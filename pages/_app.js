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
import { NFTProvider, useNFT } from "../context/NFTContextProvider"
import styles from "../styles/Home.module.css"

// Initialize Apollo Client with the GraphQL endpoint
const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL, // Ensure this environment variable is set
})

function MyApp({ Component, pageProps }) {
    const { isLoading } = useNFT()
    const [showLoading, setShowLoading] = useState(isLoading)

    console.log("isLoading:", isLoading)
    console.log("showLoading:", showLoading)

    useEffect(() => {
        console.log("Is loading app", isLoading)
        if (isLoading) {
            // Zeige die Ladekomponente sofort an, wenn isLoading true ist
            setShowLoading(true)
        } else if (!isLoading && showLoading) {
            // Setze eine Verzögerung, bevor die Ladekomponente ausgeblendet wird
            const timer = setTimeout(() => setShowLoading(false), 5000) // Verzögerung von 1 Sekunde
            return () => clearTimeout(timer) // Bereinige den Timer bei Komponentenabbau
        }
    }, [isLoading, showLoading])

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
            {/* Wrap the entire application with context providers to manage global state */}
            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    {" "}
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
            </MoralisProvider>
            <Footer />
        </div>
    )
}

export default MyApp
