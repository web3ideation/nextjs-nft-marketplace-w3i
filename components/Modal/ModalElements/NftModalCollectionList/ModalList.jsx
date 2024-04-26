import React, { useMemo, useRef, useEffect } from "react"

import { useNFT } from "@context/NftDataProvider"
import Card from "@components/NftCard/Card"

import styles from "./ModalList.module.scss"

function ModalList({ filterAddress, filterTokenId }) {
    const { data: nftsData } = useNFT()

    const listRef = useRef(null)

    useEffect(() => {
        const listElement = listRef.current
        const onWheel = (e) => {
            if (!listElement) return

            listElement.scrollLeft += e.deltaY
            e.preventDefault()
        }

        listElement?.addEventListener("wheel", onWheel)
        return () => listElement?.removeEventListener("wheel", onWheel)
    }, [])

    const filteredNFTs = useMemo(
        () =>
            nftsData.filter(
                (nft) =>
                    nft.nftAddress === filterAddress &&
                    (!filterTokenId || nft.tokenId !== filterTokenId)
            ),
        [nftsData, filterAddress, filterTokenId]
    )

    return (
        <div className={styles.modalListContainer}>
            <div className={styles.modalListWrapper} ref={listRef}>
                {filteredNFTs.length > 0 ? (
                    <div className={styles.modalList}>
                        {filteredNFTs.map((nft) => (
                            <Card nftData={nft} key={`${nft.nftAddress}${nft.tokenId}`} />
                        ))}
                    </div>
                ) : (
                    <p>No NFTs available</p>
                )}
            </div>
        </div>
    )
}

export default ModalList
