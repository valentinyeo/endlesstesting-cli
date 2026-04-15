// src/mcp/tools/get-results.ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { get } from "../../lib/api-client.js";
import { resolveDomainId } from "../helpers.js";

export function registerGetResults(server: McpServer): void {
  server.tool(
    "get_results",
    "Get variant performance data. Provide testId for a single test, or domainId for all tests in a domain.",
    {
      domainId: z.string().optional().describe("Domain ID — returns all tests for this domain"),
      testId: z.string().optional().describe("Test ID — returns full details for a single test"),
    },
    async ({ domainId, testId }) => {
      try {
        if (testId) {
          const result = await get("/api/tests/full", { id: testId });
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        }

        const resolved = resolveDomainId(domainId);
        if (typeof resolved !== "string") return resolved;

        const tests = await get(`/api/runs/domain/${resolved}/tests`);
        return {
          content: [{ type: "text", text: JSON.stringify(tests, null, 2) }],
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
