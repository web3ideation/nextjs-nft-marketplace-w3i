import React, { createContext, useContext, useReducer, useCallback } from "react"

const defaultState = {
    nftNotifications: [],
    showNftNotification: () => {},
    clearNftNotification: () => {},
    closeNftNotification: () => {},
}

const NftNotificationContext = createContext(defaultState)

// Reducer function to manage state updates in a more predictable way
function notificationReducer(state, action) {
    switch (action.type) {
        case "ADD_NOTIFICATION":
            const newNotifications = [action.payload, ...state.nftNotifications]
            if (newNotifications.length > action.maxNotifications) {
                newNotifications.pop() // Ensure max notifications are not exceeded
            }
            return { ...state, nftNotifications: newNotifications }

        case "CLEAR_NOTIFICATION":
            return {
                ...state,
                nftNotifications: state.nftNotifications.filter(
                    (notification) => notification.id !== action.payload
                ),
            }

        case "CLOSE_NOTIFICATION":
            return {
                ...state,
                nftNotifications: state.nftNotifications.map((notification) => {
                    if (notification.id === action.payload) {
                        return { ...notification, isSticky: false, closing: true }
                    }
                    return notification
                }),
            }

        default:
            return state
    }
}

export const useNftNotification = () => {
    const context = useContext(NftNotificationContext)
    if (!context) {
        throw new Error("useNftNotification must be used within a NftNotificationContextProvider")
    }
    return context
}

export const NftNotificationProvider = ({ children, maxNotifications = 7 }) => {
    const [state, dispatch] = useReducer(notificationReducer, defaultState)

    const showNftNotification = useCallback(
        (title, message, type, isSticky = false) => {
            const id = Math.random().toString(36).slice(2, 11)
            const newNotification = { id, title, message, type, isSticky }
            dispatch({ type: "ADD_NOTIFICATION", payload: newNotification, maxNotifications })
            return id
        },
        [maxNotifications]
    )

    const clearNftNotification = useCallback((id) => {
        dispatch({ type: "CLEAR_NOTIFICATION", payload: id })
    }, [])

    const closeNftNotification = useCallback((id) => {
        dispatch({ type: "CLOSE_NOTIFICATION", payload: id })
    }, [])

    return (
        <NftNotificationContext.Provider
            value={{
                nftNotifications: state.nftNotifications,
                showNftNotification,
                clearNftNotification,
                closeNftNotification,
            }}
        >
            {children}
        </NftNotificationContext.Provider>
    )
}
