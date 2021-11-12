// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Governance/IAMPT.sol";

contract Faucet{

    IAMPT public amptToken;
    address public owner;

    uint256 public tokensPerUser = 10e18;

    mapping(address => bool) public distributions;

    constructor(IAMPT amptToken_) {
        amptToken = amptToken_;
        owner = msg.sender;
    }

    function balanceOf() public view returns (uint256) {
        return amptToken.balanceOf(address(this));
    }

    function updateTokensPerUser(uint256 value) external {
        require(msg.sender == owner, "Only owner can update");

        require(value > 0, "Value must be greater than 0");
        tokensPerUser = value;
    }

    function withdraw() external returns (bool) {
        require(msg.sender == owner, "Only owner can withdraw");

        uint256 amount = amptToken.balanceOf(address(this));
        require(amount > 0, "No tokens to withdraw");

        return amptToken.transfer(owner, amount);
    }

    function getTokens() external returns (bool) {
        require(!distributions[msg.sender], "You have already received your tokens");
        require(amptToken.balanceOf(address(this)) >= tokensPerUser, "Not enough tokens in the contract");
        distributions[msg.sender] = true;

        return amptToken.transfer(msg.sender, tokensPerUser);
    }
 }
