// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts@4.9.3/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.9.3/utils/Counters.sol";
import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";

contract PublicNFTMint is ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant MAX_SUPPLY = 10000;

    event PublicNFTMinted(
        address indexed minter,
        uint256 indexed tokenId,
        string tokenURI
    );

    constructor() ERC721("Platform Collection NFT", "DROP") {}

    function mintNFT(string memory tokenURI)
        public
        returns (uint256)
    {
        require(
            _tokenIds.current() < MAX_SUPPLY,
            "Maximum NFT supply reached"
        );

        require(
            bytes(tokenURI).length > 0,
            "Token URI required"
        );

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId);

        _setTokenURI(newItemId, tokenURI);

        emit PublicNFTMinted(
            msg.sender,
            newItemId,
            tokenURI
        );

        return newItemId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
