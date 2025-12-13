# Framer Plugin Development Guide

A comprehensive guide for creating professional Framer plugins using best practices and standardized architecture.

## Overview

This guide combines the essential knowledge needed to develop, test, and publish Framer plugins. It covers plugin architecture, API usage, verification systems, and deployment workflows.

## Quick Start

### Prerequisites

- Node.js 18+ and npm (or pnpm/yarn)
- Framer desktop app with *Plugins → Developer Tools* enabled
- HTTPS certificates for localhost (handled automatically via mkcert)

### Initial Setup

```bash
# Create plugin scaffold
npm create framer-plugin@latest
cd your-plugin && npm install

# Start development server (Framer expects 5173)
npm run dev -- --host localhost --port 5173
```

### Open in Framer

1. Choose *Plugins → Open Development Plugin*
2. Enter `https://localhost:5173`
3. Allow-list `framer.com` if using ad-blockers

### Mandatory Port 5173 Rule

- Framer’s dev bridge is hardcoded to `https://localhost:5173`; run only one plugin there at a time.
- If another process uses 5173, kill it and restart: `npm run dev -- --host localhost --port 5173`.

### Environment Variables

Create `.env.local` for local development (no secrets):

```env
VITE_VERIFY_ENDPOINT=https://your-verification-endpoint
VITE_COMPONENT_URL=https://your-component-url
VITE_DEBUG=true
```

## Architecture

### File Structure

```text
your-plugin/
├── Plugin/
│   ├── src/App.tsx         # Main plugin UI
│   ├── src/App.css         # Styling and layout
│   ├── src/main.tsx        # Entry point
│   ├── framer.json         # Plugin manifest
│   ├── package.json        # Dependencies and scripts
│   └── vite.config.ts      # Build configuration
└── PluginComponent.tsx     # Canvas code component
```

### Key Design Principles
- **Fixed window size**: Lock UI to ~320–365 px wide, ~760–830 px tall; keep it non-resizable.
- **Standard padding**: Maintain ~20 px outer padding and single-column layouts.
- **Component sizing**: Match code component intrinsic dimensions with insertion attributes; include fallbacks for projects without insert permission.
- **Permission checks**: Gate all Framer API calls with `framer.isAllowedTo`.
- **Theming**: Read `document.body.dataset.framerTheme` (light/dark) and style via CSS variables.

## Theme & Background Coverage
- Listen for `data-framer-theme` changes and drive your palette through CSS custom properties.
- Set backgrounds on `html, body, #root, main` to a theme token (e.g., `var(--bg-window)`) so gaps don’t show default black/white.
- Keep plugin surfaces on a single-column layout with consistent gaps; ensure light/dark parity before shipping.

### Theme Tokens
- Light: `--bg-window: #ffffff`, `--surface-panel: rgba(255, 255, 255, 0.8)`, `--surface-card: #ffffff`, `--border-soft: rgba(17,17,17,0.08)`, `--border-strong: rgba(17,17,17,0.14)`, `--text-primary: #111`, `--text-secondary: rgba(17,17,17,0.64)`, `--accent-primary: #854fff`, `--input-background: #ffffff`
- Dark: `--bg-window: #0c0b13`, `--surface-panel: rgba(30,27,46,0.82)`, `--surface-card: #1e1b2e`, `--border-soft: rgba(255,255,255,0.1)`, `--text-primary: rgba(255,255,255,0.94)`, `--accent-primary: #b89bff`, `--input-background: rgba(20,18,30,0.85)`
- Detect theme via `document.body.dataset.framerTheme` and listen for mutation changes.

### Settings UI Patterns
- **SettingsPopover**: Render via portal to `document.body`; panel ~220–250px wide with `border-radius: 12px`, `box-shadow: 0 8px 32px rgba(0,0,0,0.15)`. Trigger 28×28px, hover `var(--ghost-bg)`, icon 16×16px rotates on open. Classes: `.settingsMenu`, `.settingsMenu-trigger`, `.settingsMenu-icon`, `.settingsMenu-overlay`, `.settingsMenu-panel`, `.settingsMenu-account`, `.settingsMenu-actions`, `.settingsMenu-item`.
- **Groups & rows**: `SettingsGroup` toggle padding `14px 16px`, hover `var(--ghost-bg)`, chevron rotates 180°. `SettingsGrid` flex-column gap 12px. `SettingsRow` flex wrap gap 12px; labels flex `1 1 0`, min-width 100px. Variants: `.settingsRow--two` (gap 8px), `.settingsRow--triple` (min-width 80px). Use `.flexColumn` for stacked label/input.

