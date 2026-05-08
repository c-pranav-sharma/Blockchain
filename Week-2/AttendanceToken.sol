// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts@4.9.3/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";

contract AttendanceToken is ERC20, Ownable {

    event AttendanceRewarded(address indexed attendee, uint256 amount);

    constructor() ERC20("Attendance Token", "AT") {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    function rewardAttendance(address attendee, uint256 amount) public onlyOwner {
        _mint(attendee, amount);

        emit AttendanceRewarded(attendee, amount);
    }
}
