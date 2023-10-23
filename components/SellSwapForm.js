import React, { useState, useRef } from "react"
import { Button } from "web3uikit"
import styles from "../styles/Home.module.css"
import Tooltip from "../components/Tooltip"

function SellSwapForm({
    title,
    key,
    onSubmit,
    defaultNftAddress,
    defaultTokenId,
    extraFields = [],
}) {
    const [focusedField, setFocusedField] = useState(null)
    const formRef = useRef(null)

    const [formData, setFormData] = useState({
        nftAddress: defaultNftAddress,
        tokenId: defaultTokenId,
        price: "",
        ...extraFields.reduce((acc, field) => {
            acc[field.key] = ""
            return acc
        }, {}),
    })

    const [errors, setErrors] = useState({
        nftAddress: "",
        tokenId: "",
        price: "",
    })

    function valkeyateField(name, value) {
        let errorMessage = ""

        switch (name) {
            case "nftAddress":
            case "desiredNftAddress":
                if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
                    errorMessage = "Please enter a valkey Ethereum address in the format 0x1234..."
                }
                break
            case "tokenId":
            case "desiredTokenId":
                if (!/^[0-9]\d*$/.test(value)) {
                    errorMessage = "Please enter a positive integer or zero."
                }
                break
            case "price":
                if (!/^\d{1,18}(\.\d{1,18})?$/.test(value)) {
                    errorMessage = "Please enter a positive amount in ETH."
                }
                break
            default:
                break
        }
        // Set the current error
        setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }))

        return errorMessage === ""
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }

    function valkeyateForm(data) {
        let isValkey = true

        // Valkeyate each field and update the isValkey status
        Object.keys(data).forEach((key) => {
            if (!valkeyateField(key, data[key])) {
                isValkey = false
            }
        })

        return isValkey
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (valkeyateForm(formData)) {
            onSubmit(formData)
        }
    }

    return (
        <form className={styles.sellSwapForm} onSubmit={handleSubmit} key={key} ref={formRef}>
            <h2>{title}</h2>
            <div className={styles.formInputWrapper}>
                <div className={styles.formInput}>
                    <label htmlFor="nftAddress">NFT Address</label>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            key="nftAddress"
                            name="nftAddress"
                            placeholder="0x0000000000000000000000000000000000000000"
                            value={formData.nftAddress}
                            onChange={handleChange}
                            onBlur={(e) => {
                                valkeyateField(e.target.name, e.target.value)
                                setFocusedField(null)
                            }}
                            onFocus={() => {
                                setFocusedField("nftAddress")
                                setErrors("")
                            }}
                            className={focusedField === "nftAddress" ? styles.inputFocused : ""}
                        />{" "}
                        {errors.nftAddress && <Tooltip message={errors.nftAddress} />}
                    </div>
                </div>{" "}
            </div>
            <div className={styles.formInputWrapper}>
                <div className={styles.formInput}>
                    <label htmlFor="tokenId">Token Id</label>
                    <div className={styles.inputWrapper}>
                        <input
                            type="number"
                            id="tokenId"
                            name="tokenId"
                            placeholder="0"
                            value={formData.tokenId}
                            onChange={handleChange}
                            onBlur={(e) => {
                                valkeyateField(e.target.name, e.target.value)
                                setFocusedField(null)
                            }}
                            onFocus={() => {
                                setFocusedField("tokenId")
                                setErrors("")
                            }}
                            className={focusedField === "tokenId" ? styles.inputFocused : ""}
                        />{" "}
                        {errors.tokenId && <Tooltip message={errors.tokenId} />}
                    </div>
                </div>{" "}
            </div>
            <div className={styles.formInputWrapper}>
                <div className={styles.formInput}>
                    <label htmlFor="price">Price (in ETH)</label>
                    <div className={styles.inputWrapper}>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            placeholder="min. amount: 0.000000000000000001"
                            step="0.000000000000000001"
                            value={formData.price}
                            onChange={handleChange}
                            onBlur={(e) => {
                                valkeyateField(e.target.name, e.target.value)
                                setFocusedField(null)
                            }}
                            onFocus={() => {
                                setFocusedField("tokenId")
                                setErrors("")
                            }}
                            className={focusedField === "price" ? styles.inputFocused : ""}
                        />
                        {errors.price && <Tooltip message={errors.price} />}
                    </div>{" "}
                </div>
            </div>
            {extraFields.map((field) => (
                <div key={field.key} className={styles.formInputWrapper}>
                    <div className={styles.formInput}>
                        <label htmlFor={field.key}>{field.name}</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type={field.type}
                                key={field.key}
                                name={field.name}
                                placeholder={field.placeholder}
                                value={formData[field.key]}
                                onChange={handleChange}
                                onBlur={(e) => {
                                    valkeyateField(e.target.name, e.target.value)
                                    setFocusedField(null)
                                }}
                                onFocus={() => {
                                    setFocusedField(field.key)
                                    setErrors("")
                                }}
                                className={focusedField === field.key ? styles.inputFocused : ""}
                            />
                            {errors[field.key] && <Tooltip message={errors[field.key]} />}
                        </div>
                    </div>
                </div>
            ))}
            <Button type="submit" text="Submit" />
        </form>
    )
}

export default SellSwapForm