### Form Controls
- Sliders: 3px track, thumb 16px circle with `--accent-primary`, border `--surface-card`, hover scale 1.1.
- Color inputs: 32px height, radius 6px, border `--border-soft`, focus ring `--accent-focus-ring`.
- Selects: radius 6px, padding `8px 10px`, custom arrow background, focus border `--accent-primary` with 3px ring.
- Checkboxes: 18px square, 1.5px border `--checkbox-border`, radius 5px; checked background `--accent-primary` with white checkmark.

## Plugin UI Development

### React Components
```tsx
import { useEffect, useState } from "react"
import { framer } from "framer-plugin"

export default function App() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    framer.getCurrentUser().then(setUser)
  }, [])
  
  return <div>Your plugin UI</div>
}
```

### Theme Awareness
```tsx
const [theme, setTheme] = useState('light')

useEffect(() => {
  const updateTheme = () => {
    setTheme(document.body.dataset.framerTheme || 'light')
  }
  
  updateTheme()
  const observer = new MutationObserver(updateTheme)
  observer.observe(document.body, { attributes: true })
  
  return () => observer.disconnect()
}, [])
```

## Common Patterns

### Permission Wrapper

```tsx
const withPermission = (permission, fn) => {
  if (!framer.isAllowedTo(permission)) {
    framer.notify(`Permission denied: ${permission}`, { type: "error" })
    return
  }
  return fn()
}

// Usage
withPermission("addComponentInstance", () => {
  framer.addComponentInstance({...})
})
```

### Error Boundary

```tsx
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false)
  
  if (hasError) {
    return <div>Something went wrong. Please refresh.</div>
  }
  
  return (
    <ErrorBoundaryComponent onError={() => setHasError(true)}>
      {children}
    </ErrorBoundaryComponent>
  )
}
```

### Loading State Hook

```tsx
const useAsync = (fn, deps = []) => {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  
  useEffect(() => {
    let cancelled = false
    
    fn()
      .then(data => !cancelled && setState({ loading: false, data, error: null }))
      .catch(error => !cancelled && setState({ loading: false, data: null, error }))
    
    return () => { cancelled = true }
  }, deps)
  
  return state
}
```

## Canvas Interaction

### Adding Components
```tsx
const addComponent = async () => {
  if (!framer.isAllowedTo("addComponentInstance")) {
    framer.notify("Cannot add components to this project")
    return
  }
  
  await framer.addComponentInstance({
    url: "https://your-component-url",
    attributes: {
      width: 600,
      height: 400,
      // Component-specific props
    }
  })
}
```

### Working with Selection
```tsx
const [selection, setSelection] = useState([])

useEffect(() => {
  return framer.subscribeToSelection(setSelection)
}, [])

const selectNode = (nodeId) => {
  framer.setSelection([nodeId])
}
```

## Verification & Licensing

### Google Apps Script Setup

1. **Create Spreadsheet** with headers:
   - Client Email
   - Access Code  
   - Plugin Name
   - Framer User ID

2. **Apps Script Template**:
```javascript
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"
const SHEET_NAME = "Purchases"

function doGet(e) {
  const params = e?.parameter || {}
  const email = String(params.email || "").trim().toLowerCase()
  const accessCode = String(params.access_code || "").trim()
  const pluginName = params.plugin_name || ""
  const framerUserId = params.framer_user_id || ""
  const bind = params.bind === "1"
  
  // Verification logic here
  // Return JSONP response
}
```

### Client-Side Verification (JSONP)

