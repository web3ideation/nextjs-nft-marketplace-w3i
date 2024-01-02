import Image from "next/image"
import styles from "../styles/Home.module.css"
import LoadingWave from "../components/ui/LoadingWave"
import { truncateStr, formatPriceToEther, truncatePrice } from "../utils/formatting"

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
    const formattedNftAddress = truncateStr(nftAddress || "", 4, 4)
    const priceInEther = formatPriceToEther(collectionPrice)
    const formattedPrice = truncatePrice(priceInEther, 4)

    return (
        <>
            {imageURI ? (
                // Render table row for NFT collection with image
                <tr className={styles.nftTableRow} onClick={onClick}>
                    <td>
                        <div className={styles.contentWrapper}>
                            <Image
                                className={styles.tableImage}
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
                        <div className={styles.contentWrapper}>{formattedPrice} ETH</div>
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
