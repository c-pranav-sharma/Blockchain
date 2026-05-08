// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts@4.9.3/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.9.3/security/ReentrancyGuard.sol";

contract SCAIStaking is ERC20, ReentrancyGuard {

    // Tracks how much native SCAI each user has staked
    mapping(address => uint256) public stakedBalance;

    // Tracks the last timestamp used for reward calculations
    mapping(address => uint256) public stakingTimestamp;

    // Total amount currently staked in the contract
    uint256 public totalStaked;

    // Events for frontend/dashboard tracking
    event Staked(address indexed user, uint256 amount);

    event Withdrawn(address indexed user, uint256 amount);

    event RewardClaimed(address indexed user, uint256 rewardAmount);

    // Contract acts as staking vault + ERC20 reward token
    constructor() ERC20("Staking Reward Token", "SRT") {}

    /**
     * @dev Stake native blockchain coins into the contract.
     */
    function stake() public payable nonReentrant {

        require(msg.value > 0, "Cannot stake 0 SCAI");

        // If user already staking, issue pending rewards first
        if (stakedBalance[msg.sender] > 0) {
            _claimRewards(msg.sender);
        }

        stakedBalance[msg.sender] += msg.value;

        stakingTimestamp[msg.sender] = block.timestamp;

        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw staked SCAI coins.
     */
    function withdraw(uint256 amount) public nonReentrant {

        require(amount > 0, "Amount must be greater than 0");

        require(
            stakedBalance[msg.sender] >= amount,
            "Insufficient staked balance"
        );

        // Claim rewards before withdrawal
        _claimRewards(msg.sender);

        stakedBalance[msg.sender] -= amount;

        totalStaked -= amount;

        // Safer ETH/SCAI transfer pattern
        (bool success, ) = payable(msg.sender).call{value: amount}("");

        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Claim staking rewards without withdrawing stake.
     */
    function claimRewards() public nonReentrant {

        require(
            stakedBalance[msg.sender] > 0,
            "No staked balance"
        );

        _claimRewards(msg.sender);
    }

    /**
     * @dev View pending rewards for frontend/dashboard usage.
     */
    function pendingRewards(address user)
        public
        view
        returns (uint256)
    {
        if (stakedBalance[user] == 0) {
            return 0;
        }

        uint256 timeStaked =
            block.timestamp - stakingTimestamp[user];

        return (stakedBalance[user] * timeStaked) / 10000;
    }

    /**
     * @dev Internal reward calculation and minting logic.
     */
    function _claimRewards(address user) internal {

        uint256 reward = pendingRewards(user);

        if (reward > 0) {

            // Reset timer after claiming
            stakingTimestamp[user] = block.timestamp;

            // Mint ERC20 reward tokens
            _mint(user, reward);

            emit RewardClaimed(user, reward);
        }
    }

    /**
     * @dev Returns contract balance (total native coins stored).
     */
    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}