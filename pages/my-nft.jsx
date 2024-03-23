// React and Hooks imports
import React, { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"

// Custom components and hooks
import { useNFT } from "@context/NFTDataProvider"
import LoadingWave from "@components/UX/LoadingWave/LoadingWave"
import { formatPriceToEther, truncatePrice } from "@utils/formatting"
import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"

// Styles import
import styles from "@styles/Home.module.scss"
import NFTList from "../components/Main/NftViewer/Lists/NFTList"
import ConnectWalletBtn from "../components/Header/WalletConnect/ConnectWalletButton/ConnectWalletBtn"

const MyNFTs = () => {
    // State for managing NFT data, loading states, and price calculations
    const { data: nftsData, isLoading: nftsLoading, reloadNFTs } = useNFT()
    const { open } = useWeb3Modal()
    const [hasOwnNFT, setHasOwnNFT] = useState(false)
    const [totalPrice, setTotalPrice] = useState(0)
    const [nftCount, setNftCount] = useState(0)
    const [formattedTotalPrice, setFormattedTotalPrice] = useState(0)
    const [truncatedTotalPrice, setTruncatedTotalPrice] = useState(0)
    const [totalPriceInEur, setTotalPriceInEur] = useState(0)
    const [formattedTotalPriceInEur, setFormattedTotalPriceInEur] = useState(0)

    // Account information from wagmi hook
    const { address, isConnected } = useAccount()

    // Checks if the NFT is owned by the current user
    const isOwnedByUser = (tokenOwner) =>
        address && tokenOwner?.toLowerCase() === address.toLowerCase()

    // Effect for updating NFT count and total price based on the user's ownership
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
    }, [nftsData, address])

    // Effect for reloading NFTs on address change
    useEffect(() => {
        reloadNFTs()
    }, [address, reloadNFTs])

    // Price formatting effects
    useEffect(() => {
        setFormattedTotalPrice(formatPriceToEther(totalPrice))
        setTruncatedTotalPrice(truncatePrice(formattedTotalPrice, 5))
        setFormattedTotalPriceInEur(truncatePrice(totalPriceInEur, 5))
    }, [totalPrice, formattedTotalPrice, totalPriceInEur])

    // Effect for updating price in EUR
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

    // Render loading state
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
                    <p>Total NFTs: {nftCount}</p>
                    <p title={formattedTotalPrice}>Total Price: {truncatedTotalPrice}... ETH</p>
                    <p title={totalPriceInEur}>Total Price: {formattedTotalPriceInEur}... €</p>
                </div>
            )}
            <div className={styles.myNftList}>
                {isConnected ? (
                    hasOwnNFT ? (
                        <NFTList sortType={"myNFT"} />
                    ) : (
                        <div>
                            <h2>You don't own any NFTs yet!</h2>
                        </div>
                    )
                ) : (
                    <div>
                        <h2>Web3 is currently not enabled - Connect your Wallet here</h2>
                        <ConnectWalletBtn onConnect={() => open()} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyNFTs
