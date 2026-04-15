// src/commands/init.ts
import { Command } from "commander";
import { input, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import ora from "ora";
import { post, get } from "../lib/api-client.js";
import { updateConfig, readConfig } from "../lib/config.js";
import { getApiKey } from "../lib/auth.js";
import type { Domain } from "../lib/types.js";

export const initCommand = new Command("init")
  .description("Register a domain and get the SDK snippet for your website")
  .addHelpText(
    "after",
    `
Examples:
  $ endlesstesting init                  Interactive domain setup

This will:
  1. Register your domain with Endless Testing
  2. Extract brand context using AI
  3. Output the SDK snippet to add to your site`
  )
  .action(async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.log(chalk.red("Not authenticated. Run: endlesstesting auth <api-key>"));
      process.exit(1);
    }

    const url = await input({
      message: "Enter your website URL (e.g. https://example.com):",
      validate: (val) => {
        try {
          new URL(val.startsWith("http") ? val : `https://${val}`);
          return true;
        } catch {
          return "Please enter a valid URL";
        }
      },
    });

    const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;

    const spinner = ora("Registering domain...").start();
    let domain: Domain;
    try {
      domain = await post<Domain>("/api/domains", { host, name: host });
      spinner.succeed(`Domain registered: ${domain.host}`);
    } catch (err: any) {
      spinner.fail("Failed to register domain");
      console.log(chalk.red(err.message));
      process.exit(1);
    }

    // Wait for brand context extraction (it starts automatically)
    const brandSpinner = ora("Extracting brand context (AI analysis)...").start();
    let attempts = 0;
    const maxAttempts = 30; // 30 x 2s = 60s max
    while (attempts < maxAttempts) {
      try {
        const ctx = await get<{ _id?: string }>(`/api/brand-context/domain/${domain.id}`);
        if (ctx && ctx._id) {
          brandSpinner.succeed("Brand context extracted");
          break;
        }
      } catch {
        // not ready yet
      }
      attempts++;
      await new Promise((r) => setTimeout(r, 2000));
    }
    if (attempts >= maxAttempts) {
      brandSpinner.warn("Brand context extraction timed out — you can set it up later.");
    }

    // Save default domain
    updateConfig({ defaultDomain: String(domain.id) });
    console.log(chalk.green(`\nDefault domain set to ${domain.host}`));

    // Output SDK snippet
    const baseUrl = readConfig().baseUrl || "https://appbe.endlesstesting.ai";
    console.log(chalk.cyan("\nAdd this snippet to your website (before </head>):"));
    console.log(chalk.gray("─".repeat(60)));
    console.log(`<script>
  window.AB_CONFIG = {
    base: "${baseUrl}",
    analyticsPath: "/api/events",
    blockUntilVariants: false
  };
</script>
<script src="${baseUrl}/api/sdk.js" defer></script>`);
    console.log(chalk.gray("─".repeat(60)));
    console.log(chalk.green("\nSetup complete! Run `endlesstesting run <url>` to start testing."));
  });
