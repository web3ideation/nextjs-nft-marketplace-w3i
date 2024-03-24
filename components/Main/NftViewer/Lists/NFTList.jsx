// React Imports
import React, { useState, useMemo, useEffect } from "react"
import { useAccount } from "wagmi"

// Custom Hooks & Components Imports
import { useNFT } from "@context/NFTDataProvider"
import { formatPriceToEther } from "@utils/formatting"
import NFTCard from "@components/Main/NftCard/NFTCard"
import BtnWithAction from "@components/UI/BtnWithAction"

// Styles import
import styles from "./NFTList.module.scss"

function NFTList({ sortType, title }) {
    // State hooks for managing NFT visibility
    const [visibleNFTs, setVisibleNFTs] = useState(null)
    const [initialVisibleNFTs, setInitialVisibleNFTs] = useState(null)

    // Custom hook to retrieve NFT data and loading state
    const { data: nftsData, isLoading: nftsLoading, reloadNFTs } = useNFT()

    // Account information from wagmi hook
    const { address, isConnected } = useAccount()

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

    // Define sort and filter functions based on sortType
    const sortAndFilterNFTs = (nfts, sortType) => {
        const isOwnedByUser = (tokenOwner) =>
            address && tokenOwner?.toLowerCase() === address.toLowerCase()

        switch (sortType) {
            case "brandNew":
                return nfts
                    .filter((nft) => nft.isListed)
                    .sort((a, b) => Number(b.listingId) - Number(a.listingId))
            case "mostSold":
                const addressCount = {} // Tracks the number of NFTs per address
                const filteredNFTs = []

                nfts.sort((a, b) => b.buyerCount - a.buyerCount).forEach((nft) => {
                    const count = addressCount[nft.nftAddress] || 0
                    if (count < 3) {
                        filteredNFTs.push(nft)
                        addressCount[nft.nftAddress] = count + 1
                    }
                })
                return filteredNFTs
            case "expensive":
                return nfts
                    .filter((nft) => Number(formatPriceToEther(nft.price)) > 0.01)
                    .sort((a, b) => Number(b.price) - Number(a.price))
            case "myNFTListed":
                return nfts.filter((nft) => isOwnedByUser(nft.tokenOwner) && nft.isListed)
            case "myNFTNotListed":
                return nfts.filter((nft) => isOwnedByUser(nft.tokenOwner) && !nft.isListed)
            default:
                return nfts // Default to unsorted if no sortType is matched
        }
    }

    // Memoized sorting and filtering of NFTs
    const sortedAndFilteredNFTs = useMemo(() => {
        return sortAndFilterNFTs(nftsData, sortType).slice(0, visibleNFTs)
    }, [nftsData, visibleNFTs, sortType])

    // Render the list of NFTs or a loading message
    const renderNFTList = () => {
        if (sortedAndFilteredNFTs.length === 0) {
            return <p>No NFTs available</p>
        }

        return sortedAndFilteredNFTs.map((nft) => (
            <NFTCard
                nftData={nft}
                reloadNFTs={reloadNFTs}
                key={`${nft.nftAddress}${nft.tokenId}`}
            />
        ))
    }

    return (
        <div className={styles.listWrapper}>
            <h3>{title}</h3>
            <div className={styles.list}>{renderNFTList()}</div>
            {nftsLoading ? null : (
                <div className={styles.showMoreBtns}>
                    {visibleNFTs == sortedAndFilteredNFTs.length && (
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
                    )}
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

export default NFTList
