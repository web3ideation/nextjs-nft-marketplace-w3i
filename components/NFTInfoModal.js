import { Modal, Button } from "web3uikit" // Importiere benötigte Komponenten
import Image from "next/image"
import styles from "../styles/Home.module.css"

const NftModal = ({
    show,
    type, // 'info' oder 'sell'
    imageURI,
    tokenDescription,
    formattedSellerAddress,
    formattedNftAddress,
    tokenId,
    tokenName,
    price,
    handleBuyClick,
    handleUpdatePriceButtonClick,
    handleMouseEnter,
    handleMouseLeave,
    copyNftAddressToClipboard,
    isCopying,
    closeModal,
}) => {
    return (
        <Modal
            className={styles.nftModalInfo}
            onCancel={closeModal}
            onOk={type === "info" ? handleBuyClick : handleUpdatePriceButtonClick}
            okText={type === "info" ? "BUY!" : "Update price"}
            cancelText="Close"
            closeButton={<Button disabled text=""></Button>}
            width="max-content"
        >
            <Image
                className={styles.nftModalImage}
                src={imageURI}
                alt={tokenDescription}
                height={100}
                width={100}
            />
            <div className={styles.nftModalInformation}>
                <div>
                    <p>Owned by: </p>
                    <p>{formattedSellerAddress}</p>
                </div>
                <div>
                    <p>Token-Adress: </p>
                    <div
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={copyNftAddressToClipboard}
                        style={{
                            display: "inline-block",
                            position: "relative",
                            cursor: isCopying ? "text" : "copy",
                        }}
                    >
                        <p>{formattedNftAddress}</p>
                    </div>
                </div>
                <div>
                    <p>Token-Id: </p>
                    <p>{tokenId}</p>
                </div>
                <div>
                    <p>Name: </p>
                    <p>{tokenName}</p>
                </div>
                <div>
                    <p>Description: </p>
                    <p>{tokenDescription || "..."}</p>
                </div>
                <div>
                    <p>Price: </p>
                    <p>{price} ETH</p>
                </div>
            </div>
        </Modal>
    )
}

export default NftModal
