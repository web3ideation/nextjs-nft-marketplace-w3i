import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import Head from "next/head"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"
import { NFTProvider } from "../components/NFTContextProvider"
import { SearchResultsProvider } from "../components/SearchResultsContext"
import Header from "../components/Header"
import "../styles/globals.css"
import React, { useEffect, useState } from "react"
import LoadingIcon from "../public/LoadingIcon"
import styles from "../styles/Home.module.css"
import Footer from "../components/Footer"

// Initialize Apollo Client
const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL, // !!!W Note: This is centralized!
})

function MyApp({ Component, pageProps }) {
    // State for loading indication
    const [isLoading, setIsLoading] = useState(true)

    // Set a timeout to simulate loading
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 400) // Duration for loading symbol
    }, [])

    return (
        <div>
            <Head>
                <title>NFT Marketplace</title>
                <meta name="description" content="NFT Marketplace" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="author" content="Web3Ideation" />
                <meta name="copyright" content="Web3Ideation" />
                <link rel="icon" href="/media/only-lightbulb-favicone.ico" />
                <link rel="canonical" href="https://w3i-marketplace.com" />
            </Head>
            {/* Wrap the app with necessary providers */}
            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <NFTProvider>
                            <SearchResultsProvider>
                                <Header />
                                {/* Display loading icon or the component based on isLoading state */}
                                {isLoading ? (
                                    <div className={styles.mainLoadingIconWrapper}>
                                        <LoadingIcon className={styles.mainLoadingIcon} />
                                    </div>
                                ) : (
                                    <Component {...pageProps} />
                                )}
                            </SearchResultsProvider>
                        </NFTProvider>
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
            <Footer />
        </div>
    )
}

export default MyApp
