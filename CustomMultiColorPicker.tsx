/**
 * Custom Multi-Color Picker for Gradient Colors
 * 
 * A wrapper component that displays two color pickers side-by-side for selecting
 * gradient start and end colors. Manages picker state to ensure only one is open at a time.
 * 
 * @example
 * ```tsx
 * <CustomMultiColorPicker
 *     colorStart="#8550ff"
 *     colorEnd="#59ddf7"
 *     onChange={(type, value) => {
 *         if (type === 'colorStart') setStartColor(value)
 *         else setEndColor(value)
 *     }}
 * />
 * ```
 */
import * as React from "react"
import { CustomColorPicker } from "./CustomColorPicker"

interface CustomMultiColorPickerProps {
    colorStart: string
    colorEnd: string
    onChange: (type: 'colorStart' | 'colorEnd', value: string) => void
}

export const CustomMultiColorPicker: React.FC<CustomMultiColorPickerProps> = ({ 
    colorStart, 
    colorEnd, 
    onChange 
}) => {
    const [activePicker, setActivePicker] = React.useState<'start' | 'end' | null>(null)

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label className="formLabel">Colors</label>
            
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "0px",
                borderRadius: "6px",
                overflow: "visible",
                height: "auto",
                minHeight: "32px",
                boxSizing: "border-box"
            }}>
                {/* Color Start */}
                <div style={{ 
                    gap: "5px",
                    padding: "0px"
                }}>
                    <div style={{ 
                        position: "relative", 
                        height: "100%",
                        display: "flex",
                        alignItems: "center"
                    }}>
                        <CustomColorPicker 
                            color={colorStart}
                            onChange={(value) => onChange('colorStart', value)}
                            isOpen={activePicker === 'start'}
                            onOpen={() => setActivePicker('start')}
                            onClose={() => setActivePicker(null)}
                        />
                    </div>
                </div>
                
                {/* Color End */}
                <div style={{ 
                    gap: "5px",
                    padding: "0px"
                }}>
                    <div style={{ 
                        position: "relative", 
                        height: "100%",
                        display: "flex",
                        alignItems: "center"
                    }}>
                        <CustomColorPicker 
                            color={colorEnd}
                            onChange={(value) => onChange('colorEnd', value)}
                            isOpen={activePicker === 'end'}
                            onOpen={() => setActivePicker('end')}
                            onClose={() => setActivePicker(null)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
