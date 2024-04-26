import React, { createContext, useContext, useReducer, useCallback } from "react"

const defaultState = {
    notifications: [],
    showNotification: () => {},
    clearNotification: () => {},
    closeNotification: () => {},
}

const NotificationContext = createContext(defaultState)

// Reducer function to manage state updates in a more predictable way
const notificationReducer = (state, action) => {
    switch (action.type) {
        case "ADD_NOTIFICATION":
            const newNotifications = [action.payload, ...state.notifications]
            if (newNotifications.length > action.maxNotifications) {
                newNotifications.pop() // Ensure max notifications are not exceeded
            }
            return { ...state, notifications: newNotifications }

        case "CLEAR_NOTIFICATION":
            return {
                ...state,
                notifications: state.notifications.filter(
                    (notification) => notification.id !== action.payload
                ),
            }

        case "CLOSE_NOTIFICATION":
            return {
                ...state,
                notifications: state.notifications.map((notification) => {
                    if (notification.id === action.payload) {
                        notification.onClose?.()
                        return { ...notification, isSticky: false, closing: true }
                    }
                    return notification
                }),
            }

        default:
            return state
    }
}

export const useNotification = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error("useNotification must be used within a NotificationContextProvider")
    }
    return context
}

export const NotificationProvider = ({ children, maxNotifications = 7 }) => {
    const [state, dispatch] = useReducer(notificationReducer, defaultState)

    const showNotification = useCallback(
        (title, message, type, isSticky = false, onClose = () => {}) => {
            const id = Math.random().toString(36).slice(2, 11)
            const newNotification = { id, title, message, type, isSticky, onClose }
            dispatch({ type: "ADD_NOTIFICATION", payload: newNotification, maxNotifications })
            return id
        },
        [maxNotifications]
    )

    const clearNotification = useCallback((id) => {
        dispatch({ type: "CLEAR_NOTIFICATION", payload: id })
    }, [])

    const closeNotification = useCallback((id) => {
        dispatch({ type: "CLOSE_NOTIFICATION", payload: id })
    }, [])

    return (
        <NotificationContext.Provider
            value={{
                notifications: state.notifications,
                showNotification,
                clearNotification,
                closeNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}
