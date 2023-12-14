// Importing React, Next.js, Apollo Client, and other necessary libraries
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import React, { useEffect, useState } from "react"
import Head from "next/head"
import { WagmiConfig } from "wagmi"
import { wagmiConfig } from "../config/wagmiConfig"

// Importing context providers and components
import { NftNotificationProvider } from "../context/NFTNotificationContext"
import { SearchResultsProvider } from "../context/SearchResultsContext"
import { NFTProvider, useNFT } from "../context/NFTContextProvider"
import NftNotification from "../components/NFTNotification"
import Header from "../components/Header"
import LoadingWave from "../components/LoadingWave"
import Footer from "../components/Footer"

// Importing global styles
import "../styles/globals.css"
import styles from "../styles/Home.module.css"

// Initialize Apollo Client
const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL, // Set environment variable for GraphQL endpoint
})

function MyApp({ Component, pageProps }) {
    const { isLoading } = useNFT()
    const [showLoading, setShowLoading] = useState(isLoading)

    // Effect to manage the loading state
    useEffect(() => {
        if (isLoading) {
            setShowLoading(true)
        } else if (!isLoading && showLoading) {
            // Delay to hide loading component
            const timer = setTimeout(() => setShowLoading(false), 5000) // 5-second delay
            return () => clearTimeout(timer) // Clean up timer on component unmount
        }
    }, [isLoading, showLoading])

    return (
        <>
            <Head>
                {" "}
                <title>NFT Marketplace</title>
                <meta name="description" content="NFT Marketplace" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="author" content="Web3Ideation" />
                <meta name="copyright" content="Web3Ideation" />
                <link rel="icon" href="/media/only-lightbulb-favicone.ico" />
                <link rel="canonical" href="https://w3i-marketplace.com" />
            </Head>
            <WagmiConfig config={wagmiConfig}>
                <ApolloProvider client={client}>
                    <NFTProvider>
                        <NftNotificationProvider>
                            <NftNotification />
                            <SearchResultsProvider>
                                <Header />
                                {showLoading ? (
                                    <div className={styles.loadingContainerMain}>
                                        <div className={styles.loadingWrapperMain}>
                                            <LoadingWave />
                                        </div>
                                    </div>
                                ) : (
                                    <Component {...pageProps} />
                                )}
                            </SearchResultsProvider>
                        </NftNotificationProvider>
                    </NFTProvider>
                </ApolloProvider>
            </WagmiConfig>
            <Footer />
        </>
    )
}

export default MyApp
