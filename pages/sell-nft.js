import styles from "../styles/Home.module.css"
import { Form, useNotification, Button } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import nftAbi from "../constants/BasicNft.json"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { useEffect, useState } from "react"

export default function Home() {
  const { chainId, account, isWeb3Enabled } = useMoralis()
  const chainString = chainId ? parseInt(chainId).toString() : "31337"
  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
  const dispatch = useNotification()
  const [proceeds, setProceeds] = useState("0")

  const { runContractFunction } = useWeb3Contract()

  async function approveAndList(data) {
    console.log("Approving...")
    const nftAddress = data.data[0].inputResult
    const tokenId = data.data[1].inputResult
    const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId,
      },
    }

    await runContractFunction({
      params: approveOptions,
      onSuccess: (tx) => handleApproveSuccess(tx, nftAddress, tokenId, price),
      onError: (error) => {
        console.log(error)
      },
    })
  }

  async function handleApproveSuccess(tx, nftAddress, tokenId, price) {
    // !!!W also dispatch a notification here like:
    // dispatch({
    //   type: "success",
    //   message: "Approval",
    //   title: "Marketplace approved",
    //   position: "topR",
    // })
    console.log("Ok! Now time to list")
    await tx.wait()
    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price,
      },
    }

    await runContractFunction({
      params: listOptions,
      onSuccess: () => handleListSuccess(),
      onError: (error) => console.log(error),
    })
  }

  async function handleListSuccess() {
    dispatch({
      type: "success",
      message: "NFT listing",
      title: "NFT listed",
      position: "topR",
    })
  }

  const handleWithdrawSuccess = () => {
    dispatch({
      type: "success",
      message: "Withdrawing proceeds",
      position: "topR",
    })
  }

  async function setupUI() {
    const returnedProceeds = await runContractFunction({
      params: {
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
          seller: account,
        },
      },
      onError: (error) => console.log(error),
    })
    if (returnedProceeds) {
      setProceeds(returnedProceeds.toString())
    }
  }

  useEffect(() => {
    setupUI()
  }, [proceeds, account, isWeb3Enabled, chainId])

  return (
    <div className={styles.container}>
      <Form
        onSubmit={approveAndList}
        data={[
          // !!!W add guides for the user, so they can not input letters where only a number makes sense, and that it has to have a specific length, and that the price field sees , and . both as the decimal point.
          {
            name: "NFT Address",
            type: "text",
            inputWidth: "100%",
            value: "",
            key: "nftAddress",
          },
          {
            name: "Token ID",
            type: "number",
            inputWidth: "100%",
            value: "",
            key: "tokenId",
          },
          {
            name: "Price (in ETH)",
            type: "number",
            inputWidth: "100%",
            value: "",
            key: "price",
          },
        ]}
        title="Sell your NFT!"
        id="Main Form"
      />
      <div className="flex flex-row justify-center">
        <div>Withdraw {proceeds} proceeds</div>
      </div>
      {proceeds != "0" ? (
        <Button
          name="Withdraw"
          type="button"
          onClick={() => {
            runContractFunction({
              params: {
                abi: nftMarketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "withdrawProceeds",
                params: {},
              },
              onError: (error) => console.log(error),
              onSuccess: () => handleWithdrawSuccess,
            })
          }}
        />
      ) : (
        <div className="flex flex-row justify-center">
          <div>No proceeds detected</div>
        </div>
      )}
    </div>
  )
}
