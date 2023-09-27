import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import { GET_ACTIVE_ITEMS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import styles from "../styles/Home.module.css"
import { ConnectButton } from "web3uikit"

export default function Home() {
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    const { loading, data, error } = useQuery(GET_ACTIVE_ITEMS)
    const [hasOwnNFT, setHasOwnNFT] = useState(false)

    if (loading || !data) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error loading NFTs</div>
    }

    const isOwnedByUser = (seller) => seller === account || seller === undefined

    // Verwenden Sie useEffect, um setHasOwnNFT einmalig oder bei Änderungen auszuführen
    useEffect(() => {
        // Überprüfen Sie, ob der Benutzer mindestens ein NFT besitzt
        const hasNFT = data.items.some((nft) => isOwnedByUser(nft.seller))

        // Aktualisieren Sie den Zustand nur, wenn sich der Wert geändert hat
        if (hasNFT !== hasOwnNFT) {
            setHasOwnNFT(hasNFT)
        }
    }, [data, hasOwnNFT]) // Fügen Sie data und hasOwnNFT als Abhängigkeiten hinzu

    return (
        <div className={styles.NFTContainer}>
            <h1>My NFT</h1>
            <div className={styles.NFTListed}>
                <div className="flex flex-wrap pb-4">
                    {isWeb3Enabled && chainId ? (
                        <>
                            {data.items.map((nft) =>
                                isOwnedByUser(nft.seller) ? (
                                    <NFTBox
                                        price={nft.price}
                                        nftAddress={nft.nftAddress}
                                        tokenId={nft.tokenId}
                                        marketplaceAddress={marketplaceAddress}
                                        seller={nft.seller}
                                        key={`${nft.nftAddress}${nft.tokenId}`}
                                    />
                                ) : null
                            )}
                            {!hasOwnNFT && <div>Go get some NFTs for yourself!!!</div>}
                        </>
                    ) : (
                        <div>
                            <h2>Web3 is currently not enabled - Connect your Wallet here</h2>
                            <ConnectButton></ConnectButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
