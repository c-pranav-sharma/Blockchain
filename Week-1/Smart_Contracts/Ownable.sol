// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19; 

contract OwnablePattern {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {

        require(msg.sender == owner, "Ownable: caller is not the owner");
        _; 
    }

    uint256 public secretCode;
    
    function setSecretCode(uint256 _newCode) public onlyOwner {
        secretCode = _newCode;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
