1. Home Page:
    1. Show recently listed NFTs !!! make this sortable and searchable
        1. If you own the NFT, you can update the listing
        2. If not, you can buy the listing
2. Sell Page:
    1. You can list your NFT on the marketplace
3. Your Page: !!!
    1. Shows all your listed NFTs
    2. Shows all your owned NFTs that you can list 

The Graph:
1. Instead of reading the events from Moralis, we will
    1. Index them with The Graph
    2. Read from The Graph

!!! when nft bought the UI should refresh the card to say Your NFT
!!! when you click on a NFT card that you dont own it shouldnt right away call the buy function, but show a modal that shows more details about the nft and then a buy button
!!! all the input fields should have a filter and error messages if the user inputs something unexpected, like wrong length of addresses, space, ... 
!!! how does the price frontend input field interpret . and , ? put in some safety mechanism that the nft doesnt accidentally get listed to a not intended price
!!! add bot protection, so there scalper bots cant directly buy nfts when they have just been listed (to protect against scalpers and also give the user time to review their listing)

!!! patrick said it is possible to have this marketplace frontend hosted on ipfs. (he even made a challange) One thing to change is how to get the images import Image from "next/image" in the NFTBox.js.

!!! when buying it should give a confirmation message and that it is waiting for block confirmation. and it should refresh automatically

!!! on the sell page it should show which nfts you own

!!! how can you see which nfts you own???

!!! estimated gas for approving costs 0.04353421SepoliaETH... tho the actual gas fee is much lower... why??? is it also that high on the mainnet?

!!! why does pending (for example when listing an NFT) take so long? bc of block confirmations? but metamask sets those, right? 

!!! approval and also listing didnt work the first try. why?

!!! use cGPT to make the interface look nicer

!!! notification if you want to sell an nft that you have already listed before

!!! when updating the listing the modal should be a notification that it is pending/ waiting for confiramtion and it should also automatically refresh the UI

!!! make sure that when the user inputs sth wrong in the sell modal price field, for example a , instead of a . that it will give a notifcation or just correct it on its own. maybe also give a preview of how much wei that would be or just what the price would look like on the marketplace...

!!! when selling after the "approval" function the listing nft function must also be approved in metamask. make sure metamask opens automatically or show a notification that tells the user to do that

!!! when clicking an nft that you dont own, it should show a modal with details about it instead of triggering the buy function right away

!!! when a transaction fails (e.g. when the price is set to 0) it should show an error message explaining whats the problem.


Sepolia testnet deployment:

deploying "NftMarketplace" (tx: 0xd8d83e529e72b9ec44754d36e6216caa34f81c4eb64d792aae5aeef5618d2337)...: deployed at 0x791c27E6E86e3fa893fECbd59b563F6b3d3558a2 with 1649423 gas

deploying "BasicNft" (tx: 0x6f61206b6e82fc53e30f3abb392a13df6c520d19eff633e27e63456652de4cd5)...: deployed at 0x2c9D7F070D03D83588E22C23fE858AA71274AD2a with 2072874 gas


The Graph Deployment:

✔ Upload subgraph to IPFS

Build completed: QmWmKKLLWtAfChGi9rJwr18jWNi3dnrFXhaqVqTsai17nC

Deployed to https://thegraph.com/studio/subgraph/nft-marketplace

Subgraph endpoints:
Queries (HTTP):     https://api.studio.thegraph.com/query/46078/nft-marketplace/v0.0.1