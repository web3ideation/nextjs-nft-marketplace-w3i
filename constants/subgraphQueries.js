import { gql } from "@apollo/client"

// This gives all the Items which are currently listed
const GET_ACTIVE_ITEMS = gql`
  {
    activeItems(where: { buyer: "0x0000000000000000000000000000000000000000" }) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
    }
  }
`
// This gives all the Items which have ever been listed, including the ones which have been sold, but doesnt include the buyers address
// !!!W create a new query which includes the buyers address
const GET_LISTED_ITEMS = gql`
  {
    itemListeds(where: {}) {
      id
      seller
      nftAddress
      tokenId
      price
    }
  }
`

// !!!W I turned off the `first 5` limit, make sure to use pages in the future to not have performance issues when there are a lot of items in the marketplace.
export default GET_ACTIVE_ITEMS
GET_LISTED_ITEMS
