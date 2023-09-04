1. Home Page:
    1. Show recently listed NFTs !!!W make this sortable and searchable
        1. If you own the NFT, you can update the listing
        2. If not, you can buy the listing
2. Sell Page:
    1. You can list your NFT on the marketplace
3. Your Page: !!!W
    1. Shows all your listed NFTs
    2. Shows all your owned NFTs that you can list 

The Graph:
1. Instead of reading the events from Moralis, we will
    1. Index them with The Graph
    2. Read from The Graph

!!!W when nft bought the UI should refresh the card to say Your NFT
!!!W when you click on a NFT card that you dont own it shouldnt right away call the buy function, but show a modal that shows more details about the nft and then a buy button
!!!W all the input fields should have a filter and error messages if the user inputs something unexpected, like wrong length of addresses, space, ... 
!!!W how does the price frontend input field interpret . and , ? put in some safety mechanism that the nft doesnt accidentally get listed to a not intended price
!!!W add bot protection, so there scalper bots cant directly buy nfts when they have just been listed (to protect against scalpers and also give the user time to review their listing)

!!!W patrick said it is possible to have this marketplace frontend hosted on ipfs. (he even made a challange) One thing to change is how to get the images import Image from "next/image" in the NFTBox.js.

!!!W when buying it should give a confirmation message and that it is waiting for block confirmation. and it should refresh automatically

!!!W on the sell page it should show which nfts you own

!!!W how can you see which nfts you own???

!!!W estimated gas for approving costs 0.04353421SepoliaETH... tho the actual gas fee is much lower... why??? is it also that high on the mainnet?

!!!W why does pending (for example when listing an NFT) take so long? bc of block confirmations? but metamask sets those, right? 

!!!W approval and also listing didnt work the first try. why?

!!!W use cGPT to make the interface look nicer

!!!W notification if you want to sell an nft that you have already listed before

!!!W when updating the listing the modal should be a notification that it is pending/ waiting for confiramtion and it should also automatically refresh the UI

!!!W make sure that when the user inputs sth wrong in the sell modal price field, for example a , instead of a . that it will give a notifcation or just correct it on its own. maybe also give a preview of how much wei that would be or just what the price would look like on the marketplace...

!!!W when selling after the "approval" function the listing nft function must also be approved in metamask. make sure metamask opens automatically or show a notification that tells the user to do that

!!!W when clicking an nft that you dont own, it should show a modal with details about it instead of triggering the buy function right away

!!!W when a transaction fails (e.g. when the price is set to 0) it should show an error message explaining whats the problem.

!!!W theGraphQL is listening to the events from the marketplace. If it would also listen to all events of all ERC721 NFTs it could also give info about the last time it got sold and maybe even for which price...


Sepolia testnet deployment:

deploying "NftMarketplace" (tx: 0xd8d83e529e72b9ec44754d36e6216caa34f81c4eb64d792aae5aeef5618d2337)...: deployed at 0x791c27E6E86e3fa893fECbd59b563F6b3d3558a2 with 1649423 gas

deploying "BasicNft" (tx: 0x6f61206b6e82fc53e30f3abb392a13df6c520d19eff633e27e63456652de4cd5)...: deployed at 0x2c9D7F070D03D83588E22C23fE858AA71274AD2a with 2072874 gas

deploying "RegularNft" (tx: 0x469fb3cf0cdf870996b0e3b6d8370608b7523206793ecd58cc4c20494cdda61f)...: deployed at 0x474ecBebfdD671179AF2ea5880E5eE881658ECFb with 2762469 gas

The Graph Deployment:

✔ Upload subgraph to IPFS

Build completed: QmWmKKLLWtAfChGi9rJwr18jWNi3dnrFXhaqVqTsai17nC

Deployed to https://thegraph.com/studio/subgraph/nft-marketplace

