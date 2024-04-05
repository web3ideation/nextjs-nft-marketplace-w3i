import mongoose from "mongoose"

const nftExtendedSchema = new mongoose.Schema({
    nftMinimal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NFTMinimal",
        required: true,
    },
    price: {
        type: Number,
        index: true,
    },
    collectionName: {
        type: String,
        index: true,
    },
    tokenSymbol: {
        type: String,
        index: true,
    },
    imageURI: {
        type: Object,
    },
})

nftExtendedSchema.index({ nftMinimal: 1 })

const NFTExtended = mongoose.models.NFTExtended || mongoose.model("NFTExtended", nftExtendedSchema)

export default NFTExtended
