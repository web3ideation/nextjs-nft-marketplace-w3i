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

    // Function to check whether the NFT belongs to the user
    const isOwnedByUser = (nftOwner) => {
        return nftOwner?.toLowerCase() === account?.toLowerCase()
    }

    // Effect to determine whether the user owns NFTs
    useEffect(() => {
        const hasNFT = nftsData.some((nft) => isOwnedByUser(nft.nftOwner))
        setHasOwnNFT(hasNFT)
    }, [nftsData, account])

    // Display the charging status while retrieving the NFT data
    if (loadingImage) {
        return <div>Loading...</div>
    }

    return (
        <div className={styles.nftListWrapper}>
            <h1>My NFT</h1>
            <div className={styles.nftList}>
                {isWeb3Enabled && chainId ? (
                    !hasOwnNFT ? (
                        <div>Go get some NFTs for yourself!!!</div>
                    ) : (
                        nftsData.map((nft) =>
                            isOwnedByUser(nft.nftOwner) ? (
                                <NFTBox key={nft.tokenId} nftData={nft} />
                            ) : null
                        )
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
