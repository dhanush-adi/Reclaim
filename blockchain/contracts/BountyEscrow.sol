// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
 
contract LostAndFound {
    struct Item {
        address owner;
        string ipfsHash; // Stores IPFS hash for metadata
        address finder;
        bool isFound;
    }
 
    uint256 private itemIdCounter;
    mapping(uint256 => Item) public items;
    mapping(address => uint256[]) private userItems;
 
    event ItemSubmitted(uint256 indexed itemId, address indexed owner, string ipfsHash);
    event ItemFound(uint256 indexed itemId, address indexed finder);
 
    constructor() {
        itemIdCounter = 1;
    }
 
    /// 🔹 Submit a lost item (stores only hash to save gas)
    function submitLostItem(string calldata _ipfsHash) external {
        uint256 itemId = itemIdCounter++;
        items[itemId] = Item(msg.sender, _ipfsHash, address(0), false);
        userItems[msg.sender].push(itemId);
 
        emit ItemSubmitted(itemId, msg.sender, _ipfsHash);
    }
 
    /// 🔹 Mark an item as found
    function submitFoundItem(uint256 _itemId) external {
        Item storage item = items[_itemId];
        require(item.owner != address(0), "Item does not exist");
        require(!item.isFound, "Item already found");
 
        item.isFound = true;
        item.finder = msg.sender;
 
        emit ItemFound(_itemId, msg.sender);
    }
 
    /// 🔹 Get items submitted by a user
    function getUserItems(address _user) external view returns (uint256[] memory) {
        return userItems[_user];
    }
 
    /// 🔹 Fetch all lost items (items that have not been marked as found)
    function getAllLostItems() external view returns (uint256[] memory) {
        uint256[] memory lostItems = new uint256[](itemIdCounter - 1);
        uint256 counter = 0;
 
        for (uint256 i = 1; i < itemIdCounter; i++) {
            if (!items[i].isFound) {
                lostItems[counter] = i;
                counter++;
            }
        }
 
        return lostItems;
    }
 
    /// 🔹 Get item details
    function getItemDetails(uint256 _itemId) external view returns (Item memory) {
        require(_itemId < itemIdCounter, "Item does not exist");
        return items[_itemId];
    }
}