import { useMoralis } from "react-moralis"
import React from "react"
import NFTListed from "../components/NFTListed"

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()

    return (
        <div>
            <NFTListed isWeb3Enabled={isWeb3Enabled} chainId={chainId} />
        </div>
    )
}
