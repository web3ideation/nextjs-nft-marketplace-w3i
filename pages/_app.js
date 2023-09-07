import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import Head from "next/head"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"
import Header from "../components/Header"
import "../styles/globals.css"
import SearchResultPage from "./SearchResultPage"
import React, { useState } from "react"

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL, // !!!W this is centralized!
})

function MyApp({ Component, pageProps }) {
  const [searchResults, setSearchResults] = useState([]) // Responsible for the search results
  return (
    <div>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="NFT Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider initializeOnMount={false}>
        <ApolloProvider client={client}>
          <NotificationProvider>
            <Header setSearchResults={setSearchResults} />

            <Component {...pageProps} setSearchResults={setSearchResults} />
            {searchResults.length > 0 && <SearchResultPage searchResults={searchResults} />}
          </NotificationProvider>
        </ApolloProvider>
      </MoralisProvider>
    </div>
  )
}

export default MyApp
