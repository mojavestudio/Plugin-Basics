# Plugin Basics

Plugin Basics collects the architecture guidance, API references, and packaging steps you need to spin up polished Framer plugins quickly. Treat it as both a starter kit and a checklist when you’re preparing a plugin for collaborators or the Marketplace.

## What’s Inside

- `PLUGIN_TEMPLATE_GUIDE.md` — reusable architecture template covering scaffold commands, window sizing, verification, caching, and release prep.
- `Framer_Plugin_reference.md` — Framer plugin APIs for UI chrome, canvas control, navigation, CMS access, and managed data.
- `Framer_component_reference.md` — runtime helpers for code components (RenderTarget, localization hooks, property controls, Motion).

## Requirements

- Node.js 18+ and npm (or pnpm/yarn) installed locally.
- Framer desktop app with *Plugins → Developer Tools* enabled.
- HTTPS certificates for localhost (handled automatically by `vite-plugin-mkcert`).
- Optional: Brave/ad-blockers allow-listed for `framer.com` so the dev bridge can reach `https://localhost:5173`.

## Quick Start (Port 5173)

1. Scaffold a plugin: `npm create framer-plugin@latest` (pnpm/yarn equivalents work too).
2. Install dependencies inside the Plugin workspace: `cd Plugin && npm install`.
3. Run the dev server and keep it on port 5173 for hot reloads: `npm run dev -- --host localhost --port 5173`.
4. In Framer choose *Plugins → Open Development Plugin* and enter `https://localhost:5173`.
5. Iterate normally; Vite + `vite-plugin-framer` will live-reload UI changes inside the editor.

## Repository Layout

```
Plugin Basics/
├── Plugin/                 # Scaffolding produced by `npm create framer-plugin`
│   ├── src/                # App.tsx, App.css, main.tsx
│   ├── framer.json         # Plugin manifest
│   ├── package.json        # Scripts + deps
│   └── vite.config.ts      # Vite + mkcert + framer plugin config
├── PluginComponent.tsx     # Example canvas code component (intrinsic sizes + props)
├── PLUGIN_TEMPLATE_GUIDE.md
├── Framer_Plugin_reference.md
└── Framer_component_reference.md
```

Keep the plugin window fixed at roughly `320px × 760px`, leave `20px` padding on the main column, and ensure canvas components declare matching intrinsic width/height so inserted instances look predictable.

## Development Workflow

1. **Run locally** — `npm run dev -- --host localhost --port 5173` for HMR + JSONP bridge.
2. **Align component sizing** — Ensure the code component’s `@framerIntrinsicWidth`/`Height` matches the dimensions passed to `framer.addComponentInstance`, and provide a `framer.createFrameNode` fallback for projects that can’t insert code components.
3. **Guard Framer APIs** — Check permissions with `framer.isAllowedTo` before adding components, writing plugin data, or editing canvas nodes.
4. **Theme awareness** — Watch `document.body.dataset.framerTheme` (or a MutationObserver) to keep dark/light treatments in sync with the editor chrome.
5. **Dev-only logging** — Gate verbose logs behind `window.location.hostname === "localhost"` so production builds stay silent.

## Verification & Licensing Flow

1. **Spreadsheet source of truth** — Create a Google Sheet with headers such as *Client Email*, *Access Code*, *Plugin Name*, *Framer User ID*, etc.
2. **Apps Script endpoint** — Replace the default script with the provided template, set the spreadsheet ID (constant or Script Properties), deploy as a Web App (execute as you, accessible to anyone with link, GET only), and copy the URL.
3. **JSONP helper** — Add `const VERIFY_ENDPOINT = import.meta.env.VITE_VERIFY_ENDPOINT || "https://script.google.com/.../exec"` to your plugin. Implement a helper that injects a `<script>` tag with a unique callback, passes `email`, `access_code`, `plugin_name`, optional `framer_user_id`, and `bind`, then cleans up after success or timeout (~15s).
4. **Two-step verification** — Run a pre-check (`bind=false`) to catch invalid invoices, then run the binding call (`bind=true`) only after the pre-check succeeds. Handle granular errors like `wrong_plugin`, `not_found`, `bound_to_other`, and `bound_requires_user_id`.
5. **UI gate** — Block the rest of the interface with a dedicated verification screen until `authStatus === "authorized"`. Surface success/error states via `framer.notify` and keep the experience branded (e.g., animated background).
6. **Session caching** — Persist auth data in both `localStorage` (`AUTH_STORAGE_ID`, `SESSION_LOCAL_KEY`, `SESSION_FORCE_FRESH_KEY`, legacy keys) and `writeUserScopedPluginData` so state follows the user across projects. Respect “force fresh” flags when users sign out or credentials change.

## Quality Checks

- `npm run lint` — Type-aware linting (TypeScript + ESLint) before every commit.
- `npm run build && npm run preview` — Smoke-test the production bundle prior to packaging.
- Optional UI smoke tests (Playwright/Cypress) can ping `https://localhost:5173` to ensure the verification endpoint responds before releases.
- Keep console output clean; unexpected logs can block Marketplace submissions.

## Publishing Workflow

1. **Preflight** — Confirm environment variables (verify endpoint, code-component URL), light/dark parity, verification overlay, and fallback insertions all behave as expected.
2. **Package** — From the Plugin directory run `npm run pack` (or `npx framer-plugin-tools@latest pack`) to generate `plugin.zip`.
3. **Submit** — In the Framer Marketplace dashboard choose “New Plugin”, upload `plugin.zip`, provide metadata (name, description, icon, screenshots), and submit for review.
4. **Update cadence** — Repeat the pack/upload cycle whenever you ship changes; Marketplace versioning increments automatically once the new zip is processed.

## Helpful References

- `PLUGIN_TEMPLATE_GUIDE.md` — End-to-end playbook for scaffolding, verification, caching, theming, and publishing.
- `Framer_Plugin_reference.md` — Full plugin API surface (canvas traits, CMS helpers, managed collections, plugin UI controls).
- `Framer_component_reference.md` — Code component utilities, property controls, localization, and Motion bindings available in Framer’s runtime.

Use these docs together to adapt the template to your branding, wire up licensing safeguards, and keep every plugin release consistent from local dev through Marketplace submission.
