/**
 * Framer Component Insert Pattern with Dynamic Sizing
 * 
 * A comprehensive pattern for inserting Framer components with dynamic sizing,
 * permission handling, fallback mechanisms, and proper error handling.
 * 
 * Features:
 * - Dynamic intrinsic sizing based on component style
 * - Permission-aware insertion with fallback frame creation
 * - Comprehensive error handling and user feedback
 * - Component URL management and version stripping
 * - Proper attribute mapping and control structure
 * 
 * @example
 * ```tsx
 * const inserted = await insertComponentWithFallback({
 *     componentUrl: "https://framer.com/m/MyComponent-v1abc.js",
 *     controls: mappedControls,
 *     animationStyle: "circle",
 *     fallbackOptions: {
 *         name: "My Component Placeholder",
 *         cornerRadius: 8,
 *         fills: [{ type: "solid", color: "#1a1a1a" }]
 *     }
 * })
 * ```
 */

import { framer } from "framer-plugin"

// Types for the insertion pattern
export type AnimationStyle = "circle" | "bar" | "text"

export interface InsertionSize {
    width: number
    height: number
}

export interface ComponentControls {
    [key: string]: any
}

export interface FallbackOptions {
    name: string
    cornerRadius?: number
    fills?: Array<{ type: string; color: string }>
    pluginData?: Record<string, any>
}

export interface InsertComponentOptions {
    componentUrl: string
    controls: ComponentControls
    animationStyle: AnimationStyle
    fallbackOptions?: FallbackOptions
    onPermissionError?: (url: string) => Promise<void>
    onError?: (error: Error, context: any) => Promise<void>
}

// Color constants for UI elements
export const FRAMER_COLORS = {
    // Background Colors
    bgWindow: '#111111',
    bgSecondary: '#1D1D1D',
    inputBackground: '#1C1C1C',
    surfaceCard: '#1a1a1a',
    surfacePanel: '#161616',
    surfaceBackground: '#111111',
    
    // Text Colors
    textPrimary: '#ffffff',
    textSecondary: '#b0b0b0',
    textTertiary: '#808080',
    textSubtle: '#606060',
    
    // Accent Colors
    accentPrimary: '#8550ff',
    accentSecondary: '#00d4ff',
    accentFocusRing: 'rgba(133, 79, 255, 0.3)',
    
    // Border Colors
    borderSoft: '#2a2a2a',
    borderStrong: '#404040',
    checkboxBorder: '#2a2a2a',
    
    // Other Colors
    ghostBg: '#1a1a1a',
    ghostText: '#b0b0b0',
    ghostBorder: '#2a2a2a',
    badgeBg: '#2a2a2a',
    badgeText: '#b0b0b0',
    previewBorder: '#2a2a2a',
    errorText: '#ff6b6b',
    cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
} as const

/**
 * Dynamic sizing function based on animation style
 * Returns optimal dimensions for different component types
 */
export const getDynamicInsertionSize = (style: AnimationStyle): InsertionSize => {
    switch (style) {
        case "circle":
            return { width: 300, height: 300 }
        case "bar":
            return { width: 600, height: 48 } // Force horizontal orientation
        case "text":
            return { width: 600, height: 48 } // Force horizontal orientation
        default:
            return { width: 300, height: 300 }
    }
}

/**
 * Strip Framer module version from URL for cleaner insertion
 * Removes @version suffix from .js files
 */
