import { useState, useEffect } from "react"

const useFetchNFTsForWallet = (walletAddress) => {
    const [nfts, setNfts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchNFTs = async () => {
            if (!walletAddress) return

            setLoading(true)
            const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
            const url = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}/getNFTs?owner=${walletAddress}`
            try {
                const response = await fetch(url)
                if (!response.ok) throw new Error("Network response was not ok")

                const data = await response.json()
                console.log("untransformed data", data)
                const transformedNfts = data.ownedNfts.map((nft) => ({
                    tokenName: nft.title || "Unbekanntes NFT",
                    tokenSymbol: nft.contractMetadata.symbol || "",
                    collectionName: nft.contractMetadata.name || "",
                    tokenURI: nft.tokenUri.raw || "",
                    attributes: nft.metadata.attributes || "",
                    tokenOwner: walletAddress,
                    imageURI: {
                        src: nft.media[0]?.gateway,
                        width: 100,
                        height: 100,
                        alt: "",
                    },
                    tokenDescription: nft.description || "",
                    nftAddress: nft.contract.address,
                    tokenId: BigInt(nft.id.tokenId).toString(),
                    desiredNftAddress: "0x0000000000000000000000000000000000000000",
                    desiredTokenId: "0",
                    price: 0,
                }))
                console.log("transformed data", transformedNfts)
                setNfts(transformedNfts)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchNFTs()
    }, [walletAddress])

    return { nfts, loading, error }
}

export default useFetchNFTsForWallet
