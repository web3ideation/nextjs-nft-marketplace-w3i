import { ConnectButton } from "web3uikit"
import Link from "next/link"

export default function Header() {
  return (
    /* Styling doesnt get displayed in browser... */
    <nav className="p-5 border-b-2 flex flex-row justify-betwwen items-center">
      <h1 className="py-4 px-4 font-bold text-3xl">NFT Marketplace</h1>
      <div className="flex flex-row items-center">
        <Link className="mr-4 p-6" href="/">
          Home
        </Link>
        <Link className="mr-4 p-6" href="/sell-nft">
          Sell page
        </Link>
        <ConnectButton moralisAuth={false} />
        {/* this means that we do not automatically try to connect to the moralis Database but just to our wallet */}
      </div>
    </nav>
  )
}
