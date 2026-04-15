#!/usr/bin/env node
// src/index.ts
import { Command } from "commander";
import { authCommand } from "./commands/auth.js";
import { initCommand } from "./commands/init.js";
import { runCommand } from "./commands/run.js";
import { statusCommand } from "./commands/status.js";
import { resultsCommand } from "./commands/results.js";
import { stopCommand } from "./commands/stop.js";
import { mcpCommand } from "./commands/mcp.js";
import { docsCommand } from "./commands/docs.js";

const program = new Command();

program
  .name("endlesstesting")
  .description("CLI for Endless Testing — AI-powered A/B testing platform")
  .version("0.1.0")
  .addHelpText(
    "after",
    `
Getting started:
  $ endlesstesting auth <api-key>        Authenticate with your API key
  $ endlesstesting init                  Register your domain and get the SDK snippet
  $ endlesstesting run <url>             Start a test run (5 AI-generated tests)
  $ endlesstesting results               View variant performance

Docs: https://docs.endlesstesting.ai`
  );

program.addCommand(authCommand);
program.addCommand(initCommand);
program.addCommand(runCommand);
program.addCommand(statusCommand);
program.addCommand(resultsCommand);
program.addCommand(stopCommand);
program.addCommand(mcpCommand);
program.addCommand(docsCommand);

program.parse();
