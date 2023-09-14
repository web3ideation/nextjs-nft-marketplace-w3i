import { useMoralis } from "react-moralis"
import { useCallback, useEffect, useState } from "react"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import { GET_ACTIVE_ITEMS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import styles from '../styles/Home.module.css'

export default function Home() {
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    const { loading, data, error } = useQuery(GET_ACTIVE_ITEMS)
    const [hasOwnNFT, setHasOwnNFT] = useState(false)

    if (loading || !data) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error loading NFTs</div>
    }

    const [isMouseWheelDisabled, setIsMouseWheelDisabled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNFTListedScroll = useCallback((event) => {
    if (isModalOpen || isMouseWheelDisabled) {
      return;
    }
    const container = document.getElementById('NFTListed');
    if (container) {
      container.scrollLeft += event.deltaY < 0 ? -226 : 226;
    }
  }, [isModalOpen, isMouseWheelDisabled]);

  useEffect(() => {
    const preventPageScroll = () => {
      const container = document.getElementById('NFTListed');
      if (container) {
        container.addEventListener("wheel", (event) => {
          event.preventDefault();
        }, { passive: false });
      }
    };
    preventPageScroll();
  }, []);

    const isOwnedByUser = (seller) => seller === account || seller === undefined

    return (
        <div className={styles.NFTContainer}>
            <h1>My NFT</h1>
            <div className={styles.NFTListed} onWheel={handleNFTListedScroll}>
                <div className="flex flex-wrap pb-4">
                    {isWeb3Enabled && chainId ? (
                        <>
                            {data.items.map((nft) =>
                                isOwnedByUser(nft.seller) ? (
                                    <NFTBox
                                        price={nft.price}
                                        nftAddress={nft.nftAddress}
                                        tokenId={nft.tokenId}
                                        marketplaceAddress={marketplaceAddress}
                                        seller={nft.seller}
                                        key={`${nft.nftAddress}${nft.tokenId}`}
                                        disableMouseWheel={() => setIsMouseWheelDisabled(true)}
                                        enableMouseWheel={() => setIsMouseWheelDisabled(false)}
                                        anyModalIsOpen={() => setIsModalOpen(true)}
                                        anyModalIsClosed={() => setIsModalOpen(false)}
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
    )
}
