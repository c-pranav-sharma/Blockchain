// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleVoting {
    address public owner;

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) private candidates;
    mapping(address => bool) public hasVoted;

    uint256 public candidatesCount;
    bool public votingActive;

    event Voted(uint256 indexed candidateId, address indexed voter);
    event CandidateAdded(uint256 indexed candidateId, string name);
    event VotingStatusChanged(bool status);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyDuringVoting() {
        require(votingActive, "Voting is not active");
        _;
    }

    constructor() {
        owner = msg.sender;
        votingActive = true;
    }

    function addCandidate(string calldata name) external onlyOwner {
        require(bytes(name).length > 0, "Invalid name");

        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, name, 0);

        emit CandidateAdded(candidatesCount, name);
    }

    function vote(uint256 candidateId) external onlyDuringVoting {
        require(!hasVoted[msg.sender], "Already voted");
        require(candidateId > 0 && candidateId <= candidatesCount, "Invalid candidate");

        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount++;

        emit Voted(candidateId, msg.sender);
    }

    function getResults(uint256 candidateId)
        external
        view
        returns (string memory name, uint256 voteCount)
    {
        require(candidateId > 0 && candidateId <= candidatesCount, "Not found");

        Candidate storage c = candidates[candidateId];
        return (c.name, c.voteCount);
    }

    function setVotingStatus(bool _status) external onlyOwner {
        votingActive = _status;
        emit VotingStatusChanged(_status);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");

        address oldOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
