#!/usr/bin/env node
/*
 * Install the built plugin into the Sizzle vault.
 *
 * Copies main.js + manifest.json to sizzle/.obsidian-vault/.obsidian/plugins/sizzle-tools/.
 * Run after `npm run build`. Re-run after each rebuild — Obsidian picks up
 * the new code when you toggle the plugin off/on (or use the "Reload app
 * without saving" command).
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLUGIN_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(PLUGIN_ROOT, "..");
const VAULT_PLUGINS_DIR = path.resolve(
  REPO_ROOT,
  "sizzle",
  ".obsidian-vault",
  ".obsidian",
  "plugins",
  "sizzle-tools",
);

const REQUIRED = ["main.js", "manifest.json"];
/* styles.css is optional — copy if present. */
const OPTIONAL = ["styles.css"];

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  for (const f of REQUIRED) {
    const src = path.join(PLUGIN_ROOT, f);
    if (!(await exists(src))) {
      console.error(`Missing ${f}. Did you run \`npm run build\` first?`);
      process.exit(1);
    }
  }

  await fs.mkdir(VAULT_PLUGINS_DIR, { recursive: true });

  for (const f of [...REQUIRED, ...OPTIONAL]) {
    const src = path.join(PLUGIN_ROOT, f);
    if (!(await exists(src))) continue;
    const dst = path.join(VAULT_PLUGINS_DIR, f);
    await fs.copyFile(src, dst);
    console.log(`  copied ${f}`);
  }

  console.log(`Installed to ${VAULT_PLUGINS_DIR}`);
  console.log("In Obsidian: Settings → Community plugins → Enable 'Sizzle Tools'.");
  console.log("If already enabled, toggle off/on (or run 'Reload app without saving') to pick up changes.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
