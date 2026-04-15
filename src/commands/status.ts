// src/commands/status.ts
import { Command } from "commander";
import chalk from "chalk";
import { get } from "../lib/api-client.js";
import { requireAuth, requireDomain } from "../lib/guards.js";
import { formatTable, colorStatus } from "../lib/formatting.js";
import type { TestRun } from "../lib/types.js";

export const statusCommand = new Command("status")
  .description("List all test runs for your domain with their current status")
  .action(async () => {
    requireAuth();
    const defaultDomain = requireDomain();

    try {
      const runs = await get<TestRun[]>("/api/runs", {
        domain: defaultDomain,
      });

      if (!runs || runs.length === 0) {
        console.log(chalk.yellow("No test runs found. Start one with: endlesstesting run <url>"));
        return;
      }

      const headers = ["Run ID", "URL", "Status", "Created"];
      const rows = runs.map((r) => [
        r.humanId || r.id.slice(-8),
        r.url || "—",
        colorStatus(r.status || "unknown"),
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—",
      ]);

      console.log(chalk.bold("\nTest Runs\n"));
      console.log(formatTable(headers, rows));
      console.log(`\n${runs.length} run(s) total`);
    } catch (err: any) {
      console.log(chalk.red(`Failed to fetch runs: ${err.message}`));
      process.exit(1);
    }
  });
