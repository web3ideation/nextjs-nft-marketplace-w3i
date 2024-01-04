// React imports (React core and hooks)
import React, { useMemo } from "react"

// Importing custom hooks and components
import { useNFT } from "../../../../context/NFTDataProvider"
import NFTBox from "../../NftCard/NFTCard"

// Styles import
import styles from "../../../../styles/Home.module.css"

function NFTModalList({ filterAddress, filterTokenId }) {
    // Retrieve NFT data and loading state using custom hook
    const { data: nftsData } = useNFT()

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
            <div className={styles.modalListWrapper}>
                <div className={styles.modalList}>{renderNFTList()}</div>
            </div>
        </div>
    )
}

export default NFTModalList
