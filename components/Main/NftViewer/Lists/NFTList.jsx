// React Imports
import React, { useState, useMemo, useEffect } from "react"
import { useAccount } from "wagmi"

// Custom Hooks & Components Imports
import { useNFT } from "@context/NFTDataProvider"
import { formatPriceToEther } from "@utils/formatting"
import LoadingWave from "@components/UX/LoadingWave/LoadingWave"
import NFTCard from "@components/Main/NftCard/NFTCard"
import BtnWithAction from "@components/UI/BtnWithAction"

// Styles import
import styles from "./NFTList.module.scss"

function NFTList({ nftsData: externalNftsData, sortType, title }) {
    // State hooks for managing NFT visibility
    const [visibleNFTs, setVisibleNFTs] = useState(null)
    const [initialVisibleNFTs, setInitialVisibleNFTs] = useState(null)

    // Custom hook to retrieve NFT data and loading state
    const {
        data: internalNftsData,
        isLoading: nftsLoading,
        isError: nftsError,
        reloadNFTs,
    } = useNFT()
    const nftsData = externalNftsData || internalNftsData
    console.log("External", externalNftsData)
    console.log("internal", internalNftsData)
    console.log("NFTS data list", nftsData)
    // Account information from wagmi hook
    const { address, isConnected } = useAccount()

    useEffect(() => {
        // Function to determine initial count of visible items based on screen width
        function getInitialVisibleCount() {
            const width = window.innerWidth
            if (width < 768) {
                return 4
            } else if (width >= 768 && width < 1023) {
                return 6
            } else if (width >= 1024 && width < 1440) {
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
    const sortAndFilterNFTs = (nftsData, sortType) => {
        const isOwnedByUser = (tokenOwner) =>
            address && tokenOwner?.toLowerCase() === address.toLowerCase()

        switch (sortType) {
            case "brandNew":
                return nftsData
                    .filter((nft) => nft.isListed)
                    .sort((a, b) => Number(b.listingId) - Number(a.listingId))
            case "mostSold":
                const addressCount = {} // Tracks the number of NFTs per address
                const filteredNFTs = []

                nftsData
                    .sort((a, b) => b.buyerCount - a.buyerCount)
                    .forEach((nft) => {
                        const count = addressCount[nft.nftAddress] || 0
                        if (count < 3) {
                            filteredNFTs.push(nft)
                            addressCount[nft.nftAddress] = count + 1
                        }
                    })
                return filteredNFTs
            case "expensive":
                return nftsData
                    .filter((nft) => Number(formatPriceToEther(nft.price)) > 0.01)
                    .sort((a, b) => Number(b.price) - Number(a.price))
            case "myNFTListed":
                return nftsData.filter((nft) => isOwnedByUser(nft.tokenOwner) && nft.isListed)
            case "myNFTNotListed":
                return nftsData.filter((nft) => isOwnedByUser(nft.tokenOwner) && !nft.isListed)
            default:
                return nftsData // Default to unsorted if no sortType is matched
        }
    }

    // Memoized sorting and filtering of NFTs
    const sortedAndFilteredNFTs = useMemo(() => {
        return sortAndFilterNFTs(nftsData, sortType).slice(0, visibleNFTs)
    }, [nftsData, visibleNFTs, sortType])

    // Render the list of NFTs or a loading message
    const renderNFTList = () => {
        if (nftsError) {
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
            {nftsLoading ? (
                <div className={styles.listLoading}>
                    <LoadingWave />
                </div>
            ) : (
                <div className={styles.list}>
                    <>{renderNFTList()} </>
                </div>
            )}
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
        </div>
    )
}

export default NFTList
