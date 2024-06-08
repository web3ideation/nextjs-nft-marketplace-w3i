import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { useNFT } from "@context/NftDataProvider"
import { formatPriceToEther } from "@utils/formatting"
import Card from "@components/NftCard/Card"
import BtnWithAction from "@components/Btn/BtnWithAction"
import styles from "./List.module.scss"

const List = ({ nftsData: externalNftsData, sortType, title }) => {
    const [visibleNFTs, setVisibleNFTs] = useState(0)
    const [initialVisibleNFTs, setInitialVisibleNFTs] = useState(0)

    const {
        data: internalNftsData,
        isLoading: nftsLoading,
        isError: nftsError,
        reloadNFTs,
    } = useNFT()
    const nftsData = useMemo(
        () => externalNftsData || internalNftsData,
        [externalNftsData, internalNftsData]
    )

    const { address } = useAccount()

    useEffect(() => {
        function getInitialVisibleCount() {
            const width = window.innerWidth
            if (width < 768) return 4
            if (width < 1023) return 6
            if (width < 1440) return 9
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

    const sortAndFilterNFTs = useCallback(
        (nftsData, sortType) => {
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
                case "myNFTFromWallet":
                    return nftsData
                default:
                    return nftsData
            }
        },
        [address]
    )

    const sortedAndFilteredNFTs = useMemo(() => {
        return sortAndFilterNFTs(nftsData, sortType).slice(0, visibleNFTs)
    }, [nftsData, visibleNFTs, sortType, sortAndFilterNFTs])

    const renderNFTList = useCallback(() => {
        if (nftsLoading) {
            return <p>Loading NFTs...</p>
        }
        if (nftsError || !nftsData) {
            console.log("Error on load", nftsError)
            return <p>No NFTs available</p>
        }

        return sortedAndFilteredNFTs.map((nft) => (
            <Card nftData={nft} reloadNFTs={reloadNFTs} key={`${nft.nftAddress}${nft.tokenId}`} />
        ))
    }, [nftsLoading, nftsError, nftsData, sortedAndFilteredNFTs, reloadNFTs])

    return (
        <div className={styles.listWrapper}>
            <h3>{title}</h3>
            <div className={styles.list}>{renderNFTList()}</div>
            <div className={styles.showMoreBtns}>
                {visibleNFTs === sortedAndFilteredNFTs.length && (
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

export default List
