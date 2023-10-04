import React, { useEffect, useState, useRef, memo } from "react"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import { ArrowLeft, Arrow } from "@web3uikit/icons"
import SearchSideFilters from "../components/SearchSideFilters"
import { Chart } from "@web3uikit/icons"

const NFTBoxMemo = memo(NFTBox)

const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = reject
        img.src = url
    })
}

function NFTListed({ chainId }) {
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    const { loading: loadingActive, data: dataActive } = useQuery(GET_ACTIVE_ITEMS)
    const { loading: loadingInactive, data: dataInactive } = useQuery(GET_INACTIVE_ITEMS)

    const [allItems, setAllItems] = useState([]) // New state for all items

    useEffect(() => {
        console.log("allItems:", allItems)
    }, [allItems])

    const [sortingOption, setSortingOption] = useState("default")
    const [selectedCategory, setSelectedCategory] = useState("default")
    const [selectedCollection, setSelectedCollection] = useState("default")
    const [selectedStatus, setSelectedStatus] = useState("default")
    const [filteredNFTs, setFilteredNFTs] = useState([])

    useEffect(() => {
        if (!loadingActive && dataActive && !loadingInactive && dataInactive) {
            console.log("dataActive.items:", dataActive.items)
            console.log("dataInactive.items:", dataInactive.items)
            const seenKeys = new Set() // Set to keep track of keys
            const uniqueItems = []

            ;[...dataActive.items, ...dataInactive.items].forEach((item) => {
                const key = `${item.nftAddress}${item.tokenId}`
                if (!seenKeys.has(key)) {
                    // Check if the key has not been seen
                    uniqueItems.push(item)
                    seenKeys.add(key) // Mark the key as seen
                }
            })

            setAllItems(uniqueItems)
        }
    }, [loadingActive, dataActive, loadingInactive, dataInactive])

    useEffect(() => {
        if (allItems.length) {
            let filteredList = [...allItems]
            console.log(filteredList)
            if (selectedStatus === "active") {
                filteredList = filteredList.filter((nft) => nft.isListed)
                console.log("Active items:", filteredList)
            } else if (selectedStatus === "inactive") {
                filteredList = filteredList.filter((nft) => !nft.isListed)
                console.log("Inactive items:", filteredList)
            }

            if (selectedCategory !== "default") {
                // Beispielhafte Filterung (muss an das tatsächliche Datenmodell angepasst werden)
                filteredList = filteredList.filter((nft) => nft.category === selectedCategory)
            }

            if (selectedCollection !== "default") {
                // Beispielhafte Filterung (muss an das tatsächliche Datenmodell angepasst werden)
                filteredList = filteredList.filter((nft) => nft.nftAddress === selectedCollection)
            }

            switch (sortingOption) {
                case "lowestId":
                    // Sorting by tokenId in ascending order
                    filteredList.sort((a, b) => a.tokenId - b.tokenId)
                    break
                case "highestId":
                    // Sorting by tokenId in descending order
                    filteredList.sort((a, b) => b.tokenId - a.tokenId)
                    break
                case "highestPrice":
                    // Sorting by price in ascending order
                    filteredList.sort((a, b) => b.price - a.price)
                    break
                case "lowestPrice":
                    // Sorting by price in descending order
                    filteredList.sort((a, b) => a.price - b.price)
                    break
                default:
                    break
            }
            console.log("NFTs to render:", filteredNFTs)
            setFilteredNFTs(filteredList)
        }
        console.log("filteredNFTs after filtering and sorting:", filteredNFTs)
    }, [allItems, selectedStatus, sortingOption, selectedCategory, selectedCollection])

    const handleFilterChange = (type, value) => {
        console.log("Changing filter type:", type, "with value:", value)
        switch (type) {
            case "status":
                setSelectedStatus(value)
                break
            case "sorting":
                setSortingOption(value)
                break
            case "category":
                setSelectedCategory(value)
                break
            case "collection":
                setSelectedCollection(value)
                break
            default:
                break
        }
    }
    const [images, setImages] = useState({})

    useEffect(() => {
        if (chainId && allItems.length) {
            setFilteredNFTs(allItems)
            allItems.forEach((nft) => {
                const { tokenId, imageIpfsUrl } = nft
                const ipfsImage = `https://ipfs.io/ipfs/${imageIpfsUrl}`
                const fallbackImage = `https://your-http-image-url/${tokenId}.png`

                preloadImage(ipfsImage)
                    .then(() => {
                        setImages((prevImages) => ({ ...prevImages, [tokenId]: ipfsImage }))
                    })
                    .catch(() => {
                        setImages((prevImages) => ({ ...prevImages, [tokenId]: fallbackImage }))
                    })
            })
        }
    }, [chainId, allItems])

    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)
    const filterRef = useRef(null)

    const handleMouseEnter = () => {
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        setIsOpen(false)
    }

    return (
        <div className={styles.searchResultPage}>
            <div
                className={styles.filterButton}
                ref={menuRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Chart fontSize="35px" />
            </div>
            {isOpen && (
                <div
                    className={styles.searchSideFiltersWrapper}
                    ref={filterRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <p>Filter</p>
                    <div>
                        {isOpen && (
                            <SearchSideFilters
                                buttonText="Sorting"
                                options={[
                                    { id: "default", label: "Default" },
                                    { id: "highestId", label: "Highest ID" },
                                    { id: "lowestId", label: "Lowest ID" },
                                    { id: "highestPrice", label: "Highest Price" },
                                    { id: "lowestPrice", label: "Lowest Price" },
                                ]}
                                onChange={handleFilterChange}
                                value={sortingOption}
                                type="sorting"
                            />
                        )}
                    </div>{" "}
                    <div>
                        {isOpen && (
                            <div className="">
                                <SearchSideFilters
                                    buttonText="Status"
                                    options={[
                                        { id: "default", label: "Default" },
                                        { id: "active", label: "Active" },
                                        { id: "inactive", label: "Inactive" },
                                    ]}
                                    onChange={handleFilterChange}
                                    value={selectedStatus}
                                    type="status"
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        {isOpen && (
                            <div className="">
                                <SearchSideFilters
                                    buttonText="Categories"
                                    options={[
                                        { id: "wearables", label: "Wearables" },
                                        { id: "utillities", label: "Utillities" },
                                    ]}
                                    onChange={handleFilterChange}
                                    value={selectedCategory}
                                    type="category"
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        {isOpen && (
                            <div className="">
                                <SearchSideFilters
                                    buttonText="Collections"
                                    options={[
                                        { id: "pug", label: "Pug" },
                                        { id: "moon", label: "Moon" },
                                    ]}
                                    onChange={handleFilterChange}
                                    value={selectedCollection}
                                    type="collection"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className={styles.nftListWrapper}>
                <h1>Recently Listed</h1>
                <div id="NFTListed" className={styles.nftList}>
                    {!allItems || !filteredNFTs ? (
                        <div>Loading...</div>
                    ) : (
                        filteredNFTs.map((nft) => {
                            const { price, nftAddress, tokenId, seller, isListed } = nft
                            const imgSrc = images[tokenId] || ""
                            return (
                                <NFTBox
                                    price={price}
                                    nftAddress={nftAddress}
                                    tokenId={tokenId}
                                    marketplaceAddress={marketplaceAddress}
                                    seller={seller}
                                    isListed={isListed}
                                    key={`${nftAddress}${tokenId}`}
                                    imgSrc={imgSrc}
                                />
                            )
                        })
                    )}
                </div>
                <div className={styles.nftScroll}>
                    <Button
                        icon={<ArrowLeft className={styles.arrows} title="arrow left icon" />}
                        iconLayout="icon-only"
                        onClick={() => {
                            const container = document.getElementById("NFTListed")
                            if (container) {
                                container.scrollLeft -= 320
                            }
                        }}
                    />
                    <div className={styles.showMoreButton}>
                        <Button
                            text="Show More"
                            onClick={() => {
                                window.location.href = "/sell-nft"
                            }}
                        />
                    </div>
                    <Button
                        icon={<Arrow className={styles.arrows} title="arrow right icon" />}
                        iconLayout="icon-only"
                        onClick={() => {
                            const container = document.getElementById("NFTListed")
                            if (container) {
                                container.scrollLeft += 320
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default NFTListed
