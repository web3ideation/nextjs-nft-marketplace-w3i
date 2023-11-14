import React, { useState, useEffect } from "react"
import NFTBox from "../components/NFTBox"
import styles from "../styles/Home.module.css"
import { useMoralis } from "react-moralis"
import { useNFT } from "../context/NFTContextProvider"
import { ConnectButton } from "web3uikit"

const MyNFTs = () => {
    const { isWeb3Enabled, account } = useMoralis()
    const { nftsData, loadingImage } = useNFT()

    const [hasOwnNFT, setHasOwnNFT] = useState(false)

    // Funktion zur Überprüfung, ob das NFT dem Benutzer gehört
    const isOwnedByUser = (nftOwner) => {
        return nftOwner?.toLowerCase() === account?.toLowerCase()
    }

    // Effekt zur Feststellung, ob der Benutzer NFTs besitzt
    useEffect(() => {
        const hasNFT = nftsData.some((nft) => isOwnedByUser(nft.nftOwner))
        setHasOwnNFT(hasNFT)
    }, [nftsData, account])

    // Anzeigen des Ladestatus beim Abrufen der NFT-Daten
    if (loadingImage) {
        return <div>Loading...</div>
    }

    return (
        <div className={styles.nftListWrapper}>
            <h1>My NFTs</h1>
            <div className={styles.nftList}>
                {isWeb3Enabled ? (
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
                        <ConnectButton />
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyNFTs
