import { App, ItemView, WorkspaceLeaf, TFile } from "obsidian";
import type { Diagnostic, Severity } from "./types";
import type { LintRunner } from "./runner";

/* -------------------------------------------------------------------------
 * Sidebar pane — Sizzle Lint
 *
 * Renders the current Diagnostic[] as a filterable list. Click an entry to
 * open the shadow MD and scroll to the offending line.
 *
 * Filters are stored in-pane (not persisted across reloads — keep simple).
 * ------------------------------------------------------------------------- */

export const SIZZLE_LINT_VIEW_TYPE = "sizzle-lint";

interface FilterState {
  error: boolean;
  warning: boolean;
  note: boolean;
  /** Free-text filter on rule id or message. Empty = no filter. */
  search: string;
}

export class SizzleLintPane extends ItemView {
  private diagnostics: Diagnostic[] = [];
  private filters: FilterState = { error: true, warning: true, note: true, search: "" };
  private listEl: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(leaf: WorkspaceLeaf, private runner: LintRunner) {
    super(leaf);
  }

  getViewType(): string {
    return SIZZLE_LINT_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Sizzle Lint";
  }

  getIcon(): string {
    return "alert-circle";
  }

  setDiagnostics(diagnostics: Diagnostic[]): void {
    this.diagnostics = diagnostics;
    this.render();
  }

  async onOpen(): Promise<void> {
    /* Subscribe directly to the runner. on() fires immediately with the
       current state, so the pane is always live-correct from the moment
       it opens — no main-plugin-level iteration to go stale. */
    this.unsubscribe = this.runner.on((diagnostics) => this.setDiagnostics(diagnostics));
  }

  async onClose(): Promise<void> {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /* -------------------- render -------------------- */

  private render(): void {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass("sizzle-lint-pane");

    /* Header: count summary + filter chips. */
    const header = container.createDiv({ cls: "sizzle-lint-header" });
    this.countEl = header.createDiv({ cls: "sizzle-lint-counts" });

    const filterBar = header.createDiv({ cls: "sizzle-lint-filterbar" });
    this.createSeverityToggle(filterBar, "error", "Errors");
    this.createSeverityToggle(filterBar, "warning", "Warnings");
    this.createSeverityToggle(filterBar, "note", "Notes");

    const searchWrap = filterBar.createDiv({ cls: "sizzle-lint-search" });
    const searchInput = searchWrap.createEl("input", {
      type: "text",
      placeholder: "filter...",
    });
    searchInput.value = this.filters.search;
    searchInput.addEventListener("input", () => {
      this.filters.search = searchInput.value;
      this.renderList();
    });

    /* List. */
    this.listEl = container.createDiv({ cls: "sizzle-lint-list" });
    this.renderList();
  }

  private createSeverityToggle(parent: HTMLElement, sev: Severity, label: string): void {
    const btn = parent.createEl("button", { cls: "sizzle-lint-sev-toggle" });
    btn.dataset.severity = sev;
    btn.dataset.active = String(this.filters[sev]);
    btn.setText(label);
    btn.addEventListener("click", () => {
      this.filters[sev] = !this.filters[sev];
      btn.dataset.active = String(this.filters[sev]);
      this.renderList();
    });
  }

  private renderList(): void {
    if (!this.listEl) return;
    const filtered = this.filteredDiagnostics();
    this.listEl.empty();
    this.updateCounts();

    if (filtered.length === 0) {
      this.listEl.createDiv({
        cls: "sizzle-lint-empty",
        text: this.diagnostics.length === 0 ? "No issues. ✨" : "No matches.",
      });
      return;
    }

    /* Group by passage for compactness. */
    const byPassage = new Map<string, Diagnostic[]>();
    for (const d of filtered) {
      const key = d.passageName || d.filePath;
      if (!byPassage.has(key)) byPassage.set(key, []);
      byPassage.get(key)!.push(d);
    }

    for (const [passageName, diags] of byPassage) {
      const group = this.listEl.createDiv({ cls: "sizzle-lint-group" });
      const groupHeader = group.createDiv({ cls: "sizzle-lint-group-header" });
      groupHeader.createSpan({ cls: "sizzle-lint-group-name", text: passageName });
      groupHeader.createSpan({
        cls: "sizzle-lint-group-count",
        text: `${diags.length}`,
      });

      for (const d of diags) {
        const row = group.createDiv({ cls: `sizzle-lint-row sev-${d.severity}` });
        row.createSpan({ cls: "sizzle-lint-dot", text: severityGlyph(d.severity) });
        const main = row.createDiv({ cls: "sizzle-lint-row-main" });
        main.createDiv({ cls: "sizzle-lint-message", text: d.message });
        const meta = main.createDiv({ cls: "sizzle-lint-meta" });
        meta.createSpan({ cls: "sizzle-lint-rule", text: d.ruleId });
        meta.createSpan({ cls: "sizzle-lint-loc", text: `line ${d.line + 1}` });
        row.addEventListener("click", () => {
          void this.openDiagnostic(d);
        });
      }
    }
  }

  private filteredDiagnostics(): Diagnostic[] {
    const search = this.filters.search.toLowerCase().trim();
    return this.diagnostics.filter((d) => {
      if (!this.filters[d.severity]) return false;
      if (search) {
        const haystack = `${d.ruleId} ${d.message} ${d.passageName}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }

  private updateCounts(): void {
    if (!this.countEl) return;
    let err = 0;
    let warn = 0;
    let note = 0;
    for (const d of this.diagnostics) {
      if (d.severity === "error") err += 1;
      else if (d.severity === "warning") warn += 1;
      else note += 1;
    }
    this.countEl.empty();
    if (this.diagnostics.length === 0) {
      this.countEl.setText("No issues.");
      return;
    }
    this.countEl.createSpan({
      cls: "sizzle-lint-count sev-error",
      text: `${err} error${err === 1 ? "" : "s"}`,
    });
    this.countEl.createSpan({ text: " · " });
    this.countEl.createSpan({
      cls: "sizzle-lint-count sev-warning",
      text: `${warn} warning${warn === 1 ? "" : "s"}`,
    });
    this.countEl.createSpan({ text: " · " });
    this.countEl.createSpan({
      cls: "sizzle-lint-count sev-note",
      text: `${note} note${note === 1 ? "" : "s"}`,
    });
  }

  private async openDiagnostic(d: Diagnostic): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(d.filePath);
    if (!(file instanceof TFile)) {
      console.warn(`[Sizzle Tools] could not resolve ${d.filePath}`);
      return;
    }
    const leaf = this.app.workspace.getLeaf(false);
    await leaf.openFile(file, { state: { mode: "source" }, eState: { line: d.line } });
  }
}

function severityGlyph(sev: Severity): string {
  if (sev === "error") return "●";
  if (sev === "warning") return "▲";
  return "✎";
}

export async function activateLintPane(app: App): Promise<void> {
  const existing = app.workspace.getLeavesOfType(SIZZLE_LINT_VIEW_TYPE);
  if (existing.length > 0) {
    app.workspace.revealLeaf(existing[0]);
    return;
  }
  const leaf = app.workspace.getRightLeaf(false);
  if (!leaf) return;
  await leaf.setViewState({ type: SIZZLE_LINT_VIEW_TYPE, active: true });
  app.workspace.revealLeaf(leaf);
}
