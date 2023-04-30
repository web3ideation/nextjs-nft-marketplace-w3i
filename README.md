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


Sepolia testnet deployment:

deploying "NftMarketplace" (tx: 0xd8d83e529e72b9ec44754d36e6216caa34f81c4eb64d792aae5aeef5618d2337)...: deployed at 0x791c27E6E86e3fa893fECbd59b563F6b3d3558a2 with 1649423 gas

deploying "BasicNft" (tx: 0x6f61206b6e82fc53e30f3abb392a13df6c520d19eff633e27e63456652de4cd5)...: deployed at 0x2c9D7F070D03D83588E22C23fE858AA71274AD2a with 2072874 gas


!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
constants:
this is the API for Patricks BasicNft. Is it correct for mine? Also why do i even need to have all the NFT Smart Contracts APIs? That means Every NFT Smart contract has to get "registered" at my marketplace to be able to get sold. Is that realistic for the real world?
same goes for nft Marketplace, wher patricks is definetely not the same as mine. But where do i get the ABI from in that format? 
--> rewatch the moralis section where he sets up the constants.