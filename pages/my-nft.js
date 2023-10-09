import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import styles from "../styles/Home.module.css"
import { ConnectButton } from "web3uikit"

export default function Home() {
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    const {
        loading: loadingActive,
        data: dataActive,
        error: activeError,
    } = useQuery(GET_ACTIVE_ITEMS)
    const {
        loading: loadingInactive,
        data: dataInactive,
        error: inactiveError,
    } = useQuery(GET_INACTIVE_ITEMS)
    const [allItems, setAllItems] = useState([])

    const [hasOwnNFT, setHasOwnNFT] = useState(false)

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

    const isOwnedByUser = (seller) => seller === account || seller === undefined

    useEffect(() => {
        const hasNFT = allItems.some((nft) => isOwnedByUser(nft.seller))
        if (hasNFT !== hasOwnNFT) {
            setHasOwnNFT(hasNFT)
        }
    }, [allItems])

    if (loadingActive || !dataActive || loadingInactive || !dataInactive) {
        return <div>Loading...</div>
    }
    if (activeError || inactiveError) {
        return <div>Error loading NFTs: {activeError?.message || inactiveError?.message}</div>
    }

    return (
        <div className={styles.nftListWrapper}>
            <h1>My NFT</h1>
            <div className={styles.nftList}>
                <div className="flex flex-wrap pb-4">
                    {isWeb3Enabled && chainId ? (
                        !hasOwnNFT ? (
                            <div>Go get some NFTs for yourself!!!</div>
                        ) : (
                            allItems.map((nft) =>
                                isOwnedByUser(nft.seller) ? (
                                    <NFTBox
                                        price={nft.price}
                                        nftAddress={nft.nftAddress}
                                        tokenId={nft.tokenId}
                                        marketplaceAddress={marketplaceAddress}
                                        seller={nft.seller}
                                        isListed={nft.isListed}
                                        key={`${nft.nftAddress}${nft.tokenId}${nft.listingId}`}
                                    />
                                ) : null
                            )
                        )
                    ) : (
                        <div>
                            <h2>Web3 is currently not enabled - Connect your Wallet here</h2>
                            <ConnectButton />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
