// src/commands/stop.ts
import { Command } from "commander";
import chalk from "chalk";
import { post } from "../lib/api-client.js";
import { requireAuth, requireDomain } from "../lib/guards.js";

export const stopCommand = new Command("stop")
  .description("Pause a test or activate the domain kill switch (stops all tests)")
  .argument("[test-id]", "Test ID to pause — omit to activate kill switch for entire domain")
  .option("--resume", "Resume a paused test, or deactivate the domain kill switch")
  .addHelpText(
    "after",
    `
Examples:
  $ endlesstesting stop                  Activate kill switch (stop all tests)
  $ endlesstesting stop --resume         Deactivate kill switch (resume all tests)
  $ endlesstesting stop abc123           Pause a specific test
  $ endlesstesting stop abc123 --resume  Resume a specific test`
  )
  .action(async (testId: string | undefined, opts: { resume?: boolean }) => {
    requireAuth();
    const defaultDomain = requireDomain();

    try {
      if (testId) {
        // Single test stop/resume
        if (opts.resume) {
          await post(`/api/tests/${testId}/resume`);
          console.log(chalk.green(`Test ${testId} resumed.`));
        } else {
          await post(`/api/tests/${testId}/pause`);
          console.log(chalk.yellow(`Test ${testId} paused.`));
        }
      } else {
        // Domain kill switch
        if (opts.resume) {
          await post(`/api/domains/${defaultDomain}/kill-switch/deactivate`);
          console.log(chalk.green("Kill switch deactivated. Tests resumed."));
        } else {
          await post(`/api/domains/${defaultDomain}/kill-switch/activate`);
          console.log(chalk.red("Kill switch activated! All tests stopped."));
        }
      }
    } catch (err: any) {
      console.log(chalk.red(`Failed: ${err.message}`));
      process.exit(1);
    }
  });
