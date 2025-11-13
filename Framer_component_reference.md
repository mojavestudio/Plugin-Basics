# Framer Component Reference

A list of exports from the Framer library that are available inside every Code Component.

## RenderTarget

Use `RenderTarget` to detect which context your Code Component is currently being shown in. The helper exposes `RenderTarget.current()` plus type-safe constants you can compare against.

### Available contexts

- `RenderTarget.canvas` — The main canvas
- `RenderTarget.export` — The export canvas
- `RenderTarget.thumbnail` — Project thumbnails
- `RenderTarget.preview` — The preview or live site

```ts
import { RenderTarget } from 'framer'

const isOnCanvas = RenderTarget.current() === RenderTarget.canvas
```

### Canvas and export safety

Animated components (for example WebGL shaders) should use `useIsStaticRenderer()` instead of checking `RenderTarget` directly. This keeps the component static on the canvas and during asset export to avoid heavy renders or tiling issues.

```ts
import { useIsStaticRenderer } from 'framer'

const isStaticRenderer = useIsStaticRenderer()
```

## Localization

When implementing localization you can build a custom locale picker by reading and setting locale data through `useLocaleInfo()`. For most cases Smart Components are preferred, but the hook is available when you need custom logic.

```tsx
import { useLocaleInfo } from 'framer'

export function LocalePicker() {
  const { activeLocale, locales, setLocale } = useLocaleInfo()

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const locale = locales.find(l => l.id === event.target.value)
    if (locale) setLocale(locale)
  }

  return (
    <select value={activeLocale?.id ?? 'default'} onChange={handleChange}>
      {locales.map(locale => (
        <option key={locale.id} value={locale.id}>
          {locale.name}
        </option>
      ))}
    </select>
  )
}
```

## Property Controls

Property controls let users pass props to a Code Component through the Framer interface. Configure them by calling `addPropertyControls(component, controls)`. For the full type reference, see the Property Controls guide.

```tsx
import { addPropertyControls, ControlType } from 'framer'

function Button({ tint = '#09F' }) {
  return <button style={{ background: tint }}>Hello</button>
}

addPropertyControls(Button, {
  tint: {
    type: ControlType.Color
  }
})
```

## Framer Motion

Every Code Component also has access to the full Motion for React API, which you can import from `framer-motion`.

```ts
import { animate, motion } from 'framer-motion'
```