Subgraph endpoints:
Queries (HTTP):     https://api.studio.thegraph.com/query/46078/nft-marketplace/v0.0.1




how to use:

add .env NEXT_PUBLIC_SUBGRAPH_URL="yoursubgraphurl"

(open hardhat-nft-marketplace repo
run "hh node")

make sure that the subgraph is active

open nextjs-nft-marketplace repo
run "yarn dev"

open http://localhost:3000/ in browser 

connect wallet metamask

(mint an nft:
hardhat repo open new additional terminl
run: yarn hardhat run scripts/mint-and-list.js --network localhost)

browser page should show the nfts



!!!W
The marketplace actually can easily display the nfts without being connected through metamask.
In the index.js there is the ? turnary operator set up so that it will only display the nft boxes once isWeb3Enabled. But changing that will make it always display the nfts!
patrick is setting up the ? turnary operator at 21:12:27
But check the line at NFTBox: 
const isOwnedByUser = seller === account || seller === undefined
since i guess that if web3 is not enabled the not connected user would be able to get to the update and cancel listing modal for any displayed nft, and it would say "owend by you" being the seller/owner for every nft displayed 




!!!W
Why nft contracts have to be registered at nft marketplaces before they can get listed:
But: If a user wants to list an nft, they have to enter their nft contracts address anyway.
Tho I want that without manual adding of the address that the user can see all their nfts already when connecting without having to "manual import" the nft contract addresse (like it is with metamask). however maybe if i just let the event log get scanned for ALL ERC721 nft addresses that can be achieved. Is that how the big marketplaces do it?

1. i need to know the nft contracts addresses beforehand to get the attributes. That happens in the components/NFTBox.js line 33 where i need to have the abi to run getTokenUri function. But i think this could already be a standard of the ERC721. Then I could use a raw function call where i do not need to know the complete abi to get the tokenUri of any ERC721 NFT.
:check -> changed that to the raw function call

2. also when using graph ql i think i need to know the nfts contracts address, maybe also already in the marketplace smartcontract backend.
:check -> graph ql is universal to all nfts events that get emitted by the nftmarketplace (but update that address when deploying a new marketplace.sol)
:check -> the marketplace.sol is universal to all ERC721 nfts

3. at the sell-nft page we import the abi "import nftAbi from "../constants/BasicNft.json"". everywhere where we use this abi is a problem when we use a different nft collection. But as said before I think i can make a raw function call to every nft contract without having to know its abi, since there is the ERC721 standard...
:check -> also used a raw function call for approve 


4. in the 99-update-frontend.js from the deployscripts of the marketplace the constants for the frontend get updated. however this sucks, cause this way only the nft contracts defined in there can be displayed... 
!!!!!!!!!!!!!!!!!!!!!!! Since I dont need the BasicNft.json in constants anymore I can delete it and change the 99-update-frontend.js to not create it anymore.


!!!W I created a new nft contract BORIS, where I used the update frontend deploy script to adapt the constants, I think it kinda overwrote the basif nft.json tho, so this is pfusch... i did this on 08.08.23 so I can just restore the version from github from the latest checkin since then. But i have to find a solution to not have to import the abi for every new nft contract... this should be possible to get around by just reliyng on the erc721 standard...





!!! add licence file in github




!!!W
so when i mint the regularNft using my mint script metamask can manually import and display the nft. when using the frontends sell function the approval function goes through, but then nothing happens, the listing doesnt get displayed.
maybe because the graph is not reading for that nfts address?? -> I have to update the active items and stuff in the graph repo.


!!!W
scaling:
subgraph must be paid(?)
website hoster must be reliable
reentrancy guard must allow two users simountanously access the withdraw function (?)

!!!W
if we use the graph to display the users owned nfts, the graph starting block must be set to a value where the very first NFT has been minted.

!!!W
wanting to display all the nfts a user owns, the graph not only has to listen/scan for transfer events, but also minting! (or does mining involve the transfer function...?)