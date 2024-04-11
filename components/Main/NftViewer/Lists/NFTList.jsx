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

const NFTList = ({ nftsData: externalNftsData, sortType, title }) => {
    const [visibleNFTs, setVisibleNFTs] = useState(null)
    const [initialVisibleNFTs, setInitialVisibleNFTs] = useState(null)

    const {
        data: internalNftsData,
        isLoading: nftsLoading,
        isError: nftsError,
        reloadNFTs,
    } = useNFT()
    const nftsData = externalNftsData || internalNftsData

    const { address } = useAccount()

    useEffect(() => {
        function getInitialVisibleCount() {
            const width = window.innerWidth
            if (width < 768) return 4
            if (width >= 768 && width < 1023) return 6
            if (width >= 1024 && width < 1440) return 9
            return 12
        }

        const initialCount = getInitialVisibleCount()
        setVisibleNFTs(initialCount)
        setInitialVisibleNFTs(initialCount)

        const handleResize = () => {
            const newCount = getInitialVisibleCount()
            setVisibleNFTs(newCount)
            setInitialVisibleNFTs(newCount)
        }

        window.addEventListener("resize", handleResize)

        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const sortAndFilterNFTs = (nftsData, sortType) => {
        const isOwnedByUser = (tokenOwner) =>
            address && tokenOwner?.toLowerCase() === address.toLowerCase()

        switch (sortType) {
            case "brandNew":
                return nftsData
                    .filter((nft) => nft.isListed)
                    .sort((a, b) => Number(b.listingId) - Number(a.listingId))
            case "mostSold":
                const addressCount = {}
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
                return nftsData
        }
    }

    const sortedAndFilteredNFTs = useMemo(() => {
        return sortAndFilterNFTs(nftsData, sortType).slice(0, visibleNFTs)
    }, [nftsData, visibleNFTs, sortType])

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
