// Importing React core
import React from "react"

// Importing third-party libraries and integrations
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import Head from "next/head"
import { WagmiConfig } from "wagmi"
import { wagmiConfig } from "../config/wagmiConfig"

// Importing context providers from local context directory
import { NftNotificationProvider } from "../context/NotificationProvider"
import { SearchResultsProvider } from "../context/SearchResultsProvider"
import { NFTProvider } from "../context/NFTDataProvider"

// Importing components from local components directory
import NftNotification from "../components/Main/Notification/NFTNotification"
import Header from "../components/Header/Header"
import Footer from "../components/Footer/Footer"

// Importing global styles
import "../styles/globals.css"

// Apollo Client Initialization with environment variable for GraphQL endpoint
const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
})

/**
 * MyApp Component - Main Application Wrapper
 * This component sets up the global providers and layout for the application.
 * It includes configurations for Apollo Client, global styles, and the WagmiConfig for Web3 integrations.
 *
 * @param {Object} props - Component properties
 * @param {JSX.Element} props.Component - The active page component.
 * @param {Object} props.pageProps - Properties passed to the page component.
 * @returns {JSX.Element} The rendered application component.
 */
function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
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
                            <Header />
                            <SearchResultsProvider>
                                <Component {...pageProps} />
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
