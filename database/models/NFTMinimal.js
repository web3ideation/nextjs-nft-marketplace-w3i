import mongoose from "mongoose"

const nftMinimalSchema = new mongoose.Schema({
    nftAddress: {
        type: String,
        required: true,
    },
    tokenId: {
        type: Number,
        required: true,
    },
    listingId: {
        type: Number,
    },
    isListed: {
        type: Boolean,
        index: true,
    },
    category: {
        type: Array,
        index: true,
    },
})

nftMinimalSchema.index({ nftAddress: 1, tokenId: 1 }, { unique: true })

const NFTMinimal = mongoose.models.NFTMinimal || mongoose.model("NFTMinimal", nftMinimalSchema)

export default NFTMinimal
