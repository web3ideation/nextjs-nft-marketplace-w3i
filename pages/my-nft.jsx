// React and Hooks imports
import React, { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"

// Custom components and hooks
import { useNFT } from "@context/NFTDataProvider"
import useFetchNFTsFromWallet from "@hooks/fetchNFTsForWallet"
import LoadingWave from "@components/UX/LoadingWave/LoadingWave"
import NFTList from "@components/Main/NftViewer/Lists/NFTList"
import ConnectWalletBtn from "@components/Header/WalletConnect/ConnectWalletButton/ConnectWalletBtn"

// Utility imports
import { formatPriceToEther, truncatePrice } from "@utils/formatting"
import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"

// Styles import
import styles from "@styles/Home.module.scss"

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

    const { nfts, loading, error } = useFetchNFTsFromWallet(address)
    const [unlistedNfts, setUnlistedNfts] = useState([])
    console.log("NFTS FROM USER", nfts)
    console.log("NFTS filtered", unlistedNfts)
    // Checks if the NFT is owned by the current user
    const isOwnedByUser = (tokenOwner) =>
        address && tokenOwner?.toLowerCase() === address.toLowerCase()

    // Filterfunktion, um NFTs zu finden, die nicht gelistet sind
    useEffect(() => {
        const listedNftsSet = new Set(nftsData.map((nft) => `${nft.nftAddress}-${nft.tokenId}`))

        // Filter NFTs, die NICHT in `listedNftsSet` enthalten sind, um ungelistete NFTs zu finden
        const filteredNfts = nfts.filter(
            (nft) => !listedNftsSet.has(`${nft.nftAddress}-${nft.tokenId}`)
        )
        setUnlistedNfts(filteredNfts)
    }, [nfts, nftsData])

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
                            <NFTList sortType={"myNFTListed"} title={"Listed on marketplace"} />
                            {/*<NFTList sortType={"myNFTNotListed"} title={"Not listed"} />*/}
                            {unlistedNfts.length > 0 ? (
                                <>
                                    <NFTList
                                        sortType={"myNFTFromWallet"}
                                        title={"In your wallet"}
                                        nftsData={unlistedNfts}
                                    />
                                </>
                            ) : (
                                <h3>Congratulations you don't own any unlisted NFTs yet!</h3>
                            )}
                        </>
                    ) : (
                        <div>
                            <h3>You don't own any NFTs yet!</h3>
                        </div>
                    )
                ) : (
                    <div>
                        <h3>Web3 is currently not enabled - Connect your Wallet here</h3>
                        <ConnectWalletBtn onConnect={() => open()} />
                    </div>
                )}
            </>
        </div>
    )
}

export default MyNFTs
