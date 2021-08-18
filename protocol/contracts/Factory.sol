// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Pool.sol";
import "./Asset.sol";
import "./Loan.sol";

contract Factory {
    using SafeMath for uint256;

    mapping(address => Pool[]) public pools;
    mapping(address => Loan[]) public loans;
    mapping(address => bool) public supportedStableCoins;
    mapping(address => uint) stableCoinsIds;
    address[] stableCoins;
    uint coinIds;


    event PoolCreated(address indexed pool, address indexed factor, string name, string structureType, address stableCoin, uint256 minDeposit);
    event LoanCreated(address indexed loan, address indexed factor, uint256 tokenId, uint256 amount, address pool);

    constructor() {}

    function addStableCoin(address stableCoin) public {
        require(!supportedStableCoins[stableCoin], "Stable coin was already added");

        supportedStableCoins[stableCoin] = true;
        stableCoins.push(stableCoin);
        stableCoinsIds[stableCoin] = coinIds;
        coinIds++;
    }

    function removeStableCoin(address stableCoin) public {
        require(supportedStableCoins[stableCoin], "Stable coin was not found");

        supportedStableCoins[stableCoin] = false;
        delete stableCoins[stableCoinsIds[stableCoin]];
        delete stableCoinsIds[stableCoin];
        coinIds--;
    }

    function getStableCoins() public view returns (address[] memory) {
        return stableCoins;
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

    function createLoan(address nftAsset, uint256 tokenId, address pool) public {
        Asset nftFactory = Asset(nftAsset);
        require(nftFactory.ownerOf(tokenId) == pool, "NFT asset is not owned by the pool");

        Loan newLoan = new Loan(nftAsset, tokenId, msg.sender, pool);
        loans[msg.sender].push(newLoan);
        emit LoanCreated(
            address(newLoan),
            msg.sender, 
            tokenId,
            newLoan.getAllowanceAmount(),
            pool
        );
    }
}
