import { gql } from "@apollo/client"

// This gives all the Items which are currently listed
export const GET_ACTIVE_ITEMS = gql`
    {
        items(first: 1000, where: { isListed: true }, orderBy: listingId, orderDirection: desc) {
            listingId
            nftAddress
            tokenId
            isListed # this is a boolean. True means the item is listed, false means it is not
            price
            seller
            buyer # is null if it has not been sold yet
            desiredNftAddress # is "0x0000000000000000000000000000000000000000" if there is no desiredNft
            desiredTokenId
        }
    }
`
// This gives the details of a single NFT based on its address and tokenId
export const GET_NFT_BY_ADDRESS_AND_TOKENID = gql`
    query GetNFTByAddressAndTokenId($nftAddress: Bytes!, $tokenId: BigInt!) {
        items(
            where: { nftAddress: $nftAddress, tokenId: $tokenId }
            orderBy: listingId
            orderDirection: desc
            first: 1
        ) {
            nftAddress
            buyer
            desiredNftAddress
            desiredTokenId
            id
            isListed
            listingId
            price
            seller
            tokenId
        }
    }
`
// This gives all the Items which have ever been listed, including the ones which have been sold, but doesn't include the buyer's address
export const GET_INACTIVE_ITEMS = gql`
    {
        items(first: 1000, where: { isListed: false }, orderBy: listingId, orderDirection: desc) {
            listingId
            nftAddress
            tokenId
            isListed # this is a boolean. True means the item is listed, false means it is not
            price
            seller
            buyer
            desiredNftAddress # is "0x0000000000000000000000000000000000000000" if there was no desiredNft
            desiredTokenId
        }
    }
`
