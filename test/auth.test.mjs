import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../dist/index.js", import.meta.url));

async function setup(t) {
  const key = `et_test_${randomBytes(16).toString("hex")}`;
  const home = await mkdtemp(join(tmpdir(), "endlesstesting-auth-"));
  const headers = [];
  const server = createServer((req, res) => {
    headers.push(req.headers.authorization);
    const valid = req.method === "GET" && req.url === "/api/auth/verify"
      && req.headers.authorization === `Bearer ${key}`;
    res.writeHead(valid ? 200 : 401, { "Content-Type": "application/json" });
    res.end(JSON.stringify(valid ? { domain: { host: "example.test", id: "d1" } } : {}));
  });

  t.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((err) => err ? reject(err) : resolve());
      server.closeAllConnections();
    });
    await rm(home, { recursive: true, force: true });
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const configDir = join(home, ".endlesstesting");
  const configFile = join(configDir, "config.json");
  await mkdir(configDir);
  await writeFile(configFile, JSON.stringify({
    baseUrl: `http://127.0.0.1:${server.address().port}`,
  }));
  return { key, home, headers, configFile };
}

function runCli(home, args, input = "") {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...args], {
      env: { ...process.env, HOME: home },
      stdio: ["pipe", "ignore", "ignore"],
    });
    let timedOut = false;
    let inputError;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, 15_000);
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.stdin.on("error", (err) => {
      if (err.code !== "EPIPE") inputError = err;
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) reject(new Error("CLI timed out after 15 seconds"));
      else if (inputError) reject(inputError);
      else resolve(code);
    });
    child.stdin.end(input);
  });
}

test("auth refuses a key given as an argument", async (t) => {
  const { key, home, headers, configFile } = await setup(t);
  const code = await runCli(home, ["auth", key]);
  assert.notEqual(code, 0);
  const config = JSON.parse(await readFile(configFile, "utf8"));
  assert.equal(Object.hasOwn(config, "apiKey"), false);
  assert.equal(headers.includes(`Bearer ${key}`), false);
});

test("auth reads the key from stdin", async (t) => {
  const { key, home, headers, configFile } = await setup(t);
  const code = await runCli(home, ["auth"], `${key}\n`);
  assert.equal(code, 0);
  const config = JSON.parse(await readFile(configFile, "utf8"));
  assert.equal(config.apiKey, key);
  assert.equal(headers.includes(`Bearer ${key}`), true);
});
