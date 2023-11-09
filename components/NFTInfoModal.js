import { Modal, Button } from "web3uikit"
import Image from "next/image"
import styles from "../styles/Home.module.css"

const NftModal = (props) => {
    // Destructuring the passed properties
    const {
        type, // 'info', 'list', or 'sell'
        imageURI,
        description,
        tokenDescription,
        formattedSellerAddress,
        formattedNftAddress,
        tokenId,
        tokenName,
        isListed,
        price,
        buyerCount,
        handleBuyClick,
        handleListClick,
        handleUpdatePriceButtonClick,
        copyNftAddressToClipboard,
        closeModal,
    } = props

    // Determine the text and handler for the OK button based on the type
    let okText, onOkHandler
    switch (type) {
        case "info":
            okText = "BUY!"
            onOkHandler = handleBuyClick
            break
        case "list":
            okText = "List"
            onOkHandler = handleListClick
            break
        case "sell":
            okText = "Update price"
            onOkHandler = handleUpdatePriceButtonClick
            break
        default:
            okText = ""
            onOkHandler = () => {}
    }

    return (
        <Modal
            className={styles.nftModalInformation}
            cancelText="Close"
            onCancel={closeModal}
            okText={okText}
            onOk={onOkHandler}
            closeButton={<Button disabled text=""></Button>}
            width="max-content"
        >
            <div className={styles.nftModalContent}>
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
                            className={styles.nftNftAddressToCopy}
                            onClick={copyNftAddressToClipboard}
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
                    <div className={styles.nftModalDescription}>
                        <p>Description: </p>
                        <p>{tokenDescription || description || "..."}</p>
                    </div>
                    <div>
                        <p>Price: </p>
                        <strong>{price} ETH</strong>
                    </div>
                    <div>
                        <p>Switched Owner:</p>
                        <strong>{buyerCount}x</strong>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default NftModal
