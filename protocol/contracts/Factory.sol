// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Pool.sol";

contract Factory {
    using SafeMath for uint256;

    mapping(address => Pool[]) public pools;
    mapping(address => bool) public supportedStableCoins;

    event PoolCreated(
        address indexed pool,
        address indexed factor,
        string name,
        string structureType,
        address stableCoin,
        uint256 minDeposit
    );

    constructor() {}

    function addStableCoin(address stableCoin) public {
        require(!supportedStableCoins[stableCoin], "Stable coin was already added");
        supportedStableCoins[stableCoin] = true;
    }

    function removeStableCoin(address stableCoin) public {
        require(supportedStableCoins[stableCoin], "Stable coin was not found");
        supportedStableCoins[stableCoin] = false;
    }

    function createPool(
        string memory name,
        string memory structure,
        address stableCoin,
        uint256 minDeposit
    ) public {
        require(supportedStableCoins[stableCoin], "Stable coin not exists");

        Pool newPool = new Pool(name, structure, stableCoin, minDeposit);
        pools[msg.sender].push(newPool);
        emit PoolCreated(
            address(newPool),
            msg.sender,
            newPool.name(),
            newPool.structureType(),
            newPool.stableCoin(),
            newPool.minDeposit()
        );
    }
}
