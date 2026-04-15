// src/mcp/tools/get-domain-health.ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { get } from "../../lib/api-client.js";
import type { UsageResponse } from "../../lib/types.js";

export function registerGetDomainHealth(server: McpServer): void {
  server.tool(
    "get_domain_health",
    "Get a domain health overview including test runs and usage vs plan limits",
    { domainId: z.string().describe("Domain ID to check health for") },
    async ({ domainId }) => {
      try {
        const [runs, usage] = await Promise.all([
          get("/api/runs", { domainId }),
          get<UsageResponse>("/api/usage"),
        ]);

        const result = { domainId, runs, usage };
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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
