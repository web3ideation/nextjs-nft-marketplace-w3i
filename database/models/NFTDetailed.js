import mongoose from "mongoose"

const nftDetailedSchema = new mongoose.Schema({
    nftExtended: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NFTExtended",
        required: true,
    },
    tokenName: {
        type: String,
        index: true,
    },
    tokenOwner: {
        type: String,
        required: true,
    },
    tokenDescription: {
        type: String,
        index: true,
    },
    external_url: {
        type: String,
    },
    attributes: {
        type: Object,
        index: true,
    },
    desiredNftAddress: {
        type: String,
    },
    desiredTokenId: {
        type: Number,
    },
    buyerCount: {
        type: Number,
        index: true,
    },
    loveCount: {
        type: Number,
        index: true,
    },
})

nftDetailedSchema.index({ nftExtended: 1 })

const NFTDetailed = mongoose.models.NFTDetailed || mongoose.model("NFTDetailed", nftDetailedSchema)

export default NFTDetailed
