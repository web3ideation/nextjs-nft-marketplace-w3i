import { gql } from "@apollo/client"

// This gives all the Items which are currently listed
const GET_ACTIVE_ITEMS = gql`
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
// This gives all the Items which have ever been listed, including the ones which have been sold, but doesnt include the buyers address
const GET_INACTIVE_ITEMS = gql`
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

module.exports = {
    GET_ACTIVE_ITEMS,
    GET_INACTIVE_ITEMS,
}
