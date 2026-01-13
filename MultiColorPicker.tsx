/**
 * Multi-Color Picker Component
 * A custom color picker that allows selecting two colors (start and end) for gradients
 * Copy-paste ready component for Framer plugins
 * 
 * NOTE: When copying this file to a React project, add:
 * import * as React from "react"
 * at the top of the file
 */

interface MultiColorPickerProps {
    colorStart: string
    colorEnd: string
    onChange: (type: 'colorStart' | 'colorEnd', value: string) => void
}

export function MultiColorPicker({ 
    colorStart, 
    colorEnd, 
    onChange 
}: MultiColorPickerProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label className="formLabel">Colors</label>
            
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "0",
                borderRadius: "6px",
                overflow: "hidden",
                height: "32px",
                boxSizing: "border-box"
            }}>
                {/* Color Start */}
                <div style={{ 
                    position: "relative", 
                    height: "100%",
                    overflow: "hidden"
                }}>
                    <input
                        type="color"
                        value={colorStart}
                        onChange={(e) => onChange('colorStart', e.target.value)}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            border: "none",
                            padding: 0,
                            margin: 0,
                            zIndex: 2
                        }}
                    />
                    <div
                        style={{
                            backgroundColor: colorStart,
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            borderRight: "1px solid var(--border-soft)",
                            boxSizing: "border-box",
                            pointerEvents: "none",
                            zIndex: 1
                        }}
                    />
                </div>
                
                {/* Color End */}
                <div style={{ 
                    position: "relative", 
                    height: "100%",
                    overflow: "hidden"
                }}>
                    <input
                        type="color"
                        value={colorEnd}
                        onChange={(e) => onChange('colorEnd', e.target.value)}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            border: "none",
                            padding: 0,
                            margin: 0,
                            zIndex: 2
                        }}
                    />
                    <div
                        style={{
                            backgroundColor: colorEnd,
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            boxSizing: "border-box",
                            pointerEvents: "none",
                            zIndex: 1
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

// Usage example:
/*
function MyComponent() {
    const [colors, setColors] = useState({
        colorStart: "#c0b7ff",
        colorEnd: "#5ad9f7"
    })

    return (
        <MultiColorPicker
            colorStart={colors.colorStart}
            colorEnd={colors.colorEnd}
            onChange={(type, value) => setColors(prev => ({ ...prev, [type]: value }))}
        />
    )
}
*/
