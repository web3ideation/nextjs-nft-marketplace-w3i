// React Imports
import React, { useState, useRef, useEffect, forwardRef } from "react"

// User-Created Components and Hooks
import Modal from "../../ModalBasis/Modal"

// Style Imports
import styles from "./ChatModal.module.scss"
import ChatList from "./ChatList/ChatList"

/**
 * The ChatModal component serves as a specialized chat interface within a modal.
 * It leverages forwardRef for parent component referencing and manages chat states,
 * including current messages and active chats.
 */
const ChatModal = forwardRef((props, ref) => {
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState({})
    const [activeChat, setActiveChat] = useState(null)

    // Pre-defined chat partners, simulating fetched data or static assignment.
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

    const handleMessageChange = (e) => {
        setMessage(e.target.value)
    }

    const handleChatSelect = (chatPartner) => {
        setActiveChat(chatPartner)
    }

    const handleClearMessages = () => {
        setMessages([])
    }

    const handleSendMessage = () => {
        if (message.trim() && activeChat) {
            const updatedMessages = {
                ...messages,
                [activeChat.id]: [...(messages[activeChat.id] || []), message],
            }

            const updatedChatPartners = chatPartners.map((partner) =>
                partner.id === activeChat.id ? { ...partner, lastMessage: message } : partner
            )

            setMessages(updatedMessages)
            setMessage("")
        }
    }

    const buttons = [
        {
            text: "Send",
            action: handleSendMessage,
        },
        {
            text: "Clear",
            action: handleClearMessages,
        },
    ]

    useEffect(() => {
        scrollToBottom()
    }, [messages, activeChat])

    return (
        <Modal ref={ref} modalTitle={"Chat"} buttons={buttons}>
            <div className={styles.chatModalContainerWrapper}>
                <div className={styles.chatModalContainer}>
                    <ChatList
                        chatPartners={chatPartners}
                        onSelectChat={handleChatSelect}
                    ></ChatList>
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
            </div>
        </Modal>
    )
})

// Setting Display Name for Debugging
// This helps in identifying the component in React Developer Tools.
ChatModal.displayName = "ChatModal"

export default ChatModal