```tsx
const verifyAccess = (email, accessCode, bind = false) => {
  return new Promise((resolve, reject) => {
    const callback = `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const script = document.createElement('script')
    
    window[callback] = (response) => {
      cleanup()
      resolve(response)
    }
    
    const cleanup = () => {
      delete window[callback]
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
    
    const params = new URLSearchParams({
      email: email.trim().toLowerCase(),
      access_code: accessCode.trim(),
      plugin_name: PLUGIN_NAME,
      framer_user_id: user?.id || "",
      bind: bind ? "1" : "0",
      callback
    })
    
    script.src = `${VERIFY_ENDPOINT}?${params}`
    script.onerror = () => {
      cleanup()
      reject(new Error('Network error'))
    }
    
    document.head.appendChild(script)
    
    setTimeout(() => {
      if (window[callback]) {
        cleanup()
        reject(new Error('Timeout'))
      }
    }, 15000)
  })
}
```

### Two-Step Verification Flow

```tsx
const handleVerification = async () => {
  try {
    setAuthStatus("checking")
    
    // Step 1: Pre-check (bind: false)
    const preCheck = await verifyAccess(email, accessCode, false)
    if (!preCheck.ok || !preCheck.valid) {
      setAuthStatus("unauthorized")
      framer.notify(preCheck.error || "Invalid credentials", { type: "error" })
      return
    }
    
    // Step 2: Bind if needed (bind: true)
    if (!preCheck.bound && user?.id) {
      const bindResult = await verifyAccess(email, accessCode, true)
      if (!bindResult.ok || !bindResult.valid) {
        setAuthStatus("unauthorized")
        framer.notify(bindResult.error || "Binding failed", { type: "error" })
        return
      }
    }
    
    setAuthStatus("authorized")
    framer.notify("Access granted!", { type: "success" })
    
    // Cache session
    localStorage.setItem('auth_session', JSON.stringify({
      email,
      verified: true,
      timestamp: Date.now()
    }))
    
  } catch (error) {
    setAuthStatus("unauthorized")
    framer.notify("Verification failed", { type: "error" })
  }
}
```

### Session Persistence

- Use multiple storage layers for reliability:
  - `localStorage` for session cache
  - `framer.writeUserScopedPluginData()` for user-scoped storage
  - `framer.setPluginData()` for project-scoped fallback
- Recommended session lifetime: 8 hours (`8 * 60 * 60 * 1000` ms)
- Session object: `{ email, projectName, expiresAt }`

## Data Management

### Plugin Data Storage
```tsx
// Store data across sessions
await framer.setPluginData('settings', JSON.stringify(settings))

// Retrieve stored data
const stored = await framer.getPluginData('settings')
const settings = stored ? JSON.parse(stored) : {}

// User-scoped data (follows user across projects)
await framer.writeUserScopedPluginData('preferences', preferences)
```

### CMS Integration
```tsx
// Get all collections
const collections = await framer.getCollections()

// Work with managed collections
const managedCollections = await framer.getManagedCollections()

// Add items to collection
await collection.addItems([{
  id: 'unique-id',
  fieldData: {
    title: 'New Item',
    description: 'Description'
  }
}])
```

## Code Components

### Component Structure
```tsx
import { addPropertyControls, ControlType } from "framer"

// Component with intrinsic dimensions
export function PluginComponent({ 
  title = "Default Title",
  color = "#09F" 
}) {
  return (
    <div style={{ 
      background: color,
      padding: 20,
      borderRadius: 8
    }}>
      {title}
    </div>
  )
}

// Define intrinsic size
PluginComponent.defaultProps = {
  width: 600,
  height: 400,
}

// Add property controls
addPropertyControls(PluginComponent, {
  title: {
    type: ControlType.String,
    title: "Title"
  },
  color: {
    type: ControlType.Color,
    title: "Background Color"
  }
})
```

### Render Target Detection
```tsx
import { RenderTarget, useIsStaticRenderer } from "framer"

export function SmartComponent() {
  const isStatic = useIsStaticRenderer()
  const isOnCanvas = RenderTarget.current() === RenderTarget.canvas
  
  if (isStatic || isOnCanvas) {
    return <StaticPreview />
  }
  
  return <InteractiveComponent />
}
```

## Development Workflow

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { framer } from 'vite-plugin-framer'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [react(), mkcert(), framer()],
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: true
  },
  build: {
    sourcemap: true,
    minify: 'esbuild'
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})
```

### Package Scripts

```json
{
  "scripts": {
    "dev": "vite --host localhost --port 5173",
    "build": "vite build",
    "preview": "vite preview --port 4173",
    "lint": "eslint . --ext ts,tsx --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "pack": "npx framer-plugin-tools@latest pack",
    "pack:preview": "npm run build && npm run pack && npm run preview",
    "clean": "rm -rf dist node_modules package-lock.json",
    "fresh": "npm run clean && npm install"
  }
}
```

### Quick Commands

```bash
# Fresh start
npm run fresh && npm run dev

# Quick build test
npm run build && npm run preview

# Pre-publish check
npm run lint && npm run type-check && npm run build

# Package for marketplace
npm run pack
```

### Debug Commands

```bash
# Check what's in the build
npm run build && npx vite preview --port 4173

# Test component in isolation
npx framer preview PluginComponent.tsx

# Verify plugin package contents
unzip -l plugin.zip
```

