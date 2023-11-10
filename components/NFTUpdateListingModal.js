import Modal from "../components/Modal"
import React, { useState } from "react"
import { useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { ethers } from "ethers"
import styles from "../styles/Home.module.css"
import { useNftNotification } from "../context/NFTNotificationContext"
import { useRouter } from "next/router"
import Tooltip from "../components/Tooltip"

export default function NFTUpdateListingModal(props) {
    const {
        nftAddress,
        tokenId,
        showUpdateListingModal,
        enableMouseWheel,
        disableMouseWheel,
        marketplaceAddress,
        onCancel,
    } = props

    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState("") //!!!W this means that if i just open the modal and klick OK without entering a number the nfts price will be set to 0. which is a problem! tho there should be an error from the marketplace smartcontract that the price can not be zero, i think.
    const [updating, setUpdating] = useState(false)
    const [focusedField, setFocusedField] = useState(null)
    const { showNftNotification, closeNftNotification } = useNftNotification()
    const router = useRouter()

    // Reset the price input to its initial state
    const resetPrice = () => setPriceToUpdateListingWith("")

    // Handle successful listing update
    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1)
        showNftNotification("Listing updated", "New price approved", "success")
        router.reload()
        onCancel && onCancel()
    }

    // Define the contract function to update the listing
    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newDesiredNftAddress: nftAddress,
            newdesiredTokenId: tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
        },
    })

    // Validate the input before calling the update
    const validateAndUpdateListing = async () => {
        let validateAndUpdateListingNotificationId

        const price = parseFloat(priceToUpdateListingWith)
        if (isNaN(price) || price <= 0) {
            closeNftNotification(validateAndUpdateListingNotificationId)
            showNftNotification(
                "Invalid Price",
                "Please enter a price greater than zero.",
                "error"
            )
            return
        }

        validateAndUpdateListingNotificationId = showNftNotification(
            "Updating",
            "Updating listing price",
            "info",
            true
        )

        setUpdating(true)
        await updateListing({
            onError: (error) => {
                if (error.code === 4001) {
                    // EIP-1193 user rejected request
                    closeNftNotification(validateAndUpdateListingNotificationId)
                    showNftNotification(
                        "Transaction Cancelled",
                        "You rejected the transaction.",
                        "error"
                    )
                } else {
                    closeNftNotification(validateAndUpdateListingNotificationId)
                    showNftNotification("Error", error.message, "error")
                }
                setUpdating(false)
            },
            onSuccess: handleUpdateListingSuccess,
        })
    }

    // Handle the button click to update the listing
    const handleUpdateButtonClick = async () => {
        validateAndUpdateListing()
    }

    // Called when the modal is cancelled or closed
    const handleClose = () => {
        onCancel && onCancel()
        enableMouseWheel && enableMouseWheel()
        resetPrice() // It's safe to reset the price when the modal is closing.
    }

    return (
        <Modal
            isVisible={showUpdateListingModal}
            onOk={handleUpdateButtonClick}
            okText={"Update"}
            onCancel={handleClose}
            cancelText="Close"
        >
            <div className={styles.modalInputWrapper}>
                <label htmlFor="update listing">Update listing price in L1 Currency (ETH)</label>
                <div className={styles.modalInput}>
                    <input
                        type="number"
                        id="number"
                        name="New listing price"
                        placeholder="min. amount: 0.000000000000000001"
                        value={priceToUpdateListingWith}
                        onChange={(event) => {
                            setPriceToUpdateListingWith(event.target.value)
                        }}
                        disabled={updating}
                        onFocus={() => {
                            setFocusedField("number")
                        }}
                        className={focusedField === "number" ? styles.inputFocused : ""}
                    />
                </div>
            </div>
            <div className={styles.modalDescription}>
                <div>
                    <h3>
                        Here are some things to keep in mind when updating your item's listing
                        price in ETH:
                    </h3>
                    <br></br>
                    <h4>Entering Price:</h4>
                    <p>
                        Enter the desired price in Ethereum (ETH). Please make sure to enter the
                        price accurately, as this directly affects the visibility and
                        attractiveness of your offer.
                    </p>
                    <br></br>
                    <h4>Fees and Costs:</h4>
                    <p>
                        Please note that when listing and selling in L1 currency (ETH), network
                        fees (so-called gas fees) may apply. These fees vary and depend on the load
                        on the Ethereum network.
                    </p>
                    <br></br>
                    <h4>Confirmation and Transaction:</h4>
                    <p>
                        After entering your price, you must confirm the transaction. This is
                        usually done via your connected wallet. Make sure you have enough ETH in
                        your wallet to cover network fees.
                    </p>
                    <br></br>
                    <h4>Visibility of your offer:</h4>
                    <p>
                        Once you have set the price and confirmed the transaction, your offer will
                        be visible on the market with the new price. This increases the chance that
                        potential buyers will become aware of your offer.
                    </p>
                    <br></br>
                    <h4>Security and Responsibility:</h4>
                    <p>
                        Please check all details carefully before confirming the update.
                        Transactions on the blockchain are irreversible and cannot be reversed. By
                        keeping these points in mind, you will ensure that your offer appears on
                        the market correctly and at your desired price.
                    </p>
                </div>
            </div>
        </Modal>
    )
}
