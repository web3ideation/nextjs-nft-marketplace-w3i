import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

// Create a context with a default value that matches the shape that consumers expect
const NftNotificationContext = createContext({
    nftNotifications: [],
    showNftNotification: () => {}, // A no-op function for the default value
    clearNftNotification: () => {},
})

export const useNftNotification = () => {
    const context = useContext(NftNotificationContext)

    // Throw an error if the context is not wrapped with a provider
    if (!context) {
        throw new Error("useNftNotification must be used within a NftNotificationContextProvider")
    }
    return context
}

// Define a provider component for the notification context
export const NftNotificationProvider = ({ children }) => {
    // State to hold multiple notification details
    const [nftNotifications, setNftNotifications] = useState([])

    // Function to clear a specific notification
    const clearNftNotification = (id) => {
        setNftNotifications((currentNotifications) => {
            return currentNotifications.map((notification) => {
                if (notification.id === id) {
                    // Trigger exit animation
                    return { ...notification, isVisible: false }
                }
                return notification
            })
        })

        // Set a timeout to remove the notification after the animation
        const animationDuration = 300 // Duration of the exit animation in milliseconds
        setTimeout(() => {
            setNftNotifications((currentNotifications) => {
                return currentNotifications.filter((notification) => notification.id !== id)
            })
        }, animationDuration)
    }

    // Function to show a new notification
    const showNftNotification = useCallback(
        (title, message, type, duration = 5000, isSticky = false) => {
            const id = Math.random().toString(36).substr(2, 9) // Generate a unique ID for each notification
            const newNotification = {
                id,
                title,
                message,
                type,
                duration,
                isVisible: true,
                isSticky,
            }

            setNftNotifications((prevNotifications) => {
                // Calculate the total height that existing notifications should move down
                const totalHeight = prevNotifications.reduce((total, notification) => {
                    // You need to know the height of each notification
                    // This could be a fixed height or dynamically calculated
                    const notificationHeight = 50 // Example fixed height
                    return total + notificationHeight + 10 // 10 is the margin-bottom from the CSS
                }, 0)

                // Apply a transform to each existing notification to move it down
                const updatedNotifications = prevNotifications.map((notification) => ({
                    ...notification,
                    style: { transform: `translateY(${totalHeight}px)` },
                }))

                return [newNotification, ...updatedNotifications]
            })
            if (!isSticky) {
                // Set a timeout to clear the notification after the duration
                setTimeout(() => clearNftNotification(id), duration + 1000)
            }
        },
        []
    )

    // Effect for cleanup on unmount
    useEffect(() => {
        return () => {
            // Clear all timeouts when the provider unmounts
            nftNotifications.forEach((notif) => {
                if (notif.timeout) clearTimeout(notif.timeout)
            })
        }
    }, [nftNotifications])

    // Render the provider with the notification state and the show function as the context value
    return (
        <NftNotificationContext.Provider
            value={{ nftNotifications, showNftNotification, clearNftNotification }}
        >
            {children}
        </NftNotificationContext.Provider>
    )
}
