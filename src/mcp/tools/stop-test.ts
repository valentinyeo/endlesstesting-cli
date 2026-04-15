// src/mcp/tools/stop-test.ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { post } from "../../lib/api-client.js";
import { readConfig } from "../../lib/config.js";

export function registerStopTest(server: McpServer): void {
  server.tool(
    "stop_test",
    "Stop or resume a test, or activate/deactivate the domain kill switch. Provide testId to toggle a single test, or domainId to toggle the kill switch for the entire domain.",
    {
      testId: z.string().optional().describe("Test ID — toggles this specific test's status"),
      domainId: z.string().optional().describe("Domain ID — activates/deactivates kill switch for the domain"),
      resume: z.boolean().optional().describe("If true, resume/deactivate instead of stop/activate (default: false)"),
    },
    async ({ testId, domainId, resume }) => {
      try {
        if (testId) {
          const result = await post(`/api/tests/${testId}/toggle-status`);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        }

        const id = domainId || readConfig().defaultDomain;
        if (!id) {
          return {
            content: [
              {
                type: "text",
                text: "No testId or domainId provided and no default domain configured.",
              },
            ],
          };
        }

        const action = resume ? "deactivate" : "activate";
        const result = await post(`/api/domains/${id}/kill-switch/${action}`);
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
