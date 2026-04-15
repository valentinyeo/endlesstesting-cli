// src/mcp/helpers.ts
import { readConfig } from "../lib/config.js";

const NO_DOMAIN_MSG =
  "No domainId provided and no default domain configured. Run `endlesstesting init` first or pass a domainId.";

/**
 * Resolve domainId from an explicit parameter or the default config.
 * Returns the ID string, or an MCP error content block if none is available.
 */
export function resolveDomainId(
  domainId: string | undefined,
): string | { content: { type: "text"; text: string }[] } {
  const id = domainId || readConfig().defaultDomain;
  if (id) return id;
  return { content: [{ type: "text" as const, text: NO_DOMAIN_MSG }] };
}
