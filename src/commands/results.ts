// src/commands/results.ts
import { Command } from "commander";
import chalk from "chalk";
import { get } from "../lib/api-client.js";
import { requireAuth, requireDomain } from "../lib/guards.js";
import {
  formatTable,
  colorStatus,
  colorConfidence,
  getConfidence,
  formatUplift,
} from "../lib/formatting.js";
import type { TestSummary, VariantSummary } from "../lib/types.js";

export const resultsCommand = new Command("results")
  .description("Show variant performance (impressions, conversions, uplift) for all tests")
  .action(async () => {
    requireAuth();
    const defaultDomain = requireDomain();

    try {
      const tests = await get<TestSummary[]>(
        `/api/runs/domain/${defaultDomain}/tests`
      );

      if (!tests || tests.length === 0) {
        console.log(chalk.yellow("No tests found."));
        return;
      }

      for (const test of tests) {
        const variants = test.variants || [];
        const control = variants.find((v) => v.isControl);
        const controlImpressions = control?.impressions ?? 0;
        const controlConversions = control?.conversions ?? 0;
        const controlRate = controlImpressions > 0 ? controlConversions / controlImpressions : 0;

        console.log(
          chalk.bold(`\n${test.name || test.id}`) +
            ` ${colorStatus(test.status || "unknown")}`
        );
        if (test.hypothesis) {
          console.log(chalk.gray(`  Hypothesis: ${test.hypothesis}`));
        }

        if (variants.length === 0) {
          console.log(chalk.gray("  No variants yet"));
          continue;
        }

        const headers = ["Variant", "Impressions", "Conversions", "Rate", "Uplift", "Confidence"];
        const rows = variants.map((v) => {
          const rate = v.impressions > 0 ? v.conversions / v.impressions : 0;
          const conf = v.isControl
            ? { level: "not-significant" as const, label: "Control" }
            : getConfidence(controlImpressions, controlConversions, v.impressions, v.conversions);

          return [
            v.isControl ? chalk.cyan(v.name) : v.name,
            String(v.impressions),
            String(v.conversions),
            `${(rate * 100).toFixed(1)}%`,
            v.isControl ? "—" : formatUplift(controlRate, rate),
            v.isControl ? chalk.cyan("Control") : colorConfidence(conf.level),
          ];
        });

        console.log(formatTable(headers, rows));
      }
    } catch (err: any) {
      console.log(chalk.red(`Failed to fetch results: ${err.message}`));
      process.exit(1);
    }
  });
