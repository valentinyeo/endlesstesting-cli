// src/lib/config.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export interface Config {
  apiKey?: string;
  baseUrl?: string;
  defaultDomain?: string; // domain ID
}

const CONFIG_DIR = join(homedir(), ".endlesstesting");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

function ensureDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

let _cachedConfig: Config | null = null;

export function readConfig(): Config {
  if (_cachedConfig) return _cachedConfig;
  ensureDir();
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    const config = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    _cachedConfig = config;
    return config;
  } catch {
    return {};
  }
}

export function writeConfig(config: Config): void {
  ensureDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function updateConfig(partial: Partial<Config>): Config {
  _cachedConfig = null;
  const config = { ...readConfig(), ...partial };
  writeConfig(config);
  return config;
}

export function getBaseUrl(): string {
  return readConfig().baseUrl || "https://appbe.endlesstesting.ai";
}
