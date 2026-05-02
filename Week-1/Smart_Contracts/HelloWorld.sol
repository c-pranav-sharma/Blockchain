pragma solidity ^0.8.0;

contract HelloWorld {
    string public greeting = "Hello World!";

    function setGreeting(string memory _newGreeting) public {
        greeting = _newGreeting;
    }
}