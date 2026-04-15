// src/lib/auth.ts
import { readConfig, updateConfig } from "./config.js";

export function getApiKey(): string | undefined {
  return readConfig().apiKey;
}

export function setApiKey(key: string): void {
  updateConfig({ apiKey: key });
}

export function clearApiKey(): void {
  updateConfig({ apiKey: undefined });
}
