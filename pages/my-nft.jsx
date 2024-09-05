import React, { useState, useEffect, useCallback, useMemo } from "react"
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
    const { address, isConnected } = useAccount()
    const { nfts } = useWalletNFTs(address)
    const { data: nftsData, isLoading: nftsLoading, reloadNFTs } = useNFT()
    const { ethToEurRate, fetching, errorFetching } = useEthToEurRate()
    const { open } = useWeb3Modal()

    const [hasOwnNFT, setHasOwnNFT] = useState(false)
    const [unlistedNfts, setUnlistedNfts] = useState([])
    const [nftCount, setNftCount] = useState(0)

    const [totalPrice, setTotalPrice] = useState(0)

    const isOwnedByUser = useCallback(
        (tokenOwner) => address && tokenOwner?.toLowerCase() === address.toLowerCase(),
        [address]
    )

    const totalPriceInEth = useMemo(() => formatPriceToEther(totalPrice), [totalPrice])
    const totalPriceInEur = useMemo(
        () => (totalPrice && ethToEurRate ? totalPriceInEth * ethToEurRate : 0),
        [totalPriceInEth, ethToEurRate]
    )

    useEffect(() => {
        if (nftsData) {
            const listedNftsSet = new Set(
                nftsData.map((nft) => `${nft.nftAddress}-${nft.tokenId}`)
            )
            const filteredNfts = nfts.filter(
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
            setNftCount(count)
            setHasOwnNFT(filteredNfts.length > 0 || count > 0)
        } else {
            setTotalPrice(0)
        }
    }, [nfts, nftsData, isOwnedByUser])

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
                                List your NFTs on the marketplace to start selling or swapping
                                them. Start by clicking on your unlisted NFTs below and choose
                                between selling or swapping them.
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
                        <h3>Congratulations, you {"don't"} own any unlisted NFTs yet!</h3>
                    )}
                </div>
            </>
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
                    <p>Total NFTs listed: {nftCount}</p>
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
                </div>
            )}
            {renderNftInfo()}
        </div>
    )
}

export default MyNFTs
