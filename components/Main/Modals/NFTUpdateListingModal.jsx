// React core and hooks
import React, { forwardRef, useState, useRef, useEffect, useCallback } from "react"
import PropTypes from "prop-types"

// Blockchain and Ethereum functionality
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { ethers } from "ethers"

// Constants and data
import nftMarketplaceAbi from "../../../constants/NftMarketplace.json"

// Custom hooks and components
import { useNFT } from "../../../context/NFTDataProvider"
import { useNftNotification } from "../../../context/NotificationProvider"
import Tooltip from "../ux/Tooltip"
import Modal from "./ModalsBasis/Modal"
import { validateField } from "../../../utils/validation"

// Styles
import styles from "../../../styles/Home.module.css"

const NFTUpdateListingModal = forwardRef((props, ref) => {
    // Destructuring props for better readability
    const {
        nftAddress,
        tokenId,
        marketplaceAddress,
        closeModal,
        price,
        desiredNftAddress,
        desiredTokenId,
    } = props

    //    console.log("NFTUpdateListingModal Props", {
    //        nftAddress,
    //        tokenId,
    //        showUpdateListingModal,
    //        marketplaceAddress,
    //        price,
    //        desiredNftAddress,
    //        desiredTokenId,
    //    })

    // ------------------ Refs ------------------
    // Reference to the form element for direct DOM manipulation if needed
    const formRef = useRef(null)

    // State hooks for managing form data, validation errors, and updating state
    const [updating, setUpdating] = useState(false)
    const [focusedField, setFocusedField] = useState(null)
    const [formData, setFormData] = useState({
        newPrice: price,
        newDesiredNftAddress: desiredNftAddress,
        newDesiredTokenId: desiredTokenId,
    })
    const [errors, setErrors] = useState({
        newPrice: "",
        newDesiredNftAddress: "",
        newDesiredTokenId: "",
    })

    // Custom hooks for accessing NFT and notification context
    const { reloadNFTs } = useNFT()
    const { showNftNotification, closeNftNotification } = useNftNotification()

    // Callback for reloading NFTs
    const handleTransactionCompletion = () => reloadNFTs()

    // Refs for managing notifications
    const confirmUpdateListingNotificationId = useRef(null)
    const whileUpdatingListingNotificationId = useRef(null)

    // Hook for smart contract interaction to update listing
    const { writeAsync: updateListing } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "updateListing",
        args: [
            nftAddress,
            tokenId,
            ethers.utils.parseEther(formData.newPrice),
            formData.newDesiredNftAddress,
            formData.newDesiredTokenId,
        ],
        onSuccess: (data) => {
            closeNftNotification(confirmUpdateListingNotificationId.current)
            setUpdateListingTxHash(data.hash)
        },
        onError: (error) => {
            handleContractError(error)
        },
    })

    // State for managing transaction hash and receipt
    const [updateListingTxHash, setUpdateListingTxHash] = useState(null)
    const {
        isLoading: isUpdateListingTxLoading,
        isSuccess: isUpdateListingTxSuccess,
        isError: isUpdateListingTxError,
    } = useWaitForTransaction({
        hash: updateListingTxHash,
    })

    // Effect hook for managing update listing transaction state
    useEffect(() => {
        if (isUpdateListingTxLoading) {
            // Show updating notification
            whileUpdatingListingNotificationId.current = showNftNotification(
                "Updating",
                "Transaction sent. Awaiting confirmation...",
                "info",
                true
            )
        } else if (isUpdateListingTxSuccess) {
            // Handle successful update
            handleSuccessfulUpdate()
        } else if (isUpdateListingTxError) {
            // Handle error in update
            showNftNotification("Error", "Failed to update the NFT.", "error")
        }
    }, [isUpdateListingTxLoading, isUpdateListingTxSuccess, isUpdateListingTxError])

    // Function to handle successful update after transaction
    const handleSuccessfulUpdate = () => {
        setUpdating(false)
        closeNftNotification(whileUpdatingListingNotificationId.current)
        showNftNotification("Listing updated", "New price approved", "success")
        handleTransactionCompletion()
    }

    // Function to handle contract interaction error
    const handleContractError = (error) => {
        setUpdating(false)
        if (error.message.includes("User denied transaction signature")) {
            showNftNotification(
                "Transaction Rejected",
                "You have rejected the transaction.",
                "error"
            )
        } else {
            showNftNotification("Error", error.message || "Failed to update the NFT.", "error")
        }
        closeNftNotification(confirmUpdateListingNotificationId.current)
    }

    // Function to validate and initiate the listing update
    const validateAndUpdateListing = async () => {
        if (validateForm(formData)) {
            if (updating) {
                showNftNotification(
                    "Updating",
                    "An update is already in progress! Check your wallet!",
                    "error"
                )
                return
            } else {
                console.log("Validation failed")
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
                console.error("An error occurred during the transaction: ", error)
            }
        }
    }
    // ------------------ Form Validation ------------------
    // Validates the entire form data and logs validation results
    const validateForm = (data) => {
        let newErrors = {}
        let isValid = true

        Object.keys(data).forEach((key) => {
            const errorMessage = validateField(key, data[key])
            newErrors[key] = errorMessage

            console.log(`validateForm: Field: ${key}, Error: ${errorMessage}`)

            if (errorMessage) {
                isValid = false
            }
        })

        setErrors(newErrors)
        console.log("Form validation result:", isValid)
        return isValid
    }

    // Function to handle changes in form fields
    const handleChange = (e) => {
        const { name, value } = e.target
        const error = validateField(name, value)

        console.log(`handleChange: ${name}, Value: ${value}, Error: ${error}`)

        setFormData((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: error ? error : "" }))
    }

    // Function to handle the update button click
    const handleUpdateButtonClick = () => {
        validateAndUpdateListing()
    }

    // Function to reset the form to its initial state
    const resetForm = () => {
        setFormData({
            newPrice: price || "",
            newDesiredNftAddress: desiredNftAddress || "",
            newDesiredTokenId: desiredTokenId || "",
        })
        setErrors({
            newPrice: "",
            newDesiredNftAddress: "",
            newDesiredTokenId: "",
        })
    }

    const handleCloseModal = () => {
        if (closeModal) {
            closeModal()
        }
        resetForm()
    }

    return (
        <Modal
            ref={ref}
            isVisible={true}
            onOk={handleUpdateButtonClick}
            okText="UPDATE"
            onCancel={handleCloseModal}
        >
            <form className={styles.sellSwapForm} ref={formRef}>
                <h2>Updating price and/or swap</h2>
                {Object.entries(formData).map(([fieldKey, value]) => (
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
                                        fieldKey === "newDesiredNftAddress"
                                            ? "0x0000000000000000000000000000000000000000"
                                            : fieldKey === "newDesiredTokenId"
                                            ? "0"
                                            : "min. amount: 0.000000000000000001"
                                    }
                                    value={formData[fieldKey]}
                                    onChange={handleChange}
                                    onBlur={(e) => {
                                        const error = validateField(e.target.name, e.target.value)
                                        setErrors((prevErrors) => ({
                                            ...prevErrors,
                                            [e.target.name]: error,
                                        }))
                                        setFocusedField(null)
                                    }}
                                    onFocus={() => {
                                        setFocusedField(fieldKey)
                                        setErrors((prevErrors) => ({
                                            ...prevErrors,
                                            [fieldKey]: "",
                                        }))
                                    }}
                                    className={
                                        focusedField === fieldKey ? styles.inputFocused : ""
                                    }
                                />
                                <div className={styles.tooltipWrapper}>
                                    {errors[fieldKey] && <Tooltip message={errors[fieldKey]} />}
                                </div>
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
