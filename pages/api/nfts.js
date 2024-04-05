import connectDB from "../../database/config/mongodb"
import NFTMinimal from "../../database/models/NFTMinimal"
import NFTExtended from "../../database/models/NFTExtended"
import NFTDetailed from "../../database/models/NFTDetailed"

connectDB()

function checkRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(
        (field) => !data.hasOwnProperty(field) || data[field] == null || data[field] === ""
    )
    return missingFields
}

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const nfts = await NFTMinimal.find({}) // Alle NFTs abrufen
            res.status(200).json(nfts)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else if (req.method === "POST") {
        try {
            const requiredFieldsForNFTMinimal = ["nftAddress", "tokenId"]
            const missingFields = checkRequiredFields(req.body, requiredFieldsForNFTMinimal)

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: "Fehlende erforderliche Felder für NFTMinimal",
                    missingFields: missingFields,
                })
            }
            const {
                nftAddress,
                tokenId,
                listingId,
                isListed,
                category = "uncategorized",
                price,
                collectionName,
                tokenSymbol,
                imageURI,
                tokenName,
                tokenOwner,
                tokenDescription,
                highestListingId,
                external_url,
                attributes,
                desiredNftAddress,
                desiredTokenId,
                seller,
                buyer = "",
                buyerCount = 0,
                loveCount = 0,
                tokenURI = "",
                __typename,
            } = req.body

            // Initialisiere ein Update-Objekt für NFTMinimal
            let updateNFTMinimal = { listingId, isListed }

            // Füge 'category' nur hinzu, wenn es explizit im Request angegeben wurde
            if (req.body.hasOwnProperty("category")) {
                updateNFTMinimal.category = category
            }

            const nftMinimalDoc = await NFTMinimal.findOneAndUpdate(
                { nftAddress, tokenId },
                { $set: updateNFTMinimal },
                { new: true, upsert: true }
            )

            const nftExtendedDoc = await NFTExtended.findOneAndUpdate(
                { nftMinimal: nftMinimalDoc._id },
                { $set: { price, collectionName, tokenSymbol, imageURI } },
                { new: true, upsert: true }
            )

            const nftDetailedDoc = await NFTDetailed.findOneAndUpdate(
                { nftExtended: nftExtendedDoc._id },
                {
                    $set: {
                        tokenName,
                        tokenOwner,
                        tokenDescription,
                        highestListingId,
                        external_url,
                        attributes,
                        desiredNftAddress,
                        desiredTokenId,
                        seller,
                        buyer,
                        buyerCount,
                        loveCount,
                        tokenURI,
                        __typename,
                    },
                },
                { new: true, upsert: true }
            )

            return res.status(201).json({
                message: "NFT erfolgreich gespeichert",
                nft: { nftMinimalDoc, nftExtendedDoc, nftDetailedDoc },
            })
        } catch (error) {
            console.error("Fehler beim Speichern des NFT: ", error)
            res.status(500).json({
                message: "Fehler beim Speichern des NFT",
                error: error.message,
            })
        }
    } else {
        // Behandlung anderer Methoden
        res.status(405).json({ message: `Methode ${req.method} nicht erlaubt` })
    }
}
