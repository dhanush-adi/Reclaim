// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
 
contract LostAndFound {
    struct Item {
        address owner;
        string ipfsHash; // Stores IPFS hash for metadata
        address finder;
        bool isFound;
        bool isVerified;
    }
 
    uint256 private itemIdCounter;
    mapping(uint256 => Item) public items;
    mapping(address => uint256[]) private userItems;
    mapping(address => uint256) public finderStats; // Track number of items found by each finder
 
    event ItemSubmitted(uint256 indexed itemId, address indexed owner, string ipfsHash);
    event ItemFound(uint256 indexed itemId, address indexed finder);
    event ItemVerified(uint256 indexed itemId, address indexed finder, address indexed owner);
 
    constructor() {
        itemIdCounter = 1;
    }
 
    /// 🔹 Submit a lost item (stores only hash to save gas)
    function submitLostItem(string calldata _ipfsHash) external {
        uint256 itemId = itemIdCounter++;
        items[itemId] = Item(msg.sender, _ipfsHash, address(0), false, false);
        userItems[msg.sender].push(itemId);
 
        emit ItemSubmitted(itemId, msg.sender, _ipfsHash);
    }
 
    /// 🔹 Mark an item as potentially found
    function submitFoundItem(uint256 _itemId) external {
        Item storage item = items[_itemId];
        require(item.owner != address(0), "Item does not exist");
        require(!item.isFound, "Item already found");
        require(item.owner != msg.sender, "Owner cannot find their own item");
 
        item.finder = msg.sender;
        // Note: We don't set isFound to true until the owner verifies
 
        emit ItemFound(_itemId, msg.sender);
    }
 
    /// 🔹 Owner verifies that the item was found
    function verifyFoundItem(uint256 _itemId, address _finder) external {
        Item storage item = items[_itemId];
        require(item.owner == msg.sender, "Only owner can verify");
        require(item.finder == _finder, "Incorrect finder address");
        require(!item.isVerified, "Item already verified");
        require(!item.isFound, "Item already marked as found");
 
        item.isFound = true;
        item.isVerified = true;
        finderStats[_finder]++; // Increment finder's stats
 
        emit ItemVerified(_itemId, _finder, msg.sender);
    }
 
    /// 🔹 Get items submitted by a user
    function getUserItems(address _user) external view returns (uint256[] memory) {
        return userItems[_user];
    }
 
    /// 🔹 Get finder's statistics
    function getFinderStats(address _finder) external view returns (uint256) {
        return finderStats[_finder];
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