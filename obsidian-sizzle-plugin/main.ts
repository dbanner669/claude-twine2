import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  WorkspaceLeaf,
} from "obsidian";
import { spawn } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

import { LintRunner } from "./lint/runner";
import { activateLintPane, SIZZLE_LINT_VIEW_TYPE, SizzleLintPane } from "./lint/pane";
import { brokenRefsRule } from "./lint/rules/broken-refs";
import {
  duplicatePassageRule,
  orphanPassageRule,
  unclosedMacroRule,
  undeclaredVariableRule,
} from "./lint/rules/twee-hygiene";
import { editorialNotesRule } from "./lint/rules/editorial-notes";
import { tagCoherenceRule, wordCountRule } from "./lint/rules/tag-coherence";
import type { Diagnostic } from "./lint/types";

/* -------------------------------------------------------------------------
 * Sizzle Tools — Obsidian plugin
 *
 * Two responsibilities:
 *   1. Wrap the CLI scripts (rebuild canvas / sync back) as commands.
 *   2. Run the lint pipeline continuously and surface diagnostics in a
 *      sidebar pane + status bar.
 *
 * The scripts remain the single source of truth for round-trip; the lint
 * runner is plugin-internal because it has to react to vault edits in
 * real time.
 * ------------------------------------------------------------------------- */

interface SizzleSettings {
  /** Absolute path to the repo root (containing sizzle/, twine-mcp-server/). */
  repoRoot: string;
  /** Optional override for the Node binary; defaults to `node` on PATH. */
  nodeBinary: string;
}

const DEFAULT_SETTINGS: SizzleSettings = {
  repoRoot: "",
  nodeBinary: "node",
};

const REPO_MARKER = path.join("sizzle", "scripts", "build-obsidian-canvas.js");

export default class SizzleToolsPlugin extends Plugin {
  settings!: SizzleSettings;
  private lintRunner!: LintRunner;
  private statusBarEl: HTMLElement | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.autoDetectRepoRoot();

    /* ---- script-runner commands ---- */

    this.addCommand({
      id: "rebuild-canvas",
      name: "Rebuild canvas from Twee",
      callback: () => {
        void this.runScript(
          "sizzle/scripts/build-obsidian-canvas.js",
          [],
          "Rebuild canvas",
        );
      },
    });

    this.addCommand({
      id: "syncback-dryrun",
      name: "Sync passages back to Twee (dry-run)",
      callback: () => {
        void this.runScript(
          "sizzle/scripts/build-twee-from-vault.js",
          [],
          "Sync-back dry-run",
        );
      },
    });

    this.addCommand({
      id: "syncback-apply",
      name: "Sync passages back to Twee (apply)",
      callback: () => {
        void this.runScript(
          "sizzle/scripts/build-twee-from-vault.js",
          ["--apply"],
          "Sync-back apply",
        );
      },
    });

    this.addRibbonIcon("refresh-cw", "Sizzle: Rebuild canvas from Twee", () => {
      void this.runScript(
        "sizzle/scripts/build-obsidian-canvas.js",
        [],
        "Rebuild canvas",
      );
    });

    /* ---- lint pipeline ---- */

    this.lintRunner = new LintRunner(this.app, this.settings.repoRoot);
    this.lintRunner.register(brokenRefsRule);
    this.lintRunner.register(unclosedMacroRule);
    this.lintRunner.register(duplicatePassageRule);
    this.lintRunner.register(orphanPassageRule);
    this.lintRunner.register(undeclaredVariableRule);
    this.lintRunner.register(editorialNotesRule);
    this.lintRunner.register(tagCoherenceRule);
    this.lintRunner.register(wordCountRule);

    this.registerView(
      SIZZLE_LINT_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new SizzleLintPane(leaf, this.lintRunner),
    );

    this.addCommand({
      id: "open-lint-pane",
      name: "Open lint pane",
      callback: () => {
        void activateLintPane(this.app);
      },
    });

    this.addCommand({
      id: "rerun-lint",
      name: "Re-run lint now",
      callback: () => {
        void this.lintRunner.run();
        new Notice("Sizzle: lint refreshed.", 2000);
      },
    });

    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.addClass("sizzle-statusbar-counts");
    this.statusBarEl.addEventListener("click", () => {
      void activateLintPane(this.app);
    });

    /* Status bar follows the runner; panes subscribe themselves in onOpen(). */
    this.lintRunner.on((diagnostics) => this.updateStatusBar(diagnostics));

    /* Vault event hooks — debounced re-lint. */
    this.registerEvent(this.app.vault.on("modify", (file) => this.maybeReLint(file)));
    this.registerEvent(this.app.vault.on("create", (file) => this.maybeReLint(file)));
    this.registerEvent(this.app.vault.on("delete", (file) => this.maybeReLint(file)));
    this.registerEvent(this.app.vault.on("rename", (file) => this.maybeReLint(file)));

    /* Initial scan once the workspace is ready. */
    this.app.workspace.onLayoutReady(() => {
      void this.lintRunner.run();
    });

    this.addSettingTab(new SizzleSettingTab(this.app, this));

