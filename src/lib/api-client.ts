// src/lib/api-client.ts
// Thin HTTP client using Node fetch. Mirrors pattern from the frontend api-client.ts.

import { readConfig, getBaseUrl } from "./config.js";

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOpts {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClientError extends Error {
  public readonly status: number;
  public readonly responseBody: string;

  constructor(status: number, body: string) {
    super(`HTTP ${status}: ${body}`);
    this.name = "ApiClientError";
    this.status = status;
    this.responseBody = body;
  }
}

async function request<T>(method: Method, path: string, opts: ApiOpts = {}): Promise<T> {
  const { body, params } = opts;
  const base = getBaseUrl();

  let url = `${base}${path}`;
  if (params) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) sp.set(k, String(v));
    }
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const config = readConfig();
  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new ApiClientError(res.status, txt || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  return request<T>("GET", path, { params });
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, { body });
}

export async function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PUT", path, { body });
}

export async function del(path: string): Promise<void> {
  await request<unknown>("DELETE", path);
}

export { ApiClientError };
