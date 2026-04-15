// Re-exported from packages that define these types locally.
// Keeping them here consolidates the definitions and ensures consistency.

/** ICE scoring rubric fields */
export type ICE = {
  impact?: number;
  confidence?: number;
  ease?: number;
  score?: number; // ICE product
  scoreAvg?: number; // average of (I, C, E)
};

/** Per-variant summary used in test cards and run listings */
export type VariantSummary = {
  id: string;
  name: string;
  key: string;
  isControl: boolean;
  impressions: number;
  conversions: number;
  weight?: number;
  status?: string;
};

/** Full test summary including metrics, run context, and variant list */
export type TestSummary = {
  id: string; // from API (serializeTest returns this)
  _id?: string; // internal Mongo document id, may appear in some responses
  name?: string;
  url?: string;
  status?: string;
  hypothesis?: string | null;
  pageType?: "homepage" | "pricing" | "contact";
  ice?: ICE;

  impressions?: number;
  clicks?: number;

  seqWithinRun?: number | null;
  runHumanId?: string | null;
  run?: {
    id: string;
    url?: string;
    name?: string | null;
    humanId?: string | null;
  };

  createdAt?: string;
  updatedAt?: string;

  metrics?: {
    profitUsd?: number;
    revenueImpact?: number;
    monetaryImpact?: number;
    daysRunning?: number;
    controlConv?: number;
    totalConv?: number;
  };

  variants?: VariantSummary[];
} & Record<string, unknown>;
