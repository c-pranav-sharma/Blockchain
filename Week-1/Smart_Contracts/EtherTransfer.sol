// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19; 

contract EtherTransfer {
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public {
        require(msg.sender == owner, "Only the owner can withdraw");
        uint256 amount = address(this).balance;

        (bool success, ) = owner.call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    function transferTo(address payable _to, uint256 _amount) public {
        require(msg.sender == owner, "Only the owner can initiate transfers");
        require(address(this).balance >= _amount, "Insufficient balance in contract");

        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Transfer failed");
    }
}
