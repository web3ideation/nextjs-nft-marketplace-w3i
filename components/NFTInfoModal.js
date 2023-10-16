import { Modal, Button } from "web3uikit" // Importiere benötigte Komponenten
import Image from "next/image"
import styles from "../styles/Home.module.css"

const NftModal = (props) => {
    const {
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
        handleListClick,
        handleUpdatePriceButtonClick,
        handleMouseEnter,
        handleMouseLeave,
        copyNftAddressToClipboard,
        isCopying,
        closeModal,
        showPurchaseMessage,
    } = props

    const okText = type === "info" ? "BUY!" : type === "list" ? "List" : "Update price"
    const onOkHandler =
        type === "info"
            ? handleBuyClick
            : type === "list"
            ? handleListClick
            : handleUpdatePriceButtonClick

    return (
        <Modal
            customize={{
                borderRadius: "5px",
            }}
            className={styles.nftModalInformation}
            onCancel={closeModal}
            onOk={onOkHandler}
            okText={okText}
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
            <div className={styles.nftModalText}>
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
                    <strong>{tokenId}</strong>
                </div>
                <div>
                    <p>Name: </p>
                    <strong>{tokenName}</strong>
                </div>
                <div>
                    <p>Description: </p>
                    <p>{tokenDescription || "..."}</p>
                </div>
                <div>
                    <p>Price: </p>
                    <strong>{price} ETH</strong>
                </div>
            </div>
            {showPurchaseMessage && (
                <div>
                    Der Kauf ist im Gange. Bitte überprüfen Sie Ihre Wallet und bestätigen Sie den
                    Kaufvorgang.
                </div>
            )}
        </Modal>
    )
}

export default NftModal
