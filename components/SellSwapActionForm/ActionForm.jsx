import { useEffect, useState, useCallback, useRef, useMemo, use } from "react"
import { useRouter } from "next/router"
import { usePublicClient, useAccount } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { useNFT, useModal } from "@context"
import { networkMapping } from "@constants"
import {
    useWalletNFTs,
    useApprove,
    useListItem,
    useGetApproved,
    useEthToCurrencyRates,
} from "@hooks"
import { ConnectWalletBtn, BtnWithAction, LoadingWave, List } from "@components"
import { capitalizeFirstChar, validateField } from "@utils"
import { InputFields, Information } from "./index"
import styles from "./ActionForm.module.scss"

const ActionForm = ({ action, formTitle, extraFields = [] }) => {
    const [isClient, setIsClient] = useState(false)
    useEffect(() => {
        setIsClient(true)
    }, [])
    const router = useRouter()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const formRef = useRef(null)
    const { openModal, modalContent, modalType, closeModal, currentModalId } = useModal()
    const { data: nftsData, isLoading: nftsLoading, reloadNFTs } = useNFT()
    const { address, isConnected } = useAccount()
    const { nfts } = useWalletNFTs(address)
    const [unlistedNfts, setUnlistedNfts] = useState([])
    const { open } = useWeb3Modal()

    const initialFormData = useMemo(
        () => ({
            nftAddress: router.query.nftAddress || "",
            tokenId: router.query.tokenId || "",
            price: router.query.price || "",
            ...extraFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {}),
            categories: [],
        }),
        [router.query.nftAddress, router.query.tokenId, router.query.price, extraFields]
    )

    useEffect(() => {
        if (router.query.nftAddress && router.query.tokenId) {
            setFormData((prev) => ({
                ...prev,
                nftAddress: router.query.nftAddress,
                tokenId: router.query.tokenId,
                price: router.query.price,
            }))
        }
    }, [router.query.nftAddress, router.query.tokenId, router.query.price])

    useEffect(() => {
        if (nftsData) {
            const listedNftsSet = new Set(
                nftsData.map((nft) => `${nft.nftAddress}-${nft.tokenId}`)
            )
            const filteredNfts = nfts.filter(
                (nft) => !listedNftsSet.has(`${nft.nftAddress}-${nft.tokenId}`)
            )
            setUnlistedNfts(filteredNfts)
        }
    }, [nfts, nftsData])

    useEffect(() => {
        reloadNFTs()
    }, [address, reloadNFTs])

    const { ethToCurrencyRates } = useEthToCurrencyRates()
    const [formData, setFormData] = useState(initialFormData)
    const [ethPrice, setEthPrice] = useState(formData.price)
    const [currency, setCurrency] = useState("EUR") // Standardwährung EUR
    const [currencyPrice, setCurrencyPrice] = useState("")
    const [activeInput, setActiveInput] = useState(null) // Neuer State für aktives Eingabefeld

    const initialErrors = useMemo(
        () => ({
            nftAddress: "",
            tokenId: "",
            price: "",
            ...extraFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {}),
            categories: "",
        }),
        [extraFields]
    )

    const [errors, setErrors] = useState(initialErrors)

    const convertEthToCurrency = (eth) => {
        if (!ethToCurrencyRates[currency.toLowerCase()]) return "" // Überprüfe, ob der Umrechnungskurs vorhanden ist
        return eth * ethToCurrencyRates[currency.toLowerCase()] // Konvertiere ETH in die ausgewählte Währung
    }

    const convertCurrencyToEth = (currencyValue) => {
        if (!ethToCurrencyRates[currency.toLowerCase()]) return "" // Überprüfe, ob der Umrechnungskurs vorhanden ist
        return currencyValue / ethToCurrencyRates[currency.toLowerCase()] // Konvertiere die ausgewählte Währung in ETH
    }

    useEffect(() => {
        if (
            ethPrice &&
            ethToCurrencyRates[currency.toLowerCase()] &&
            activeInput !== "priceInCurrency"
        ) {
            const decimalPlaces = currency === "BTC" ? 8 : 2 // 8 Nachkommastellen für Bitcoin
            setCurrencyPrice(convertEthToCurrency(ethPrice).toFixed(decimalPlaces))
        }
    }, [ethPrice, ethToCurrencyRates, currency, activeInput])

    useEffect(() => {
        if (
            currencyPrice &&
            ethToCurrencyRates[currency.toLowerCase()] &&
            activeInput !== "price"
        ) {
            setEthPrice(convertCurrencyToEth(currencyPrice).toFixed(18))
        }
    }, [currencyPrice, ethToCurrencyRates, currency, activeInput])

    const handleCurrencyChange = (e) => {
        const newCurrency = e.target.value
        setCurrency(newCurrency)

        if (activeInput === "price") {
            // Eth-Wert bleibt gleich, Währungswert wird angepasst
            const convertedPrice = convertEthToCurrency(ethPrice)
            if (!isNaN(convertedPrice)) {
                const decimalPlaces = newCurrency === "BTC" ? 8 : 2 // 8 Nachkommastellen für Bitcoin
                setCurrencyPrice(convertedPrice.toFixed(decimalPlaces))
            }
        } else if (activeInput === "priceInCurrency") {
            // Währungswert bleibt gleich, ETH-Wert wird angepasst
            const ethValue = convertCurrencyToEth(currencyPrice)
            if (!isNaN(ethValue)) {
                setEthPrice(ethValue.toFixed(18))
            }
        }
    }

    const handleTransactionCompletion = useCallback(() => {
        const { pathname } = router
        const modalId = `transactionModal-${formData.nftAddress}${formData.tokenId}`
        const modalTransactionContent = {
            nftAddress: formData.nftAddress,
            tokenId: formData.tokenId,
        }

        if (pathname !== "/") {
            router.push("/")
        }

        reloadNFTs()
        openModal("transaction", modalId, modalTransactionContent)
    }, [router, formData.nftAddress, formData.tokenId, reloadNFTs, openModal])

    const { handleListItem } = useListItem(
        marketplaceAddress,
        formData.nftAddress,
        formData.tokenId,
        formData.price,
        formData.desiredNftAddress,
        formData.desiredTokenId,
        formData.categories,
        handleTransactionCompletion
    )
    const handleApproveComplete = useCallback(() => {
        handleListItem()
    }, [handleListItem])

    const { handleApprove } = useApprove(
        marketplaceAddress,
        formData.nftAddress,
        formData.tokenId,
        handleApproveComplete
    )

    // Aktualisierte Verwendung von useGetApproved
    const { isApprovedForMarketplace } = useGetApproved(
        formData.nftAddress,
        formData.tokenId,
        marketplaceAddress
    )

    const approveAndList = useCallback(
        async (e) => {
            e.preventDefault() // Prevent the default form submission behavior
            if (!validateForm(formData)) {
                return
            }
            if (handleApprove && !isApprovedForMarketplace) {
                handleApprove()
            }
            if (handleListItem && isApprovedForMarketplace) {
                handleListItem()
            }
        },
        [formData, handleApprove, handleListItem, isApprovedForMarketplace]
    )

    const validateForm = (data) => {
        let newErrors = {}
        let isValid = true

        Object.keys(data).forEach((key) => {
            const errorMessage = validateField(key, data[key])
            newErrors[key] = errorMessage

            if (errorMessage) {
                isValid = false
            }
        })

        setErrors(newErrors)
        return isValid
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        setActiveInput(name) // Set the active input field

        if (name === "price") {
            const [integerPart, decimalPart] = value.split(".")
            if (decimalPart && decimalPart.length > 18) {
                e.target.value = `${integerPart}.${decimalPart.slice(0, 18)}`
            }
            setEthPrice(e.target.value)
            setFormData((prev) => ({ ...prev, price: e.target.value })) // Update formData.price directly
        } else if (name === "priceInCurrency") {
            const [integerPart, decimalPart] = value.split(".")
            const decimalPlaces = currency === "BTC" ? 8 : 2 // Set decimal places based on currency
            if (decimalPart && decimalPart.length > decimalPlaces) {
                e.target.value = `${integerPart}.${decimalPart.slice(0, decimalPlaces)}`
            }
            setCurrencyPrice(e.target.value)
            const ethValue = convertCurrencyToEth(e.target.value).toFixed(18) // Convert EUR to ETH
            setEthPrice(ethValue)
            setFormData((prev) => ({ ...prev, price: ethValue })) // Ensure formData.price is updated with ETH value
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }

        const error = validateField(name, value)
        setErrors((prev) => ({ ...prev, [name]: error ? error : "" }))
    }

    const handleBlur = () => {
        setActiveInput(null) // Setze das aktive Eingabefeld zurück, wenn das Feld verlassen wird
    }

    const inputFields = [
        {
            key: "nftAddress",
            label: "NFT Address",
            type: "text",
            placeholder: "0x0000000000000000000000000000000000000000",
        },
        { key: "tokenId", label: "Token ID", type: "number", placeholder: "0" },
        {
            key: "price",
            label: "Price in ETH",
            type: "number",
            placeholder: "min. amount: 0.000000000000000001",
            onChange: handleChange,
            onBlur: handleBlur,
        },
        {
            key: "priceInCurrency",
            label: (
                <span>
                    Price in
                    <select id="currency" value={currency} onChange={handleCurrencyChange}>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                        <option value="BTC">BTC</option>
                    </select>
                </span>
            ),
            type: "number",
            placeholder: "min. amount: 0.00",
            onChange: handleChange,
            onBlur: handleBlur,
        },
        ...extraFields,
    ]

    useEffect(() => {
        console.log("Modal Content updated:", modalContent)
    }, [modalContent])

    return (
        <div className={styles.nftSellSwapContainer}>
            {isClient && (
                <div className={styles.sellSwapFormWrapper}>
                    <h2>{capitalizeFirstChar(action)} your NFT</h2>
                    <div className={styles.sellSwapForm} ref={formRef}>
                        <InputFields
                            fields={inputFields}
                            formData={{
                                ...formData,
                                price: ethPrice,
                                priceInCurrency: currencyPrice,
                            }}
                            errors={errors}
                            setErrors={setErrors}
                            setFormData={setFormData}
                            handleChange={handleChange}
                        />
                        {!isConnected ? (
                            <div className={styles.sellSwapFormNFTListWrapper}>
                                <h3>Nothing to {action} here</h3>
                                <div
                                    className={`${styles.sellSwapFormNFTList} ${styles.loading} ${
                                        action === "sell" ? styles.sell : "swap" ? styles.swap : ""
                                    }`}
                                >
                                    <div>
                                        <h3>
                                            Web3 is currently not enabled - Connect your Wallet
                                            here
                                        </h3>
                                        <ConnectWalletBtn onConnect={open} isClient={true} />
                                    </div>
                                </div>
                            </div>
                        ) : isConnected && action !== "update" ? (
                            <div className={styles.sellSwapFormNFTListWrapper}>
                                <h3>Your NFTs to list</h3>
                                {nftsLoading ? (
                                    <div
                                        className={`${styles.loading} ${
                                            action === "sell"
                                                ? styles.sell
                                                : "swap"
                                                ? styles.swap
                                                : ""
                                        }`}
                                    >
                                        <div className={styles.myNftLoadingWaveWrapper}>
                                            <LoadingWave />
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`${styles.sellSwapFormNFTList} ${
                                            action === "sell"
                                                ? styles.sell
                                                : "swap"
                                                ? styles.swap
                                                : ""
                                        }`}
                                    >
                                        {unlistedNfts.length > 0 ? (
                                            <List
                                                sortType={"myNFTFromWallet"}
                                                nftsData={unlistedNfts}
                                            />
                                        ) : (
                                            <h3>
                                                Congratulations, you {"don't"} own any unlisted
                                                NFTs yet!
                                            </h3>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                    <Information type={action} />
                    <BtnWithAction
                        buttonText={
                            action === "update"
                                ? "Update"
                                : isApprovedForMarketplace
                                ? "List"
                                : "Approve and list"
                        }
                        onClickAction={approveAndList}
                    />
                </div>
            )}
        </div>
    )
}

export default ActionForm
