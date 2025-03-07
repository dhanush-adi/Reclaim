// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DisputeResolution {
    struct Dispute {
        uint256 itemId;
        address owner;
        address finder;
        string reason;
        bool resolved;
        address winner;
    }

    mapping(uint256 => Dispute) public disputes;
    address public moderator;

    event DisputeRaised(uint256 indexed itemId, address indexed owner, address indexed finder, string reason);
    event DisputeResolved(uint256 indexed itemId, address winner);

    modifier onlyModerator() {
        require(msg.sender == moderator, "Only moderator can resolve disputes");
        _;
    }

    constructor() {
        moderator = msg.sender; // Initial moderator is contract deployer
    }

    function raiseDispute(uint256 _itemId, address _finder, string calldata _reason) external {
        require(disputes[_itemId].itemId == 0, "Dispute already exists");

        disputes[_itemId] = Dispute(_itemId, msg.sender, _finder, _reason, false, address(0));
        emit DisputeRaised(_itemId, msg.sender, _finder, _reason);
    }

    function resolveDispute(uint256 _itemId, address _winner) external onlyModerator {
        Dispute storage dispute = disputes[_itemId];
        require(!dispute.resolved, "Dispute already resolved");

        dispute.resolved = true;
        dispute.winner = _winner;

        emit DisputeResolved(_itemId, _winner);
    }

    function setModerator(address _newModerator) external onlyModerator {
        moderator = _newModerator;
    }
}
