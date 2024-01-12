// ------------------ React Imports ------------------
import React, { useState, useMemo } from "react"

// ------------------ Custom Hooks & Component Imports ------------------
import NFTBox from "../../NftCard/NFTCard"
import { useNFT } from "../../../../context/NFTDataProvider"
import LoadingWave from "../../ux/LoadingWave"

// ------------------ Styles ------------------
import styles from "../../../../styles/Home.module.css"

// Component for displaying the most sold NFTs
function NFTMostSold() {
    // Retrieve NFT data and loading state using custom hook
    const { data: nftsData, loadingImage } = useNFT()

    // State for the number of visible NFTs
    const [visibleNFTs, setVisibleNFTs] = useState(5)

    // useMemo used to sort and filter NFTs based on buyerCount and limit per address
    const sortedAndFilteredNFTs = useMemo(() => {
        const addressCount = {} // Tracks the number of NFTs per address
        const filteredNFTs = []

        ;[...nftsData]
            .sort((a, b) => b.buyerCount - a.buyerCount)
            .forEach((nft) => {
                const count = addressCount[nft.nftAddress] || 0
                if (count < 3) {
                    filteredNFTs.push(nft)
                    addressCount[nft.nftAddress] = count + 1
                }
            })

        return filteredNFTs.slice(0, visibleNFTs)
    }, [nftsData, visibleNFTs])

    // Function to render the NFT list or loading state
    const renderNFTList = () => {
        if (loadingImage) {
            return (
                <div className={styles.nftLoadingIconWrapper}>
                    <LoadingWave />
                </div>
            )
        }

        if (sortedAndFilteredNFTs.length === 0) {
            return <p>No NFTs available</p>
        }

        return sortedAndFilteredNFTs.map((nft) => (
            <NFTBox nftData={nft} key={`${nft.nftAddress}${nft.tokenId}`} />
        ))
    }

    return (
        <div className={styles.nftListMostWrapper}>
            <h1>Hot Picks</h1>
            <div id="NFTMostSold" className={styles.nftListMost}>
                {renderNFTList()}
            </div>
            {loadingImage ? null : (
                <div className={styles.showMoreMostButton}>
                    <button onClick={() => setVisibleNFTs((prevVisible) => prevVisible + 5)}>
                        MORE
                    </button>
                    {visibleNFTs > 5 && <button onClick={() => setVisibleNFTs(5)}>LESS</button>}
                </div>
            )}
        </div>
    )
}

export default NFTMostSold
