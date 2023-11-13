import Image from "next/image"
import styles from "../styles/Home.module.css"
import { ethers } from "ethers"
import LoadingWave from "../components/LoadingWave"

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

export default function NFTTableElement({ collection, onClick, loadingImage }) {
    const {
        nftAddress,
        firstImageURI: imageURI,
        collectionName: collectionName,
        firstTokenDescription: tokenDescription,
        count: itemCount, // dies ist die neue Eigenschaft, die die Anzahl der Items in der Sammlung darstellt
        collectionPrice,
    } = collection

    console.log(collection)

    // Format address for display
    const formattedNftAddress = truncateStr(nftAddress || "", 15)

    return (
        <>
            {imageURI ? (
                <tr className={styles.nftTableRow} onClick={onClick}>
                    <td>
                        <div className={styles.contentWrapper}>
                            <Image
                                src={imageURI.src}
                                height={50}
                                width={50}
                                alt={tokenDescription || "..."}
                            />
                        </div>
                    </td>
                    <td>
                        <div className={styles.contentWrapper}>{formattedNftAddress}</div>
                    </td>
                    <td>
                        <div className={styles.contentWrapper}>{collectionName}'s</div>
                    </td>
                    <td>
                        <div className={styles.contentWrapper}>{itemCount}</div>
                    </td>
                    <td>
                        <div className={styles.contentWrapper}>
                            {parseFloat(
                                ethers.utils.formatUnits(collectionPrice, "ether")
                            ).toFixed(6)}{" "}
                            ETH
                        </div>
                    </td>
                </tr>
            ) : (
                <div className={styles.nftLoadingIconWrapper}>
                    <div className={styles.nftLoadingIcon}>
                        <LoadingWave />
                    </div>
                </div>
            )}
        </>
    )
}
