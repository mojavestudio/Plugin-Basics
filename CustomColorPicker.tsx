/**
 * Custom Framer-style Color Picker with Opacity Support
 * 
 * A sophisticated color picker component that matches Framer's design language.
 * Features HSL color square selection, hue/opacity sliders, RGB inputs, and eyedropper tool.
 * 
 * @example
 * ```tsx
 * <CustomColorPicker 
 *     color="#8550ff" 
 *     onChange={(color) => console.log(color)}
 *     isOpen={true}
 *     onClose={() => setIsOpen(false)}
 * />
 * ```
 */
import * as React from "react"
import { Eyedropper } from "@phosphor-icons/react"

interface ColorPickerProps {
    color: string
    onChange: (color: string) => void
    isOpen?: boolean
    onOpen?: () => void
    onClose?: () => void
}

// Helper functions for color conversion
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}

const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16)
        return hex.length === 1 ? "0" + hex : hex
    }).join("")
}

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h = h / 360
    s = s / 100
    l = l / 100
    
    let r, g, b

    if (s === 0) {
        r = g = b = l
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1/6) return p + (q - p) * 6 * t
            if (t < 1/2) return q
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
            return p
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    }
}

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
            case g: h = ((b - r) / d + 2) / 6; break
            case b: h = ((r - g) / d + 4) / 6; break
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    }
}

export const CustomColorPicker: React.FC<ColorPickerProps> = ({ 
    color, 
    onChange, 
    isOpen = false, 
    onOpen, 
    onClose 
}) => {
    const [hexValue, setHexValue] = React.useState(color)
    const [hsl, setHsl] = React.useState(() => {
        const rgb = hexToRgb(color)
        return rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, l: 0 }
    })
    const [opacity, setOpacity] = React.useState(100)

    React.useEffect(() => {
        setHexValue(color)
        const rgb = hexToRgb(color)
        if (rgb) {
            setHsl(rgbToHsl(rgb.r, rgb.g, rgb.b))
        }
    }, [color])

    const handleColorSquareChange = (event: React.PointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const saturation = (x / rect.width) * 100
        const lightness = (1 - y / rect.height) * 100

        const newHsl = { ...hsl, s: saturation, l: lightness }
        setHsl(newHsl)
        
        const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
        const newHex = rgbToHex(rgb.r, rgb.g, rgb.b)
        setHexValue(newHex)
        onChange(newHex)
    }

    const handleHueChange = (newHue: number) => {
        const newHsl = { ...hsl, h: newHue }
        setHsl(newHsl)
        
        const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
        const newHex = rgbToHex(rgb.r, rgb.g, rgb.b)
        setHexValue(newHex)
        onChange(newHex)
    }

    const handleOpacityChange = (newOpacity: number) => {
        setOpacity(newOpacity)
        // Note: For simplicity, we're not handling alpha in hex output
        // In a real implementation, you might want to support RGBA/HSLA
    }

    const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
        const numValue = parseInt(value) || 0
        const clampedValue = Math.max(0, Math.min(255, numValue))
        
        const rgb = hexToRgb(hexValue) || { r: 0, g: 0, b: 0 }
        const newRgb = { ...rgb, [channel]: clampedValue }
        
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
        setHexValue(newHex)
        
        const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b)
        setHsl(newHsl)
        
        onChange(newHex)
    }

    const handleEyedropper = async () => {
        try {
            if ('EyeDropper' in window) {
                const eyeDropper = new (window as any).EyeDropper()
                const result = await eyeDropper.open()
                if (result.sRGBHex) {
                    setHexValue(result.sRGBHex)
                    onChange(result.sRGBHex)
                    
                    const rgb = hexToRgb(result.sRGBHex)
                    if (rgb) {
                        setHsl(rgbToHsl(rgb.r, rgb.g, rgb.b))
                    }
                }
            }
        } catch (error) {
            console.error('Eyedropper API not available or failed:', error)
        }
    }

    const rgb = hexToRgb(hexValue) || { r: 0, g: 0, b: 0 }
    const hslGradient = `linear-gradient(to right, 
        hsl(0, 100%, 50%), 
        hsl(60, 100%, 50%), 
        hsl(120, 100%, 50%), 
        hsl(180, 100%, 50%), 
        hsl(240, 100%, 50%), 
        hsl(300, 100%, 50%), 
        hsl(360, 100%, 50%))`
    
    const opacityGradient = `linear-gradient(to right, 
        transparent, 
        hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%))`

    return (
        <div className="customColorPicker">
            {/* Color preview button */}
            <div 
                className="colorPreview" 
                style={{ backgroundColor: hexValue }}
                onClick={onOpen}
            />
            
            {/* Popup */}
            {isOpen && (
                <div className="colorPickerPopup">
                    <div className="colorSquareContainer">
                        <div 
                            className="colorSquare"
                            style={{ 
                                backgroundColor: `hsl(${hsl.h}, 100%, 50%)`,
                                backgroundImage: `
                                    radial-gradient(circle at 50% 0%, hsl(${hsl.h}, 0%, 100%), transparent),
                                    radial-gradient(circle at 50% 100%, hsl(${hsl.h}, 100%, 0%), transparent)
                                `
                            }}
                            onPointerDown={handleColorSquareChange}
                        >
                            <div 
                                className="colorIndicator"
                                style={{ 
                                    left: `${(hsl.s / 100) * 100}%`,
                                    top: `${(1 - hsl.l / 100) * 100}%`
                                }} 
                            />
                        </div>
                    </div>

                    {/* Hue slider */}
                    <div className="sliderContainer">
                        <div className="framerColorSliderWrapper" style={{ background: hslGradient }}>
                            <div 
                                className="framerColorHueCircle" 
                                style={{ left: `${(hsl.h / 360) * 100}%` }} 
                            />
                            <input
                                className="framerColorHue"
                                type="range"
                                min={0}
                                max={360}
                                value={Math.round(hsl.h)}
                                onChange={(e) => handleHueChange(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Opacity slider */}
                    <div className="sliderContainer">
                        <div className="framerColorSliderWrapper" style={{ background: opacityGradient }}>
                            <div 
                                className="framerColorAlphaCircle" 
                                style={{ left: `${opacity}%` }} 
                            />
                            <input
                                className="framerColorAlpha"
                                type="range"
                                min={0}
                                max={100}
                                value={Math.round(opacity)}
                                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Input fields */}
                    <div className="inputContainer">
                        {/* RGB Input Fields */}
                        <div className="rgbInput">
                            <input
                                type="text"
                                value={hexToRgb(hexValue)?.r || 0}
                                onChange={(e) => handleRgbChange('r', e.target.value)}
                                className="rgbTextField"
                                placeholder="R"
                                maxLength={3}
                            />
                            <span className="rgbSeparator">|</span>
                            <input
                                type="text"
                                value={hexToRgb(hexValue)?.g || 0}
                                onChange={(e) => handleRgbChange('g', e.target.value)}
                                className="rgbTextField"
                                placeholder="G"
                                maxLength={3}
                            />
                            <span className="rgbSeparator">|</span>
                            <input
                                type="text"
                                value={hexToRgb(hexValue)?.b || 0}
                                onChange={(e) => handleRgbChange('b', e.target.value)}
                                className="rgbTextField"
                                placeholder="B"
                                maxLength={3}
                            />
                        </div>
                        
                        {/* Eyedropper Button */}
                        <button 
                            className="eyedropperButton"
                            onClick={handleEyedropper}
                            title="Pick color from screen"
                        >
                            <Eyedropper size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
