import { useQuery } from "@apollo/client"
import { GET_NFT_BY_ADDRESS_AND_TOKEN_ID } from "@constants/subgraphQueries"

export const useNFTByAddressAndTokenId = (nftAddress, tokenId, onCompleted, onError) => {
    return useQuery(GET_NFT_BY_ADDRESS_AND_TOKEN_ID, {
        variables: { nftAddress, tokenId },
        onCompleted: (data) => {
            console.log("NFT data:", data)
            if (onCompleted) {
                onCompleted(data)
            }
        },
        onError: (error) => {
            console.error("Error fetching NFT:", error)
            if (onError) {
                onError(error)
            }
        },
    })
}
