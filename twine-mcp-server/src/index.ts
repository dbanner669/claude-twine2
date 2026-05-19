#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerTools } from "./tools";

const server = new McpServer({
  name: "claude-twine-bridge",
  version: "0.1.0",
});

registerTools(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Claude-Twine MCP server running on stdio");
}

main().catch((error: unknown) => {
  console.error("Fatal:", error);
  process.exit(1);
});
