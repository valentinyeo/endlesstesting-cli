// src/commands/mcp.ts
import { Command } from "commander";
import { startMcpServer } from "../mcp/server.js";

export const mcpCommand = new Command("mcp")
  .description("Start the Model Context Protocol (MCP) server for AI coding tools")
  .addHelpText(
    "after",
    `
This command starts an MCP server that lets AI coding tools
(Claude Code, Cursor, etc.) manage your A/B tests directly.

Add this to your MCP config to use it:
  {
    "mcpServers": {
      "endlesstesting": {
        "command": "npx",
        "args": ["endlesstesting", "mcp"]
      }
    }
  }`
  )
  .action(async () => {
    await startMcpServer();
  });
