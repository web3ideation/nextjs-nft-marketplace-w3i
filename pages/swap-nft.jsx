import NFTActionForm from "@components/Main/SellSwapActionForm/SellSwapActionForm"

const SwapNFT = () => {
    const extraFields = [
        {
            name: "Desired NFT Address",
            type: "text",
            key: "desiredNftAddress",
            placeholder: "0x0000000000000000000000000000000000000000",
        },
        { name: "Desired Token ID", type: "number", key: "desiredTokenId", placeholder: "0" },
    ]

    return <NFTActionForm action="sell" formTitle="Swap your NFT!" extraFields={extraFields} />
}

export default SwapNFT
