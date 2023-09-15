import React, { useCallback, useEffect, useState } from "react";
import NFTBox from "../components/NFTBox";
import networkMapping from "../constants/networkMapping.json";
import { GET_ACTIVE_ITEMS } from "../constants/subgraphQueries";
import { useQuery } from "@apollo/client";
import styles from '../styles/Home.module.css';
import { Button } from "web3uikit";
import { ArrowLeft, Arrow } from '@web3uikit/icons';

const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
};

function NFTListed({ isWeb3Enabled, chainId }) {
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];
  const { loading, data } = useQuery(GET_ACTIVE_ITEMS);

  console.log("Is Web3 enabled:" + isWeb3Enabled)
  console.log("Chain ID:" + chainId)
  console.log("Listed nfts:" + data)

  const [isMouseWheelDisabled, setIsMouseWheelDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState({});

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

  useEffect(() => {
    if (isWeb3Enabled && chainId && !loading && data) {
      data.items.forEach((nft) => {
        const { tokenId, imageIpfsUrl } = nft;
        const ipfsImage = `https://ipfs.io/ipfs/${imageIpfsUrl}`;
        const fallbackImage = `https://your-http-image-url/${tokenId}.png`;

        preloadImage(ipfsImage)
          .then(() => {
            setImages((prevImages) => ({ ...prevImages, [tokenId]: ipfsImage }));
          })
          .catch(() => {
            setImages((prevImages) => ({ ...prevImages, [tokenId]: fallbackImage }));
          });
      });
    }
  }, [isWeb3Enabled, chainId, loading, data]);

  return (
    <div className={styles.NFTContainer}>
      <h1>Recently Listed</h1>
      <div id="NFTListed" className={styles.NFTListed} onWheel={handleNFTListedScroll}>
        {isWeb3Enabled && chainId ? (
          loading || !data ? (
            <div>Loading...</div>
          ) : (
            data.items.map((nft) => {
              const { price, nftAddress, tokenId, seller } = nft;
              const imgSrc = images[tokenId] || '';

              return (
                <NFTBox
                  price={price}
                  nftAddress={nftAddress}
                  tokenId={tokenId}
                  marketplaceAddress={marketplaceAddress}
                  seller={seller}
                  key={`${nftAddress}${tokenId}`}
                  disableMouseWheel={() => setIsMouseWheelDisabled(true)}
                  enableMouseWheel={() => setIsMouseWheelDisabled(false)}
                  anyModalIsOpen={() => setIsModalOpen(true)}
                  anyModalIsClosed={() => setIsModalOpen(false)}
                  imgSrc={imgSrc}
                />
              )
            })
          )
        ) : (
          <div>Web3 Currently Not Enabled</div>
        )}
      </div>
      <div className={styles.moreButton}>
        <Button
          icon={<ArrowLeft className={styles.arrows} title="arrow left icon" />}
          iconLayout="icon-only"
          onClick={() => {
            const container = document.getElementById('NFTListed');
            if (container) {
              container.scrollLeft -= 226;
            }
          }}
        />
        <div className={styles.showMoreButton}>
          <Button
            text="Show More"
            onClick={() => {
              window.location.href = '/sell-nft';
            }}
          />
        </div>
        <Button
          icon={<Arrow className={styles.arrows} title="arrow right icon" />}
          iconLayout="icon-only"
          onClick={() => {
            const container = document.getElementById('NFTListed');
            if (container) {
              container.scrollLeft += 226;
            }
          }}
        />
      </div>
    </div>
  );
}

export default NFTListed;