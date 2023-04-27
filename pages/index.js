import Image from "next/image"
import styles from "../styles/Home.module.css"
import { useMoralisQuery, useMoralis } from "react-moralis"
import NFTBox from "../components/NFTBox"

export default function Home() {
  const { isWeb3Enabled } = useMoralis()
  const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
    // TableName
    // Function for the query
    "ActiveItem",
    (query) => query.limit(10).descending("tokenId")
  )
  console.log(listedNfts)

  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? (
          fetchingListedNfts ? (
            <div>Loading...</div>
          ) : (
            listedNfts.map((nft) => {
              console.log(nft.attributes)
              const { price, nftAddress, tokenId, marketplaceAddress, seller } = nft.attributes
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
  )
}

// !!! Patrick is converting the NFT URI and image URI from ipfs to http bc most browsers dont support ipfs out of the box. I should find a way to default display the ipfs way and only if that doesnt work it should automatically use the https. but ipfs would be slower...
// !!! the next js <image/> tag stops us from making this a static site, thus it cant be hosted on ipfs (that means it would be hosted centralized)... how do i decentralize it then? what about fleek or vercel? Is there an alternative to the <image/> tag? Maybe I should develop two versions of the site, one being with the centralized things like URI Http and the <image /> tags and the other one being static...
