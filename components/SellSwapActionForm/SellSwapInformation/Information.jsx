import React from "react"
import styles from "./Information.module.scss"

const Information = ({ type }) => {
    let action
    let actionType
    switch (type) {
        case "sell":
            action = "listing"
            actionType = " for sell"
            break
        case "swap":
            action = "listing"
            actionType = " for swap"
            break
        case "update":
            action = "updating"
            actionType = " either the desired price or the desired swap"
            break
        case "welcome":
            action = "listing"
            actionType = ""
        default:
            null
            break
    }

    return (
        <div className={styles.sellSwapInformationWrapper}>
            <h3>
                Here are some things to keep in mind when {action} your NFT{actionType}:
            </h3>
            <div className={styles.sellSwapInformation}>
                {" "}
                <h4>Fees and Costs:</h4>
                <p>
                    Please note that when listing and selling in L1 currency (ETH), network fees
                    (so-called gas fees) may apply. These fees vary and depend on the load on the
                    Ethereum network.
                </p>
                <br />
                {type !== "update" && (
                    <>
                        <h4>NFT Address:</h4>
                        <p>
                            {"It's"} crucial to enter the correct NFT Address, which is the unique
                            contract address of your NFT on the blockchain. This ensures that the
                            right asset is being listed and can be identified accurately by buyers.
                        </p>
                        <br />
                        <h4>Token ID:</h4>
                        <p>
                            Each NFT has a distinct Token ID. Enter this Token ID carefully, as it
                            uniquely identifies your NFT within its collection or contract.
                            Incorrect entry of the Token ID could lead to listing a different asset
                            than intended.
                        </p>
                        <br />
                    </>
                )}
                <h4>Entering Price:</h4>
                <p>
                    Enter the desired price in Ethereum (ETH). Please make sure to enter the price
                    accurately, as this directly affects the visibility and attractiveness of your
                    offer.
                </p>
                <br />
                {type !== "sell" && (
                    <>
                        <h4>Exchange NFT Address:</h4>
                        <p>
                            When initiating a trade, {"it's"} important to specify the correct
                            Exchange NFT Address, which is the unique contract address of the NFT
                            you wish to receive in the exchange. This ensures that the correct
                            asset is targeted in the trade and can be accurately identified by the
                            other party.
                        </p>
                        <br />
                        <h4>Exchange Token ID:</h4>
                        <p>
                            Each NFT you aim to receive in a trade has a distinct Token ID.
                            Carefully enter this Token ID, as it uniquely identifies the NFT within
                            its collection or contract. An incorrect Token ID could result in a
                            different asset being exchanged than the one you intended.
                        </p>
                        <br />
                    </>
                )}
                {type !== "update" && (
                    <>
                        <h4>Approval for Marketplace:</h4>
                        <p>
                            Before listing your NFT, it must first be approved for the marketplace.
                            This approval process ensures that your NFT meets all necessary
                            criteria and standards for listing. Once approved, you can proceed with
                            listing your NFT on the platform.
                        </p>
                        <br />
                    </>
                )}
                <h4>Confirmation and Transaction:</h4>
                <p>
                    After entering your price{" "}
                    {type !== "update" ? "and obtaining marketplace approval, " : ""}you must
                    confirm the transaction. This is usually done via your connected wallet. Make
                    sure you have enough ETH in your wallet to cover network fees.
                </p>
                <br />
                <h4>Visibility of your offer:</h4>
                <p>
                    Once you have set the price, {type !== "update" ? "obtained approval, " : ""}
                    and confirmed the transaction, your offer will be visible on the market with
                    the new price. This increases the chance that potential buyers will become
                    aware of your offer.
                </p>
                <br />
                <h4>Security and Responsibility:</h4>
                <p>
                    Please check all details carefully before confirming the listing. Transactions
                    on the blockchain are irreversible and cannot be reversed. By keeping these
                    points in mind, you will ensure that your offer appears on the market correctly
                    and at your desired price.
                </p>
            </div>
        </div>
    )
}

export default Information
