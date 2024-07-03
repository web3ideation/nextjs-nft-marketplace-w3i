import ActionForm from "@components/SellSwapActionForm/SellSwapActionForm"

const SwapNFT = () => {
    const extraFields = [
        {
            key: "desiredNftAddress",
            label: "Desired NFT Address",
            type: "text",
            placeholder: "0x0000000000000000000000000000000000000000",
        },
        { key: "desiredTokenId", label: "Desired Token ID", type: "number", placeholder: "0" },
    ]

    return <ActionForm action="swap" formTitle="Swap your NFT!" extraFields={extraFields} />
}

export default SwapNFT
