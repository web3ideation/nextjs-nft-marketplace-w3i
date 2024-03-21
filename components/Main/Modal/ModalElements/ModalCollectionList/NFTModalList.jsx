// React imports (React core and hooks)
import React, { useMemo, useRef, useEffect } from "react"

// Importing custom hooks and components
import { useNFT } from "@context/NFTDataProvider"
import NFTBox from "@components/Main/NftCard/NFTCard"

// Styles import
import styles from "./NFTModalList.module.scss"

function NFTModalList({ filterAddress, filterTokenId }) {
    // Retrieve NFT data and loading state using custom hook
    const { data: nftsData } = useNFT()

    const listRef = useRef(null)

    // Funktion zum horizontalen Scrollen
    const onWheel = (e) => {
        if (!listRef.current) return
        listRef.current.scrollLeft += e.deltaY
    }

    // Effect Hook, um den Event Listener hinzuzufügen
    useEffect(() => {
        const listElement = listRef.current
        if (listElement) {
            listElement.addEventListener("wheel", onWheel)
        }

        // Cleanup-Funktion
        return () => {
            if (listElement) {
                listElement.removeEventListener("wheel", onWheel)
            }
        }
    }, [])

    // useMemo for memoizing filtered NFTs to optimize performance
    const filteredNFTs = useMemo(() => {
        return nftsData.filter(
            (nft) =>
                nft.nftAddress === filterAddress &&
                (!filterTokenId || nft.tokenId !== filterTokenId)
        )
    }, [nftsData, filterAddress, filterTokenId])

    // Function to render NFTs or a fallback message
    const renderNFTList = () => {
        // Early return for no NFTs case
        if (filteredNFTs.length === 0) {
            return <p>No NFTs available</p>
        }

        // Mapping over filtered NFTs to render them
        return filteredNFTs.map((nft) => (
            <NFTBox nftData={nft} key={`${nft.nftAddress}${nft.tokenId}`} />
        ))
    }

    return (
        <div className={styles.modalListContainer}>
            <div className={styles.modalListWrapper} ref={listRef}>
                <div className={styles.modalList}>{renderNFTList()}</div>
            </div>
        </div>
    )
}

export default NFTModalList
