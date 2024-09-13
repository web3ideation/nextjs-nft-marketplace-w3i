import { useEffect, useState, useCallback, useRef, useMemo, use } from "react"
import { useRouter } from "next/router"
import { usePublicClient } from "wagmi"
import SellSwapInformation from "@components/SellSwapActionForm/SellSwapInformation/SellSwapInformation"
import CategoriesCheckbox from "./SellSwapForm/CategoriesCheckbox"
import ConnectWalletBtn from "@components/Btn/ConnectWalletBtn/ConnectWalletBtn"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import NFTList from "@components/NftViewer//NftLists/List"
import { useWalletNFTs } from "@hooks/index"
import { useAccount } from "wagmi"
import SellSwapInputFields from "./SellSwapForm/SellSwapInputFields"
import BtnWithAction from "@components/Btn/BtnWithAction"
import { useNFT } from "@context/NftDataProvider"
import { useApprove, useListItem } from "../../hooks/index"
import networkMapping from "@constants/networkMapping.json"
import styles from "./SellSwapActionForm.module.scss"
import { validateField } from "@utils/validation"
import { capitalizeFirstChar } from "@utils/formatting"
import useEthToEurRate from "@hooks/ethToEurRate/useEthToEurRate"
import { useModal } from "@context/ModalProvider"
import LoadingWave from "@components/LoadingWave/LoadingWave"

const ActionForm = ({ action, formTitle, extraFields = [] }) => {
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

    const isOwnedByUser = useCallback(
        (tokenOwner) => address && tokenOwner?.toLowerCase() === address.toLowerCase(),
        [address]
    )

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
    }, [nfts, nftsData, isOwnedByUser])

    useEffect(() => {
        reloadNFTs()
    }, [address, reloadNFTs])

    const [formData, setFormData] = useState(initialFormData)
    const [ethPrice, setEthPrice] = useState(formData.price)
    const [eurPrice, setEurPrice] = useState("")
    const { ethToEurRate } = useEthToEurRate()
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

    //const [checkboxData, setCheckboxData] = useState({
    //    DAO: false,
    //    Music: false,
    //    Membership: false,
    //    "Real world assets": false,
    //    Gaming: false,
    //    Wearables: false,
    //    "Digital Twin": false,
    //})

    const convertEthToEur = (eth) => {
        if (!ethToEurRate) return "" // or any default value
        return eth * ethToEurRate // Convert ETH to EUR
    }

    const convertEurToEth = (eur) => {
        if (!ethToEurRate) return "" // or any default value
        return eur / ethToEurRate // Gib den ETH-Wert als Zahl zurück
    }

    // Wenn ethPrice geändert wird, aktualisiere den eurPrice, aber nur, wenn das Feld "ETH" aktiv ist
    useEffect(() => {
        if (ethPrice && ethToEurRate && activeInput !== "priceInEur") {
            setEurPrice(convertEthToEur(ethPrice).toFixed(2))
        }
    }, [ethPrice, ethToEurRate, activeInput])

    // Wenn eurPrice geändert wird, aktualisiere den ethPrice, aber nur, wenn das Feld "EUR" aktiv ist
    useEffect(() => {
        if (eurPrice && ethToEurRate && activeInput !== "price") {
            setEthPrice(convertEurToEth(eurPrice).toFixed(18))
        }
    }, [eurPrice, ethToEurRate, activeInput])

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

    const handleApproveCompleted = useCallback(() => {
        handleListItem()
    }, [handleListItem])

    const { handleApprove } = useApprove(
        marketplaceAddress,
        formData.nftAddress,
        formData.tokenId,
        handleApproveCompleted
    )

    const approveAndList = (e) => {
        e.preventDefault() // Prevent the default form submission behavior
        if (!validateForm(formData)) {
            return
        }
        if (handleApprove) {
            handleApprove()
        }
    }

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
        } else if (name === "priceInEur") {
            const [integerPart, decimalPart] = value.split(".")
            if (decimalPart && decimalPart.length > 2) {
                e.target.value = `${integerPart}.${decimalPart.slice(0, 2)}`
            }
            setEurPrice(e.target.value)
            const ethValue = convertEurToEth(e.target.value).toFixed(18) // Convert EUR to ETH
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
        { key: "tokenId", label: "Token ID", type: "text", placeholder: "0" },
        {
            key: "price",
            label: "Price in ETH",
            type: "number",
            placeholder: "min. amount: 0.000000000000000001",
            onChange: handleChange,
            onBlur: handleBlur,
        },
        {
            key: "priceInEur",
            label: "Price in EUR",
            type: "number",
            placeholder: "min. amount: 0.00",
            onChange: handleChange,
            onBlur: handleBlur,
        },
        ...extraFields,
    ]

    //const handleCategoryChange = (updatedCategories) => {
    //    setFormData((prev) => ({ ...prev, categories: updatedCategories }))
    //}

    useEffect(() => {
        console.log("Modal Content updated:", modalContent)
    }, [modalContent])

    return (
        <div className={styles.nftSellSwapContainer}>
            <div className={styles.sellSwapFormWrapper}>
                <h2>{capitalizeFirstChar(action)} your NFT</h2>
                <div className={styles.sellSwapForm} ref={formRef}>
                    <SellSwapInputFields
                        fields={inputFields}
                        formData={{
                            ...formData,
                            price: ethPrice,
                            priceInEur: eurPrice,
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
                                        Web3 is currently not enabled - Connect your Wallet here
                                    </h3>
                                    <ConnectWalletBtn onConnect={open} isClient={true} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.sellSwapFormNFTListWrapper}>
                            <h3>Your NFTs to list</h3>
                            {nftsLoading ? (
                                <div
                                    className={`${styles.loading} ${
                                        action === "sell" ? styles.sell : "swap" ? styles.swap : ""
                                    }`}
                                >
                                    <div className={styles.myNftLoadingWaveWrapper}>
                                        <LoadingWave />
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`${styles.sellSwapFormNFTList} ${
                                        action === "sell" ? styles.sell : "swap" ? styles.swap : ""
                                    }`}
                                >
                                    {unlistedNfts.length > 0 ? (
                                        <NFTList
                                            sortType={"myNFTFromWallet"}
                                            nftsData={unlistedNfts}
                                        />
                                    ) : (
                                        <h3>
                                            Congratulations, you {"don't"} own any unlisted NFTs
                                            yet!
                                        </h3>
                                    )}
                                </div>
                            )}{" "}
                        </div>
                    )}
                    {/*<CategoriesCheckbox
                        checkboxData={checkboxData}
                        setCheckboxData={setCheckboxData}
                        handleCategoryChange={handleCategoryChange}
                    />*/}
                </div>
                <SellSwapInformation type={action} />
                <BtnWithAction buttonText={"Approve and list"} onClickAction={approveAndList} />
            </div>
        </div>
    )
}

export default ActionForm
