// src/commands/docs.ts
import { Command } from "commander";
import { exec } from "child_process";

const DOCS_URL = "https://docs.endlesstesting.ai";

export const docsCommand = new Command("docs")
  .description("Open the Endless Testing documentation in your browser")
  .action(async () => {
    const platform = process.platform;
    let cmd: string;

    if (platform === "darwin") {
      cmd = `open "${DOCS_URL}"`;
    } else if (platform === "win32") {
      cmd = `start "${DOCS_URL}"`;
    } else {
      cmd = `xdg-open "${DOCS_URL}"`;
    }

    exec(cmd, (err) => {
      if (err) {
        // Fallback: just print the URL
        console.log(`Open the docs at: ${DOCS_URL}`);
      }
    });
  });
