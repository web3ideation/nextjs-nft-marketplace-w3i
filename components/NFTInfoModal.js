import Modal from "../components/Modal"
import Image from "next/image"
import styles from "../styles/Home.module.css"

const NftModal = (props) => {
    // Destructuring the passed properties
    const {
        type, // 'info', 'list', or 'sell'
        imageURI,
        description,
        tokenDescription,
        formattedNftOwner,
        formattedNftAddress,
        desiredNftAddress,
        formattedDesiredNftAddress,
        desiredTokenId,
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
            isVisible={type}
            cancelText="Close"
            onCancel={closeModal}
            okText={okText}
            onOk={onOkHandler}
        >
            <div className={styles.modalContent}>
                <Image
                    className={styles.modalImage}
                    src={imageURI}
                    alt={tokenDescription}
                    height={300}
                    width={300}
                />
                <div className={styles.modalText}>
                    <div>
                        <p>Owned by: </p>
                        <p>{formattedNftOwner}</p>
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
                    <div>
                        <p>Price: </p>
                        <strong>{price} ETH</strong>
                    </div>
                    <div>
                        <p>Switched Owner:</p>
                        <strong>{buyerCount}x</strong>
                    </div>

                    {desiredNftAddress !== "0x0000000000000000000000000000000000000000" && (
                        <div>
                            <p>Desired Address: </p>
                            <p>{formattedDesiredNftAddress}</p>
                        </div>
                    )}

                    {desiredNftAddress !== "0x0000000000000000000000000000000000000000" && (
                        <div>
                            <p>Desired Token-Id </p>
                            <strong>{desiredTokenId}</strong>
                        </div>
                    )}

                    <div className={styles.modalDescriptionWrapper}>
                        <div className={styles.modalDescription}>
                            <p>Description:</p>
                            <p>{tokenDescription || description || "..."}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default NftModal
