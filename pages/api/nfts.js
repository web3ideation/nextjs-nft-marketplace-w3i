import connectDB from "../../database/config/mongodb" // Pfad zur Datenbankverbindungsfunktion
import NFT from "../../database/models/NFT" // Pfad zum NFT-Modell

connectDB()

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const nfts = await NFT.find({}) // Alle NFTs abrufen
            res.status(200).json(nfts)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else if (req.method === "POST") {
        try {
            const { nftAddress, tokenId, tokenDescription } = req.body
            const newNft = new NFT({
                nftAddress,
                tokenId,
                tokenDescription,
            })
            await newNft.save()
            res.status(201).json({ message: "NFT erfolgreich gespeichert", nft: newNft })
        } catch (error) {
            res.status(500).json({
                message: "Fehler beim Speichern des NFT",
                error: error.message,
            })
        }
    } else {
        res.status(405).json({ message: `Methode ${req.method} nicht erlaubt` })
    }
}
