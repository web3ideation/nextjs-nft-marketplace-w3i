import React, { useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"

import { useNFT } from "@context/NftDataProvider"
import { useWalletNFTs } from "@hooks/index"
import LoadingWave from "@components/LoadingWave/LoadingWave"
import NFTList from "@components/NftViewer/NftLists/List"
import ConnectWalletBtn from "@components/Btn/ConnectWalletBtn/ConnectWalletBtn"

import { formatPriceToEther, truncatePrice } from "@utils/formatting"
import useEthToEurRate from "@hooks/ethToEurRate/useEthToEurRate"

import styles from "@styles/Home.module.scss"

const MyNFTs = () => {
    const { data: nftsData, isLoading: nftsLoading, reloadNFTs } = useNFT()
    const { open } = useWeb3Modal()
    const [hasOwnNFT, setHasOwnNFT] = useState(false)
    const [totalPrice, setTotalPrice] = useState(0)
    const [nftCount, setNftCount] = useState(0)
    const [formattedTotalPrice, setFormattedTotalPrice] = useState(0)
    const [truncatedTotalPrice, setTruncatedTotalPrice] = useState(0)
    const [totalPriceInEur, setTotalPriceInEur] = useState(0)
    const [formattedTotalPriceInEur, setFormattedTotalPriceInEur] = useState(0)

    const { address, isConnected } = useAccount()

    const { nfts, loading, error } = useWalletNFTs(address)
    const [unlistedNfts, setUnlistedNfts] = useState([])
    const ethToEurRate = useEthToEurRate()

    const isOwnedByUser = useCallback(
        (tokenOwner) => {
            const isOwned = address && tokenOwner?.toLowerCase() === address.toLowerCase()
            console.log(
                "Comparing token owner:",
                tokenOwner?.toLowerCase(),
                "with user address:",
                address?.toLowerCase(),
                "Result:",
                isOwned
            )
            return isOwned
        },
        [address]
    )

    useEffect(() => {
        console.log("Fetched NFTs from wallet:", nfts)
        console.log("NFT data from provider:", nftsData)

        const listedNftsSet = new Set(nftsData.map((nft) => `${nft.nftAddress}-${nft.tokenId}`))
        console.log("Listed NFTs Set:", listedNftsSet)

        const filteredNfts = nfts.filter(
            (nft) => !listedNftsSet.has(`${nft.nftAddress}-${nft.tokenId}`)
        )
        console.log("Unlisted NFTs:", filteredNfts)
        setUnlistedNfts(filteredNfts)

        // Set hasOwnNFT based on unlisted NFTs
        if (filteredNfts.length > 0 || nftsData.length > 0) {
            setHasOwnNFT(true)
        }
    }, [nfts, nftsData])

    useEffect(() => {
        if (nftsData) {
            console.log("NFTs Data Structure:", nftsData)
            const { total, count } = nftsData.reduce(
                (acc, nft) => {
                    console.log("Processing NFT:", nft)
                    if (isOwnedByUser(nft.tokenOwner)) {
                        acc.total += parseFloat(nft.price)
                        acc.count += 1
                    }
                    return acc
                },
                { total: 0, count: 0 }
            )
            console.log("Total Price of NFTs:", total)
            console.log("NFT Count:", count)

            setTotalPrice(total)
            setNftCount(count)

            // Set hasOwnNFT based on listed NFTs
            if (count > 0) {
                setHasOwnNFT(true)
            }
        }
    }, [nftsData, isOwnedByUser])

    useEffect(() => {
        console.log("Reloading NFTs for address:", address)
        reloadNFTs()
    }, [address, reloadNFTs])

    useEffect(() => {
        setFormattedTotalPrice(formatPriceToEther(totalPrice))
        setTruncatedTotalPrice(truncatePrice(formattedTotalPrice, 5))
        setFormattedTotalPriceInEur(truncatePrice(totalPriceInEur, 2))
        console.log("Formatted Total Price:", formattedTotalPrice)
        console.log("Truncated Total Price:", truncatedTotalPrice)
    }, [totalPrice, formattedTotalPrice, totalPriceInEur])

    // Update the price in EUR only if we have both the price and the exchange rate
    useEffect(() => {
        if (totalPrice && ethToEurRate) {
            const ethPrice = formatPriceToEther(totalPrice)
            setTotalPriceInEur(ethPrice * ethToEurRate)
        }
    }, [totalPrice, ethToEurRate])

    if (nftsLoading) {
        console.log("Loading NFTs...")
        return (
            <div className={styles.myNftWrapper}>
                <h2>My NFTs</h2>
                <div className={styles.myNftLoadingWaveWrapper}>
                    <LoadingWave />
                </div>
            </div>
        )
    }

    return (
        <div className={styles.myNftWrapper}>
            <h2>My NFTs</h2>
            {isConnected && (
                <div className={styles.myNftTotalInformation}>
                    <p>Total NFTs listed: {nftCount}</p>
                    <p title={formattedTotalPrice}>
                        Total price listed NFTs: {truncatedTotalPrice}... ETH
                    </p>
                    <p title={totalPriceInEur}>
                        Total price listed NFTs: {formattedTotalPriceInEur}... €
                    </p>
                </div>
            )}
            <>
                {isConnected ? (
                    hasOwnNFT ? (
                        <>
                            <div className={styles.nftListingContainer}>
                                {nftCount > 0 ? (
                                    <NFTList
                                        sortType={"myNFTListed"}
                                        title={"Listed on marketplace"}
                                        showPlaceholders={false}
                                    />
                                ) : (
                                    <>
                                        <h3>You {"don't"} have any listed NFTs yet!</h3>
                                        <p>
                                            List your NFTs on the marketplace to start selling or
                                            swapping them. Start by clicking on your unlisted NFTs
                                            below and choose between selling or swapping them.
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className={styles.nftListingContainer}>
                                {unlistedNfts.length > 0 ? (
                                    <NFTList
                                        sortType={"myNFTFromWallet"}
                                        title={"Unlisted in your wallet"}
                                        nftsData={unlistedNfts}
                                    />
                                ) : (
                                    <h3>
                                        Congratulations, you {"don't"} own any unlisted NFTs yet!
                                    </h3>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className={styles.nftListingContainer}>
                            <h3>You {"don't"} own any NFTs yet!</h3>
                        </div>
                    )
                ) : (
                    <div className={`${styles.nftListingContainer} ${styles.notConnected}`}>
                        <h3>Web3 is currently not enabled - Connect your Wallet here</h3>
                        <ConnectWalletBtn onConnect={() => open()} isClient={true} />
                    </div>
                )}
            </>
        </div>
    )
}

export default MyNFTs
