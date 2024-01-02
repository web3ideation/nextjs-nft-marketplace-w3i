import React, { forwardRef, useState, useRef, useEffect, useCallback } from "react"
import PropTypes from "prop-types"
import Modal from "./Modal"
import Tooltip from "./Tooltip"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import nftMarketplaceAbi from "../../constants/NftMarketplace.json"
import { ethers } from "ethers"
import styles from "../../styles/Home.module.css"
import { useNFT } from "../../context/NFTContextProvider"
import { useNftNotification } from "../../context/NFTNotificationContext"
import { useRouter } from "next/router"

const NFTUpdateListingModal = forwardRef((props, ref) => {
    const {
        nftAddress,
        tokenId,
        showUpdateListingModal,
        marketplaceAddress,
        onCancel,
        price,
        desiredNftAddress,
        desiredTokenId,
    } = props

    // State for form fields and UI states
    const [updating, setUpdating] = useState(false)
    const [focusedField, setFocusedField] = useState(null)

    // Consolidated formData and errors state
    const [formState, setFormState] = useState({
        formData: {
            newPrice: price || "",
            newDesiredNftAddress: desiredNftAddress || "",
            newDesiredTokenId: desiredTokenId || "",
        },
        errors: {
            newPrice: "",
            newDesiredNftAddress: "",
            newDesiredTokenId: "",
        },
    })

    // Retrieve NFT data and loading state using custom hook
    const { loadNFTs } = useNFT()

    const reloadNFTs = useCallback(() => {
        loadNFTs()
    }, [loadNFTs])

    const { showNftNotification, closeNftNotification } = useNftNotification()
    const router = useRouter()

    // Validate form fields and set error messages
    function validateField(name, value) {
        console.log(`Validating ${name}: ${value}`) // Logging für Diagnosezwecke
        let errorMessage = ""
        if (name === "price" && !/^\d{1,18}(\.\d{1,18})?$/.test(value)) {
            errorMessage = "Please enter a positive amount in ETH."
        } else if (name === "desiredNftAddress" && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
            errorMessage = "Please enter a valid NFT address."
        } else if (name === "desiredTokenId" && !/^\d+$/.test(value)) {
            errorMessage = "Token ID must be a positive integer."
        }
        console.log(`Error message for ${name}: ${errorMessage}`) // Logging für Diagnosezwecke
        setFormState((prevState) => ({
            ...prevState,
            errors: { ...prevState.errors, [name]: errorMessage },
        }))
        return errorMessage === ""
    }

    const confirmUpdateListingNotificationId = useRef(null)
    const whileUpdatingListingNotificationId = useRef(null)
    // Define the smart contract function to update the listing
    const { data: updateListingData, writeAsync: updateListing } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "updateListing",
        args: [
            nftAddress,
            tokenId,
            ethers.utils.parseEther(formState.formData.newPrice),
            formState.formData.newDesiredNftAddress,
            formState.formData.newDesiredTokenId,
        ],
        onSuccess: (data) => {
            console.log("Update listing send: ", data)
            closeNftNotification(confirmUpdateListingNotificationId.current)
            setUpdateListingTxHash(data.hash)
        },
        onError: (error) => {
            console.log("Update Listing send error: ", error)
            setUpdating(false)
            if (error.message.includes("User denied transaction signature")) {
                // for user rejected transaction
                showNftNotification(
                    "Transaction Rejected",
                    "You have rejected the transaction.",
                    "error"
                )
            } else {
                // Handle other errors
                showNftNotification("Error", error.message || "Failed to update the NFT.", "error")
            }
            closeNftNotification(confirmUpdateListingNotificationId.current)
        },
    })

    const [updateListingTxHash, setUpdateListingTxHash] = useState(null)
    const {
        data: updateListingTxReceipt,
        isLoading: isUpdateListingTxLoading,
        isSuccess: isUpdateListingTxSuccess,
        isError: isUpdateListingTxError,
    } = useWaitForTransaction({
        hash: updateListingTxHash,
    })

    useEffect(() => {
        if (isUpdateListingTxLoading) {
            whileUpdatingListingNotificationId.current = showNftNotification(
                "Updating",
                "Transaction sent. Awaiting confirmation...",
                "info",
                true
            )
        } else if (isUpdateListingTxSuccess) {
            setUpdating(false)
            closeNftNotification(whileUpdatingListingNotificationId.current)
            showNftNotification("Listing updated", "New price approved", "success")
            console.log(
                "Update item data",
                updateListingData,
                "Update item receipt",
                updateListingTxReceipt
            )
            updatePageContentAfterTransaction()
        } else if (isUpdateListingTxError) {
            setUpdating(false)
            closeNftNotification(whileUpdatingListingNotificationId.current)
            showNftNotification("Error", error.message || "Failed to update the NFT.", "error")
        }
    }, [isUpdateListingTxLoading, isUpdateListingTxSuccess, isUpdateListingTxError])

    // Function for updating after buy or delist
    const updatePageContentAfterTransaction = async () => {
        console.log("Reeeeeeloaaaaaad")
        setTimeout(() => {
            reloadNFTs()
        }, 1000)
    }

    // Validate the input before updating the listing
    const validateAndUpdateListing = async () => {
        const isPriceValid = validateField("price", formState.formData.newPrice)
        const isAddressValid = validateField(
            "desiredNftAddress",
            formState.formData.newDesiredNftAddress
        )
        const isTokenIdValid = validateField(
            "desiredTokenId",
            formState.formData.newDesiredTokenId
        )

        if (!isPriceValid || !isAddressValid || !isTokenIdValid) {
            return
        }

        if (updating) {
            showNftNotification(
                "Updating",
                "A update is already in progress! Check your wallet!",
                "error"
            )
            return
        }
        setUpdating(true)
        confirmUpdateListingNotificationId.current = showNftNotification(
            "Check your wallet",
            "Confirm updating...",
            "info",
            true
        )
        try {
            await updateListing()
        } catch (error) {
            // This will handle any errors that are not caught by the onError callback
            console.log("An error occurred during the transaction: ", error)
        }
    }

    // Handle input change in a consolidated manner
    const handleChange = (e) => {
        const { name, value } = e.target
        const isValid = validateField(name, value)

        setFormState((prevState) => ({
            formData: { ...prevState.formData, [name]: value },
            errors: { ...prevState.errors, [name]: isValid ? "" : prevState.errors[name] },
        }))
    }

    // Handle the button click to update the listing
    const handleUpdateButtonClick = () => {
        validateAndUpdateListing()
    }

    // Reset the form to its initial state
    const resetForm = () => {
        setFormState({
            formData: {
                newPrice: price || "",
                newDesiredNftAddress: desiredNftAddress || "",
                newDesiredTokenId: desiredTokenId || "",
            },
            errors: {
                newPrice: "",
                newDesiredNftAddress: "",
                newDesiredTokenId: "",
            },
        })
    }

    // Reset the form when the modal is closed
    const handleClose = () => {
        onCancel && onCancel()
        resetForm()
    }

    return (
        <Modal
            ref={ref}
            isVisible={showUpdateListingModal}
            onOk={handleUpdateButtonClick}
            okText="UPDATE"
            onCancel={handleClose}
            cancelText="CLOSE"
        >
            <form className={styles.sellSwapForm}>
                <h2>Updating price and/or swap</h2>
                {Object.entries(formState.formData).map(([fieldKey, value]) => (
                    <div key={fieldKey} className={styles.formInputWrapper}>
                        <div key={fieldKey} className={styles.modalInputWrapper}>
                            <label htmlFor={fieldKey}>
                                {fieldKey.charAt(0).toUpperCase() +
                                    fieldKey.slice(1).replace("Id", " ID")}
                            </label>
                            <div className={styles.modalInput}>
                                <input
                                    type={fieldKey === "price" ? "number" : "text"}
                                    id={fieldKey}
                                    name={fieldKey}
                                    placeholder={
                                        fieldKey === "desiredNftAddress"
                                            ? "0x0000000000000000000000000000000000000000"
                                            : fieldKey === "desiredTokenId"
                                            ? "0"
                                            : "min. amount: 0.000000000000000001"
                                    }
                                    value={formState.formData[fieldKey]}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    onFocus={() => setFocusedField(fieldKey)}
                                    className={
                                        focusedField === fieldKey ? styles.inputFocused : ""
                                    }
                                />
                                {formState.errors[fieldKey] && (
                                    <Tooltip message={formState.errors[fieldKey]} />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </form>
            <div className={styles.modalDescriptionWrapper}>
                <div className={`${styles.modalDescription} ${styles.modalAttention}`}>
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
})

NFTUpdateListingModal.propTypes = {
    nftAddress: PropTypes.string.isRequired,
    tokenId: PropTypes.string.isRequired,
    showUpdateListingModal: PropTypes.bool.isRequired,
    marketplaceAddress: PropTypes.string.isRequired,
    onCancel: PropTypes.func,
    price: PropTypes.string,
    desiredNftAddress: PropTypes.string,
    desiredTokenId: PropTypes.string,
}

export default NFTUpdateListingModal
