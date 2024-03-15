// ------------------ React Imports ------------------
import React, { useState, useMemo, useEffect } from "react"

// ------------------ Custom Hooks & Component Imports ------------------
import { useNFT } from "../../../../context/NFTDataProvider"
import NFTBox from "../../NftCard/NFTCard"
import BtnWithAction from "../../../uiComponents/BtnWithAction"

// ------------------ Styles ------------------
import styles from "./NFTListed.module.scss"

function NFTListed() {
    // Retrieve NFT data and loading state using custom hook
    const { data: nftsData, isLoading: nftsLoading, reloadNFTs } = useNFT()

    // State for the number of visible NFTs
    const [visibleNFTs, setVisibleNFTs] = useState(null)
    const [initialVisibleNFTs, setInitialVisibleNFTs] = useState(null)

    useEffect(() => {
        //function to get initial count of items should be displayed
        function getInitialVisibleCount() {
            const width = window.innerWidth
            if (width < 768) {
                return 4
            } else if (width >= 768 && width < 1024) {
                return 9
            } else {
                return 6
            }
        }
        setVisibleNFTs(getInitialVisibleCount())
        setInitialVisibleNFTs(getInitialVisibleCount())

        function handleResize() {
            setVisibleNFTs(getInitialVisibleCount())
            setInitialVisibleNFTs(getInitialVisibleCount())
        }

        window.addEventListener("resize", handleResize)

        // Cleanup
        return () => window.removeEventListener("resize", handleResize)
    }, [])

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
                <div className={styles.showMoreBtns}>
                    <BtnWithAction
                        buttonText={"More"}
                        onClickAction={() => setVisibleNFTs((prevVisible) => prevVisible + 12)}
                    />
                    {visibleNFTs > 9 && (
                        <BtnWithAction
                            buttonText={"Less"}
                            onClickAction={() => setVisibleNFTs(initialVisibleNFTs)}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default NFTListed
