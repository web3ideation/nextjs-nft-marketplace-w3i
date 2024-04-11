import React from "react"

import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import Head from "next/head"
import { WagmiConfig } from "wagmi"
import { wagmiConfig } from "@config/wagmiConfig"

import { NftNotificationProvider } from "@context/NotificationProvider"
import { SearchResultsProvider } from "@context/SearchResultsProvider"
import { NFTProvider } from "@context/NFTDataProvider"
import { ModalProvider } from "@context/ModalProvider"

import ModalRenderer from "@components/Main/Modal/ModalRenderer"
import NftNotification from "@components/Main/Notification/NFTNotification"
import Header from "@components/Header/Header"
import Footer from "@components/Footer/Footer"

import "@styles/globals.scss"

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
})

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>NFT Marketplace</title>
                <meta name="robots" content="noindex, nofollow" />
                <meta name="description" content="NFT Marketplace" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="author" content="Web3Ideation" />
                <meta name="copyright" content="Web3Ideation" />
                <link rel="icon" href="/media/only-lightbulb-favicone.ico" />
                <link rel="canonical" href="https://ideationmarket.com" />
            </Head>
            <WagmiConfig config={wagmiConfig}>
                <ApolloProvider client={client}>
                    <ModalProvider>
                        <NFTProvider>
                            <NftNotificationProvider>
                                <NftNotification />
                                <Header />
                                <ModalRenderer />
                                <SearchResultsProvider>
                                    <Component {...pageProps} />
                                </SearchResultsProvider>
                                <Footer />
                            </NftNotificationProvider>
                        </NFTProvider>
                    </ModalProvider>
                </ApolloProvider>
            </WagmiConfig>
        </>
    )
}

export default MyApp
