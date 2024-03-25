import { useState } from "react"

const useSaveOrUpdateExtendedNft = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const saveOrUpdateExtendedNft = async (nftMinimalId, extendedData) => {
        setIsLoading(true)
        setError(null)

        try {
            console.log(
                "Versuche, erweiterte NFT-Daten zu speichern/aktualisieren für:",
                nftMinimalId,
                extendedData
            )

            const response = await fetch(`/api/nfts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(extendedData),
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error(
                    "Fehler beim Speichern/Aktualisieren der erweiterten NFT-Daten:",
                    errorText
                )
                throw new Error(
                    "Fehler beim Speichern/Aktualisieren der erweiterten NFT-Daten: " + errorText
                )
            }

            const data = await response.json()
            console.log("Erweiterte NFT-Daten erfolgreich gespeichert/aktualisiert:", data)
            return data
        } catch (err) {
            console.error("Fehler im saveOrUpdateExtendedNft-Hook:", err.message)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return { saveOrUpdateExtendedNft, isLoading, error }
}

export default useSaveOrUpdateExtendedNft
