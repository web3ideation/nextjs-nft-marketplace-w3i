import { Modal, Input, useNotification, Button } from "web3uikit"
import React, { useState } from "react"
import { useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { ethers } from "ethers"
import styles from "../styles/Home.module.css"

export default function UpdateListingModal({
    nftAddress,
    tokenId,
    showUpdateListingModal,
    marketplaceAddress,
    onCancel,
    enableMouseWheel,
    disableMouseWheel,
}) {
    const dispatch = useNotification()

    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState("") //!!!W this means that if i just open the modal and klick OK without entering a number the nfts price will be set to 0. which is a problem! tho there should be an error from the marketplace smartcontract that the price can not be zero, i think.
    const [error, setError] = useState(null); // Error state if something with the value is wrong
    const [transactionError, setTransactionError] = useState(null); // Error state if something with wallet is wrong

    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "listing updated",
            title: "Listing updated - please refresh (and move blocks)",
            position: "topR",
        })
        onCancel && onCancel()
        setPriceToUpdateListingWith("") // !!!W this has to be done in the error case, right? so add it at line 48? Bc if an error happens it will not be reset to 0...
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
    const handleUpdateButtonClick = async () => { // !!!N Komma should be reassigned with a dot
        if (priceToUpdateListingWith.trim() === "") {
            setError("Add your new price");
        } else if (parseFloat(priceToUpdateListingWith) === 0) {
            setError("Price can't be zero.")
        } else {
            try {
                const tx = await updateListing({
                    onError: (error) => {
                        if (error.message === "MetaMask Tx Signature: User denied transaction signature.") {
                            setTransactionError("Transaction was denied by the user.");
                        } else {
                        setError(error.message);
                        }
                        setPriceToUpdateListingWith("");
                        console.error(error);
                    },
                    onSuccess: handleUpdateListingSuccess,
                });
                setError(null);
            } catch (error) {
                setError(error.message);
                setPriceToUpdateListingWith("");
                console.error(error);
            }
        }
    }

    return (
        <Modal
            className={styles.modal}
            onOk={handleUpdateButtonClick}
            okText="Update"
            onCancel={() => {
                onCancel && onCancel();
                enableMouseWheel && enableMouseWheel();
                setError(null);
            }}
            cancelText="Close"
            width="325px"
            closeButton={<Button disabled text=""></Button>}
        >
            <Input
                className={styles.modalInput}
                label="Update listing price in L1 Currency (ETH)"
                name="New listing price"
                type="number"
                value={priceToUpdateListingWith}
                onChange={(event) => {
                    setPriceToUpdateListingWith(event.target.value)
                }}
            />
            {error && <div style={{ color: "red" }}>{error}</div>}
            {transactionError && <div style={{ color: "red" }}>{transactionError}</div>}
        </Modal>
    )
}
