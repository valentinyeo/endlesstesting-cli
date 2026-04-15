# Endless Testing — Agent Onboarding

This file tells an AI coding agent (Claude Code, Cursor, etc.) how to install and operate Endless Testing on a website codebase. Drop this file into any project root and point your agent at it.

---

## What Endless Testing does

- Generates 5 concurrent AI-driven A/B test variants per page
- Allocates traffic via Thompson sampling (Bayesian bandit)
- Auto-declares winners when statistical thresholds are met
- New baseline → new variants → iterate forever

Zero manual test creation. Zero manual winner picking.

---

## Onboarding checklist (agents: follow in order, do not skip)

### 1. Install the CLI

```bash
npm install -D endlesstesting
```

Or one-off:

```bash
npx endlesstesting@latest --help
```

### 2. Authenticate

The user must provide an API key from https://app.endlesstesting.ai/settings.
The key starts with `et_live_…` (prod) or `et_test_…` (sandbox).

```bash
npx endlesstesting auth <api-key>
```

If no key is available, STOP and ask the user for one. Do not guess, do not mock.

### 3. Register the domain and get the SDK snippet

```bash
npx endlesstesting init
```

The CLI will:
- Prompt for the site URL (use the user's production domain)
- Register the domain with the backend
- Auto-extract brand context via AI (takes ~30–60 seconds)
- Print the `<script>` snippet to paste into the site's `<head>`

### 4. Install the SDK snippet

The snippet looks like this (do **not** hand-write it — use the one the CLI printed, since `baseUrl` may differ per environment):

```html
<script>
  window.AB_CONFIG = {
    base: "https://appbe.endlesstesting.ai",
    analyticsPath: "/api/events",
    blockUntilVariants: false
  };
</script>
<script src="https://appbe.endlesstesting.ai/api/sdk.js" defer></script>
```

Placement rules:
- **Inside `<head>`**, as late as possible before `</head>`
- Keep `blockUntilVariants: false` for public pages — never block FCP
- If the site uses a single layout/template (Next.js `_document` / `app/layout`, Astro `BaseLayout`, Nuxt `app.vue`, etc.), install there once
- If the site statically generates HTML (Astro/Hugo/Eleventy), regenerate and redeploy after installing

### 5. Verify the SDK is loading

After deploy, the agent must verify — don't trust the install blindly:

```bash
# Fetch the live page and check the snippet is served
curl -s https://<your-domain>/ | grep -E "AB_CONFIG|api/sdk\.js"
```

If nothing returns, the snippet is missing from the deployed HTML. Fix before proceeding.

### 6. Start the first test run

```bash
npx endlesstesting run https://<your-domain>/
```

This creates one run with 5 AI-generated tests targeting different page elements. Use the most important page (homepage, pricing, landing). The CLI returns a run ID and URL to the dashboard.

### 7. Monitor

```bash
npx endlesstesting status      # all runs
npx endlesstesting results     # per-variant impressions/conversions/uplift
```

Agents: don't poll `status` in a loop from code — the user can run these manually. Check back after traffic has flowed (hours or days depending on volume).

### 8. Kill switch (if anything looks wrong)

```bash
npx endlesstesting stop                      # pause a single test (will prompt)
npx endlesstesting stop --all-domain         # kill all tests on the domain
```

---

## MCP integration (Claude Code / Cursor)

The CLI doubles as an MCP server. Agents can run tools directly instead of shelling out:

**Claude Code** — add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "endlesstesting": {
      "command": "npx",
      "args": ["endlesstesting", "mcp"]
    }
  }
}
```

**Cursor** — add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "endlesstesting": {
      "command": "npx",
      "args": ["endlesstesting", "mcp"]
    }
  }
}
```

MCP tools exposed: `register_domain`, `start_test_run`, `list_runs`, `get_results`, `stop_test`, `kill_switch`.

---

## Rules for agents

1. **Do not fabricate test results.** Tests take real traffic to declare winners (hours to days). Don't tell the user a test "won" without checking `results`.
2. **Do not install the SDK inside iframes, widgets, or admin/auth pages** — only on public, traffic-bearing pages.
3. **Do not bypass `endlesstesting init`** by POSTing to the API directly — `init` also extracts brand context, which improves variant quality.
4. **Do not change `blockUntilVariants: true`** unless the user explicitly asks for blocking mode (only use for static pages where FCP doesn't matter).
5. **Do not commit the API key.** The CLI writes it to `~/.config/endlesstesting/auth.json`, not to the repo.
6. **Prefer the CLI over the MCP over the API.** MCP is a wrapper over the CLI. The REST API should only be used for advanced integrations.

---

## Links

- Docs: https://docs.endlesstesting.ai
- CLI repo: https://github.com/valentinyeo/endlesstesting-cli
- Dashboard: https://app.endlesstesting.ai
- Issues: https://github.com/valentinyeo/endlesstesting-cli/issues
