## Settings Menu Dropdown (SettingsPopover) - Updated

The settings menu is a **centered modal popover** that appears when clicking the gear icon in the top-right corner. This updated version provides a better user experience with centered positioning and proper modal overlay.

### Key Improvements
- **Centered modal** - Appears in the center of the window instead of dropdown
- **Grey overlay** - Background is greyed out to focus attention on the modal
- **Phosphor Gear icon** - Must use `@phosphor-icons/react` Gear icon for consistency
- **Click-outside-to-close** - Clicking outside the modal closes it
- **Portal rendering** - Uses `createPortal` for proper z-index stacking

### Component Structure
```tsx
import { SettingsPopover } from './SettingsPopover'
import { Gear } from "@phosphor-icons/react"

const [settingsOpen, setSettingsOpen] = useState(false)

// Settings button in header
<button 
    onClick={() => setSettingsOpen(true)}
    className="settingsButton"
>
    <Gear size={16} />
</button>

// Settings modal
<SettingsPopover
    user={user}
    isOpen={settingsOpen}
    onClose={() => setSettingsOpen(false)}
    onSignOut={handleSignOut}
/>
```

### Required Dependencies
- React and React DOM
- `@phosphor-icons/react` for the Gear icon
- Framer plugin CSS variables for theming

### CSS Classes Required
```css
/* Main settings menu container */
.settingsMenu {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

/* Grey overlay */
.settingsMenu-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

/* Centered modal panel */
.settingsMenu-panel {
  background: var(--surface-card);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 16px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  min-width: 280px;
  max-width: 90vw;
}

/* Settings button with Phosphor Gear */
.settingsButton {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  color: var(--text-primary);
  transition: background-color 0.2s ease;
}

.settingsButton:hover {
  background: var(--ghost-bg);
}
```

### Component Features
- **User Profile Section** - Shows "Signed in as" with display name/email
- **User Guide Link** - Opens documentation in new tab
- **Sign Out Button** - Calls provided signOut handler
- **Responsive Design** - Works on different screen sizes
- **Theme Support** - Uses Framer CSS variables for light/dark mode
- **Accessibility** - Proper focus management and keyboard navigation

### Usage Notes
- Import the CSS file: `import './SettingsPopover.css'`
- Ensure Gear icon from `@phosphor-icons/react` is used
- Modal uses `createPortal` to render in `document.body`
- Clicking outside the modal or pressing Escape closes it
- All styling uses Framer plugin CSS variables for consistency
