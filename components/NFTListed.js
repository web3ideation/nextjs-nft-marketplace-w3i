import React, { useState, useMemo, useCallback } from "react"
import NFTBox from "../components/NFTBox"
import styles from "../styles/Home.module.css"
import { useNFT } from "../context/NFTContextProvider"
import LoadingWave from "../components/ui/LoadingWave"

function NFTListed() {
    // ------------------ Hooks & Data Retrieval ------------------

    // Retrieve NFT data and loading state using custom hook
    const { data: nftsData, isLoading, loadNFTs } = useNFT()

    const reloadNFTs = useCallback(() => {
        loadNFTs() // Diese Funktion sollte die NFTs neu laden
    }, [loadNFTs])

    // State for the number of visible NFTs
    const [visibleNFTs, setVisibleNFTs] = useState(5)

    // Sort NFTs by listingId using useMemo for performance optimization
    const sortedAndFilteredNFTs = useMemo(() => {
        return [...nftsData]
            .filter((nft) => nft.isListed) // Filter out NFTs where isListed is not true
            .sort((a, b) => Number(b.listingId) - Number(a.listingId))
    }, [nftsData])

    // ------------------ Render Functions ------------------

    // Render the list of NFTs or a loading state
    const renderNFTList = (is) => {
        if (isLoading) {
            return (
                <div className={styles.loadingContainerNotification}>
                    <div className={styles.loadingWrapperNotification}>
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
        return sortedAndFilteredNFTs
            .slice(0, visibleNFTs)
            .map((nft) => (
                <NFTBox
                    nftData={nft}
                    reloadNFTs={reloadNFTs}
                    key={`${nft.nftAddress}${nft.tokenId}`}
                />
            ))
    }

    return (
        <div className={styles.nftListWrapper}>
            <h1>Brand New Drops</h1>
            <div id="NFTListed" className={styles.nftList}>
                {renderNFTList()}
            </div>
            {isLoading ? null : (
                <div className={styles.showMoreButton}>
                    <button
                        onClick={() => {
                            setVisibleNFTs((prevVisible) => prevVisible + 20)
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
                            {" "}
                            LESS
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default NFTListed
