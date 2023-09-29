import React, { useEffect, useState, useRef } from "react"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import { GET_ACTIVE_ITEMS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import { ArrowLeft, Arrow } from "@web3uikit/icons"
import SearchSideFilters from "../components/SearchSideFilters"
import { Chart } from "@web3uikit/icons"

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
    const { loading, data } = useQuery(GET_ACTIVE_ITEMS)

    const [sortingOption, setSortingOption] = useState("default")
    const [selectedCategory, setSelectedCategory] = useState("default")
    const [selectedCollection, setSelectedCollection] = useState("default")

    const handleSortingChange = (event, sortingType) => {
        setSortingOption(sortingType)
        let sortedResults = [...activeSearchResultsFromQuery] // Create a new array to avoid modifying the original
        console.log(activeSearchResultsFromQuery)
        switch (sortingType) {
            case "Active Items":
                // Default sorting by ID (you can replace with appropriate field)
                sortedResults.sort((a, b) => a.id.localeCompare(b.id))
                break
            case "Inactive Items":
                // Sorting by a different field (replace with appropriate field)
                sortedResults.sort((a, b) => a.someField.localeCompare(b.someField))
                break
            default:
                // Use default sorting logic here
                break
        }
    }
    const handleCategoryChange = (event, selectedCategory) => {
        setSelectedCategory(selectedCategory)
        const filteredResults = searchResults.filter(
            (result) => result.category === selectedCategory
        )
        console.log("Choosen category:", selectedCategory)
        // Hier können Sie Ihre Verarbeitungslogik hinzufügen, um die Suchergebnisse basierend auf der ausgewählten Kategorie zu filtern oder sortieren.
        setSearchResults(filteredResults)
        console.log("Here are the results filtered by categories" + filteredResults)
    }

    const handleCollectionChange = (even, selectedCollection) => {
        setSelectedCollection(selectedCollection)
        const filteredResults = searchResults.filter(
            (result) => result.category === selectedCollection
        )
        console.log("Choosen collection:", selectedCollection)
        // Hier können Sie Ihre Verarbeitungslogik hinzufügen, um die Suchergebnisse basierend auf der ausgewählten Kategorie zu filtern oder sortieren.
        setSearchResults(filteredResults)
        console.log("Here are the results filtered by collections" + filteredResults)
    }

    console.log("Chain ID:" + chainId)
    console.log("Listed nfts:" + data)

    const [images, setImages] = useState({})

    useEffect(() => {
        if (chainId && !loading && data) {
            data.items.forEach((nft) => {
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
    }, [chainId, loading, data])

    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

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
                    ref={menuRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <p>Filter</p>
                    {isOpen && (
                        <SearchSideFilters
                            buttonText="Show all"
                            options={[
                                { id: "active", label: "Active Items" },
                                { id: "inactive", label: "Inactive Items" },
                            ]}
                            onChange={(event, sortingType) =>
                                handleSortingChange(event, sortingType)
                            }
                            value={sortingOption}
                        />
                    )}
                    <div>
                        {isOpen && (
                            <div className="">
                                <SearchSideFilters
                                    buttonText="Categories"
                                    options={[
                                        { id: "wearables", label: "Wearables" },
                                        { id: "utillities", label: "Utillities" },
                                    ]}
                                    onChange={(event, selectedCategory) =>
                                        handleCategoryChange(event, selectedCategory)
                                    }
                                    value={selectedCategory}
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
                                    onChange={(event, selectedCollection) =>
                                        handleCollectionChange(event, selectedCollection)
                                    }
                                    value={selectedCollection}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className={styles.nftListWrapper}>
                <h1>Recently Listed</h1>
                <div id="NFTListed" className={styles.nftList}>
                    {loading || !data ? (
                        <div>Loading...</div>
                    ) : (
                        data.items.map((nft) => {
                            const { price, nftAddress, tokenId, seller } = nft
                            const imgSrc = images[tokenId] || ""

                            return (
                                <NFTBox
                                    price={price}
                                    nftAddress={nftAddress}
                                    tokenId={tokenId}
                                    marketplaceAddress={marketplaceAddress}
                                    seller={seller}
                                    key={`${nftAddress}${tokenId}`}
                                    imgSrc={imgSrc}
                                />
                            )
                        })
                    )}
                </div>
                <div className={styles.moreButton}>
                    <Button
                        icon={<ArrowLeft className={styles.arrows} title="arrow left icon" />}
                        iconLayout="icon-only"
                        onClick={() => {
                            const container = document.getElementById("NFTListed")
                            if (container) {
                                container.scrollLeft -= 226
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
                                container.scrollLeft += 226
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default NFTListed
