import React from "react"
import Head from "next/head"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import { WagmiConfig } from "wagmi"
import { wagmiConfig } from "@config"
import { ModalProvider, NftProvider, NotificationProvider } from "@context"
import { Header, Footer, ModalRenderer, Notification, PageLoader } from "@components"
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
                        <NftProvider>
                            <NotificationProvider>
                                <Notification />
                                <Header />
                                <ModalRenderer />
                                <PageLoader>
                                    <Component {...pageProps} />
                                </PageLoader>
                                <Footer />
                            </NotificationProvider>
                        </NftProvider>
                    </ModalProvider>
                </ApolloProvider>
            </WagmiConfig>
        </>
    )
}

export default MyApp
