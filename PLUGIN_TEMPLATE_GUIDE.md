# Plugin-Name Architecture Template

Use this guide as a reusable playbook for any Framer plugin. It mirrors the structure of the existing project but replaces specific branding and endpoints with generic “Plugin-Name” placeholders so you can safely hand it to collaborators or clients.

## Quick Start (always on port 5173)

- **Create a scaffold**  
  ```bash
  npm create framer-plugin@latest      # or pnpm/yarn equivalents
  cd Plugin-Name && npm install
  ```
- **Run the dev server**  
  ```bash
  npm run dev -- --host localhost --port 5173
  ```  
  Vite + `vite-plugin-framer` will hot-reload the UI inside Framer. Keep this command running; Framer polls `https://localhost:5173`.
- **Prereqs**: Node 18+, HTTPS certificates (handled automatically by `vite-plugin-mkcert`), Framer desktop app with *Plugins → Developer Tools* enabled.
- **Open in Framer**: *Plugins → Open Development Plugin* → enter `https://localhost:5173`. If Brave/ad-blockers block localhost, allow-list `framer.com`.

## File Structure & Build System

```
Plugin-Name/
├── Plugin/
│   ├── src/App.tsx         # Plugin UI, verification screen, component insertion
│   ├── src/App.css         # Base padding + layout
│   ├── src/main.tsx        # Mounts <App/>
│   ├── framer.json         # Metadata
│   ├── package.json        # Scripts + deps
│   └── vite.config.ts      # Vite + mkcert + framer plugin config
└── PluginComponent.tsx     # Published Framer code component (Canvas)
```

- Lock `framer.showUI` width/height (e.g., `width: 320, height: 760`) so layout remains predictable.
- Keep `main` padding at `20px` (see `App.css`) to align controls with Framer’s metrics.
- In `vite.config.ts` keep plugins `[react(), mkcert(), framer()]` and (optionally) set `server: { port: 5173 }` for clarity.

## Plugin Window, Padding, and Component Sizing

- Code components should define `@framerIntrinsicWidth`/`Height` plus matching default props (e.g., 600 × 600).  
- When inserting via `framer.addComponentInstance`, pass the same width/height so the canvas node matches design intent.  
- Provide a fallback (e.g., `framer.createFrameNode`) for projects lacking permissions to insert code components.
- Maintain generous padding inside the plugin UI to prevent cramped controls in the 320 px-wide panel.

## Verification Page + Google Apps Script Endpoint

Every plugin should include a gated verification experience when licensing is required. Recreate the existing flow with your own Google Apps Script (GAS) endpoint by following these steps:

### 1. Prepare the Spreadsheet

Create a Google Sheet with row‑1 headers:

```
Client Name | Client Email | Paid At | Access Code | Plugin Name | Framer User ID
```

At minimum you need **Client Email**, **Access Code**, **Plugin Name**, and **Framer User ID** for the verifier/binder to work.

### 2. Create the Apps Script

1. In the sheet choose *Extensions → Apps Script*.
2. Replace the default script with the sanitized template below (no proprietary IDs included).
3. Set your spreadsheet ID via the constant or Script Properties.

```ts
/****************************************************
 * Plugin-Name — License Verifier API (read-only + binder)
 ****************************************************/

const SPREADSHEET_ID = PropertiesService.getScriptProperties()
  .getProperty("SHEET_ID") || "YOUR_SPREADSHEET_ID";
const SHEET_NAME = "Purchases";
const CACHE_SECONDS = 300; // adjust as needed

function norm(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getHeaderMap_(sheet) {
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};
  header.forEach((h, i) => (map[norm(h)] = i + 1));
  return map;
}

function respond_(payload, callback) {
  const body = JSON.stringify(payload);
  if (callback) {
    return ContentService.createTextOutput(`${callback}(${body});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}

const MEMO = {};
function getCache_(key) {
  if (MEMO[key]) return MEMO[key];
  const raw = CacheService.getScriptCache().get(key);
  if (!raw) return null;
  return (MEMO[key] = JSON.parse(raw));
}
function putCache_(key, value, seconds) {
  MEMO[key] = value;
  CacheService.getScriptCache().put(key, JSON.stringify(value), seconds);
}

