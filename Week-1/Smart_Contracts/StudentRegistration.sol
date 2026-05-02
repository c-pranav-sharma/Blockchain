// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StudentRegistration {
    address public owner;

    struct Student {
        string name;
        string course;
        bool isRegistered;
    }

    mapping(uint256 => Student) private students;

    event StudentRegistered(uint256 indexed rollNumber, string name, string course);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function register(
        uint256 rollNumber,
        string calldata name,
        string calldata course
    ) external onlyOwner {
        require(rollNumber > 0, "Invalid roll number");
        require(!students[rollNumber].isRegistered, "Already registered");
        require(bytes(name).length > 0, "Name required");
        require(bytes(course).length > 0, "Course required");

        students[rollNumber] = Student({
            name: name,
            course: course,
            isRegistered: true
        });

        emit StudentRegistered(rollNumber, name, course);
    }

    function getStudent(uint256 rollNumber)
        external
        view
        returns (string memory name, string memory course)
    {
        require(students[rollNumber].isRegistered, "Not found");

        Student storage s = students[rollNumber];
        return (s.name, s.course);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");

        address oldOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
