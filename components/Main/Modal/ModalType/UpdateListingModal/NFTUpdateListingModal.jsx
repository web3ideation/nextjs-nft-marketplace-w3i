// React core and hooks
import React, { forwardRef, useState, useRef } from "react"
import PropTypes from "prop-types"

// Blockchain and Ethereum functionality
import { ethers } from "ethers"
import { useAccount, usePublicClient } from "wagmi"

// Custom hooks and components
import { useNFT } from "../../../../../context/NFTDataProvider"
import Tooltip from "../../../ux/Tooltip"
import Modal from "../../ModalBasis/Modal"
import { validateField } from "../../../../../utils/validation"
import { useUpdateListing } from "../../../../../hooks/useUpdateListing"
import { useModal } from "../../../../../context/ModalProvider"
import networkMapping from "../../../../../constants/networkMapping.json"

// Styles
import styles from "./UpdateListingModal.module.scss"

// Component for updating NFT listings, with form validation and blockchain interaction
const NFTUpdateListingModal = forwardRef((props, ref) => {
    // Destructuring props for better readability
    const { modalContent, modalType } = useModal()
    console.log("MODAL Type", modalType)
    console.log("Modal content", modalContent)
    const { address, isConnected } = useAccount()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    // State for form data and validation errors
    const [formData, setFormData] = useState({
        newPrice: modalContent.price,
        newDesiredNftAddress: modalContent.desiredNftAddress,
        newDesiredTokenId: modalContent.desiredTokenId,
    })
    const [errors, setErrors] = useState({
        newPrice: "",
        newDesiredNftAddress: "",
        newDesiredTokenId: "",
    })

    // Refs and custom hooks
    const formRef = useRef(null)
    const { reloadNFTs } = useNFT()

    // Callback for reloading NFTs
    const handleTransactionCompletion = () => reloadNFTs()

    // Function to handle the listing update
    const { handleUpdateListing } = useUpdateListing(
        marketplaceAddress,
        ethers.utils.parseEther(formData.newPrice),
        modalContent.nftAddress,
        modalContent.tokenId,
        formData.newDesiredNftAddress,
        formData.newDesiredTokenId,
        isConnected,
        handleTransactionCompletion
    )

    // Function to validate and initiate the listing update
    const validateAndUpdateListing = async () => {
        if (validateForm(formData)) {
            try {
                await handleUpdateListing()
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

    // Function to reset the form to its initial state
    const resetForm = () => {
        setFormData({
            newPrice: modalContent.price || "",
            newDesiredNftAddress: modalContent.desiredNftAddress || "",
            newDesiredTokenId: modalContent.desiredTokenId || "",
        })
        setErrors({
            newPrice: "",
            newDesiredNftAddress: "",
            newDesiredTokenId: "",
        })
    }

    return (
        <Modal
            ref={ref}
            modalTitle="Updating price or the desired swap"
            okText="UPDATE"
            onOk={validateAndUpdateListing}
        >
            <form className={styles.updateListingForm} ref={formRef}>
                <div className={styles.updateListingFormTitle}>
                    <h3>The data of your NFT</h3>
                </div>
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
                                    }}
                                    onFocus={() => {
                                        setErrors((prevErrors) => ({
                                            ...prevErrors,
                                            [fieldKey]: "",
                                        }))
                                    }}
                                />
                                <div className={styles.tooltipWrapper}>
                                    {errors[fieldKey] && <Tooltip message={errors[fieldKey]} />}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </form>

            <div className={styles.updateModalDescriptionWrapper}>
                <div className={`${styles.updateModalDescription} ${styles.modalAttention}`}>
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
