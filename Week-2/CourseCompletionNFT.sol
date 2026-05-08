// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts@4.9.3/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.9.3/utils/Counters.sol";
import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";

contract CourseCompletionNFT is ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Stores the completed course name for each NFT
    mapping(uint256 => string) public completedCourses;

    // Event emitted whenever a new course certificate NFT is issued
    event CourseCompleted(
        address indexed student,
        uint256 indexed tokenId,
        string courseName,
        string tokenURI
    );

    constructor() ERC721("Course Completion NFT", "CCNFT") {}

    /**
     * @dev Issues a unique Course Completion NFT to a student.
     * @param student Wallet address of the student.
     * @param courseName Name of the completed course.
     * @param tokenURI Metadata URI (IPFS or JSON metadata link).
     */
    function issueCourseNFT(
        address student,
        string memory courseName,
        string memory tokenURI
    )
        public
        onlyOwner
        returns (uint256)
    {
        // Increment token ID counter
        _tokenIds.increment();

        // Get new token ID
        uint256 newItemId = _tokenIds.current();

        // Safely mint NFT to student
        _safeMint(student, newItemId);

        // Attach metadata URI to NFT
        _setTokenURI(newItemId, tokenURI);

        // Store course name on-chain
        completedCourses[newItemId] = courseName;

        // Emit event for frontend tracking
        emit CourseCompleted(
            student,
            newItemId,
            courseName,
            tokenURI
        );

        return newItemId;
    }

    /**
     * @dev Returns total NFTs issued.
     */
    function totalCertificatesIssued() public view returns (uint256) {
        return _tokenIds.current();
    }
}
