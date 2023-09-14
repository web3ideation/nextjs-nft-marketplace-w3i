import React, { useCallback, useState, useEffect } from "react"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import { GET_ACTIVE_ITEMS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import { ArrowLeft, Arrow } from "@web3uikit/icons"

function NFTListed({ isWeb3Enabled, chainId }) {
  const chainString = chainId ? parseInt(chainId).toString() : "31337"
  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
  const { loading, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [isMouseWheelDisabled, setIsMouseWheelDisabled] = useState(false)

  const handleNFTListedScroll = useCallback(
    (event) => {
      if (isModalOpen || isMouseWheelDisabled) {
        return
      }
      // Prüfen, ob das Scrollen im NFT-Container stattfindet
      const container = document.getElementById("NFTListed")
      if (container && !isModalOpen) {
        if (event.deltaY < 0) {
          container.scrollLeft -= 226 // Nach links scrollen (negativer Wert)
          console.log("Scrolling left")
        } else {
          container.scrollLeft += 226 // Nach rechts scrollen (positiver Wert)
          console.log("scrolling Right")
        }
        event.preventDefault() // Verhindern Sie das Standard-Mausradverhalten
      }
    },
    [isModalOpen, isMouseWheelDisabled]
  )

  // Funktion, um das MouseWheel zu deaktivieren, wenn ein Modal geöffnet ist
  const disableMouseWheel = () => {
    setIsMouseWheelDisabled(true)
  }

  // Funktion, um das MouseWheel zu aktivieren, wenn ein Modal geschlossen wird
  const enableMouseWheel = () => {
    setIsMouseWheelDisabled(false)
  }

  return (
    <div className={styles.NFTContainer}>
      <h1>Recently Listed</h1>
      <div id="NFTListed" className={styles.NFTListed} onWheel={handleNFTListedScroll}>
        {isWeb3Enabled && chainId ? (
          loading || !listedNfts ? (
            <div>Loading...</div>
          ) : (
            listedNfts.items.map((nft) => {
              console.log(nft)
              const { price, nftAddress, tokenId, seller, imageIpfsUrl } = nft
              const ipfsImage = `https://ipfs.io/ipfs/${imageIpfsUrl}`
              const imgSrc = new Image()

              imgSrc.src = ipfsImage

              imgSrc.onload = () => {
                return <img src={ipfsImage} alt="NFT" />
              }

              imgSrc.onerror = () => {
                return <img src={`https://your-http-image-url/${tokenId}.png`} alt="NFT" />
              }

              return (
                <NFTBox
                  price={price}
                  nftAddress={nftAddress}
                  tokenId={tokenId}
                  marketplaceAddress={marketplaceAddress}
                  seller={seller}
                  key={`${nftAddress}${tokenId}`}
                  disableMouseWheel={disableMouseWheel} // Übergeben Sie die Funktion als Prop
                  enableMouseWheel={enableMouseWheel} // Übergeben Sie die Funktion als Prop
                />
              )
            })
          )
        ) : (
          <div>Web3 Currently Not Enabled</div>
        )}
      </div>
      <div className={styles.moreButton}>
        {" "}
        {/*!!!N those buttons need individual keys */}
        <Button
          key="leftButton"
          icon={<ArrowLeft className={styles.arrows} title="arrow left icon" />}
          iconLayout="icon-only"
          onClick={() => {
            const container = document.getElementById("NFTListed")
            if (container) {
              container.scrollLeft -= 226
            }
          }}
        />
        <Button
          key="showMoreButton"
          text="Show More"
          onClick={() => {
            window.location.href = "/sell-nft"
          }}
        />
        <Button
          key="rightButton"
          icon={<Arrow className={styles.arrows} title="arrow right icon" />}
          iconLayout="icon-only"
          onClick={() => {
            const container = document.getElementById("NFTListed")
            if (container) {
              container.scrollLeft += 226
            }
          }}
        />
      </div>
    </div>
  )
}

export default NFTListed

// !!!W Patrick is converting the NFT URI and image URI from ipfs to http bc most browsers dont support ipfs out of the box. I should find a way to default display the ipfs way and only if that doesnt work it should automatically use the https. but ipfs would be slower...
// !!!W the next js <image/> tag stops us from making this a static site, thus it cant be hosted on ipfs (that means it would be hosted centralized)... how do i decentralize it then? what about fleek or vercel? Is there an alternative to the <image/> tag? Maybe I should develop two versions of the site, one being with the centralized things like URI Http and the <image /> tags and the other one being static...
