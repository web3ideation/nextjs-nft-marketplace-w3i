import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import NFTBox from "../components/NFTBox"
import styles from "../styles/Home.module.css"
import { ConnectButton } from "web3uikit"
import { useNFT } from "../context/NFTContextProvider"

export default function Home() {
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const { nftsData, loadingImage } = useNFT()

    const [hasOwnNFT, setHasOwnNFT] = useState(false)

    // Function to check if the NFT is owned by the user
    const isOwnedByUser = (seller, buyer) => {
        // Check if the seller matches the account
        if (seller === account) return true
        // Check if the buyer matches the account and seller doesn't
        if (seller !== account && buyer === account) return true
        // Check if the seller is undefined
        if (seller === undefined) return true
        return false
    }

    // Effect to determine if the user owns any NFTs
    useEffect(() => {
        const hasNFT = nftsData.some((nft) => isOwnedByUser(nft.seller, nft.buyer))
        if (hasNFT !== hasOwnNFT) {
            setHasOwnNFT(hasNFT)
        }
    }, [nftsData])

    // Display a loading state while fetching NFT data
    if (loadingImage) {
        return <div>Loading...</div>
    }

    return (
        <div className={styles.nftListWrapper}>
            <h1>My NFT</h1>
            <div className={styles.nftList}>
                {isWeb3Enabled && chainId ? (
                    !hasOwnNFT ? (
                        // Display a message if the user doesn't own any NFTs
                        <div>Go get some NFTs for yourself!!!</div>
                    ) : (
                        // Display the list of NFTs owned by the user
                        nftsData.map((nft) =>
                            isOwnedByUser(nft.seller, nft.buyer) ? <NFTBox nftData={nft} /> : null
                        )
                    )
                ) : (
                    // Display a message and a button to connect the wallet if Web3 is not enabled
                    <div>
                        <h2>Web3 is currently not enabled - Connect your Wallet here</h2>
                        <ConnectButton />
                    </div>
                )}
            </div>
        </div>
    )
}
