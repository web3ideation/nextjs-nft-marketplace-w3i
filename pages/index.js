import { useMoralis } from "react-moralis"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import Link from "next/link"
import React from 'react'

export default function Home() {
  const { isWeb3Enabled, chainId } = useMoralis()
  const chainString = chainId ? parseInt(chainId).toString() : "31337"
  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
  const { loading, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS)

  return (
    <div className="mt-10 mx-48 p-4 bg-blue-100 to-blue-400 rounded-2xl">
      <h1 className="py-4 font-bold text-2xl text-center">Recently Listed</h1>
      <div className="flex flex-row items-center">
        <div className="flex flex-wrap pb-4">
          {isWeb3Enabled && chainId ? ( // !!! it should show the available NFTs also without having a wallet connected.
            loading || !listedNfts ? (
              <div>Loading...</div>
            ) : (
              listedNfts.activeItems.map((nft) => {
                console.log(nft)
                const { price, nftAddress, tokenId, seller, imageIpfsUrl } = nft

                // Try fetching image from IPFS
                const ipfsImage = `https://ipfs.io/ipfs/${imageIpfsUrl}`;
                const imgSrc = new Image();
                imgSrc.src = ipfsImage;

                imgSrc.onload = () => {
                  // IPFS image loaded successfully, render the image
                  return (
                    <img src={ipfsImage} alt="NFT" />
                  );
                };

                imgSrc.onerror = () => {
                  // IPFS image load failed, fall back to HTTP image
                  return (
                    <img src={`https://your-http-image-url/${tokenId}.png`} alt="NFT" />
                  );
                };

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
      </div>
      <div className="hover:bg-blue-500 bg-blue-400 shadow rounded-2xl px-4 mx-4 mb-4">
        <Link href="/sell-nft" className="cursor-pointer flex flex-row items-center justify-center">
          <img className="p-4" src="/pfeil.png" width="100" height="100"></img>
          <div className="p-4 text-center">Show more</div>
        </Link>
      </div>
    </div>
  )
}

// !!! Patrick is converting the NFT URI and image URI from ipfs to http bc most browsers dont support ipfs out of the box. I should find a way to default display the ipfs way and only if that doesnt work it should automatically use the https. but ipfs would be slower...
// !!! the next js <image/> tag stops us from making this a static site, thus it cant be hosted on ipfs (that means it would be hosted centralized)... how do i decentralize it then? what about fleek or vercel? Is there an alternative to the <image/> tag? Maybe I should develop two versions of the site, one being with the centralized things like URI Http and the <image /> tags and the other one being static...
