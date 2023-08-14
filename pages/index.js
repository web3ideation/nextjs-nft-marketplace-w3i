import { useMoralis } from "react-moralis"
import React from "react"
import NFTListed from "../components/NFTListed"

export default function Home() {
  const { isWeb3Enabled, chainId } = useMoralis()

  return (
        <NFTListed isWeb3Enabled={isWeb3Enabled} chainId={chainId} />
  )
}

// !!!W Patrick is converting the NFT URI and image URI from ipfs to http bc most browsers dont support ipfs out of the box. I should find a way to default display the ipfs way and only if that doesnt work it should automatically use the https. but ipfs would be slower...
// !!!W the next js <image/> tag stops us from making this a static site, thus it cant be hosted on ipfs (that means it would be hosted centralized)... how do i decentralize it then? what about fleek or vercel? Is there an alternative to the <image/> tag? Maybe I should develop two versions of the site, one being with the centralized things like URI Http and the <image /> tags and the other one being static...
