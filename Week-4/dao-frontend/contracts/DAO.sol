// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// ==========================================
// 1. THE GOVERNANCE TOKEN
// ==========================================
contract DAOToken is ERC20, ERC20Permit, ERC20Votes {
    constructor() ERC20("DAO Governance Token", "DGT") ERC20Permit("DAO Governance Token") {
        _mint(msg.sender, 10000 * 10 ** decimals());
    }

    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }
    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }
    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}

// ==========================================
// 2. THE GOVERNOR (THE BRAIN)
// ==========================================
contract DAOGovernor is Governor, GovernorSettings, GovernorCountingSimple, GovernorVotes, GovernorTimelockControl {

    constructor(IVotes _token, TimelockController _timelock)
        Governor("SCAI Governor")
        GovernorSettings(
            1,       // voting delay: 1 block (for testing)
            50,      // voting period: 50 blocks (for testing)
            100e18   // proposal threshold: 100 DGT required
        )
        GovernorVotes(_token)
        GovernorTimelockControl(_timelock)
    {}

    function quorum(uint256) public pure override returns (uint256) {
        return 1000e18;
    }

    function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) { return super.votingDelay(); }
    function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) { return super.votingPeriod(); }
    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) { return super.state(proposalId); }
    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) { return super.proposalThreshold(); }
    function supportsInterface(bytes4 interfaceId) public view override(Governor, GovernorTimelockControl) returns (bool) { return super.supportsInterface(interfaceId); }

    function _execute(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }

    function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description)
        public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }
}

// ==========================================
// 3. THE COMMUNITY VAULT (THE TREASURY)
// ==========================================
contract CommunityVault is Ownable, ReentrancyGuard, Pausable {
    uint256 public standardGrantAmount;
    uint256 public totalFundsDispensed;
    uint256 public grantCount;

    event GrantAmountUpdated(uint256 newAmount);
    event FundsDispensed(address indexed recipient, uint256 amount);
    event FundsReceived(address indexed sender, uint256 amount);

    constructor(address timelock) {
        require(timelock != address(0), "Invalid timelock address");
        _transferOwnership(timelock);
    }

    function updateGrantAmount(uint256 _newAmount) external onlyOwner {
        standardGrantAmount = _newAmount;
        emit GrantAmountUpdated(_newAmount);
    }

    function dispenseFunds(address payable recipient, uint256 amount) external onlyOwner nonReentrant whenNotPaused {
        require(address(this).balance >= amount, "Insufficient funds");
        totalFundsDispensed += amount;
        grantCount++;
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "SCAI Transfer failed");
        emit FundsDispensed(recipient, amount);
    }

    function pauseVault() external onlyOwner { _pause(); }
    function unpauseVault() external onlyOwner { _unpause(); }

    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
}
