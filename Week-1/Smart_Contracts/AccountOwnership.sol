// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AccountOwnership {
    address public owner;

    mapping(address => string) public accountNames;

    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        accountNames[msg.sender] = "Contract Creator";
    }

    function changeOwner(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Invalid address");

        address oldOwner = owner;
        owner = _newOwner;

        emit OwnershipTransferred(oldOwner, _newOwner);
    }

    function setMyNickname(string memory _name) public {
        require(bytes(_name).length > 0, "Empty name not allowed");
        accountNames[msg.sender] = _name;
    }
}
