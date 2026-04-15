// src/commands/run.ts
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { post } from "../lib/api-client.js";
import { requireAuth, requireDomain } from "../lib/guards.js";

export const runCommand = new Command("run")
  .description("Start a new AI-generated test run (5 tests) for a URL")
  .argument("<url>", "Full URL of the page to test (e.g. https://example.com/pricing)")
  .addHelpText(
    "after",
    `
Examples:
  $ endlesstesting run https://example.com
  $ endlesstesting run https://example.com/pricing`
  )
  .action(async (url: string) => {
    requireAuth();
    const defaultDomain = requireDomain();

    const spinner = ora("Creating AI test run (5 tests)...").start();
    try {
      const result = await post<{ run?: { humanId?: string }; tests?: unknown[] }>(
        "/api/variants/ai-run/targets",
        {
          url,
          domainId: defaultDomain,
        }
      );

      const testCount = result.tests?.length ?? 0;
      const humanId = result.run?.humanId ?? "unknown";
      spinner.succeed(`Test run created: ${humanId} (${testCount} tests)`);
      console.log(chalk.cyan("AI is generating variants. Check status with: endlesstesting status"));
    } catch (err: any) {
      spinner.fail("Failed to create test run");
      console.log(chalk.red(err.message));
      process.exit(1);
    }
  });