function doGet(e) {
  const params = e?.parameter || {};
  const callback = (params.callback || "").trim();
  const email = String(params.email || "").trim().toLowerCase();
  const accessCode = String(params.access_code || "").trim();
  const framerUserId = String(params.framer_user_id || "").trim();
  const pluginName = norm(params.plugin || params.plugin_name || "plugin-name");
  const bind = params.bind === "1";
  const noCache = params.nocache === "1";

  if (!email || !accessCode) {
    return respond_({ ok: false, error: "missing email or access_code" }, callback);
  }

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) {
    return respond_({ ok: false, error: `Sheet "${SHEET_NAME}" not found` }, callback);
  }

  const map = getHeaderMap_(sheet);
  const col = (label) => map[norm(label)] || 0;
  const cEmail = col("Client Email");
  const cCode = col("Access Code");
  const cPlugin = col("Plugin Name");
  const cFuid = col("Framer User ID");
  const cClient = col("Client Name");

  if (!cEmail || !cCode || !cPlugin || !cFuid) {
    return respond_({ ok: false, error: "Missing required columns" }, callback);
  }

  const rowCount = sheet.getLastRow() - 1;
  if (rowCount <= 0) {
    return respond_({ ok: true, valid: false, bound: false, reason: "not_found" }, callback);
  }

  const readCol = (colIdx) => sheet.getRange(2, colIdx, rowCount, 1).getValues().flat();
  const emailValues = readCol(cEmail);
  const codeValues = readCol(cCode);
  const pluginValues = readCol(cPlugin);
  const framerIds = readCol(cFuid);
  const clientNames = cClient ? readCol(cClient) : [];

  const matches = [];
  for (let i = 0; i < rowCount; i++) {
    if (emailValues[i]?.toLowerCase().trim() === email && codeValues[i]?.trim() === accessCode) {
      matches.push(i);
    }
  }
  if (!matches.length) {
    return respond_({ ok: true, valid: false, bound: false, reason: "not_found" }, callback);
  }

  const filtered = pluginName
    ? matches.filter((i) => norm(pluginValues[i]) === pluginName)
    : matches;
  if (!filtered.length) {
    const firstIdx = matches[0];
    return respond_(
      {
        ok: true,
        valid: false,
        bound: !!String(framerIds[firstIdx]).trim(),
        reason: "wrong_plugin",
        plugin_name_found: pluginValues[firstIdx],
      },
      callback,
    );
  }

  let idx = filtered.find((i) => !String(framerIds[i]).trim());
  if (idx === undefined) idx = filtered.find((i) => String(framerIds[i]).trim() === framerUserId);
  if (idx === undefined) idx = filtered[0];

  const projectName = clientNames[idx];
  const boundFuid = String(framerIds[idx] || "").trim();
  const buildResponse = (payload) => respond_(payload, callback);

  let cacheKey = null;
  if (!noCache && !bind) {
    const tag = pluginName || "any";
    cacheKey = `verify:${email}:${accessCode}:${framerUserId || "anonymous"}:${tag}`;
    const cached = getCache_(cacheKey);
    if (cached) return buildResponse(cached);
  }

  const setCache = (payload) => {
    if (cacheKey) putCache_(cacheKey, payload, CACHE_SECONDS);
    return buildResponse(payload);
  };

  if (bind || (framerUserId && !boundFuid)) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(5000);
      const cell = sheet.getRange(idx + 2, cFuid, 1, 1);
      const current = String(cell.getValue() || "").trim();
      if (!current && framerUserId) {
        cell.setValue(framerUserId);
        return setCache({ ok: true, valid: true, bound: true, project_name: projectName, action: "bound" });
      }
      if (current === framerUserId) {
        return setCache({ ok: true, valid: true, bound: true, project_name: projectName, action: "already_bound" });
      }
      return setCache({ ok: true, valid: false, bound: true, reason: "bound_to_other" });
    } finally {
      try {
        lock.releaseLock();
      } catch (_) {}
    }
  }

  if (!boundFuid) {
    return setCache({ ok: true, valid: true, bound: false, project_name: projectName });
  }
  if (!framerUserId) {
    return setCache({ ok: true, valid: false, bound: true, reason: "bound_requires_user_id" });
  }
  if (boundFuid === framerUserId) {
    return setCache({ ok: true, valid: true, bound: true, project_name: projectName, action: "already_bound" });
  }
  return setCache({ ok: true, valid: false, bound: true, reason: "bound_to_other" });
}
```

### 3. Publish the Script

1. *Deploy → New deployment → Web app.*
2. Execute as **Me**, allow access to **Anyone with link** (GET only).
3. Copy the Web App URL; use it as `VERIFY_ENDPOINT`.
4. Store sensitive values (sheet IDs) in Script Properties or environment variables when possible.

### 4. Integrate with the Plugin

- Add `const VERIFY_ENDPOINT = import.meta.env.VITE_VERIFY_ENDPOINT || "https://script.google.com/.../exec"` to `App.tsx`.
- Implement a JSONP helper identical to `verifyAccessJSONP`:
  - Create a temporary `<script>` tag with `callback=uniqueName`.
  - Pass `email`, `access_code`, `plugin_name`, optional `framer_user_id`, and `bind`.
  - Clean up the tag + callback when resolved or on timeout.
- Build a two-step flow:
  1. **Pre-check (`bind: false`)** — fail fast for obvious errors.
  2. **Bind (`bind: true`)** — only after pre-check passes; handle responses for `wrong_plugin`, `not_found`, `bound_to_other`, `bound_requires_user_id`.
- Show a dedicated verification page (full-height overlay) until `authStatus === "authorized"`. Include animated background, clear error messaging, and CTA to retry.

## Caching Login State

- Track sessions for ~8 hours with keys such as:
  - `AUTH_STORAGE_ID` (localStorage snapshot)
  - `SESSION_LOCAL_KEY` (localStorage session)
  - `SESSION_FORCE_FRESH_KEY` (forces revalidation)
  - `LEGACY_SESSION_KEY` (plugin data fallback)
- Persist sessions in both localStorage and `writeUserScopedPluginData` so they roam with the Framer account.
- Respect the “force fresh” flag when a user signs out or when credentials change.
- Wrap reads/writes in try/catch and gate `framer.setPluginData` calls with `framer.isAllowedTo("setPluginData")`.

## Visual & Interaction Guidelines

- **Dark + Light modes**: Use `document.body.dataset.framerTheme` (or MutationObserver) to sync with the host editor and theme your components (cards, inputs, sliders, backgrounds) accordingly.
- **Canvas previews**: For interactive components, mirror the code component’s behavior inside the plugin window (e.g., `<GridPreview />`) so users see real-time changes.
- **Console logs**: Guard them with `const __isLocal = window.location.hostname === "localhost"` and only log in dev mode to avoid leaking user data in production builds.
- **Padding & spacing**: Keep a single scrollable column, 12–16 px gaps, and 20 px outer padding to stay readable within 320 px width.

## Package Dependencies

- Runtime: `framer-plugin`, `react`, `react-dom`, optional icon packs (e.g., `@phosphor-icons/react`).
- Tooling: `vite`, `@vitejs/plugin-react` or `@vitejs/plugin-react-swc`, `vite-plugin-framer`, `vite-plugin-mkcert`, `typescript`, `eslint`, `typescript-eslint`.
- Scripts:
  ```json
  {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --max-warnings 0",
    "pack": "npx framer-plugin-tools@latest pack"
  }
  ```

## Development Workflow

1. `npm run dev -- --port 5173` (HMR + Framer bridge).  
2. `npm run lint` before commits; fix hooks/perf warnings early.  
3. `npm run build && npm run preview` to smoke-test production output.  
4. Keep console output clean unless `__isLocal` is true.  
5. Wrap every Framer API call in permission checks (`framer.isAllowedTo("addComponentInstance")`, etc.).

## Publishing & Marketplace Checklist

1. **Pre-flight**
   - Update `VERIFY_ENDPOINT` and `PLUGIN_COMPONENT_URL` constants.
   - Confirm dark/light parity, verification flow, and fallback insertions.
   - Run lint + build.
2. **Package**
   - `npm run pack` (generates `plugin.zip`).
3. **Submit**
   - Marketplace dashboard → “New Plugin” → upload `plugin.zip`, fill metadata, verify icon/name, and submit.
4. **Update**
   - After changes, bump version, rerun `npm run pack`, and upload the new zip.

## Additional Tips

- Document controls and presets inside `README.md` plus this template for onboarding.
- Add troubleshooting for common issues (permissions, port conflicts, missing HTTPS).
- Consider smoke tests (Playwright/Cypress) against `localhost:5173` to ping the verification endpoint before every release.
- Keep a change log so future Plugin-Name derivatives know when endpoints, component URLs, or sizing requirements changed.

Follow this template and you can hand off Plugin-Name to any collaborator without exposing proprietary identifiers while preserving the exact architecture, verification flow, caching strategy, and visual polish expected from your plugin suite.
