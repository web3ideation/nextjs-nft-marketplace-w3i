import mongoose from "mongoose"

const nftSchema = new mongoose.Schema({
    nftAddress: {
        type: String,
        required: true,
    },
    tokenId: {
        type: Number,
        required: true,
    },
    categories: {
        type: String,
        required: false,
    },
})

const NFT = mongoose.models.NFT || mongoose.model("NFT", nftSchema)

module.exports = NFT