### Deploy Scripts

**deploy.sh** (pre-publish checklist):

```bash
#!/bin/bash
echo "Building plugin..."
npm run build

echo "Running checks..."
npm run lint
npm run type-check

echo "Packaging..."
npm run pack

echo "Ready to upload to Marketplace!"
echo "Package: plugin.zip"
echo "Size: $(du -h plugin.zip)"
```

**switch-env.sh** (environment switcher):

```bash
#!/bin/bash
ENV=${1:-development}

case $ENV in
  "dev")
    cp .env.dev .env.local
    echo "Switched to development"
    ;;
  "prod")
    cp .env.prod .env.local
    echo "Switched to production"
    ;;
  *)
    echo "Usage: ./switch-env.sh [dev|prod]"
    ;;
esac
```

## Quality Checks
```bash
# Type checking and linting
npm run lint

# Build and test production bundle
npm run build && npm run preview

# Create plugin package
npm run pack
```

## API Reference

### Core Plugin APIs
- **Navigation**: `framer.navigateTo()`, `framer.zoomIntoView()`
- **UI Control**: `framer.showUI()`, `framer.hideUI()`, `framer.closePlugin()`
- **User Info**: `framer.getCurrentUser()`
- **Permissions**: `framer.isAllowedTo()`, `framer.subscribeToIsAllowedTo()`

### Canvas Operations
- **Components**: `framer.addComponentInstance()`, `framer.addDetachedComponentLayers()`
- **Nodes**: `framer.createFrameNode()`, `framer.cloneNode()`, `framer.removeNode()`
- **Selection**: `framer.getSelection()`, `framer.setSelection()`, `framer.subscribeToSelection()`

### Data & Storage
- **Plugin Data**: `framer.setPluginData()`, `framer.getPluginData()`
- **User Data**: `framer.writeUserScopedPluginData()`, `framer.readUserScopedPluginData()`
- **Assets**: `framer.uploadImage()`, `framer.uploadFile()`, `framer.addSvg()`

## Publishing

### Pre-Flight Checklist
- [ ] Environment variables configured
- [ ] Dark/light theme parity tested
- [ ] Verification flow working
- [ ] Error handling implemented
- [ ] Console logs gated for production
- [ ] Component fallbacks provided

### Manual Testing Checklist
1. Clear local storage/session and test fresh verification flow (including invalid credentials).
2. Test component insertion with and without permissions.
3. Check theme switching (light/dark) and control styles.
4. Exercise network timeout and error handling paths.
5. Confirm plugin closes properly and console is clean in production build.

### Packaging
```bash
# Create plugin package
npm run pack
# Generates plugin.zip for Marketplace submission
```

### Marketplace Submission
1. Go to Framer Marketplace dashboard
2. Select "New Plugin"
3. Upload `plugin.zip`
4. Provide metadata (name, description, icon, screenshots)
5. Submit for review

## Best Practices

### Performance
- Use React.memo for expensive components
- Implement proper loading states
- Cache API responses when appropriate
- Minimize re-renders with useCallback/useMemo

### Security
- Never expose API keys in client code
- Validate all user inputs
- Use HTTPS for all external requests
- Implement proper error boundaries

### User Experience
- Provide clear feedback for all actions
- Use `framer.notify()` for important messages
- Implement proper loading and error states
- Maintain consistent spacing and typography

### Code Quality
- Use TypeScript for type safety
- Implement proper error handling
- Write meaningful comments for complex logic
- Follow consistent naming conventions

## Troubleshooting

### Common Issues
- **Port conflicts**: Ensure port 5173 is available
- **HTTPS errors**: Check that mkcert is properly installed
- **Permission denied**: Verify user has required Framer permissions
- **Component not inserting**: Check component URL and permissions

### Debug Tips
```tsx
// Development-only logging
const __isLocal = window.location.hostname === "localhost"

if (__isLocal) {
  console.log('Debug info:', data)
}

// Permission debugging
const canAddComponents = framer.isAllowedTo("addComponentInstance")
console.log('Can add components:', canAddComponents)
```

## Resources

- [Framer Plugin API Documentation](https://www.framer.com/docs/plugins/)
- [Framer Component API](https://www.framer.com/docs/components/)
- [Vite Configuration Guide](https://vitejs.dev/config/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

This guide provides a solid foundation for building professional Framer plugins. Follow these patterns and best practices to create reliable, user-friendly plugins that integrate seamlessly with the Framer ecosystem.
