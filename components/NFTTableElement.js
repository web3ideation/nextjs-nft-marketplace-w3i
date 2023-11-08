import { useState, useEffect, useCallback } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { useRouter } from "next/router"
import Image from "next/image"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"
import LoadingIcon from "../public/LoadingIcon"
import NFTInfoModal from "../components/NFTInfoModal"
import NFTUpdateListingModal from "./NFTUpdateListingModal"
import styles from "../styles/Home.module.css"

// Utility function to truncate strings
const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)

    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

export default function NFTTableElement({ collection, loadingImage }) {
    const {
        nftAddress,
        firstImageURI: imageURI,
        firstTokenName: collectionName,
        firstTokenDescription: tokenDescription,
        count: itemCount, // dies ist die neue Eigenschaft, die die Anzahl der Items in der Sammlung darstellt
    } = collection

    console.log(collection)

    // Format address for display
    const formattedNftAddress = truncateStr(nftAddress || "", 15)

    return (
        <>
            <tr className={styles.nftTableRow}>
                <td>
                    <Image
                        src={imageURI.src}
                        height={50}
                        width={50}
                        alt={tokenDescription || "..."}
                    />
                </td>
                <td>{formattedNftAddress}</td>
                <td>{collectionName}'s</td>
                <td>{itemCount}</td>
            </tr>
        </>
    )
}
