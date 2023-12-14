import React, { useState, useEffect } from "react"
import nftMarketplaceAbi from "../constants/NftMarketplace.json" // !!!N brauchen wir das hier noch? / NEIN
import networkMapping from "../constants/networkMapping.json"
import NFTBox from "../components/NFTBox"
import styles from "../styles/Home.module.css"
import { useNFT } from "../context/NFTContextProvider"
import { getAccount, getContract } from "@wagmi/core"
import { usePublicClient } from "wagmi"

const MyNFTs = () => {
    //    const address = useAddress()
    //    const isConnected = useConnectionStatus()
    //    const { contract } = useContract(contractAddress)

    const { nftsData, loadingImage } = useNFT()
    const [hasOwnNFT, setHasOwnNFT] = useState(false)

    const provider = usePublicClient()
    console.log("Public client", provider.chains)
    // Get the chain ID
    const chain = provider.chains[0]
    console.log("Chain Id call", chain)

    // Convert chain ID to string format
    const chainString = chain.id ? parseInt(chain.id).toString() : "31337"
    console.log("Chain string", chainString)

    // Get the marketplace/smart contract address based on the current chain
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    console.log("Contract address", marketplaceAddress)

    // Get all the contract information
    const contract = getContract({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
    })

    // Get the wallet address
    // Get the wallet status
    const { address, isConnected } = getAccount()

    // Funktion zur Überprüfung, ob das NFT dem Benutzer gehört
    const isOwnedByUser = (nftOwner) => {
        return nftOwner?.toLowerCase() === address?.toLowerCase()
    }

    // Effekt zur Feststellung, ob der Benutzer NFTs besitzt
    useEffect(() => {
        const hasNFT = nftsData.some((nft) => isOwnedByUser(nft.nftOwner))
        setHasOwnNFT(hasNFT)
    }, [nftsData, address])

    // Anzeigen des Ladestatus beim Abrufen der NFT-Daten
    if (loadingImage) {
        return <div>Loading...</div>
    }

    return (
        <div className={styles.nftListWrapper}>
            <h1>My NFTs</h1>
            <div className={styles.nftList}>
                {isConnected ? (
                    hasOwnNFT ? (
                        nftsData.map((nft) =>
                            isOwnedByUser(nft.nftOwner) ? (
                                <NFTBox key={`${nft.nftAddress}${nft.tokenId}`} nftData={nft} />
                            ) : null
                        )
                    ) : (
                        <div>You don't own any NFTs yet!</div>
                    )
                ) : (
                    <div>
                        <h2>Web3 is currently not enabled - Connect your Wallet here</h2>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyNFTs
