import React, { useState } from "react"
import NFTBox from "../components/NFTBox"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import { useNFT } from "../components/NFTContextProvider"
import { useRouter } from "next/router"

function NFTListed() {
    const { nftsData, loadingImage } = useNFT()
    const router = useRouter()

    // State for the number of visible NFTs
    const [visibleNFTs, setVisibleNFTs] = useState(5)

    return (
        <div className={styles.nftListingContainer}>
            <div className={styles.nftListWrapper}>
                <h1>Recently Listed</h1>
                <div id="NFTListed" className={styles.nftList}>
                    {loadingImage ? (
                        <div>Loading...</div>
                    ) : (
                        // Use the slice method to display only the desired number of NFTs
                        nftsData
                            .slice(0, visibleNFTs)
                            .map((nft) => (
                                <NFTBox
                                    nftAddress={nft.nftAddress}
                                    tokenId={nft.tokenId}
                                    key={`${nft.nftAddress}${nft.tokenId}${nft.listingId}`}
                                />
                            ))
                    )}
                </div>
                <div className={styles.showMoreButton}>
                    <Button
                        text="Show More"
                        onClick={() => {
                            setVisibleNFTs((prevVisible) => prevVisible + 20)
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
            </div>
        </div>
    )
}

export default NFTListed
