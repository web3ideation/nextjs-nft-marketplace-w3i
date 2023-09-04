import { gql } from "@apollo/client"

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
// !!!W I turned off the `first 5` limit, make sure to use pages in the future to not have performance issues when there are a lot of items in the marketplace.
export default GET_ACTIVE_ITEMS
