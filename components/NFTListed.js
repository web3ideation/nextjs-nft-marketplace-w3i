import React from "react"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import styles from '../styles/Home.module.css';
import Link from "next/link"
import { Button } from "web3uikit"

function NFTListed({ isWeb3Enabled, chainId }) {
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const { loading, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS)

    return (
        <div className={styles.NFTContainer}>
            <h1>Recently Listed</h1>
            <div className={styles.NFTListed}>
                {isWeb3Enabled && chainId ? (
                    loading || !listedNfts ? (
                        <div>Loading...</div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
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
                                />
                            )
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
            <div className={styles.moreContainer}>

                <Link
                    href="/sell-nft"
                    className={styles.moreLink}>
                    <Button
                    text="Show More"
                    size="large"
                    >
                    </Button>
                </Link>

            </div>
        </div>
    )
}

export default NFTListed

// !!!W Patrick is converting the NFT URI and image URI from ipfs to http bc most browsers dont support ipfs out of the box. I should find a way to default display the ipfs way and only if that doesnt work it should automatically use the https. but ipfs would be slower...
// !!!W the next js <image/> tag stops us from making this a static site, thus it cant be hosted on ipfs (that means it would be hosted centralized)... how do i decentralize it then? what about fleek or vercel? Is there an alternative to the <image/> tag? Maybe I should develop two versions of the site, one being with the centralized things like URI Http and the <image /> tags and the other one being static...
