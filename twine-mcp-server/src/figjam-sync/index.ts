import * as path from "path";

import { startSyncServer } from "./server";

const DEFAULT_PORT = 4747;

function parseArgs(argv: string[]): { port: number; contentDir: string; outDir: string; story: string } {
  const args = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) continue;
    const eq = value.indexOf("=");
    if (eq !== -1) {
      args.set(value.slice(2, eq), value.slice(eq + 1));
    } else {
      args.set(value.slice(2), argv[index + 1] ?? "");
      index += 1;
    }
  }

  const repoRoot = path.resolve(process.cwd(), "..");
  const story = args.get("story") ?? "sizzle";
  const portRaw = args.get("port") ?? String(DEFAULT_PORT);
  const port = Number.parseInt(portRaw, 10);
  if (Number.isNaN(port)) {
    throw new Error(`Invalid --port value: ${portRaw}`);
  }

  const contentDir = args.get("content-dir")
    ? path.resolve(args.get("content-dir") as string)
    : path.join(repoRoot, story, "src", "content");
  const outDir = args.get("out-dir")
    ? path.resolve(args.get("out-dir") as string)
    : path.join(repoRoot, story, ".figjam");

  return { port, contentDir, outDir, story };
}

async function main(): Promise<void> {
  const { port, contentDir, outDir, story } = parseArgs(process.argv.slice(2));

  const server = await startSyncServer({ port, contentDir, outDir, storyName: story });
  const banner = [
    `figjam-sync listening on http://127.0.0.1:${port}`,
    `  story:       ${story}`,
    `  content dir: ${contentDir}`,
    `  out dir:     ${outDir}`,
    "",
    "Endpoints:",
    `  GET  /health`,
    `  GET  /story-graph.json`,
    `  POST /board.json  (writes board-<timestamp>.json + board-latest.json)`,
  ].join("\n");
  process.stdout.write(banner + "\n");

  const shutdown = (signal: NodeJS.Signals) => {
    process.stdout.write(`\nReceived ${signal}, shutting down figjam-sync.\n`);
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  process.stderr.write(`figjam-sync failed: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
