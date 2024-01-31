// ChatModalComponent.tsx

// React Imports
import React, { useState, useRef, useEffect, forwardRef } from "react"

// User-Created Components and Hooks
import Modal from "../../ModalBasis/Modal"

// Style Imports
import styles from "../../../../../styles/Home.module.css"
import ChatList from "./ChatList/ChatList"

/**
 * ChatModal Component
 * This component is a specialized modal for chat functionality,
 * using forwardRef for parent component referencing. It maintains
 * the state of messages and handles sending and clearing messages.
 */
const ChatModal = forwardRef((props, ref) => {
    // Local State: Managing message input and message list
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState({})
    const [activeChat, setActiveChat] = useState(null) // Aktiver Chatpartner

    const chatPartners = [
        { id: 1, partnerAddress: "0x123...6781", lastMessage: "Wie geht's dir heute?" },
        { id: 2, partnerAddress: "0x123...6782", lastMessage: "Hast du den Bericht fertig?" },
        { id: 3, partnerAddress: "0x123...6783", lastMessage: "Wir treffen uns um 18:00 Uhr." },
        { id: 4, partnerAddress: "0x123...6784", lastMessage: "Kannst du mir helfen?" },
        { id: 5, partnerAddress: "0x123...6785", lastMessage: "Tolles Spiel gestern!" },
        { id: 6, partnerAddress: "0x123...6786", lastMessage: "Ich schicke dir die Infos." },
        { id: 7, partnerAddress: "0x123...6787", lastMessage: "Ich schicke dir die Infos." },
        { id: 8, partnerAddress: "0x123...6788", lastMessage: "Ich schicke dir die Infos." },
        { id: 9, partnerAddress: "0x123...6789", lastMessage: "Ich schicke dir die Infos." },
        { id: 10, partnerAddress: "0x123...6790", lastMessage: "Ich schicke dir die Infos." },
        { id: 11, partnerAddress: "0x123...6791", lastMessage: "Ich schicke dir die Infos." },
        { id: 12, partnerAddress: "0x123...6792", lastMessage: "Ich schicke dir die Infos." },
    ]

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" })
    }

    // Function: handleMessageChange
    // Updates the message state as the user types in the input.
    const handleMessageChange = (e) => {
        setMessage(e.target.value)
    }

    // Funktion, um den aktiven Chatpartner zu ändern
    const handleChatSelect = (chatPartner) => {
        setActiveChat(chatPartner)
    }

    // Function: handleSendMessage
    // Adds the current message to the messages list and clears the input field.
    // Anpassung der sendMessage Funktion, um Nachrichten nach Chatpartner zu speichern
    const handleSendMessage = () => {
        if (message.trim() && activeChat) {
            const updatedMessages = {
                ...messages,
                [activeChat.id]: [...(messages[activeChat.id] || []), message],
            }

            // Aktualisieren der lastMessage im chatPartners Zustand
            const updatedChatPartners = chatPartners.map((partner) =>
                partner.id === activeChat.id ? { ...partner, lastMessage: message } : partner
            )

            setMessages(updatedMessages)
            setMessage("")
            // Hier müssen Sie möglicherweise auch den chatPartners Zustand im Elternteil aktualisieren,
            // wenn dieser Zustand dort verwaltet wird
        }
    }

    // Function: handleClearMessages
    // Clears all messages from the chat.
    const handleClearMessages = () => {
        setMessages([])
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, activeChat])

    return (
        <Modal
            ref={ref}
            modalTitle={"Chat"}
            okText={"Send"}
            onOk={handleSendMessage}
            clearMessages={handleClearMessages}
        >
            <div className={styles.chatModalContainer}>
                <ChatList chatPartners={chatPartners} onSelectChat={handleChatSelect}></ChatList>
                <div className={styles.chatContainer}>
                    <div className={styles.messagesArea}>
                        {activeChat && (
                            <>
                                <div className={styles.chatMessageInWrapper}>
                                    <div className={styles.chatMessageIn}>
                                        {activeChat.lastMessage}
                                    </div>
                                </div>
                                {messages[activeChat.id]?.map((msg, index) => (
                                    <div key={index} className={styles.chatMessageOutWrapper}>
                                        <div className={styles.chatMessageOut}>{msg}</div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
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
            </div>
        </Modal>
    )
})

// Setting Display Name for Debugging
// This helps in identifying the component in React Developer Tools.
ChatModal.displayName = "ChatModal"

export default ChatModal
