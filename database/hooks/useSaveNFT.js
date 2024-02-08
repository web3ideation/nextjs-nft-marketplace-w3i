import { useState } from "react"

const useSaveNft = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const saveNft = async (nftData) => {
        setIsLoading(true)
        setError(null)

        try {
            console.log("Versuche, NFT zu speichern:", nftData) // Log Daten vor dem Senden

            const response = await fetch("/api/nfts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(nftData),
            })

            if (!response.ok) {
                const errorText = await response.text() // Lesen des Fehler-Textes aus der Antwort
                console.error("Fehler beim Speichern des NFTs:", errorText) // Log des Fehler-Textes
                throw new Error("Fehler beim Speichern des NFTs: " + errorText)
            }

            const data = await response.json()
            console.log("NFT erfolgreich gespeichert:", data) // Log der Antwort-Daten
            return data
        } catch (err) {
            console.error("Fehler im saveNft-Hook:", err.message) // Detaillierter Log des Fehlers
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return { saveNft, isLoading, error }
}

export default useSaveNft
