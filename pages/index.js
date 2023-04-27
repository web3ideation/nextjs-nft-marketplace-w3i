import Image from "next/image"
import styles from "../styles/Home.module.css" // !!! muss hier ein @ statt den .. hin? dann kann ich die datei ja auch löschen...
import Header from "../components/Header"

export default function Home() {
  return <div className={styles.container}>Homepage</div>
}

// !!! Patrick is converting the NFT URI and image URI from ipfs to http bc most browsers dont support ipfs out of the box. I should find a way to default display the ipfs way and only if that doesnt work it should automatically use the https. but ipfs would be slower...
// !!! the next js <image/> tag stops us from making this a static site, thus it cant be hosted on ipfs (that means it would be hosted centralized)... how do i decentralize it then? what about fleek or vercel? Is there an alternative to the <image/> tag? Maybe I should develop two versions of the site, one being with the centralized things like URI Http and the <image /> tags and the other one being static...
