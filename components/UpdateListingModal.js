import { Modal, Input, useNotification } from "web3uikit"
import { useState } from "react"
import { useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { ethers } from "ethers"
import styles from "../styles/Home.module.css"

export default function UpdateListingModal({
  nftAddress,
  tokenId,
  isVisible,
  marketplaceAddress,
  onClose,
}) {
  const dispatch = useNotification()

  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0) //!!!W this means that if i just open the modal and klick OK without entering a number the nfts price will be set to 0. which is a problem! tho there should be an error from the marketplace smartcontract that the price can not be zero, i think.

  const handleUpdateListingSuccess = async (tx) => {
    await tx.wait(1)
    dispatch({
      type: "success",
      message: "listing updated",
      title: "Listing updated - please refresh (and move blocks)",
      position: "topR",
    })
    onClose && onClose()
    setPriceToUpdateListingWith("0") // !!!W this has to be done in the error case, right? so add it at line 48? Bc if an error happens it will not be reset to 0...
  }

  const { runContractFunction: updateListing } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "updateListing",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"), //!!!W this means that if i just open the modal and klick OK without entering a number the nfts price will be set to 0. which is a problem! tho there should be an error from the marketplace smartcontract that the price can not be zero, i think.
    },
  })

  return (
    <Modal
      className={styles.modal}
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() => {
        updateListing({
          onError: (error) => {
            console.log(error)
          },
          onSuccess: handleUpdateListingSuccess,
        })
      }}
    >
      <Input
        style={{ outline: "none", appearance: "none" }}
        label="Update listing price in L1 Currency (ETH)"
        name="New listing price"
        type="number"
        onChange={(event) => {
          setPriceToUpdateListingWith(event.target.value)
        }}
      />
    </Modal>
  )
}