    if (this.settings.repoRoot) {
      console.log(`[Sizzle Tools] repo root: ${this.settings.repoRoot}`);
    } else {
      console.warn(
        "[Sizzle Tools] repo root not detected. Lint will run on passages but cross-file context (glossary, media) is unavailable until set in plugin settings.",
      );
    }
  }

  onunload(): void {
    /* Obsidian unregisters views automatically via registerView lifecycle. */
  }

  /* -------------------- lint helpers -------------------- */

  private maybeReLint(file: { path: string } | null): void {
    if (!file) return;
    /* Only re-lint when something inside passages/ or beats.json changes.
       Filtering avoids cascading re-runs on, e.g., the canvas file itself. */
    if (file.path.startsWith("passages/") || file.path === "beats.json") {
      this.lintRunner.scheduleRun();
    }
  }

  private updateStatusBar(diagnostics: Diagnostic[]): void {
    if (!this.statusBarEl) return;
    let err = 0;
    let warn = 0;
    let note = 0;
    for (const d of diagnostics) {
      if (d.severity === "error") err += 1;
      else if (d.severity === "warning") warn += 1;
      else note += 1;
    }
    this.statusBarEl.empty();
    if (diagnostics.length === 0) {
      this.statusBarEl.setText("Sizzle: clean");
      this.statusBarEl.setAttr("aria-label", "Sizzle Lint: no issues");
      return;
    }
    this.statusBarEl.setAttr(
      "aria-label",
      `Sizzle Lint: ${err} errors · ${warn} warnings · ${note} notes`,
    );
    this.statusBarEl.createSpan({ cls: "sev-error", text: `● ${err}` });
    this.statusBarEl.createSpan({ cls: "sev-warning", text: `▲ ${warn}` });
    this.statusBarEl.createSpan({ cls: "sev-note", text: `✎ ${note}` });
  }

  /* -------------------- repo detection + scripts -------------------- */

  autoDetectRepoRoot(): void {
    if (
      this.settings.repoRoot &&
      fs.existsSync(path.join(this.settings.repoRoot, REPO_MARKER))
    ) {
      return;
    }
    const adapter = this.app.vault.adapter as unknown as { getBasePath?: () => string };
    const vaultPath = typeof adapter.getBasePath === "function" ? adapter.getBasePath() : "";
    if (!vaultPath) return;

    let p = vaultPath;
    for (let i = 0; i < 8; i += 1) {
      if (fs.existsSync(path.join(p, REPO_MARKER))) {
        this.settings.repoRoot = p;
        void this.saveSettings();
        return;
      }
      const parent = path.dirname(p);
      if (parent === p) break;
      p = parent;
    }
  }

  async runScript(
    relScriptPath: string,
    args: string[],
    label: string,
  ): Promise<void> {
    if (!this.settings.repoRoot) {
      new Notice("Sizzle: repo root not configured. Open plugin settings.", 6000);
      return;
    }
    const scriptAbs = path.join(this.settings.repoRoot, relScriptPath);
    if (!fs.existsSync(scriptAbs)) {
      new Notice(`Sizzle: script not found at ${scriptAbs}`, 8000);
      return;
    }

    new Notice(`Sizzle: ${label} running…`, 3000);

    let stdout = "";
    let stderr = "";

    const child = spawn(this.settings.nodeBinary, [scriptAbs, ...args], {
      cwd: this.settings.repoRoot,
      env: process.env,
      windowsHide: true,
    });

    child.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
    });

    child.on("error", (err: Error) => {
      new Notice(`Sizzle: ${label} failed to spawn (${err.message})`, 10000);
      console.error(`[Sizzle Tools] spawn error for ${label}:`, err);
    });

    child.on("close", (code: number | null) => {
      console.log(`[Sizzle Tools] ${label} exit=${code}\n${stdout}`);
      if (stderr) console.error(`[Sizzle Tools] ${label} stderr:\n${stderr}`);
      if (code === 0) {
        const last = stdout
          .trim()
          .split(/\r?\n/)
          .reverse()
          .find((line) => line.trim().length > 0);
        new Notice(`Sizzle: ${label} ✓${last ? `\n${last.trim()}` : ""}`, 8000);
      } else {
        new Notice(
          `Sizzle: ${label} failed (exit ${code}). See developer console.`,
          12000,
        );
      }
    });
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

class SizzleSettingTab extends PluginSettingTab {
  plugin: SizzleToolsPlugin;

  constructor(app: App, plugin: SizzleToolsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Sizzle Tools" });

    new Setting(containerEl)
      .setName("Repo root")
      .setDesc(
        "Absolute path to the Female Agent repo root (the folder containing sizzle/, twine-mcp-server/, etc.). " +
          "Auto-detected when the vault sits at sizzle/.obsidian-vault/.",
      )
      .addText((text) =>
        text
          .setPlaceholder("C:\\path\\to\\Female Agent")
          .setValue(this.plugin.settings.repoRoot)
          .onChange(async (val) => {
            this.plugin.settings.repoRoot = val.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Node binary")
      .setDesc(
        "Command to run Node. Default is `node` from PATH. Override if Node is installed elsewhere.",
      )
      .addText((text) =>
        text
          .setPlaceholder("node")
          .setValue(this.plugin.settings.nodeBinary)
          .onChange(async (val) => {
            this.plugin.settings.nodeBinary = val.trim() || "node";
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Re-detect repo root")
      .setDesc("Walk up from the current vault path looking for sizzle/scripts/.")
      .addButton((btn) =>
        btn.setButtonText("Detect").onClick(() => {
          this.plugin.settings.repoRoot = "";
          this.plugin.autoDetectRepoRoot();
          this.display();
          if (this.plugin.settings.repoRoot) {
            new Notice(`Sizzle: detected ${this.plugin.settings.repoRoot}`);
          } else {
            new Notice("Sizzle: no repo root found near this vault.");
          }
        }),
      );
  }
}
