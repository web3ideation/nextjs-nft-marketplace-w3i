import React, { useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"

import { useNFT } from "@context/NftDataProvider"
import { useWalletNFTs } from "@hooks/index"
import LoadingWave from "@components/LoadingWave/LoadingWave"
import NFTList from "@components/NftViewer/NftLists/List"
import ConnectWalletBtn from "@components/Btn/ConnectWalletBtn/ConnectWalletBtn"

import { formatPriceToEther, truncatePrice } from "@utils/formatting"
import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"

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
    const isOwnedByUser = useCallback(
        (tokenOwner) => address && tokenOwner?.toLowerCase() === address.toLowerCase(),
        [address]
    )

    useEffect(() => {
        const listedNftsSet = new Set(nftsData.map((nft) => `${nft.nftAddress}-${nft.tokenId}`))

        const filteredNfts = nfts.filter((nft) => !listedNftsSet.has(`${nft.nftAddress}-${nft.tokenId}`))
        setUnlistedNfts(filteredNfts)
    }, [nfts, nftsData])

    useEffect(() => {
        if (nftsData) {
            const { total, count } = nftsData.reduce(
                (acc, nft) => {
                    if (isOwnedByUser(nft.tokenOwner)) {
                        acc.total += parseFloat(nft.price)
                        acc.count += 1
                    }
                    return acc
                },
                { total: 0, count: 0 }
            )
            setTotalPrice(total)
            setNftCount(count)
            setHasOwnNFT(count > 0)
        }
    }, [nftsData, isOwnedByUser])

    useEffect(() => {
        reloadNFTs()
    }, [address, reloadNFTs])

    useEffect(() => {
        setFormattedTotalPrice(formatPriceToEther(totalPrice))
        setTruncatedTotalPrice(truncatePrice(formattedTotalPrice, 5))
        setFormattedTotalPriceInEur(truncatePrice(totalPriceInEur, 5))
    }, [totalPrice, formattedTotalPrice, totalPriceInEur])

    useEffect(() => {
        const updatePriceInEur = async () => {
            const ethToEurRate = await fetchEthToEurRate()
            if (ethToEurRate) {
                const ethPrice = formatPriceToEther(totalPrice)
                setTotalPriceInEur(ethPrice * ethToEurRate)
            }
        }

        updatePriceInEur()
    }, [totalPrice])

    if (nftsLoading) {
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
                    <p title={formattedTotalPrice}>Total price listed NFTs: {truncatedTotalPrice}... ETH</p>
                    <p title={totalPriceInEur}>Total price listed NFTs: {formattedTotalPriceInEur}... €</p>
                </div>
            )}
            <>
                {isConnected ? (
                    hasOwnNFT ? (
                        <>
                            <div className={styles.nftListingContainer}>
                                <NFTList sortType={"myNFTListed"} title={"Listed on marketplace"} />
                            </div>
                            {unlistedNfts.length > 0 ? (
                                <>
                                    <div className={styles.nftListingContainer}>
                                        <NFTList
                                            sortType={"myNFTFromWallet"}
                                            title={"Unlisted in your wallet"}
                                            nftsData={unlistedNfts}
                                        />
                                    </div>
                                </>
                            ) : (
                                <h3>Congratulations you {"don't"} own any unlisted NFTs yet!</h3>
                            )}
                        </>
                    ) : (
                        <div>
                            <h3>You {"don't"} own any NFTs yet!</h3>
                        </div>
                    )
                ) : (
                    <div>
                        <h3>Web3 is currently not enabled - Connect your Wallet here</h3>
                        <ConnectWalletBtn onConnect={() => open()} isClient={true} />
                    </div>
                )}
            </>
        </div>
    )
}

export default MyNFTs
