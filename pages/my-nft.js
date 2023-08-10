import { useMoralis } from "react-moralis"
import { useState } from "react"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"

export default function Home() {
  const { isWeb3Enabled, chainId, account } = useMoralis() //user wird nicht importiert oder woher bekommt man den?
  const chainString = chainId ? parseInt(chainId).toString() : "31337"
  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
  const { loading, data: listedNfts, error } = useQuery(GET_ACTIVE_ITEMS)
  const [hasOwnNFT, setHasOwnNFT] = useState(); // Variable zur Verfolgung, ob du eigene NFTs hast

  if (loading || !listedNfts) {
    return <div>Loading</div>
  }

  if (error) {
    return <div>Error loading NFTs</div>
  }

  const handleNFTClick = (nft) => {
    console.log(nft);
    console.log(account)
    const { price, nftAddress, tokenId, seller } = nft;

    console.log(seller);
    if (account === seller) {
      console.log("User address is equal to seller address");
    } else if (!account) {
      console.log("No user address found");
    } else {
      console.log("User address is not equal to seller address");
    }

    if (seller === account) {
      setHasOwnNFT(true);

      return (
        <NFTBox
          price={price}
          nftAddress={nftAddress}
          tokenId={tokenId}
          marketplaceAddress={marketplaceAddress}
          seller={seller}
          key={`${nftAddress}${tokenId}`}
        />
      );
    }

    return null;
  };

  return (
    <div className="mt-10 mx-48 p-4 bg-blue-100 rounded-2xl">
      <h1 className="py-4 font-bold text-2xl text-center">My NFT</h1>
      <div className="flex flex-row justify-center items-center">
        <div className="flex flex-wrap pb-4">
          {isWeb3Enabled && chainId ? (
            <>
              {listedNfts.activeItems.map((nft) => handleNFTClick(nft))}
              {!hasOwnNFT && (
                <div>
                  Go get some NFT for yourself!!!
                </div>
              )}
            </>
          ) : (
            <div>Web3 Currently Not Enabled</div>
          )}
        </div>
      </div>
    </div>
  );
}