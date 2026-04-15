// src/mcp/tools/get-test-status.ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { get } from "../../lib/api-client.js";
import { resolveDomainId } from "../helpers.js";

export function registerGetTestStatus(server: McpServer): void {
  server.tool(
    "get_test_status",
    "Get test runs and their status for a domain. Uses the default domain from config if none specified.",
    { domainId: z.string().optional().describe("Domain ID (uses default domain from config if omitted)") },
    async ({ domainId }) => {
      try {
        const resolved = resolveDomainId(domainId);
        if (typeof resolved !== "string") return resolved;
        const runs = await get("/api/runs", { domainId: resolved });
        return {
          content: [{ type: "text", text: JSON.stringify(runs, null, 2) }],
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
