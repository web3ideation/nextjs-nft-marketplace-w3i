import React, { useState, useRef, useEffect, forwardRef } from "react"
import Modal from "../../ModalBasis/Modal"
import styles from "./ChatModal.module.scss"
import ChatList from "./ChatList/ChatList"
import ComingSoon from "@components/ComingSoon/ComingSoon"

const ChatModal = forwardRef((props, ref) => {
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState({})
    const [activeChat, setActiveChat] = useState(null)

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" })
    }, [messages, activeChat])

    const handleMessageChange = (e) => setMessage(e.target.value)

    const handleChatSelect = (chatPartner) => setActiveChat(chatPartner)

    const handleClearMessages = () => setMessages([])

    const handleSendMessage = () => {
        if (message.trim() && activeChat) {
            const updatedMessages = {
                ...messages,
                [activeChat.id]: [...(messages[activeChat.id] || []), message],
            }

            setMessages(updatedMessages)
            setMessage("")
        }
    }

    const buttons = [
        { text: "Send", action: handleSendMessage },
        { text: "Clear", action: handleClearMessages },
    ]

    return (
        <Modal ref={ref} modalTitle="Chat" buttons={buttons}>
            <div className={styles.chatModalContainerWrapper}>
                <div className={styles.chatModalContainer}>
                    <ChatList chatPartners={chatPartners} onSelectChat={handleChatSelect} />
                    {activeChat && (
                        <div className={styles.chatContainer}>
                            <div className={styles.messagesArea}>
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
                    )}
                    <ComingSoon size="large"></ComingSoon>
                </div>
            </div>
        </Modal>
    )
})

ChatModal.displayName = "ChatModal"

export default ChatModal
