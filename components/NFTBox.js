import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import nftAbi from "../constants/BasicNft.json"
import Image from "next/image"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import UpdateListingModal from "./UpdateListingModal"

const truncateStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) return fullStr

  const separator = "..."
  const seperatorLength = separator.length
  const charsToShow = strLen - seperatorLength
  const frontChars = Math.ceil(charsToShow / 2)
  const backChars = Math.floor(charsToShow / 2)
  return (
    fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars)
  )
}

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
  const { isWeb3Enabled, account } = useMoralis()
  const [imageURI, setImageURI] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [tokenDescription, setTokenDescription] = useState("")
  const [showModal, setShowModal] = useState(false)
  const hideModal = () => setShowModal(false)
  const dispatch = useNotification()

  const [loadingImage, setLoadingImage] = useState(false) // Added loading state
  const [errorLoadingImage, setErrorLoadingImage] = useState(false) // Added error state

  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: "TOKEN_URI",
  })

  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "buyItem",
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  })

  async function updateUI() {
    const tokenURI = await getTokenURI()
    console.log(`The TokenURI is ${tokenURI}`)
    // We are going to cheat a little here... !!!W what does he mean and how to do it the correct way?
    if (tokenURI) {
      // IPFS Gateway: A server that will return IPFS files from a "normal" URL.
      const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
      const tokenURIResponse = await (await fetch(requestURL)).json()
      const imageURI = tokenURIResponse.image
      const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
      setImageURI(imageURIURL)
      setTokenName(tokenURIResponse.name)
      setTokenDescription(tokenURIResponse.description)
      // Ways for decentralizantion
      // We could render the Image on our sever, and just call our sever.
      // For testnets & mainnet -> use moralis server hooks
      // Have the world adopt IPFS
      // Build our own IPFS gateway
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI()
    }
  }, [isWeb3Enabled])

  const isOwnedByUser = seller === account || seller === undefined
  const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 15)

  const handleCardClick = () => {
    isOwnedByUser
      ? setShowModal(true)
      : buyItem({
          // !!!W here it should also have a modal coming up, which displays detailed infromation about the nft and on there there would be a button for the buy function
          onError: (error) => console.log(error),
          onSuccess: handleBuyItemSuccess,
        })
  }

  const handleBuyItemSuccess = async (tx) => {
    await tx.wait(1)
    dispatch({
      type: "success",
      message: "Item bought!",
      title: "Item Bought",
      position: "topR",
    })
  }

  // Load the image from IPFS and fall back to HTTP if needed
  const loadImage = async () => {
    try {
      setLoadingImage(true) // Set loading state to true
      setErrorLoadingImage(false) // Reset error state

      const tokenURI = await getTokenURI()
      if (tokenURI) {
        const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
        const tokenURIResponse = await (await fetch(requestURL)).json()
        const imageURI = tokenURIResponse.image
        const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
        setImageURI({ src: imageURIURL, width: 100 })
      }
      setLoadingImage(false) // Set loading state to false after image is loaded
    } catch (error) {
      console.error("Error loading image:", error)
      setErrorLoadingImage(true) // Set error state to true
      setLoadingImage(false) // Set loading state to false in case of error
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      loadImage() // Load the image when the component mounts
    }
  }, [isWeb3Enabled])

  return (
    <div className="hover:bg-blue-500 hover:shadow rounded-3xl m-4">
      <div>
        {imageURI ? (
          <div className="m-1">
            <UpdateListingModal
              isVisible={showModal}
              tokenId={tokenId}
              marketplaceAddress={marketplaceAddress}
              nftAddress={nftAddress}
              onClose={hideModal}
            />
            <Card
              className="border ring-1 rounded-2xl shadow"
              title={tokenName}
              description={tokenDescription}
              onClick={handleCardClick}
            >
              <div>
                <div className="flex flex-col items-end gap-2">
                  <div>#{tokenId}</div>
                  <div className="italic text-sm w-48">Owned by {formattedSellerAddress}</div>
                  {imageURI ? (
                    <Image src={imageURI.src} height={100} width={100} alt="Sweet PUG" />
                  ) : (
                    <div>
                      {loadingImage ? (
                        <div>Loading Image... </div>
                      ) : errorLoadingImage ? (
                        <div>Error loading image</div>
                      ) : (
                        <Image src={imageURI.src} height={100} width={100} alt="Sweet PUG" />
                      )}
                    </div>
                  )}
                  <div className="font-bold">{ethers.utils.formatUnits(price, "ether")} ETH</div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  )
}
