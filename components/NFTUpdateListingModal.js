import { Modal, Input, useNotification, Button, Loading } from "web3uikit"
import React, { useState } from "react"
import { useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { ethers } from "ethers"
import styles from "../styles/Home.module.css"

export default function NFTUpdateListingModal(props) {
    const {
        nftAddress,
        tokenId,
        showUpdateListingModal,
        marketplaceAddress,
        onCancel,
        enableMouseWheel,
        disableMouseWheel,
    } = props

    const dispatch = useNotification()
    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState("") //!!!W this means that if i just open the modal and klick OK without entering a number the nfts price will be set to 0. which is a problem! tho there should be an error from the marketplace smartcontract that the price can not be zero, i think.
    const [error, setError] = useState(null) // Error state if something with the value is wrong
    const [transactionError, setTransactionError] = useState(null) // Error state if something with wallet is wrong
    const [updating, setUpdating] = useState(false)

    const resetPrice = () => setPriceToUpdateListingWith("")

    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "listing updated",
            title: "Listing updated - please refresh (and move blocks)",
            position: "topR",
        })
        onCancel && onCancel()
        resetPrice() // !!!W this has to be done in the error case, right? so add it at line 48? Bc if an error happens it will not be reset to 0...
    }

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newDesiredNftAddress: nftAddress,
            newdesiredTokenId: tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"), //!!!W this means that if i just open the modal and klick OK without entering a number the nfts price will be set to 0. which is a problem! tho there should be an error from the marketplace smartcontract that the price can not be zero, i think.
        },
    })

    const handleUpdateButtonClick = async () => {
        if (!priceToUpdateListingWith.trim()) {
            setError("Add your new price")
            return
        }

        if (parseFloat(priceToUpdateListingWith) <= 0) {
            setError("Price must be greater than zero.")
            return
        }

        try {
            setUpdating(true)
            await updateListing({
                onError: (error) => {
                    if (error.message.includes("User denied transaction signature")) {
                        setTransactionError("Transaction was denied by the user.")
                    } else {
                        setError(error.message)
                    }
                    resetPrice()
                    setUpdating(false)
                },
                onSuccess: async (tx) => {
                    handleUpdateListingSuccess(tx)
                    setUpdating(false)
                },
            })
            setError(null)
        } catch (error) {
            setError(error.message)
            resetPrice()
            setUpdating(false)
        }
    }

    return (
        <div className={styles.nftModalUpdateListing}>
            <Modal
                onOk={handleUpdateButtonClick}
                okText={updating ? <Loading /> : "Update"}
                onCancel={() => {
                    onCancel && onCancel()
                    enableMouseWheel && enableMouseWheel()
                    setError(null)
                }}
                cancelText="Close"
                width="min-content"
                closeButton={<Button disabled text=""></Button>}
            >
                <Input
                    label="Update listing price in L1 Currency (ETH)"
                    name="New listing price"
                    type="number"
                    validation={{
                        regExp: /^\d{1,18}(\.\d{1,18})?$/,
                        regExpInvalidMessage: "Please enter a positive amount in ETH.",
                    }}
                    value={priceToUpdateListingWith}
                    onChange={(event) => {
                        setPriceToUpdateListingWith(event.target.value)
                    }}
                />
                {error && <div style={{ color: "red" }}>{error}</div>}
                {transactionError && <div style={{ color: "red" }}>{transactionError}</div>}
            </Modal>
        </div>
    )
}
