import React, { useState, useEffect } from "react"
import Image from "next/image"

import LoadingWave from "@components/UX/LoadingWave/LoadingWave"
import { useModal } from "@context/ModalProvider"

import { truncateStr, formatPriceToEther, truncatePrice } from "@utils/formatting"

import styles from "./TableElement.module.scss"

const TableElement = ({ collection }) => {
    const {
        nftAddress,
        firstImageURI: imageURI,
        firstTokenDescription: tokenDescription,
        collectionCount,
        collectionSymbol,
        count: itemCount,
        collectionPrice,
    } = collection

    const { openModal } = useModal()
    const formattedNftAddress = truncateStr(nftAddress || "", 4, 4)
    const priceInEther = formatPriceToEther(collectionPrice)
    const formattedPrice = truncatePrice(priceInEther, 4)
    const [imageLoaded, setImageLoaded] = useState(false)
    const handleCollectionClick = () => {
        const modalId = `topCollectionModal-${nftAddress}`
        openModal("collection", modalId, collection)
    }

    useEffect(() => {
        setImageLoaded(false)
    }, [imageURI])

    const handleImageLoad = () => {
        setImageLoaded(true)
    }

    return (
        <>
            <tr
                className={styles.tableRow}
                key={`${nftAddress}${collectionCount}`}
                onClick={handleCollectionClick}
            >
                <td>
                    <div className={styles.contentWrapper}>
                        <div className={styles.tableImageWrapper}>
                            {!imageLoaded && (
                                <div className={styles.tableImageLoadingWaveWrapper}>
                                    <LoadingWave />
                                </div>
                            )}
                            <Image
                                src={imageURI}
                                alt={tokenDescription || "..."}
                                height={50}
                                width={50}
                                loading="lazy"
                                className={`${styles.tableImage} ${
                                    !imageLoaded ? styles.imageLoading : ""
                                }`}
                                onLoad={handleImageLoad}
                            />
                        </div>
                    </div>
                </td>
                <td className={styles.nonNecessaryTableItems}>
                    <div className={styles.contentWrapper}>{formattedNftAddress}</div>
                </td>
                <td>
                    <div className={styles.contentWrapper}>{collectionSymbol}</div>
                </td>
                <td className={styles.nonNecessaryTableItems}>
                    <div className={styles.contentWrapper}>{itemCount}</div>
                </td>
                <td>
                    <div className={styles.contentWrapper}>{collectionCount || ""}</div>
                </td>
                <td>
                    <div className={styles.contentWrapper}>{formattedPrice} ETH</div>
                </td>
            </tr>
        </>
    )
}
export default TableElement
