import { Form } from "web3uikit"

function SellSwapForm({ title, id, onSubmit, buttonText, extraFields = [] }) {
    // Define the common fields for both forms
    const commonFields = [
        {
            name: "NFT Address",
            type: "text",
            inputWidth: "100%",
            value: "",
            key: "nftAddress",
            validation: {
                regExp: /^0x[0-9a-fA-F]{40}$/,
                regExpInvalidMessage:
                    "Please enter a valid Ethereum address in the format 0x1234...",
            },
        },
        {
            name: "Token ID",
            type: "number",
            inputWidth: "100%",
            value: "number",
            key: "tokenId",
            validation: {
                regExp: /^[0-9]\d*$/,
                regExpInvalidMessage: "Please enter a positive integer or zero.",
            },
        },
        {
            name: "Price (in ETH)",
            type: "number",
            inputWidth: "100%",
            key: "price",
            validation: {
                regExp: /^\d{1,18}(\.\d{1,18})?$/,
                regExpInvalidMessage: "Please enter a positive amount in ETH.",
            },
        },
    ]

    const allFields = [...commonFields, ...extraFields]

    return (
        <>
            <Form onSubmit={onSubmit} data={allFields} title={title} id={id} />
        </>
    )
}

export default SellSwapForm
