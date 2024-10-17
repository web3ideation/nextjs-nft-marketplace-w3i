import { useState, useEffect } from "react"
import { fetchNFTsByWallet } from "@api/fetchNFTsByWallet"

const useWalletNFTs = (walletAddress) => {
    const [nfts, setNfts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!walletAddress) return

            setLoading(true)
            try {
                const fetchedNFTs = await fetchNFTsByWallet(walletAddress)
                setNfts(fetchedNFTs)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [walletAddress])

    return { nfts, loading, error }
}

export default useWalletNFTs
