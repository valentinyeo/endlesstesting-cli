// src/mcp/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerListDomains } from "./tools/list-domains.js";
import { registerRunAbTest } from "./tools/run-ab-test.js";
import { registerGetTestStatus } from "./tools/get-test-status.js";
import { registerGetResults } from "./tools/get-results.js";
import { registerStopTest } from "./tools/stop-test.js";
import { registerGetDomainHealth } from "./tools/get-domain-health.js";

export async function startMcpServer(): Promise<void> {
  const server = new McpServer({
    name: "endless-testing",
    version: "0.1.0",
  });

  // Register all tools
  registerListDomains(server);
  registerRunAbTest(server);
  registerGetTestStatus(server);
  registerGetResults(server);
  registerStopTest(server);
  registerGetDomainHealth(server);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
