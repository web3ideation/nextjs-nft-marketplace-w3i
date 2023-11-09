import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import Head from "next/head"
import { MoralisProvider } from "react-moralis"
import { NftNotificationProvider } from "../context/NFTNotificationContext"
import NftNotification from "../components/NFTNotification"
import { SearchResultsProvider } from "../context/SearchResultsContext"
import Header from "../components/Header"
import "../styles/globals.css"
import React, { useEffect, useState } from "react"
import LoadingWave from "../components/LoadingWave"
import Footer from "../components/Footer"
import { NFTProvider } from "../context/NFTContextProvider"
import styles from "../styles/Home.module.css"

// Initialize Apollo Client with the GraphQL endpoint
const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL, // Ensure this environment variable is set
})

function MyApp({ Component, pageProps }) {
    // State to control the loading indicator
    const [isLoading, setIsLoading] = useState(true)

    // Simulate loading for a better user experience
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false) // Hide loading after 2 seconds
        }, 2000)
        return () => clearTimeout(timer) // Clear the timeout if the component unmounts
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
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
                    rel="stylesheet"
                />
            </Head>
            {/* Wrap the entire application with context providers to manage global state */}
            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    {" "}
                    <NFTProvider>
                        <NftNotificationProvider>
                            <NftNotification />
                            <SearchResultsProvider>
                                <Header />
                                {isLoading ? (
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
            </MoralisProvider>
            <Footer />
        </div>
    )
}

export default MyApp
