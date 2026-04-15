// src/lib/guards.ts
import chalk from "chalk";
import { getApiKey } from "./auth.js";
import { readConfig } from "./config.js";

/** Require a valid API key or exit with instructions. */
export function requireAuth(): string {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.log(chalk.red("Not authenticated. Run: endlesstesting auth <api-key>"));
    process.exit(1);
  }
  return apiKey;
}

/** Require a default domain or exit with instructions. */
export function requireDomain(): string {
  const config = readConfig();
  if (!config.defaultDomain) {
    console.log(chalk.red("No default domain. Run: endlesstesting init"));
    process.exit(1);
  }
  return config.defaultDomain;
}
