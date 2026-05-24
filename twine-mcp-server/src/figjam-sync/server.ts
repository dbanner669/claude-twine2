import { promises as fs } from "fs";
import * as http from "http";
import * as path from "path";

import { buildGraphFromDirectory } from "./graph-builder";

interface SyncServerOptions {
  port: number;
  contentDir: string;
  outDir: string;
  storyName: string;
}

const CORS_HEADERS: http.OutgoingHttpHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function sendJson(res: http.ServerResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    ...CORS_HEADERS,
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body).toString(),
  });
  res.end(body);
}

function sendText(res: http.ServerResponse, status: number, body: string): void {
  res.writeHead(status, {
    ...CORS_HEADERS,
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(body).toString(),
  });
  res.end(body);
}

async function readJsonBody(req: http.IncomingMessage, limitBytes = 16 * 1024 * 1024): Promise<unknown> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let received = 0;
    req.on("data", (chunk: Buffer) => {
      received += chunk.length;
      if (received > limitBytes) {
        reject(new Error(`Request body exceeded limit of ${limitBytes} bytes`));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export async function startSyncServer(options: SyncServerOptions): Promise<http.Server> {
  await fs.mkdir(options.outDir, { recursive: true });

  const server = http.createServer(async (req, res) => {
    if (!req.url || !req.method) {
      sendText(res, 400, "Bad request");
      return;
    }

    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    try {
      if (req.method === "GET" && url.pathname === "/health") {
        sendJson(res, 200, { ok: true, story: options.storyName });
        return;
      }

      if (req.method === "GET" && url.pathname === "/story-graph.json") {
        const graph = await buildGraphFromDirectory(options.contentDir, options.storyName);
        sendJson(res, 200, graph);
        return;
      }

      if (req.method === "POST" && url.pathname === "/board.json") {
        const payload = await readJsonBody(req);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `board-${timestamp}.json`;
        const target = path.join(options.outDir, filename);
        await fs.writeFile(target, JSON.stringify(payload, null, 2), "utf8");
        const latest = path.join(options.outDir, "board-latest.json");
        await fs.writeFile(latest, JSON.stringify(payload, null, 2), "utf8");
        sendJson(res, 200, { ok: true, savedAs: filename, latest: "board-latest.json" });
        return;
      }

      sendText(res, 404, `Not found: ${req.method} ${url.pathname}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      sendJson(res, 500, { ok: false, error: message });
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(options.port, "127.0.0.1", () => resolve());
  });

  return server;
}
