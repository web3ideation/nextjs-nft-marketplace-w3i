import Image from "next/image"
import styles from "../styles/Home.module.css"
import { ethers } from "ethers"
import LoadingWave from "../components/LoadingWave"

// Utility function to truncate strings for better UI display
const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const separatorLength = separator.length
    const charsToShow = strLen - separatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)

    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

export default function NFTTableElement({ collection, onClick, loadingImage }) {
    // Destructure properties from the collection object
    const {
        nftAddress,
        firstImageURI: imageURI,
        collectionName,
        firstTokenDescription: tokenDescription,
        collectionCount,
        collectionSymbol,
        count: itemCount,
        collectionPrice,
    } = collection

    // Format NFT address for display (truncate for brevity)
    const formattedNftAddress = truncateStr(nftAddress || "", 15)

    return (
        <>
            {imageURI ? (
                // Render table row for NFT collection with image
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
                        <div className={styles.contentWrapper}>{collectionSymbol}</div>
                    </td>
                    <td>
                        <div className={styles.contentWrapper}>{itemCount}</div>
                    </td>
                    <td>
                        <div className={styles.contentWrapper}>{collectionCount}</div>
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
                // Render loading state if no image URI is available
                <div className={styles.nftLoadingIconWrapper}>
                    <div className={styles.nftLoadingIcon}>
                        <LoadingWave />
                    </div>
                </div>
            )}
        </>
    )
}
