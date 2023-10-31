import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

// Create a context with a default value that matches the shape that consumers expect
const NftNotificationContext = createContext({
    nftNotification: {
        title: "",
        message: "",
        type: "",
        isVisible: false, // Default to not visible
    },
    showNftNotification: () => {}, // A no-op function for the default value
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
    // State to hold the notification details
    const [nftNotification, setNftNotification] = useState({
        title: "",
        message: "",
        type: "",
        isVisible: false,
        duration: 0,
    })

    // State to store the timeout ID for clearing the notification
    const [timeoutId, setTimeoutId] = useState(null)

    // Function to clear the current notification
    const clearNftNotification = useCallback(() => {
        if (timeoutId) clearTimeout(timeoutId) // Clear the timeout if it exists
        setNftNotification((prev) => ({ ...prev, isVisible: false })) // Hide the notification
        setTimeoutId(null) // Reset the timeout ID
    }, [timeoutId])

    // Function to show a new notification
    const showNftNotification = useCallback(
        (title, message, type, duration = 5000) => {
            console.log(`Showing notification for ${duration}ms`) // Debug log
            if (timeoutId) {
                clearTimeout(timeoutId) // Löschen Sie den vorhandenen Timeout, wenn einer vorhanden ist
            }
            const id = setTimeout(() => {
                console.log("Clearing notification after timeout") // Debug log
                clearNftNotification() // Verwenden Sie eine Funktion, um den vorherigen Zustand zu erhalten und zu aktualisieren
            }, duration)
            setTimeoutId(id) // Speichern Sie die neue Timeout-ID
            setNftNotification({ title, message, type, isVisible: true, duration }) // Fügen Sie die Dauer zum Zustand hinzu
        },
        [timeoutId, clearNftNotification]
    )

    // Effect for cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutId) clearTimeout(timeoutId) // Clear the timeout when the provider unmounts
        }
    }, [timeoutId])

    // Render the provider with the notification state and the show function as the context value
    return (
        <NftNotificationContext.Provider
            value={{ nftNotification, showNftNotification, clearNftNotification }}
        >
            {children}
        </NftNotificationContext.Provider>
    )
}
