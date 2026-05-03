// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract InternshipTracker {
    address public owner;

    enum Status { Pending, InProgress, Completed, Review }

    struct Task {
        string taskName;
        string description;
        Status status;
        uint256 lastUpdated;
    }

    mapping(uint256 => Task) private tasks;
    uint256 public taskCount;

    event TaskCreated(uint256 id, string taskName);
    event StatusUpdated(uint256 id, Status newStatus);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addTask(string calldata name, string calldata description) external onlyOwner {
        require(bytes(name).length > 0, "Name required");
        require(bytes(description).length > 0, "Description required");

        taskCount++;

        tasks[taskCount] = Task({
            taskName: name,
            description: description,
            status: Status.Pending,
            lastUpdated: block.timestamp
        });

        emit TaskCreated(taskCount, name);
    }

    function updateTaskStatus(uint256 taskId, Status newStatus) external onlyOwner {
        require(taskId > 0 && taskId <= taskCount, "Not found");

        tasks[taskId].status = newStatus;
        tasks[taskId].lastUpdated = block.timestamp;

        emit StatusUpdated(taskId, newStatus);
    }

    function getTask(uint256 taskId)
        external
        view
        returns (
            string memory name,
            string memory description,
            Status status,
            uint256 updatedAt
        )
    {
        require(taskId > 0 && taskId <= taskCount, "Not found");

        Task storage t = tasks[taskId];
        return (t.taskName, t.description, t.status, t.lastUpdated);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");

        address oldOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
