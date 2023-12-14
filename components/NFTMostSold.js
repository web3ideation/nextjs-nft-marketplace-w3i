import React, { useState, useMemo, useCallback } from "react"
import NFTBox from "../components/NFTBox"
import styles from "../styles/Home.module.css"
import { useNFT } from "../context/NFTContextProvider"
import LoadingWave from "../components/LoadingWave"

function NFTMostSold() {
    // Retrieve NFT data and loading state using custom hook
    const { nftsData, loadingImage, loadNFTs } = useNFT()

    const reloadNFTs = useCallback(() => {
        loadNFTs() // Diese Funktion sollte die NFTs neu laden
    }, [loadNFTs])

    // State for the number of visible NFTs
    const [visibleNFTs, setVisibleNFTs] = useState(5)

    // Sort NFTs by buyerCount and limit to three per nftAddress
    const sortedAndFilteredNFTs = useMemo(() => {
        const addressCount = {} // Tracker for the number of NFTs per address
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

    // Render the list of NFTs or a loading state
    const renderNFTList = () => {
        if (loadingImage) {
            return (
                <div className={styles.nftLoadingIconWrapper}>
                    <div className={styles.nftLoadingIcon}>
                        <LoadingWave />
                    </div>
                </div>
            )
        }

        // Check if there are no NFTs to display
        if (sortedAndFilteredNFTs.length === 0) {
            return <p>No NFTs available</p>
        }

        // Use the slice method to display only the desired number of NFTs
        return sortedAndFilteredNFTs.map((nft) => (
            <NFTBox
                nftData={nft}
                reloadNFTs={reloadNFTs}
                key={`${nft.nftAddress}${nft.tokenId}`}
            />
        ))
    }

    return (
        <div className={styles.nftListWrapper}>
            <h1>Most Sold</h1>
            <div id="NFTMostSold" className={styles.nftList}>
                {renderNFTList()}
            </div>
            {loadingImage ? null : (
                <div className={styles.showMoreButton}>
                    <button
                        onClick={() => {
                            setVisibleNFTs((prevVisible) => prevVisible + 5)
                        }}
                    >
                        MORE
                    </button>
                    {visibleNFTs > 5 && (
                        <button
                            onClick={() => {
                                setVisibleNFTs(5)
                            }}
                        >
                            LESS
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default NFTMostSold
