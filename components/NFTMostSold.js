import React, { useState, useMemo } from "react"
import NFTBox from "../components/NFTBox"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import { useNFT } from "../context/NFTContextProvider"
import LoadingWave from "../components/LoadingWave"

function NFTMostSold() {
    // Retrieve NFT data and loading state using custom hook
    const { nftsData, loadingImage } = useNFT()

    // State for the number of visible NFTs
    const [visibleNFTs, setVisibleNFTs] = useState(5)

    // State to keep track of how many NFTs per address have been shown
    const [nftAddressCount, setNftAddressCount] = useState({})

    // Filter and sort NFTs by buyerCount and ensure that no more than 3 NFTs per address are shown
    const sortedAndFilteredNFTs = useMemo(() => {
        const addressCount = {} // Local tracker for addresses
        const filteredNFTs = []

        // Sort the NFTs by buyerCount
        const sortedNFTs = [...nftsData].sort((a, b) => b.buyerCount - a.buyerCount)

        for (const nft of sortedNFTs) {
            // Check if the address has been encountered less than 3 times
            if ((addressCount[nft.nftAddress] || 0) < 3) {
                filteredNFTs.push(nft)
                addressCount[nft.nftAddress] = (addressCount[nft.nftAddress] || 0) + 1
            }
        }

        // Update the state with the new counts
        setNftAddressCount(addressCount)

        return filteredNFTs
    }, [nftsData])

    // Render the list of NFTs or a loading state
    const renderNFTList = () => {
        if (loadingImage) {
            return (
                <div className={styles.nftLoadingIconWrapper}>
                    <div className={styles.nftLoadingIcon}>
                        <LoadingWave />
                    </div>
                </div>
            )
        }

        // Check if there are no NFTs to display
        if (sortedAndFilteredNFTs.length === 0) {
            return <p>No NFTs available</p>
        }

        // Use the slice method to display only the desired number of NFTs
        return sortedAndFilteredNFTs
            .slice(0, visibleNFTs)
            .map((nft) => <NFTBox nftData={nft} key={`${nft.nftAddress}${nft.tokenId}`} />)
    }

    return (
        <div className={styles.nftListWrapper}>
            <h1>Most Sold NFTs</h1>
            <div id="NFTMostSold" className={styles.nftList}>
                {renderNFTList()}
            </div>
            {loadingImage ? null : (
                <div className={styles.showMoreButton}>
                    <Button
                        text="Show More"
                        onClick={() => {
                            setVisibleNFTs((prevVisible) => prevVisible + 5)
                        }}
                    />
                    {visibleNFTs > 5 && (
                        <Button
                            text="Show Less"
                            onClick={() => {
                                setVisibleNFTs(5)
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default NFTMostSold
