## Color Picker Components

### Advanced Custom Color Picker
See `CustomColorPicker.tsx` for a sophisticated single-color picker with Framer-style design.

**Features:**
- HSL color square with hue/saturation/lightness selection
- Hue slider with gradient background
- Opacity slider with transparency preview
- RGB input fields with visual separators (R|G|B)
- Eyedropper tool for screen color picking
- Advanced color conversion utilities (hex ↔ RGB ↔ HSL)
- Popup/dropdown behavior with proper positioning
- TypeScript with comprehensive prop types

**Dependencies:**
- React
- @phosphor-icons/react (for Eyedropper icon)
- CSS classes for styling (see App.css in repository)

**Usage:**
```tsx
import * as React from "react"
import { CustomColorPicker } from './CustomColorPicker'

const [color, setColor] = useState("#8550ff")
const [isOpen, setIsOpen] = useState(false)

<CustomColorPicker 
    color={color}
    onChange={setColor}
    isOpen={isOpen}
    onOpen={() => setIsOpen(true)}
    onClose={() => setIsOpen(false)}
/>
```

### Multi-Color Picker for Gradients
See `CustomMultiColorPicker.tsx` for selecting gradient start/end colors.

**Features:**
- Two-column layout for start/end colors
- Manages active picker state (only one open at a time)
- Grid layout with customizable gaps
- Clean separation between color pickers
- TypeScript with proper prop types

**Usage:**
```tsx
import * as React from "react"
import { CustomMultiColorPicker } from './CustomMultiColorPicker'

const [colors, setColors] = useState({
    colorStart: "#8550ff",
    colorEnd: "#59ddf7"
})

<CustomMultiColorPicker
    colorStart={colors.colorStart}
    colorEnd={colors.colorEnd}
    onChange={(type, value) => setColors(prev => ({ ...prev, [type]: value }))}
/>
```

### Color Picker Slider Pattern
Use this pattern for hue/opacity sliders with circular indicators:

```tsx
<div className="framerColorSliderWrapper" style={{ background: hueGradient }}>
  <div className="framerColorHueCircle" style={{ left: `${(h / 360) * 100}%` }} />
  <input
    className="framerColorHue"
    type="range"
    min={0}
    max={360}
    value={Math.round(h)}
    onChange={...}
  />
</div>
```

**CSS Classes Required:**
```css
.framerColorSliderWrapper {
  position: relative;
  width: 100%;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--border-soft);
  cursor: pointer;
}

.framerColorSliderWrapper input {
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.framerColorSliderWrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  background: inherit;
  border-radius: inherit;
  pointer-events: none;
}

.framerColorHueCircle,
.framerColorAlphaCircle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  z-index: 5;
}
```

### Integration Notes
- Both components use Framer CSS variables for theming
- Requires monospace font for input fields
- Uses standard 32px height for consistency
- Proper focus states with accent colors
- Hover states with smooth transitions