export const stripFramerModuleVersion = (url: string): string => {
    return url.replace(/(\.js)@[^/?#]+/g, "$1")
}

/**
 * Create a fallback frame when component insertion fails
 * Provides a visual placeholder with basic styling
 */
export const createFallbackFrame = async (
    size: InsertionSize,
    options: FallbackOptions
): Promise<boolean> => {
    try {
        // Check permissions for frame creation
        let canCreateFrame = false
        try {
            canCreateFrame = await framer.isAllowedTo('createFrame')
        } catch {
            // Permission check failed, assume we don't have permission
        }

        if (!canCreateFrame) {
            return false
        }

        // Create the frame node
        const node = await framer.createFrame({
            width: size.width,
            height: size.height,
        })

        if (!node) return false

        // Set frame attributes
        if (typeof node.setAttributes === "function") {
            await node.setAttributes({
                name: options.name,
                width: size.width,
                height: size.height,
                cornerRadius: options.cornerRadius || 0,
                fills: options.fills || [],
            } as any)
        } else {
            // Fallback for older Framer versions
            node.name = options.name
            node.width = size.width
            node.height = size.height
        }

        // Store plugin data for later component replacement
        if (typeof node.setPluginData === "function" && options.pluginData) {
            await node.setPluginData(options.pluginData)
        }

        return true
    } catch (error) {
        console.error("Failed to create fallback frame:", error)
        return false
    }
}

/**
 * Main component insertion function with comprehensive error handling
 * Handles permissions, fallbacks, and provides detailed user feedback
 */
export const insertComponentWithFallback = async (
    options: InsertComponentOptions
): Promise<{ success: boolean; componentId?: string; fallbackUsed?: boolean }> => {
    const {
        componentUrl,
        controls,
        animationStyle,
        fallbackOptions,
        onPermissionError,
        onError,
    } = options

    // Validate component URL
    const cleanUrl = stripFramerModuleVersion(componentUrl.trim())
    if (!cleanUrl) {
        await framer.notify(
            "Component URL missing. Please provide a valid Framer component URL.",
            { variant: "error" }
        )
        return { success: false }
    }

    // Get dynamic sizing based on animation style
    const insertionSize = getDynamicInsertionSize(animationStyle)

    // Prepare insertion attributes
    const insertAttrs = {
        width: insertionSize.width,
        height: insertionSize.height,
        // Property control values must live under controls
        controls: controls,
    } as any

    try {
        // Check insertion permissions
        const canInsert = await framer.isAllowedTo('addComponentInstance')
        if (!canInsert) {
            // Handle permission error with fallback
            if (onPermissionError) {
                await onPermissionError(cleanUrl)
            }

            // Try fallback insertion
            if (fallbackOptions) {
                const fallbackSuccess = await createFallbackFrame(insertionSize, fallbackOptions)
                if (fallbackSuccess) {
                    await framer.notify(
                        `⚠️ Inserted a frame placeholder (${insertionSize.width}×${insertionSize.height}) because component insertion permissions are restricted. To insert the actual component, grant "addComponentInstance" permission in Framer's plugin settings.`,
                        { variant: "warning" }
                    )
                    return { success: true, fallbackUsed: true }
                }
            }

            await framer.notify(
                `Plugin permissions don't allow inserting components. You can manually add the component by pasting this URL onto the Framer Canvas: ${cleanUrl}`,
                { variant: "error" }
            )
            return { success: false }
        }

        // Insert the component
        const inserted = await framer.addComponentInstance({
            url: cleanUrl,
            attributes: insertAttrs,
        } as any)

        if (!inserted || typeof (inserted as any).id !== "string") {
            throw new Error("Component insertion returned invalid result")
        }

        const insertedId = (inserted as any).id

        // Set parent to canvas root for proper positioning
        try {
            const canSetParent = await framer.isAllowedTo('setParent')
            const canvasRoot = await framer.getCanvasRoot()
            if (canSetParent && canvasRoot?.id) {
                await framer.setParent(insertedId, canvasRoot.id as any)
            }
        } catch (parentErr) {
            console.warn("Failed to set parent to canvas root:", parentErr)
        }

        // Explicitly enforce the frame size (component may load asynchronously)
        try {
            const canSet = await framer.isAllowedTo('setAttributes')
            if (canSet) {
                await (framer as any).setAttributes(insertedId, {
                    width: insertionSize.width as any,
                    height: insertionSize.height as any,
                    controls: controls,
                } as any)

                // Retry setting attributes after a delay to handle async loading
                const retrySetAttributes = async () => {
                    try {
                        await (framer as any).setAttributes(insertedId, {
                            width: insertionSize.width as any,
                            height: insertionSize.height as any,
                            controls: controls,
                        } as any)
                    } catch (retryErr) {
                        console.warn("Retry setting attributes failed:", retryErr)
                    }
                }

                setTimeout(retrySetAttributes, 500)
            }
        } catch (attrErr) {
            console.warn("Failed to set component attributes:", attrErr)
        }

        // Center the component in the canvas
        try {
            const canGetPosition = await framer.isAllowedTo('getPosition')
            const canSetPosition = await framer.isAllowedTo('setPosition')
            
            if (canGetPosition && canSetPosition) {
                const canvasRoot = await framer.getCanvasRoot()
                const parentRect = await framer.getRect(canvasRoot?.id || "")
                const instRect = await framer.getRect(insertedId)
                
                if (parentRect && instRect) {
                    const parentWidth = Math.max(1, Math.round((parentRect as any)?.width ?? 0))
                    const instanceWidth = Math.max(1, Math.round((instRect as any)?.width ?? insertionSize.width))
                    
                    // Calculate center position
                    const centerPercent = 50 // Center horizontally
                    const topPercent = 30 // Position at 30% from top
                    
                    await (framer as any).setPosition(insertedId, {
                        x: { type: "percent", value: centerPercent },
                        y: { type: "percent", value: topPercent },
                    } as any)
                }
            }
        } catch (posErr) {
            console.warn("Failed to center component:", posErr)
        }

        return { success: true, componentId: insertedId }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        
        // Provide context-aware error messages
        let userMessage = `Failed to insert component: ${errorMessage}`
        
        if (errorMessage.includes("Permission") || errorMessage.includes("permission") || errorMessage.includes("not allowed")) {
            userMessage += " This may be a plugin permission issue. Try: 1) Paste the component URL directly onto the Framer Canvas to add it manually, or 2) Check Plugins → Developer Tools for permission settings."
        } else if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("404") || errorMessage.includes("Failed to fetch") || errorMessage.includes("module")) {
            userMessage += ` The component URL may not be accessible. Ensure the component is publicly shared in Framer (Assets → Code → right-click component → Copy URL). You can also paste this URL directly onto the Canvas: ${cleanUrl}`
        } else if (errorMessage.includes("lookup contains invalid query")) {
            userMessage += ` This usually means Framer rejected the component URL or the insert attributes. Try pasting the URL directly onto the Canvas to verify it works: ${cleanUrl}`
        } else {
            userMessage += ` You can manually add the component by pasting this URL directly onto the Framer Canvas: ${cleanUrl}`
        }
        
        await framer.notify(userMessage, { variant: "error" })

        // Call custom error handler if provided
        if (onError) {
            await onError(error instanceof Error ? error : new Error(errorMessage), {
                componentUrl: cleanUrl,
                insertAttrs,
                insertionSize,
                controls,
                animationStyle,
            })
        }

        return { success: false }
    }
}

/**
 * Utility function to map plugin controls to component property controls
 * This should be customized based on your specific component structure
 */
export const mapControlsToComponentPropertyControls = (pluginControls: any): ComponentControls => {
    // Example mapping - customize for your component
    return {
        // Bar controls
        bar: {
            animationStyle: pluginControls.loadBar?.animationStyle,
            width: pluginControls.loadBar?.width,
            showTrack: pluginControls.loadBar?.showTrack,
            trackColor: pluginControls.loadBar?.trackColor,
            progressColor: pluginControls.loadBar?.progressColor,
            cornerRadius: pluginControls.loadBar?.barRadius,
        },
        // Label controls
        label: {
            text: pluginControls.label?.text,
            position: pluginControls.label?.position,
            outsideDirection: pluginControls.label?.labelOutsideDirection,
            font: pluginControls.label?.font,
            size: pluginControls.label?.size,
            color: pluginControls.label?.color,
        },
        // Progress controls
        progress: {
            value: pluginControls.progress?.value,
            showPercentage: pluginControls.progress?.showPercentage,
        },
        // Gate controls
        gate: {
            enabled: pluginControls.gate?.enabled,
            trigger: pluginControls.gate?.trigger,
            threshold: pluginControls.gate?.threshold,
            perpetual: pluginControls.gate?.perpetual,
            replayGap: pluginControls.gate?.replayGap,
        },
    }
}

/**
 * Remove undefined values from object recursively
 * Prevents undefined values from being passed to Framer API
 */
export const pruneUndefinedDeep = (obj: any): any => {
    if (obj === null || obj === undefined) return undefined
    if (typeof obj !== 'object') return obj
    
    if (Array.isArray(obj)) {
        return obj.map(pruneUndefinedDeep).filter(val => val !== undefined)
    }
    
    const pruned: any = {}
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const val = pruneUndefinedDeep(obj[key])
            if (val !== undefined) {
                pruned[key] = val
            }
        }
    }
    
    return pruned
}
