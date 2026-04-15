// src/mcp/tools/run-ab-test.ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { post } from "../../lib/api-client.js";
import { resolveDomainId } from "../helpers.js";

export function registerRunAbTest(server: McpServer): void {
  server.tool(
    "run_ab_test",
    "Create a full A/B test run with AI-generated variants for a URL (5 tests targeting different page elements)",
    {
      url: z.string().describe("The URL to create A/B tests for"),
      domainId: z.string().optional().describe("Domain ID — falls back to the configured default domain if omitted"),
    },
    async ({ url, domainId }) => {
      try {
        const resolved = resolveDomainId(domainId);
        if (typeof resolved !== "string") return resolved;
        const result = await post("/api/variants/ai-run/targets", {
          url,
          domainId: resolved,
        });
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
