import { useState, useEffect } from "react"

const useFetchNfts = () => {
    const [nfts, setNfts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchNfts = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch("/api/nfts")
                if (!response.ok) {
                    throw new Error("Daten konnten nicht abgerufen werden")
                }
                const data = await response.json()
                setNfts(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchNfts()
    }, [])

    return { nfts, isLoading, error }
}

export default useFetchNfts
