import React, { useEffect, useState, memo } from "react"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import SearchSideFilters from "../components/SearchSideFilters"

const NFTBoxMemo = memo(NFTBox)

function NFTListed({ chainId }) {
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    const { loading: loadingActive, data: dataActive } = useQuery(GET_ACTIVE_ITEMS)
    const { loading: loadingInactive, data: dataInactive } = useQuery(GET_INACTIVE_ITEMS)

    const [allItems, setAllItems] = useState([])
    const [filteredNFTs, setFilteredNFTs] = useState([])

    const [images, setImages] = useState({})

    // Merge and remove duplicates
    useEffect(() => {
        if (!loadingActive && dataActive && !loadingInactive && dataInactive) {
            const seenKeys = new Set() // Set to keep track of keys
            const uniqueItems = [...dataActive.items, ...dataInactive.items].reduce(
                (acc, item) => {
                    const key = `${item.nftAddress}${item.tokenId}${item.listingId}`
                    if (!seenKeys.has(key)) {
                        // Check if the key has not been seen
                        acc.push(item)
                        seenKeys.add(key) // Mark the key as seen
                    }
                    return acc
                },
                []
            )

            setAllItems(uniqueItems)
        }
    }, [loadingActive, dataActive, loadingInactive, dataInactive])

    useEffect(() => {
        if (allItems.length) {
            allItems.forEach((nft) => {
                const { tokenId, imageIpfsUrl } = nft
                const ipfsImage = `https://ipfs.io/ipfs/${imageIpfsUrl}`
                const fallbackImage = `https://your-http-image-url/${tokenId}.png`

                preloadImage(ipfsImage)
                    .then(() =>
                        setImages((prevImages) => ({ ...prevImages, [tokenId]: ipfsImage }))
                    )
                    .catch(() =>
                        setImages((prevImages) => ({ ...prevImages, [tokenId]: fallbackImage }))
                    )
            })
        }
    }, [chainId, allItems])

    useEffect(() => {
        setFilteredNFTs(allItems)
    }, [allItems])

    const handleFilteredItemsChange = (newFilteredItems) => {
        setFilteredNFTs(newFilteredItems)
    }

    return (
        <div className={styles.searchResultPage}>
            <SearchSideFilters
                initialItems={allItems}
                onFilteredItemsChange={handleFilteredItemsChange}
            />
            <div className={styles.nftListWrapper}>
                <h1>Recently Listed</h1>
                <div id="NFTListed" className={styles.nftList}>
                    {!allItems || !filteredNFTs ? (
                        <div>Loading...</div>
                    ) : (
                        filteredNFTs.map((nft) => {
                            const { price, nftAddress, tokenId, seller, isListed, listingId } = nft
                            const imgSrc = images[tokenId] || ""
                            return (
                                <NFTBox
                                    price={price}
                                    nftAddress={nftAddress}
                                    tokenId={tokenId}
                                    marketplaceAddress={marketplaceAddress}
                                    seller={seller}
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
                            window.location.href = "/sell-nft"
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default NFTListed

const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = reject
        img.src = url
    })
}
