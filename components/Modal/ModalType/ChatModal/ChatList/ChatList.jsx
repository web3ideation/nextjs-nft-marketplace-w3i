// React Imports
import React from "react"

// Style Imports (angepasst an Ihren Style-Bedarf)
import styles from "./ChatList.module.scss"

/**
 * ChatList Component
 * Diese Komponente zeigt eine Liste von Chatpartnern an.
 * Beim Klicken auf einen Partner wird die onSelectChat-Funktion ausgelöst.
 */
const ChatList = ({ chatPartners, onSelectChat }) => {
    return (
        <div className={styles.chatListContainer}>
            {chatPartners.map((partner, index) => (
                <div
                    key={index}
                    className={styles.chatPartner}
                    onClick={() => onSelectChat(partner)}
                >
                    {partner.partnerAddress}
                </div>
            ))}
        </div>
    )
}

export default ChatList
