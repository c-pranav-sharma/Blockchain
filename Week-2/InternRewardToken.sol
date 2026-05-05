// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InternRewardToken
 * @dev Capped ERC-20 reward system for interns on the SecureChain AI network.
 * Inherits standard functionality from OpenZeppelin.
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InternRewardToken is ERC20, ERC20Burnable, Ownable {

    // MAX_SUPPLY: 2,000,000 tokens (expressed in 10^18 wei units)
    uint256 public constant MAX_SUPPLY = 2000000 * 10 ** 18;

    event RewardMinted(address indexed to, uint256 amount);

    constructor() 
        ERC20("Intern Reward Token", "IRT") 
        Ownable(msg.sender) 
    {

        _mint(msg.sender, 1000000 * 10 ** 18);
    }

    function mintRewards(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "IRT: Cannot mint to zero address");
        require(amount > 0, "IRT: Mint amount must be positive");
        require(totalSupply() + amount <= MAX_SUPPLY, "IRT: Max supply exceeded");

        _mint(to, amount);

        emit RewardMinted(to, amount);
    }

    function remainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
