// src/mcp/tools/list-domains.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { get } from "../../lib/api-client.js";
import type { Domain } from "../../lib/types.js";

export function registerListDomains(server: McpServer): void {
  server.tool(
    "list_domains",
    "List all domains configured in Endless Testing",
    {},
    async () => {
      try {
        const domains = await get<Domain[]>("/api/domains");
        return {
          content: [{ type: "text", text: JSON.stringify(domains, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message || String(err)}` }],
          isError: true,
        };
      }
    },
  );
}
