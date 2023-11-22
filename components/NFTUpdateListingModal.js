import React, { useState } from "react"
import Modal from "../components/Modal"
import Tooltip from "../components/Tooltip"
import { useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { ethers } from "ethers"
import styles from "../styles/Home.module.css"
import { useNftNotification } from "../context/NFTNotificationContext"
import { useRouter } from "next/router"

export default function NFTUpdateListingModal(props) {
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
    const [formData, setFormData] = useState({
        price: price || "",
        desiredNftAddress: desiredNftAddress || "",
        desiredTokenId: desiredTokenId || "",
    })

    const [errors, setErrors] = useState({
        price: "",
        desiredNftAddress: "",
        desiredTokenId: "",
    })

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
        setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }))
        return errorMessage === ""
    }

    // Define the smart contract function to update the listing
    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress,
            tokenId,
            newDesiredNftAddress: formData.desiredNftAddress,
            newdesiredTokenId: formData.desiredTokenId,
            newPrice: ethers.utils.parseEther(formData.price),
        },
    })

    // Handle successful listing update
    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1)
        showNftNotification("Listing updated", "New price approved", "success")
        router.reload()
        onCancel && onCancel()
    }

    // Validate the input before updating the listing
    const validateAndUpdateListing = async () => {
        const isPriceValid = validateField("price", formData.price)
        const isAddressValid = validateField("desiredNftAddress", formData.desiredNftAddress)
        const isTokenIdValid = validateField("desiredTokenId", formData.desiredTokenId)

        if (!isPriceValid || !isAddressValid || !isTokenIdValid) {
            return
        }

        setUpdating(true)
        const notificationId = showNftNotification(
            "Updating",
            "Updating listing price",
            "info",
            true
        )
        await updateListing({
            onError: (error) => {
                closeNftNotification(notificationId)
                showNftNotification("Error", error.message, "error")
                setUpdating(false)
            },
            onSuccess: handleUpdateListingSuccess,
        })
    }

    // Reset the form to its initial state
    const resetForm = () => {
        setFormData({
            price: price || "",
            desiredNftAddress: desiredNftAddress || "",
            desiredTokenId: desiredTokenId || "",
        })
        setErrors({
            price: "",
            desiredNftAddress: "",
            desiredTokenId: "",
        })
    }

    // Handle the button click to update the listing
    const handleUpdateButtonClick = () => {
        validateAndUpdateListing()
    }

    // Reset the form when the modal is closed
    const handleClose = () => {
        onCancel && onCancel()
        resetForm()
    }

    // Handle input change in a consolidated manner
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    return (
        <Modal
            isVisible={showUpdateListingModal}
            onOk={handleUpdateButtonClick}
            okText="UPDATE"
            onCancel={handleClose}
            cancelText="CLOSE"
        >
            <form className={styles.sellSwapForm}>
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
                                        fieldKey === "desiredNftAddress"
                                            ? "0x0000000000000000000000000000000000000000"
                                            : fieldKey === "desiredTokenId"
                                            ? "0"
                                            : "min. amount: 0.000000000000000001"
                                    }
                                    value={formData[fieldKey]}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    onFocus={() => setFocusedField(fieldKey)}
                                    className={
                                        focusedField === fieldKey ? styles.inputFocused : ""
                                    }
                                />
                                {errors[fieldKey] && <Tooltip message={errors[fieldKey]} />}
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
}
