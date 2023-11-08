import React, { useState, useMemo } from "react" // Import useMemo
import NFTBox from "../components/NFTBox"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import { useNFT } from "../context/NFTContextProvider"
import LoadingWave from "../components/LoadingWave"

function NFTListed() {
    // ------------------ Hooks & Data Retrieval ------------------

    // Retrieve NFT data and loading state using custom hook
    const { nftsData, loadingImage } = useNFT()

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
        return sortedAndFilteredNFTs
            .slice(0, visibleNFTs)
            .map((nft) => (
                <NFTBox nftData={nft} key={`${nft.nftAddress}${nft.tokenId}${nft.listingId}`} />
            ))
    }

    return (
        <div className={styles.nftListWrapper}>
            <h1>Recently Listed</h1>
            <div id="NFTListed" className={styles.nftList}>
                {renderNFTList()}
            </div>
            {loadingImage ? null : (
                <div className={styles.showMoreButton}>
                    <Button
                        text="Show More"
                        onClick={() => {
                            setVisibleNFTs((prevVisible) => prevVisible + 20)
                        }}
                    />
                    {visibleNFTs > 5 && (
                        <Button
                            text="Show Less"
                            onClick={() => {
                                setVisibleNFTs(5)
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default NFTListed
