import { Form } from "web3uikit"
import React from "react"

function SellSwapForm({
    title,
    id,
    onSubmit,
    defaultNftAddress,
    defaultTokenId,
    extraFields = [],
}) {
    const commonFields = [
        {
            name: "NFT Address",
            type: "text",
            value: defaultNftAddress,
            inputWidth: "100%",
            key: "nftAddress",
            validation: {
                regExp: /^0x[0-9a-fA-F]{40}$/,
                regExpInvalidMessage:
                    "Please enter a valid Ethereum address in the format 0x1234...",
                required: true,
            },
        },

        {
            name: "Token ID",
            type: "number",
            value: defaultTokenId,
            inputWidth: "100%",
            key: "tokenId",
            validation: {
                regExp: /^[0-9]\d*$/,
                regExpInvalidMessage: "Please enter a positive integer or zero.",
                required: true,
            },
        },
        {
            name: "Price (in ETH)",
            type: "number",
            inputWidth: "100%",
            key: "price",
            step: "0,000000000000000001",
            validation: {
                regExp: /^\d{1,18}(\.\d{1,18})?$/,
                regExpInvalidMessage: "Please enter a positive amount in ETH.",
                required: true,
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
