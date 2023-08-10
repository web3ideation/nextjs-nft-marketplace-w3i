import { ConnectButton } from "web3uikit"
import Link from "next/link"
import PopupMenu from './PopupMenu'
import SearchBar from "./SearchBar";

export default function Header() {

  return (
    <nav className="bg-blue-100 p-5 flex flex-row justify-between items-center">
      <div className="flex items-center">
        <Link href="/">
          <img src="/favicon.ico/" className="ml-4 w-12 rounded-3xl"></img>
        </Link>
        <h1 className="py-4 px-4 font-bold text-3xl">NFT Marketplace</h1>
      </div>
      <div className="flex flex-row items-center">
      <SearchBar/>
        <Link href="/sell-nft" className="hover:bg-blue-500 bg-blue-400 flex justify-center items-center mr-4 p-2 w-32 rounded-2xl shadow">
          <div className="">Sell NFT</div>
        </Link>
        <Link href="/collections" className="hover:bg-blue-500 bg-blue-400 flex justify-center items-center mr-4 p-2 w-32 rounded-2xl shadow">
          <div className="">Collections</div>
        </Link>
        <Link href="" className="hover:bg-blue-500 bg-blue-400 flex justify-center items-center p-2 w-32 rounded-2xl shadow">
          <div className="">Create</div>
        </Link>
        <div className="connect-button">
          <ConnectButton className="rounded-2xl shadow" 
          moralisAuth={false}
          />
        </div>
        <div className="button bg-blue-100">
            <PopupMenu className="hover:bg-blue-500 bg-blue-400 flex justify-center items-center p-2 w-32 rounded-2xl shadow" />
        </div>
      </div>
    </nav>
  )
}
