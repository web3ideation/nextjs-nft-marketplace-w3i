// ChatModalComponent.tsx

// React Imports
import React, { useState, forwardRef } from "react"

// User-Created Components and Hooks
import Modal from "../../ModalBasis/Modal"

// Style Imports
import styles from "../../../../../styles/Home.module.css"

/**
 * ChatModal Component
 * This component is a specialized modal for chat functionality,
 * using forwardRef for parent component referencing. It maintains
 * the state of messages and handles sending and clearing messages.
 */
const ChatModal = forwardRef((props, ref) => {
    // Local State: Managing message input and message list
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])

    // Function: handleMessageChange
    // Updates the message state as the user types in the input.
    const handleMessageChange = (e) => {
        setMessage(e.target.value)
    }

    // Function: handleSendMessage
    // Adds the current message to the messages list and clears the input field.
    const handleSendMessage = () => {
        if (message.trim()) {
            setMessages((prevMessages) => [...prevMessages, message])
            setMessage("") // Clear input after sending
        }
    }

    // Function: handleClearMessages
    // Clears all messages from the chat.
    const handleClearMessages = () => {
        setMessages([])
    }

    return (
        <Modal
            ref={ref}
            modalTitle={"Chat"}
            okText={"Send"}
            onOk={handleSendMessage}
            clearMessages={handleClearMessages}
        >
            <div className={styles.chatContainer}>
                <div className={styles.messagesArea}>
                    {messages.map((msg, index) => (
                        <div key={index} className={styles.chatMessage}>
                            {msg}
                        </div>
                    ))}
                </div>
                <div className={styles.inputArea}>
                    <input
                        type="text"
                        placeholder="Enter your message..."
                        value={message}
                        onChange={handleMessageChange}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        className={styles.messageInput}
                    />
                </div>
            </div>
        </Modal>
    )
})

// Setting Display Name for Debugging
// This helps in identifying the component in React Developer Tools.
ChatModal.displayName = "ChatModal"

export default ChatModal
