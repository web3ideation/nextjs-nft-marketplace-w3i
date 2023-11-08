import React, { createContext, useContext, useState, useCallback } from "react"

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

export const NftNotificationProvider = ({ children, maxNotifications = 7 }) => {
    const [nftNotifications, setNftNotifications] = useState([])

    const clearNftNotification = useCallback((id) => {
        setNftNotifications((currentNotifications) => {
            return currentNotifications.filter((notification) => notification.id !== id)
        })
    }, [])

    const closeNftNotification = useCallback((id) => {
        setNftNotifications((currentNotifications) => {
            return currentNotifications.map((notification) => {
                if (notification.id === id) {
                    // Setzen Sie nur die Eigenschaft 'closing' auf true
                    return { ...notification, isSticky: false, closing: true }
                }
                return notification
            })
        })
    }, [])

    const showNftNotification = useCallback(
        (title, message, type, isSticky = false) => {
            const id = Math.random().toString(36).substr(2, 9)
            const newNotification = {
                id,
                title,
                message,
                type,
                isSticky,
            }

            setNftNotifications((prevNotifications) => {
                // Wenn die maximale Anzahl erreicht ist, entfernen Sie die älteste Benachrichtigung
                const notifications = [newNotification, ...prevNotifications]
                if (notifications.length > maxNotifications) {
                    // Entfernen Sie die letzte Benachrichtigung im Array
                    notifications.pop()
                }
                return notifications
            })
            return id
        },
        [maxNotifications]
    )

    return (
        <NftNotificationContext.Provider
            value={{
                nftNotifications,
                showNftNotification,
                clearNftNotification,
                closeNftNotification,
            }}
        >
            {children}
        </NftNotificationContext.Provider>
    )
}
