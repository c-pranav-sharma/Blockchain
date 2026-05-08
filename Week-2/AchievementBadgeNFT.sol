// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts@4.9.3/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.9.3/utils/Counters.sol";
import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";

contract AchievementBadgeNFT is ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => string) public badgeNames;
    mapping(uint256 => uint256) public awardedAt;

    event BadgeAwarded(
        address indexed recipient,
        uint256 indexed tokenId,
        string badgeName,
        string tokenURI
    );

    constructor() ERC721("Achievement Badge NFT", "BADGE") {}

    function awardBadge(
        address recipient,
        string memory badgeName,
        string memory tokenURI
    )
        public
        onlyOwner
        returns (uint256)
    {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(badgeName).length > 0, "Badge name required");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();

        _safeMint(recipient, newItemId);

        _setTokenURI(newItemId, tokenURI);

        badgeNames[newItemId] = badgeName;

        awardedAt[newItemId] = block.timestamp;

        emit BadgeAwarded(
            recipient,
            newItemId,
            badgeName,
            tokenURI
        );

        return newItemId;
    }

    function totalBadgesAwarded() public view returns (uint256) {
        return _tokenIds.current();
    }
}
