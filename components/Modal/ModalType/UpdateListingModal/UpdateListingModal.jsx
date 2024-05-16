import React, { forwardRef, useState, useRef, useEffect } from "react"

import { ethers } from "ethers"
import { useAccount, usePublicClient } from "wagmi"

import { useNFT } from "@context/NftDataProvider"
import { validateField } from "@utils/validation"
import { useUpdateListing } from "@hooks/useUpdateListing"
import { useModal } from "@context/ModalProvider"
import Modal from "../../ModalBasis/Modal"
import Tooltip from "@components/Tooltip/Tooltip"

import networkMapping from "@constants/networkMapping.json"

import styles from "./UpdateListingModal.module.scss"

const UpdateListingModal = forwardRef((props, ref) => {
    const { modalContent, isModalOpen } = useModal()
    const { isConnected } = useAccount()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const formRef = useRef(null)
    const { reloadNFTs } = useNFT()

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

    const handleTransactionCompletion = () => reloadNFTs()

    const { handleUpdateListing } = useUpdateListing(
        marketplaceAddress,
        ethers.utils.parseEther(formData.newPrice || "0"),
        modalContent.nftAddress,
        modalContent.tokenId,
        formData.newDesiredNftAddress,
        formData.newDesiredTokenId,
        isConnected,
        handleTransactionCompletion
    )

    const validateAndUpdateListing = async () => {
        if (validateForm(formData)) {
            try {
                await handleUpdateListing()
            } catch (error) {
                console.error("An error occurred during the transaction: ", error)
            }
        }
    }

    const validateForm = (data) => {
        let newErrors = {}
        let isValid = true

        Object.keys(data).forEach((key) => {
            const errorMessage = validateField(key, data[key])
            newErrors[key] = errorMessage

            if (errorMessage) {
                isValid = false
            }
        })

        setErrors(newErrors)
        return isValid
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        const error = validateField(name, value)

        setFormData((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: error ? error : "" }))
    }

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

    useEffect(() => {
        if (!isModalOpen) {
            resetForm()
        }
    }, [isModalOpen])

    const buttons = [
        {
            text: "UPDATE",
            action: validateAndUpdateListing,
        },
    ]

    return (
        <Modal ref={ref} modalTitle="Updating price or the desired swap" buttons={buttons}>
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

export default UpdateListingModal
