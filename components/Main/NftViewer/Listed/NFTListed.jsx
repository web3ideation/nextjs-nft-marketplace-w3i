// ------------------ React Imports ------------------
import React, { useState, useMemo } from "react"

// ------------------ Custom Hooks & Component Imports ------------------
import { useNFT } from "../../../../context/NFTDataProvider"
import NFTBox from "../../NftCard/NFTCard"

// ------------------ Styles ------------------
import styles from "../../../../styles/Home.module.css"

function NFTListed() {
    // Retrieve NFT data and loading state using custom hook
    const { data: nftsData, isLoading: nftsLoading, reloadNFTs } = useNFT()

    // State for the number of visible NFTs
    const [visibleNFTs, setVisibleNFTs] = useState(5)

    // Sort and filter NFTs based on listingId and isListed status
    const sortedAndFilteredNFTs = useMemo(() => {
        return [...nftsData]
            .filter((nft) => nft.isListed)
            .sort((a, b) => Number(b.listingId) - Number(a.listingId))
    }, [nftsData])

    // Render the list of NFTs or a loading message
    const renderNFTList = () => {
        if (sortedAndFilteredNFTs.length === 0) {
            return <p>No NFTs available</p>
        }

        return sortedAndFilteredNFTs
            .slice(0, visibleNFTs)
            .map((nft) => (
                <NFTBox
                    nftData={nft}
                    reloadNFTs={reloadNFTs}
                    key={`${nft.nftAddress}${nft.tokenId}`}
                />
            ))
    }

    return (
        <div className={styles.nftListNewWrapper}>
            <h1>Brand New Drops</h1>
            <div className={styles.nftListNew}>{renderNFTList()}</div>
            {nftsLoading ? null : (
                <div className={styles.showMoreNewButton}>
                    <button
                        onClick={() => {
                            setVisibleNFTs((prevVisible) => prevVisible + 10)
                        }}
                    >
                        MORE
                    </button>
                    {visibleNFTs > 5 && (
                        <button
                            onClick={() => {
                                setVisibleNFTs(5)
                            }}
                        >
                            {" "}
                            LESS
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default NFTListed
