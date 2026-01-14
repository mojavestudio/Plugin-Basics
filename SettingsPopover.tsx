/**
 * Settings Popover Component - Centered Modal with User Profile
 * 
 * A centered modal settings popover that appears when clicking the gear icon.
 * Features user profile display, user guide link, and sign out functionality.
 * Uses createPortal for proper z-index stacking and includes click-outside-to-close behavior.
 * 
 * @example
 * ```tsx
 * import { SettingsPopover } from './SettingsPopover'
 * import { Gear } from "@phosphor-icons/react"
 * 
 * const [settingsOpen, setSettingsOpen] = useState(false)
 * 
 * <button onClick={() => setSettingsOpen(true)}>
 *   <Gear size={16} />
 * </button>
 * 
 * <SettingsPopover
 *   user={user}
 *   isOpen={settingsOpen}
 *   onClose={() => setSettingsOpen(false)}
 *   onSignOut={handleSignOut}
 * />
 * ```
 */
import * as React from "react"
import { createPortal } from "react-dom"

interface SettingsPopoverProps {
    user?: any
    displayNameOverride?: string | null
    isOpen: boolean
    onClose: () => void
    onSignOut?: () => void
}

export const SettingsPopover: React.FC<SettingsPopoverProps> = ({ 
    user, 
    displayNameOverride, 
    isOpen, 
    onClose, 
    onSignOut 
}) => {
    if (!isOpen) return null

    const displayName =
        (displayNameOverride && displayNameOverride.trim()) ||
        (user?.name && user.name.trim()) ||
        user?.email ||
        "Unknown user"

    // Click outside to close
    React.useEffect(() => {
        const handlePointer = (event: Event) => {
            const target = event.target instanceof Node ? event.target : null
            if (!target) return
            
            // Check if click is outside the settings panel
            const settingsPanel = document.querySelector('.settingsMenu-panel')
            if (settingsPanel && !settingsPanel.contains(target)) {
                onClose()
            }
        }

        document.addEventListener("mousedown", handlePointer)
        document.addEventListener("touchstart", handlePointer)
        
        return () => {
            document.removeEventListener("mousedown", handlePointer)
            document.removeEventListener("touchstart", handlePointer)
        }
    }, [onClose])

    return createPortal(
        <div className="settingsMenu">
            <div className="settingsMenu-overlay" onClick={onClose} />
            <div className="settingsMenu-panel" onClick={(e) => e.stopPropagation()}>
                <div className="settingsMenu-account">
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                        Signed in as
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {displayName}
                    </div>
                </div>

                <div className="settingsMenu-actions">
                    <a
                        href="#"
                        className="settingsMenu-item"
                        onClick={(e) => {
                            e.preventDefault()
                            window.open("https://mojavestud.io/plugins/your-plugin", "_blank", "noopener")
                        }}
                    >
                        User Guide
                    </a>
                    <a
                        href="#"
                        className="settingsMenu-item"
                        onClick={(e) => {
                            e.preventDefault()
                            onSignOut?.()
                        }}
                    >
                        Sign Out
                    </a>
                </div>
            </div>
        </div>,
        document.body
    )
}
