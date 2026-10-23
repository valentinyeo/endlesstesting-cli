import { Command } from "commander";
import chalk from "chalk";
import { password } from "@inquirer/prompts";
import { get } from "../lib/api-client.js";
import { setApiKey, clearApiKey, getApiKey } from "../lib/auth.js";
import type { AuthVerifyResponse } from "../lib/types.js";

export const authCommand = new Command("auth")
  .description("Authenticate with your Endless Testing API key")
  .allowExcessArguments(false)
  .option("--status", "Check if you are currently authenticated")
  .option("--logout", "Remove stored API key and log out")
  .addHelpText(
    "after",
    `
Examples:
  $ endlesstesting auth                  Enter API key securely and verify it
  $ endlesstesting auth --status         Check current auth status
  $ endlesstesting auth --logout         Remove stored API key`
  )
  .action(async (opts: { status?: boolean; logout?: boolean }) => {
    if (opts.logout) {
      clearApiKey();
      console.log(chalk.green("Logged out. API key removed."));
      return;
    }

    if (opts.status) {
      const key = getApiKey();
      if (!key) {
        console.log(chalk.yellow("Not authenticated. Run: endlesstesting auth"));
        return;
      }
      try {
        const result = await get<AuthVerifyResponse>("/api/auth/verify");
        console.log(chalk.green("Authenticated"));
        console.log(`  Domain: ${result.domain.host}`);
        console.log(`  Key prefix: ${key.slice(0, 8)}...`);
      } catch {
        console.log(chalk.red("Stored key is invalid or expired."));
      }
      return;
    }

    let apiKey = "";
    if (!process.stdin.isTTY) {
      process.stdin.setEncoding("utf8");
      for await (const chunk of process.stdin) {
        apiKey += chunk;
      }
      apiKey = apiKey.trim();
    } else {
      apiKey = await password({ message: "API key:", mask: "*" });
    }

    if (!apiKey) {
      console.log(chalk.red("An API key is required."));
      process.exit(1);
    }

    setApiKey(apiKey);
    try {
      const result = await get<AuthVerifyResponse>("/api/auth/verify");
      console.log(chalk.green("Authenticated successfully!"));
      console.log(`  Domain: ${result.domain.host}`);
      console.log(`  Domain ID: ${result.domain.id}`);
    } catch (err: any) {
      clearApiKey();
      console.log(chalk.red("Invalid API key."));
      if (err.status === 401) {
        console.log("The key was not recognized. Check that it's correct.");
      } else {
        console.log(`Error: ${err.message}`);
      }
      process.exit(1);
    }
  });
