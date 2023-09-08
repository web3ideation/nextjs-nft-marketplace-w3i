import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import Head from "next/head"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"
import Header from "../components/Header"
import "../styles/globals.css"
import SearchResultPage from "./SearchResultPage"
import React, { useEffect, useState } from "react"
import LoadingIcon from "../public/LoadingIcon";
import styles from "../styles/Home.module.css"

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL, // !!!W this is centralized!
})

function MyApp({ Component, pageProps }) {
  const [searchResults, setSearchResults] = useState([]) // Responsible for the search results
  const [isLoading, setIsLoading] = useState(true); // Zustandsvariable für die Ladeanzeige

  useEffect(() => {
    // Simuliere eine kurze Ladezeit (kann durch deine tatsächliche Ladezeit ersetzt werden)
    setTimeout(() => {
      setIsLoading(false); // Setze isLoading auf false, wenn die Seite geladen ist
    }, 2000); // Ändere die Dauer nach Bedarf
  }, []);

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
            {/* Zeige das Ladezeitsymbol, bis isLoading auf false gesetzt wird */}
            {isLoading ? (
              <div className={styles.loadingIcon}>
                <LoadingIcon />
              </div>
            ) : (
              <>
                <Component {...pageProps} setSearchResults={setSearchResults} />
                {searchResults.length > 0 && <SearchResultPage searchResults={searchResults} />}
              </>
            )}
          </NotificationProvider>
        </ApolloProvider>
      </MoralisProvider>
    </div>
  )
}

export default MyApp
