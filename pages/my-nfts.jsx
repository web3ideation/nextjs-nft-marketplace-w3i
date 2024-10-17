import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useAccount } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { useNFT } from "@context"
import { useWalletNFTs, useEthToCurrencyRates } from "@hooks"
import { LoadingWave, List, ConnectWalletBtn } from "@components"
import { formatPriceToEther, truncatePrice } from "@utils"
import styles from "@styles/Home.module.scss"

const MyNFTs = () => {
    const { address, isConnected } = useAccount()
    const { nfts: walletNfts, isLoading: walletNftsLoading } = useWalletNFTs(address)
    const { data: nftsData, isLoading: nftsLoading, reloadNFTs } = useNFT()
    const { ethToCurrencyRates, fetching, fetchingSuccess, errorFetching } =
        useEthToCurrencyRates()
    const { open } = useWeb3Modal()

    const [hasOwnNFT, setHasOwnNFT] = useState(false)
    const [unlistedNfts, setUnlistedNfts] = useState([])

    const [nftListedCount, setNftListedCount] = useState(0)
    const [nftTotalCount, setNftTotalCount] = useState(0)
    const [totalPrice, setTotalPrice] = useState(0)

    const isOwnedByUser = useCallback(
        (tokenOwner) => address && tokenOwner?.toLowerCase() === address.toLowerCase(),
        [address]
    )

    const totalPriceInEth = useMemo(() => formatPriceToEther(totalPrice), [totalPrice])
    const totalPriceInEur = useMemo(
        () => (totalPrice && ethToCurrencyRates ? totalPriceInEth * ethToCurrencyRates.eur : 0),
        [totalPriceInEth, ethToCurrencyRates, totalPrice]
    )

    useEffect(() => {
        if (nftsData) {
            const listedNftsSet = new Set(
                nftsData.map((nft) => `${nft.nftAddress}-${nft.tokenId}`)
            )
            const filteredNfts = walletNfts.filter(
                (nft) => !listedNftsSet.has(`${nft.nftAddress}-${nft.tokenId}`)
            )
            setUnlistedNfts(filteredNfts)

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
            setNftTotalCount(walletNfts.length)
            setNftListedCount(count)
            setHasOwnNFT(filteredNfts.length > 0 || count > 0)
        } else {
            setTotalPrice(0)
        }
    }, [walletNfts, nftsData, isOwnedByUser])

    useEffect(() => {
        reloadNFTs()
    }, [address, reloadNFTs])

    const renderNftInfo = () => {
        if (!isConnected) {
            return (
                <div className={`${styles.nftListingContainer} ${styles.textCenter}`}>
                    <h3>Web3 is currently not enabled - Connect your Wallet here</h3>
                    <ConnectWalletBtn onConnect={open} isClient={true} />
                </div>
            )
        }

        if (!hasOwnNFT) {
            return (
                <div className={`${styles.nftListingContainer} ${styles.textCenter}`}>
                    <h3>You {"don't"} own any NFTs yet!</h3>
                </div>
            )
        }

        return (
            <div className={styles.nftListingContainer}>
                <div className={styles.myNftContainer}>
                    {nftListedCount > 0 ? (
                        nftsLoading ? (
                            <LoadingWave />
                        ) : (
                            <List
                                sortType={"myNFTListed"}
                                title={"Listed on marketplace"}
                                showPlaceholders={false}
                            />
                        )
                    ) : (
                        <>
                            <h3>You {"don't"} have any listed NFTs yet!</h3>
                            <p>
                                List your NFTs on the marketplace to start selling or swapping
                                them. Start by clicking on your unlisted NFTs below and choose
                                between selling or swapping them.
                            </p>
                        </>
                    )}
                    {unlistedNfts.length > 0 ? (
                        walletNftsLoading ? (
                            <LoadingWave />
                        ) : (
                            <List
                                sortType={"myNFTFromWallet"}
                                title={"Unlisted in your wallet"}
                                nftsData={unlistedNfts}
                            />
                        )
                    ) : (
                        <h3>Congratulations, you {"don't"} own any unlisted NFTs yet!</h3>
                    )}
                </div>
            </div>
        )
    }

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
                    <p>Total NFTs listed: {nftListedCount}</p>
                    <p title={totalPriceInEth}>
                        Total price listed NFTs: {truncatePrice(totalPriceInEth, 5)}... ETH
                    </p>
                    {fetching ? (
                        <p>Fetching price in EUR...</p>
                    ) : errorFetching ? (
                        <p>Error fetching price in EUR</p>
                    ) : (
                        <p title={totalPriceInEur}>
                            Total price listed NFTs: {truncatePrice(totalPriceInEur, 2)}... €
                        </p>
                    )}
                    <p>Total NFTs unlisted: {unlistedNfts.length}</p>
                    <p>Total NFTs: {nftTotalCount}</p>
                </div>
            )}
            {renderNftInfo()}
        </div>
    )
}

export default MyNFTs
