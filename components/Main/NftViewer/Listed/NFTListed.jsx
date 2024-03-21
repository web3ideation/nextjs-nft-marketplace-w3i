// ------------------ React Imports ------------------
import React, { useState, useMemo, useEffect } from "react"

// ------------------ Custom Hooks & Component Imports ------------------
import { useNFT } from "../../../../context/NFTDataProvider"
import NFTBox from "../../NftCard/NFTCard"
import BtnWithAction from "../../../uiComponents/BtnWithAction"

// ------------------ Styles ------------------
import styles from "./NFTListed.module.scss"

function NFTListed() {
    // State hooks for managing NFT visibility
    const [visibleNFTs, setVisibleNFTs] = useState(null)
    const [initialVisibleNFTs, setInitialVisibleNFTs] = useState(null)

    // Custom hook to retrieve NFT data and loading state
    const { data: nftsData, isLoading: nftsLoading, reloadNFTs } = useNFT()

    useEffect(() => {
        // Function to determine initial count of visible items based on screen width
        function getInitialVisibleCount() {
            const width = window.innerWidth
            if (width < 768) {
                return 6
            } else if (width >= 768 && width < 1024) {
                return 9
            } else {
                return 12
            }
        }

        // Set initial visible NFTs based on screen size
        const initialCount = getInitialVisibleCount()
        setVisibleNFTs(initialCount)
        setInitialVisibleNFTs(initialCount)

        // Handle window resize to adjust visible NFTs
        const handleResize = () => {
            const newCount = getInitialVisibleCount()
            setVisibleNFTs(newCount)
            setInitialVisibleNFTs(newCount)
        }

        window.addEventListener("resize", handleResize)

        // Cleanup function to remove event listener on component unmount
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Memoized sorting and filtering of NFTs based on their listed status and listing ID
    const sortedAndFilteredNFTs = useMemo(() => {
        return nftsData
            .filter((nft) => nft.isListed)
            .sort((a, b) => Number(b.listingId) - Number(a.listingId))
    }, [nftsData])

    // Render the list of NFTs or a loading message
    const renderNFTList = () => {
        if (sortedAndFilteredNFTs.length === 0) {
            return <p>No NFTs available</p>
        }

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
        <div className={styles.nftListNewWrapper}>
            <h2>Brand New Drops</h2>
            <div className={styles.nftListNew}>{renderNFTList()}</div>
            {nftsLoading ? null : (
                <div className={styles.showMoreBtns}>
                    <BtnWithAction
                        buttonText={"More"}
                        onClickAction={() =>
                            setVisibleNFTs(
                                (prevVisible) =>
                                    prevVisible +
                                    (initialVisibleNFTs > 12 ? initialVisibleNFTs : 12)
                            )
                        }
                    />
                    {visibleNFTs > initialVisibleNFTs && (
                        <BtnWithAction
                            buttonText={"Less"}
                            onClickAction={() => setVisibleNFTs(initialVisibleNFTs)}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default NFTListed
