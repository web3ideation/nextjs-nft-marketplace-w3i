import { useCallback } from "react"
import { useProvider } from "wagmi"
import { ethers } from "ethers"

// Benutzerdefinierter Hook, der die Logik für getRawTokenURI enthält
export const useGetRawTokenURI = () => {
    const provider = useProvider()

    const getRawTokenURI = useCallback(
        async (nftAddress, tokenId) => {
            try {
                const functionSignature = ethers.utils.id("tokenURI(uint256)").slice(0, 10)
                const tokenIdHex = ethers.utils
                    .hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32)
                    .slice(2)
                const data = functionSignature + tokenIdHex

                const result = await provider.call({ to: nftAddress, data })
                const decodedData = ethers.utils.defaultAbiCoder.decode(["string"], result)
                return decodedData[0]
            } catch (error) {
                console.error("Error fetching raw tokenURI:", error)
                throw error
            }
        },
        [provider]
    )

    return getRawTokenURI
}
