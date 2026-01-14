/**
 * Insert Button Component - Phosphor Plus Icon with Hover Text
 * 
 * A clean insert button that uses a Phosphor Plus icon and shows "Insert" text on hover.
 * Perfect for plugin insert functionality with a minimal, modern design.
 * 
 * Key improvements:
 * - Fixed positioning issues with high z-index and pointerEvents
 * - Inline SVG PlusIcon for reliable rendering
 * - Proper hover text animation (appears to left of icon)
 * - Prevents clipping with overflow: visible
 * - Works inside containers with pointerEvents: none
 * 
 * @example
 * ```tsx
 * import { InsertButton } from './InsertButton'
 * 
 * const [isInserting, setIsInserting] = useState(false)
 * 
 * <InsertButton
 *   onInsert={handleInsert}
 *   disabled={isInserting}
 *   loading={isInserting}
 *   position={{ top: "16px", right: "32px" }}
 * />
 * ```
 */
import * as React from "react"
import { Plus } from "@phosphor-icons/react"

interface InsertButtonProps {
    onInsert: () => void
    disabled?: boolean
    loading?: boolean
    className?: string
    style?: React.CSSProperties
    position?: {
        top?: string
        right?: string
        bottom?: string
        left?: string
    }
    zIndex?: number
}

// Inline SVG PlusIcon for reliable rendering
const PlusIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
)

export const InsertButton: React.FC<InsertButtonProps> = ({ 
    onInsert, 
    disabled = false, 
    loading = false,
    className = "",
    style = {},
    position = { top: "16px", right: "32px" },
    zIndex = 10000
}) => {
    return (
        <button
            onClick={onInsert}
            disabled={disabled || loading}
            className={`insertButton ${className}`}
            style={{
                position: "absolute",
                top: position.top,
                right: position.right,
                bottom: position.bottom,
                left: position.left,
                width: "40px",
                height: "40px",
                background: "none",
                border: "none",
                color: "var(--text-primary)",
                cursor: disabled || loading ? "not-allowed" : "pointer",
                zIndex: zIndex,
                textAlign: "left",
                pointerEvents: "auto",
                overflow: "visible",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                ...style
            }}
        >
            {loading ? "..." : <PlusIcon size={20} />}
            <span className="insertButtonText">Insert</span>
        </button>
    )
}
