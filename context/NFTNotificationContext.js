import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

const NftNotificationContext = createContext({
    nftNotifications: [],
    showNftNotification: () => {},
    clearNftNotification: () => {},
})

export const useNftNotification = () => {
    const context = useContext(NftNotificationContext)
    if (!context) {
        throw new Error("useNftNotification must be used within a NftNotificationContextProvider")
    }
    return context
}

export const NftNotificationProvider = ({ children }) => {
    const [nftNotifications, setNftNotifications] = useState([])

    const clearNftNotification = useCallback((id) => {
        setNftNotifications((currentNotifications) => {
            return currentNotifications.filter((notification) => notification.id !== id)
        })
    }, [])

    const showNftNotification = useCallback(
        (title, message, type, duration = 5000, isSticky = false) => {
            const id = Math.random().toString(36).substr(2, 9)
            const newNotification = {
                id,
                title,
                message,
                type,
                isVisible: true,
                isSticky,
                className: "enter", // Start with the 'enter' class
            }

            setNftNotifications((prevNotifications) => [newNotification, ...prevNotifications])

            if (!isSticky) {
                setTimeout(() => {
                    setNftNotifications((currentNotifications) => {
                        return currentNotifications.map((notification) => {
                            if (notification.id === id) {
                                return { ...notification, className: "exit" } // Change to 'exit' class to animate out
                            }
                            return notification
                        })
                    })

                    // After the exit animation, remove the notification from state
                    setTimeout(() => clearNftNotification(id), 1000) // Match the animation duration
                }, duration)
            }
        },
        [clearNftNotification]
    )

    return (
        <NftNotificationContext.Provider
            value={{ nftNotifications, showNftNotification, clearNftNotification }}
        >
            {children}
        </NftNotificationContext.Provider>
    )
}
