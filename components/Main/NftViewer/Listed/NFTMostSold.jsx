// ------------------ React Imports ------------------
import React, { useState, useMemo, useEffect } from "react"

// ------------------ Custom Hooks & Component Imports ------------------
import NFTBox from "../../NftCard/NFTCard"
import { useNFT } from "@context/NFTDataProvider"
import BtnWithAction from "@components/uiComponents/BtnWithAction"

// ------------------ Styles ------------------
import styles from "./NFTMostSold.module.scss"

// Component for displaying the most sold NFTs
function NFTMostSold() {
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

    // Memoized sorting and filtering of NFTs based on buyerCount and limit per address
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
        <div className={styles.nftListMostWrapper}>
            <h2>Hot Picks</h2>
            <div className={styles.nftListMost}>{renderNFTList()}</div>
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

export default NFTMostSold
