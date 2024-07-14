import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { useNFT } from "@context/NftDataProvider"
import { formatPriceToEther } from "@utils/formatting"
import Card from "@components/NftCard/Card"
import BtnWithAction from "@components/Btn/BtnWithAction"
import styles from "./List.module.scss"
import { ethers } from "ethers"

const List = ({ nftsData: externalNftsData, sortType, title }) => {
    const [visibleNFTs, setVisibleNFTs] = useState(0)
    const [initialVisibleNFTs, setInitialVisibleNFTs] = useState(0)
    const [isLoaded, setIsLoaded] = useState(false)

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

    const getInitialVisibleCount = useCallback(() => {
        const width = window.innerWidth
        if (width < 768) return 4
        if (width < 1023) return 6
        if (width < 1440) return 9
        return 12
    }, [])

    useEffect(() => {
        const initialCount = getInitialVisibleCount()
        setVisibleNFTs(initialCount)
        setInitialVisibleNFTs(initialCount)

        const handleResize = () => {
            const newCount = getInitialVisibleCount()
            if (visibleNFTs <= initialVisibleNFTs) {
                setVisibleNFTs(newCount)
            }
            setInitialVisibleNFTs(newCount)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [getInitialVisibleCount, initialVisibleNFTs])

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
                case "swap":
                    return nftsData.filter(
                        (nft) => nft.desiredNftAddress !== ethers.constants.AddressZero
                    )
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

    useEffect(() => {
        if (!nftsLoading) {
            setIsLoaded(true)
        }
    }, [nftsLoading])

    const renderNFTList = useCallback(() => {
        if (nftsError || !nftsData) {
            console.error("Error on load", nftsError)
            return Array.from({ length: initialVisibleNFTs }, (_, index) => (
                <Card
                    nftData={null}
                    key={`placeholder-${index}`}
                    className={` ${styles.cardPlaceholder} ${isLoaded ? styles.loaded : ""}`}
                />
            ))
        }

        const renderedNFTs = sortedAndFilteredNFTs.map((nft) => (
            <Card
                nftData={nft}
                reloadNFTs={reloadNFTs}
                key={`${nft.nftAddress}${nft.tokenId}`}
                className={`${styles.card} ${isLoaded ? styles.loaded : ""}`}
            />
        ))

        if (renderedNFTs.length === 0) {
            return Array.from({ length: initialVisibleNFTs }, (_, index) => (
                <Card
                    nftData={null}
                    key={`placeholder-${index}`}
                    className={` ${styles.cardPlaceholder} ${isLoaded ? styles.loaded : ""}`}
                />
            ))
        }

        return renderedNFTs
    }, [nftsError, nftsData, sortedAndFilteredNFTs, reloadNFTs, initialVisibleNFTs, isLoaded])

    return (
        <div className={styles.listWrapper}>
            <h3>{title}</h3>
            <div className={styles.list}>
                {renderNFTList().length === 0 && (
                    <Card
                        nftData={null}
                        className={`${styles.card} ${isLoaded ? styles.loaded : ""}`}
                    />
                )}
                {renderNFTList()}
            </div>
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
