// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts@4.9.3/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.9.3/utils/Counters.sol";
import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";

contract InternshipCertificate is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event CertificateIssued(address indexed intern, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("Internship Certificate NFT", "CERT") {}

    function issueCertificate(address intern, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _safeMint(intern, newItemId);

        _setTokenURI(newItemId, tokenURI);

        emit CertificateIssued(intern, newItemId, tokenURI);

        return newItemId;
    }
}
