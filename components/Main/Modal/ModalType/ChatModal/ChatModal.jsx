// React imports
import React, { useState, forwardRef } from "react"

// User-created components and hooks
import Modal from "../../ModalBasis/Modal"

// Style imports
import styles from "../../../../../styles/Home.module.css"

// ChatModal component using forwardRef for parent component referencing
const ChatModal = forwardRef((props, ref) => {
    // Local state for managing message input and message list
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])

    // Destructuring props for easier access
    const { closeModal, modalTitle, isVisible } = props

    // Handles input change for message text
    const handleMessageChange = (e) => {
        setMessage(e.target.value)
    }

    // Handles sending a message
    const handleSendMessage = () => {
        if (message.trim()) {
            setMessages((prevMessages) => [...prevMessages, message])
            setMessage("") // Clear input after sending
        }
    }

    // Clears all messages
    const handleClearMessages = () => {
        setMessages([])
    }

    return (
        <Modal
            ref={ref}
            isVisible={isVisible}
            modalTitle={modalTitle}
            closeModal={closeModal}
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

export default ChatModal
