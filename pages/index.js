import { useMoralis } from "react-moralis"
import React from "react"
import NFTListed from "../components/NFTListed"
import NFTTopCollections from "../components/NFTTopCollections"

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()

    return (
        <div>
            <NFTListed isWeb3Enabled={isWeb3Enabled} chainId={chainId} />
        </div>
    )
}
