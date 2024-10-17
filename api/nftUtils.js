import { fetchNFTContractData } from "./fetchContractData"
import { fetchIPFSData } from "./fetchIpfsData"

export const loadAttributes = async (provider, nft) => {
    try {
        // Abrufen der NFT-Daten vom Contract
        const contractData = await fetchNFTContractData(provider, nft.nftAddress, nft.tokenId)

        if (!contractData) {
            console.warn("No contract data found for NFT:", nft)
            return nft // Rückgabe des unveränderten NFT, wenn keine Daten verfügbar sind
        }

        const {
            tokenURI,
            tokenOwner,
            collectionName,
            tokenSymbol,
            balanceOf,
            totalSupply,
            getApproved,
        } = contractData

        // Abrufen der IPFS-Daten
        const ipfsData = await fetchIPFSData(tokenURI)

        return {
            ...nft,
            ...ipfsData, // IPFS-Daten hinzufügen
            tokenOwner: tokenOwner || "Unknown Owner", // Fallback-Wert, wenn kein Owner gefunden wird
            collectionName: collectionName || "Unknown Collection", // Fallback für den Sammlungsnamen
            tokenSymbol: tokenSymbol || "N/A", // Fallback für das Symbol
            tokenURI: tokenURI || "N/A", // Fallback für die URI
            balanceOf: balanceOf ? BigInt(balanceOf).toString() : "N/A", // Fallback für balanceOf
            totalSupply: totalSupply ? BigInt(totalSupply).toString() : "N/A", // Fallback für totalSupply
            getApproved: getApproved || "N/A", // Fallback für approved Adresse
        }
    } catch (error) {
        console.error("Error loading attributes for NFT:", error)
        return null // Rückgabe von null, wenn ein schwerwiegender Fehler auftritt
    }
}

export const createCollections = (nfts) => {
    const collectionsMap = new Map()
    nfts.forEach((nft) => {
        const {
            nftAddress,
            tokenId,
            imageURI,
            collectionName,
            price,
            tokenSymbol,
            buyerCount,
            totalSupply,
        } = nft
        const numericPrice = Number(price)
        if (!collectionsMap.has(nftAddress)) {
            collectionsMap.set(nftAddress, {
                nftAddress,
                items: [],
                collectionCount: 0,
                count:
                    totalSupply && totalSupply !== "N/A"
                        ? BigInt(totalSupply).toString()
                        : totalSupply,

                collectionPrice: 0,
                firstImageURI: imageURI,
                collectionName,
                collectionSymbol: tokenSymbol,
                tokenIds: [],
            })
        }
        const collection = collectionsMap.get(nftAddress)
        if (!collection.items.some((item) => item.tokenId === tokenId)) {
            collection.items.push(nft)
            //collection.count += 1
            collection.tokenIds.push(tokenId)
            collection.collectionCount += buyerCount
            if (!isNaN(numericPrice)) {
                collection.collectionPrice += numericPrice
            }
        }
    })
    return Array.from(collectionsMap.values()).map((collection) => {
        collection.tokenIds.sort((a, b) => a - b)
        collection.tokenIds = collection.tokenIds.join(",")
        collection.collectionPrice = collection.collectionPrice.toString()
        return collection
    })
}
