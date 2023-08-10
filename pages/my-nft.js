import { useMoralis } from "react-moralis";
import { useState } from "react";
import NFTBox from "../components/NFTBox";
import networkMapping from "../constants/networkMapping.json";
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries";
import { useQuery } from "@apollo/client";

export default function Home() {
  const { isWeb3Enabled, chainId, account } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];

  const { loading, data: listedNfts, error } = useQuery(GET_ACTIVE_ITEMS);
  const [hasOwnNFT, setHasOwnNFT] = useState(false);

  if (loading || !listedNfts) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading NFTs</div>;
  }

  const isOwnedByUser = (seller) => seller === account || seller === undefined;

  return (
    <div className="mt-10 mx-48 p-4 bg-blue-100 rounded-2xl">
      <h1 className="py-4 font-bold text-2xl text-center">My NFT</h1>
      <div className="flex flex-row justify-center items-center">
        <div className="flex flex-wrap pb-4">
          {isWeb3Enabled && chainId ? (
            <>
              {listedNfts.activeItems.map((nft) =>
                isOwnedByUser(nft.seller) ? (
                  <NFTBox
                    key={`${nft.nftAddress}${nft.tokenId}`}
                    price={nft.price}
                    nftAddress={nft.nftAddress}
                    tokenId={nft.tokenId}
                    marketplaceAddress={marketplaceAddress}
                    seller={nft.seller}
                  />
                ) : null
              )}
              {hasOwnNFT && <div>Go get some NFTs for yourself!!!</div>}
            </>
          ) : (
            <div>Web3 is currently not enabled</div>
          )}
        </div>
      </div>
    </div>
  );
}
