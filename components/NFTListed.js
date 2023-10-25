import React, { useEffect, useState, useCallback } from "react"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"

function NFTListed({ chainId, items, setItems, filteredItems, setFilteredItems }) {
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    const { loading: loadingActive, data: dataActive } = useQuery(GET_ACTIVE_ITEMS)
    const { loading: loadingInactive, data: dataInactive } = useQuery(GET_INACTIVE_ITEMS)

    console.log("Data Active", dataActive)
    console.log("Data Inactive", dataInactive)

    const [images, setImages] = useState({})

    // Merge and remove duplicates
    const mergeAndFilterItems = useCallback(() => {
        if (!loadingActive && dataActive && !loadingInactive && dataInactive) {
            const seenKeys = new Set()
            const combinedItems = [...dataActive.items, ...dataInactive.items]

            combinedItems.sort((a, b) => b.listingId - a.listingId)

            const uniqueItems = combinedItems.reduce((acc, item) => {
                const key = `${item.nftAddress}${item.tokenId}`
                if (!seenKeys.has(key)) {
                    acc.push(item)
                    seenKeys.add(key)
                }
                return acc
            }, [])

            setItems(uniqueItems)
            setFilteredItems(uniqueItems)
        }
    }, [loadingActive, dataActive, loadingInactive, dataInactive, setItems, setFilteredItems])

    console.log("Unique items", items)

    useEffect(mergeAndFilterItems, [mergeAndFilterItems])

    const preloadImage = useCallback((url) => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = resolve
            img.onerror = reject
            img.src = url
        })
    }, [])

    useEffect(() => {
        items.forEach((nft) => {
            const { tokenId, imageIpfsUrl } = nft
            const ipfsImage = `https://ipfs.io/ipfs/${imageIpfsUrl}`
            const fallbackImage = `https://your-http-image-url/${tokenId}.png`

            preloadImage(ipfsImage)
                .then(() => setImages((prevImages) => ({ ...prevImages, [tokenId]: ipfsImage })))
                .catch(() =>
                    setImages((prevImages) => ({ ...prevImages, [tokenId]: fallbackImage }))
                )
        })
    }, [chainId, items, preloadImage])

    return (
        <div className={styles.nftListingContainer}>
            <div className={styles.nftListWrapper}>
                <h1>Recently Listed</h1>
                <div id="NFTListed" className={styles.nftList}>
                    {!items.length || !filteredItems.length ? (
                        <div>Loading...</div>
                    ) : (
                        filteredItems.map((nft) => {
                            const {
                                price,
                                nftAddress,
                                tokenId,
                                seller,
                                isListed,
                                listingId,
                                buyer,
                            } = nft
                            const imgSrc = images[tokenId] || ""
                            return (
                                <NFTBox
                                    price={price}
                                    nftAddress={nftAddress}
                                    tokenId={tokenId}
                                    marketplaceAddress={marketplaceAddress}
                                    seller={seller}
                                    buyer={buyer}
                                    isListed={isListed}
                                    key={`${nftAddress}${tokenId}${listingId}`}
                                    imgSrc={imgSrc}
                                />
                            )
                        })
                    )}
                </div>

                <div className={styles.showMoreButton}>
                    <Button
                        text="Show More"
                        onClick={() => {
                            window.location.href = "/sell-swap-nft"
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default NFTListed
