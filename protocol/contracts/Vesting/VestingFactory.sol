// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./Vesting.sol";
import "../utils/CloneFactory.sol";

contract VestingFactory is CloneFactory {
    address public immutable owner;
    
    struct Instance {
        address instanceAddr;
        address owner;
        address tokenAddr;
    }

    Instance[] public instances;
    address public libraryAddress;

    event InstanceCreated(address indexed instance, address owner, address token);

    /**
     * @notice Contract constructor
     * @dev Prior to deployment you must deploy one copy of `Vesting` which
     * is used as a library for vesting contracts deployed by this factory
     * @param _libraryAddress `Vesting` contract address
    */
    constructor(address _libraryAddress) {
        require(_libraryAddress != address(0), "Library address cannot be 0");

        owner = msg.sender;
        libraryAddress = _libraryAddress;
    } 

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @notice Update the `Vesting` library address
     * @dev Only the owner can update the library address
     * @param _libraryAddress `Vesting` contract address
     */
    function setLibraryAddress(address _libraryAddress) external onlyOwner {
        require(_libraryAddress != address(0), "Library address cannot be 0");
        require(_libraryAddress != libraryAddress, "Library address cannot be the same as the current one");

        libraryAddress = _libraryAddress;
    }

    /** 
     * @notice Deploy a new vesting contract
     * @param _token Address of the ERC20 token being distributed
    */
    function createVestingContract(IERC20 _token) external virtual {
        address _contract = createClone(libraryAddress);

        Vesting(_contract).initialize(msg.sender, _token);
        instances.push(Instance(_contract, msg.sender, address(_token)));

        emit InstanceCreated(_contract, msg.sender, address(_token));
    }

    function getBlockTimestamp() public virtual view returns (uint256) {
        return block.timestamp;
    }
}