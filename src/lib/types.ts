// src/lib/types.ts
// Ported essential types from endless-testing-poc-fe/lib/types.ts

// Shared types consolidated in ../shared/index.js
export type { ICE, VariantSummary, TestSummary } from "../shared/index.js";

export interface Domain {
  id: string;
  _id?: string;
  host: string;
  name?: string;
  killSwitchActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestRun {
  id: string;
  _id?: string;
  domainId: string;
  url: string;
  name?: string;
  status?: string;
  humanId?: string;
  seq?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsageResponse {
  concurrentTests: { current: number; limit: number };
  mau: { current: number; limit: number };
  domains: { current: number; limit: number };
  variants: { limit: number };
}

export interface AuthVerifyResponse {
  valid: boolean;
  domain: { id: string; host: string; name?: string };
}

export type { ConfidenceLevel, ConfidenceResult } from "../shared/index.js";
