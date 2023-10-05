import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import Head from "next/head"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"
import { SearchResultsProvider } from "../components/SearchResultsContext"
import Header from "../components/Header"
import "../styles/globals.css"
import React, { useEffect, useState } from "react"
import LoadingIcon from "../public/LoadingIcon"
import styles from "../styles/Home.module.css"

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL, // !!!W this is centralized!
})

function MyApp({ Component, pageProps }) {
    const [isLoading, setIsLoading] = useState(true) // Responsible for loading

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
                <link rel="icon" href="/media/only-lightbulb-favicone.ico" />
            </Head>
            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <SearchResultsProvider>
                            <Header />
                            {/* Zeige das Ladezeitsymbol, bis isLoading auf false gesetzt wird */}
                            {isLoading ? (
                                <div>
                                    <div className={styles.mainLoadingIconWrapper}>
                                        <LoadingIcon className={styles.mainLoadingIcon} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Component {...pageProps} />
                                </>
                            )}
                        </SearchResultsProvider>
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
        </div>
    )
}

export default MyApp
