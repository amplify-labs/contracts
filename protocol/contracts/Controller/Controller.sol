// SPDX-License-Identifier: MIT
/// @dev size: 20.333 Kbytes
pragma solidity ^0.8.0;

import "./ControllerStorage.sol";
import "./Rewards.sol";
import "./StableCoin.sol";

import "../Liquidity/Pool.sol";

import "../proxy/Clones.sol";
import "../security/Ownable.sol";
import "../security/ReentrancyGuard.sol";
import "../utils/NonZeroAddressGuard.sol";

import { ControllerErrorReporter } from "../utils/ErrorReporter.sol";

contract Controller is ControllerStorage, Rewards, ControllerErrorReporter, Ownable, ReentrancyGuard, NonZeroAddressGuard {
    using StableCoin for StableCoin.Data;
    
    StableCoin.Data private _stableCoins;
    address internal _poolLibrary;

    event PoolCreated(address indexed pool, address indexed owner, address stableCoin, uint256 minDeposit, uint8 access);
    
    event NewProvisionPool(LossProvisionInterface oldProvisionPool, LossProvisionInterface newProvisionPool);
    event NewInterestRateModel(InterestRateModel oldInterestRateModel, InterestRateModel newInterestRateModel);
    event NewAssetsFactory(AssetInterface oldAssetsFactory, AssetInterface newAssetsFactory);
    event NewAmptContract(IERC20 oldAmptToken, IERC20 newAmptToken);

    event AmptPoolSpeedChanged(address pool, uint oldSpeed, uint newSpeed);
    event AmptDepositAmountChanged(uint oldAmount, uint newAmount);

    event BorrowerCreated(address borrower);
    event BorrowerWhitelisted(address borrower);
    event BorrowerBlacklisted(address borrower);

    event LenderCreated(address lender);
    event LenderWhitelisted(address lender, address borrower);
    event LenderBlacklisted(address lender, address borrower);
    
    event DebtCeilingChanged(address borrower, uint newCeiling);
    event RatingChanged(address borrower, uint newRating);

    constructor() {
        _deployPoolLibrary();
    }

    function _deployPoolLibrary() internal virtual {
        _poolLibrary = address(new Pool());
    }

    function submitBorrower() external returns (uint256) {
        transferAMPTDeposit(msg.sender);

        if(!borrowers[msg.sender].created) {
            borrowers[msg.sender] = Borrower(
                0,
                0,
                false,
                true
            );
            emit BorrowerCreated(msg.sender);
        }
        return uint256(Error.NO_ERROR);
    }

    function requestPoolWhitelist(address pool, uint256 deposit) external nonReentrant nonZeroAddress(pool) returns (uint256) {
        Pool poolI = Pool(pool);

        require(poolI.isInitialized(), "Pool is not initialized");
        require(poolI.stableCoin().allowance(msg.sender, address(this)) >= deposit, "Lender does not approve allowance");

        Application storage application = poolApplicationsByLender[pool][msg.sender];
        if(!application.created) {
            application.created = true;

            application.depositAmount = deposit;
            application.lender = msg.sender;
            application.mapIndex = poolApplications[pool].length;

            poolApplications[pool].push(application);
            emit LenderCreated(msg.sender);
            
            assert(poolI.stableCoin().transferFrom(msg.sender, address(this), deposit));
        }

        return uint256(Error.NO_ERROR);
    }

    function withdrawApplicationDeposit(address pool) external {
        Application storage application = poolApplicationsByLender[pool][msg.sender];
        require(application.lender == msg.sender, "invalid application lender");

        if (application.created) {
            uint256 depositAmount = application.depositAmount;
            application.depositAmount = 0;
            poolApplications[pool][application.mapIndex] = application;

            assert(Pool(pool).stableCoin().transfer(msg.sender, depositAmount));
        }
    }

    function createPool(string memory name, uint256 minDeposit, address stableCoin, Pool.Access poolAccess) external nonReentrant {
        require(borrowers[msg.sender].whitelisted, "Only whitelisted user can create pool");
        address pool = Clones.createClone(_poolLibrary);

        Pool _poolI = Pool(pool);
        require(!_poolI.isInitialized(), "pool already initialized");
        _poolI.initialize(msg.sender, stableCoin, name, minDeposit, poolAccess);

        PoolInfo storage _pool = pools[pool];
        _pool.owner = msg.sender;
        _pool.isActive = true;

        borrowerPools[msg.sender].push(pool);

        // reward variables
        rewardPools.push(pool);
        rewardsState[pool] = PoolState(true, 0, 0, 0, 0);

        emit PoolCreated(pool, msg.sender, stableCoin, minDeposit, uint8(poolAccess));
    }

    function getPoolUtilizationRate(address pool) external view returns (uint256) {
        uint256 totalCash = Pool(pool).getCash();
        uint256 totalBorrows = Pool(pool).getTotalBorrowBalance();

        return interestRateModel.utilizationRate(totalCash, totalBorrows);
    }

    // Admin functions
    function _setProvisionPool(LossProvisionInterface newProvisionPool) external onlyOwner {
        require(newProvisionPool.isLossProvision(), "marker method returned false");

        LossProvisionInterface oldProvisionPool = provisionPool;
        require(newProvisionPool != oldProvisionPool, "provisionPool is already set to this value");

        provisionPool = newProvisionPool;
        emit NewProvisionPool(oldProvisionPool, newProvisionPool);
    }

    function _setInterestRateModel(InterestRateModel newInterestModel) external onlyOwner {
        require(newInterestModel.isInterestRateModel(), "marker method returned false");

        InterestRateModel oldInterestModel = interestRateModel;
        require(newInterestModel != oldInterestModel, "interestRateModel is already set to this value");

        interestRateModel = newInterestModel;
        emit NewInterestRateModel(oldInterestModel, newInterestModel);
    }

    function _setAssetsFactory(AssetInterface newAssetsFactory) external onlyOwner {
        require(newAssetsFactory.isAssetsFactory(), "marker method returned false");

        AssetInterface oldAssetsFactory = assetsFactory;
        require(newAssetsFactory != oldAssetsFactory, "assetsFactory is already set to this value");

        assetsFactory = newAssetsFactory;
        emit NewAssetsFactory(oldAssetsFactory, newAssetsFactory);
    }

    function _setAmptContract(IERC20 newAmptToken) external onlyOwner {
        IERC20 oldAmptToken = amptToken;
        require(newAmptToken != oldAmptToken, "amptToken is already set to this value");

        amptToken = newAmptToken;
        emit NewAmptContract(oldAmptToken, newAmptToken);
    }

    function _setAmptSpeed(address pool, uint256 newSpeed) external onlyOwner nonZeroAddress(pool) {
        require(Pool(pool).isInitialized(), "pool is not active");
        require(newSpeed > 0, "speed must be greater than 0");

        uint currentSpeed = amptPoolSpeeds[pool];
        if (currentSpeed != newSpeed) {
            amptPoolSpeeds[pool] = newSpeed;
            emit AmptPoolSpeedChanged(pool, currentSpeed, newSpeed);
        }
        updateBorrowIndexInternal(pool);
        updateSupplyIndexInternal(pool);
    }

    function _setAmptDepositAmount(uint256 newDeposit) external onlyOwner{
        require(newDeposit > 0, "amount must be greater than 0");

        uint currentDeposit = amptDepositAmount;

        if (currentDeposit != newDeposit) {
            amptDepositAmount = newDeposit;
            emit AmptDepositAmountChanged(currentDeposit, newDeposit);
        }
    }

    function transferFunds(address destination) external onlyOwner nonZeroAddress(destination) returns (bool) {
        return amptToken.transfer(destination, amptToken.balanceOf(address(this)));
    }

    function whitelistBorrower(address borrower, uint256 debtCeiling, uint256 rating) external onlyOwner returns (uint256) {
        Borrower storage _borrower = borrowers[borrower];
        require(_borrower.created, toString(Error.BORROWER_NOT_CREATED));
        require(!_borrower.whitelisted, toString(Error.ALREADY_WHITELISTED));
 
        _borrower.whitelisted = true;

        _setBorrowerDebtCeiling(borrower, debtCeiling);
        _setBorrowerRating(borrower, rating);

        emit BorrowerWhitelisted(borrower);
        return uint256(Error.NO_ERROR);
    }

    function whitelistLender(address _lender, address _pool) external returns (uint256) {
        Application storage application = poolApplicationsByLender[_pool][_lender];
        require(application.created, toString(Error.LENDER_NOT_CREATED));

        address borrower = pools[_pool].owner;
        require(borrower == msg.sender, toString(Error.INVALID_OWNER));

        require(!borrowerWhitelists[borrower][_lender], toString(Error.ALREADY_WHITELISTED));

        borrowerWhitelists[borrower][_lender] = true;
        application.whitelisted = true;
        poolApplications[_pool][application.mapIndex] = application;

        emit LenderWhitelisted(_lender, msg.sender);
        return uint256(Error.NO_ERROR);
    }

    function blacklistBorrower(address borrower) external onlyOwner returns (uint256) {
        Borrower storage _borrower = borrowers[borrower];

        require(_borrower.created, toString(Error.BORROWER_NOT_CREATED));
        require(_borrower.whitelisted, toString(Error.BORROWER_NOT_WHITELISTED));
    
        _borrower.whitelisted = false;
        for(uint8 i=0; i < borrowerPools[borrower].length; i++) {
            address pool = borrowerPools[borrower][i];
            pools[pool].isActive = false;
        }
        emit BorrowerBlacklisted(borrower);
        return uint256(Error.NO_ERROR);
    }

    function blacklistLender(address _lender) external returns (uint256) {
        require(borrowerWhitelists[msg.sender][_lender], toString(Error.LENDER_NOT_WHITELISTED));
    
        borrowerWhitelists[msg.sender][_lender] = false;
        for(uint8 i=0; i < borrowerPools[msg.sender].length; i++) {
            address pool = borrowerPools[msg.sender][i];
            
            poolApplicationsByLender[pool][_lender].whitelisted = false;
            poolApplications[pool][poolApplicationsByLender[pool][_lender].mapIndex] = poolApplicationsByLender[pool][_lender];
        }

        emit LenderBlacklisted(_lender, msg.sender);
        return uint256(Error.NO_ERROR);
    }

    struct BorrowerInfo {
        uint256 debtCeiling;
        uint256 rating;
    }

    function updateBorrowerInfo(address borrower, BorrowerInfo calldata borrowerInfo) external onlyOwner nonZeroAddress(borrower) returns (uint256) {
        require(borrowers[borrower].created, toString(Error.BORROWER_NOT_CREATED));
        
        _setBorrowerDebtCeiling(borrower, borrowerInfo.debtCeiling);
        _setBorrowerRating(borrower, borrowerInfo.rating);

        return uint256(Error.NO_ERROR);
    }

    function addStableCoin(address stableCoin) onlyOwner external {
        require(_stableCoins.insert(stableCoin));
    }

    function removeStableCoin(address stableCoin) onlyOwner external {
        require(_stableCoins.remove(stableCoin));
    }

    function containsStableCoin(address stableCoin) public view returns (bool) {
        return _stableCoins.contains(stableCoin);
    }

    function getStableCoins() external view returns (address[] memory) {
        return _stableCoins.getList();
    }

    function lendAllowed(address pool, address lender, uint256 amount) external returns (uint256) {
        PoolInfo storage _pool = pools[pool];

        // Check if pool is active
        if (!_pool.isActive) {
            return uint256(Error.POOL_NOT_ACTIVE);
        }

        // Check if pool is private
        if (
            Pool(pool).access() == uint8(Pool.Access.Private) &&
            !borrowerWhitelists[_pool.owner][lender]
        ) {
            return uint256(Error.LENDER_NOT_WHITELISTED);
        }

        // Not used for now
        amount;

        updateSupplyIndexInternal(pool);
        distributeSupplierTokens(pool, lender);

        return uint256(Error.NO_ERROR);
    }

    function redeemAllowed(address pool, address redeemer, uint256 amount) external returns (uint256) {
        PoolInfo storage _pool = pools[pool];

        // Check if pool is active
        if (!_pool.isActive) {
            return uint256(Error.POOL_NOT_ACTIVE);
        }

        // Not used for now
        amount;

        updateSupplyIndexInternal(pool);
        distributeSupplierTokens(pool, redeemer);

        return uint256(Error.NO_ERROR);
    }

    function borrowAllowed(address pool, address borrower, uint256 amount) external returns (uint256) {
        PoolInfo storage _pool = pools[pool];

        // Check if pool is active
        if (!_pool.isActive) {
            return uint256(Error.POOL_NOT_ACTIVE);
        }

        /* Check if borrower is owner of the pool */
        // @dev Borrower can borrow only from his own pools
        if (_pool.owner != borrower) {
            return uint256(Error.BORROWER_NOT_MEMBER);
        }

        // Check if borrower is whitelisted
        if (!borrowers[borrower].whitelisted) {
            return uint256(Error.BORROWER_NOT_WHITELISTED);
        }

        uint256 borrowCap = borrowers[borrower].debtCeiling;
        // Borrow cap of 0 corresponds to unlimited borrowing
        if (borrowCap != 0) {
            uint256 totalBorrows = Pool(pool).getBorrowerBalance(borrower);
            uint256 nextTotalBorrows = totalBorrows + amount;
            if (nextTotalBorrows >= borrowCap) {
                return uint256(Error.BORROW_CAP_EXCEEDED);
            }
        }

        updateBorrowIndexInternal(pool);
        distributeBorrowerTokens(pool, borrower);

        return uint256(Error.NO_ERROR);
    }

    function repayAllowed(address pool, address payer, address borrower, uint256 amount) external returns (uint256) {
        PoolInfo storage _pool = pools[pool];

        // currently unused
        payer;
        amount;

        // Check if pool is active
         require(_pool.isActive, toString(Error.POOL_NOT_ACTIVE));

        updateBorrowIndexInternal(pool);
        distributeBorrowerTokens(pool, borrower);

        return uint256(Error.NO_ERROR);
    }

    function createCreditLineAllowed(address pool, address borrower, uint256 collateralAsset) external virtual nonReentrant returns (uint256) {
         PoolInfo storage _pool = pools[pool];

        // Check if pool is active
        require(_pool.isActive, toString(Error.POOL_NOT_ACTIVE));

        // Check if collateral asset is supported
        (uint256 assetValue, uint256 maturity,uint256 interestRate,,, , bool redeemed) = assetsFactory.getTokenInfo(collateralAsset);
        uint256 borrowCap = borrowers[borrower].debtCeiling;

        require(borrowCap == 0 || borrowCap >= assetValue, toString(Error.BORROW_CAP_EXCEEDED));
        require(assetsFactory.ownerOf(collateralAsset) == pool, toString(Error.INVALID_OWNER));
        require(!redeemed, toString(Error.ASSET_REDEEMED));
        require(maturity >= getBlockTimestamp(), toString(Error.MATURITY_DATE_EXPIRED));
        require(interestRate > 0, toString(Error.NOT_ALLOWED_TO_CREATE_CREDIT_LINE));

        return uint256(Error.NO_ERROR);
    }

    // Internal function
    function transferAMPTDeposit(address _owner) internal nonReentrant {
        require(amptToken.allowance(_owner, address(this)) >= amptDepositAmount, "Allowance is not enough");
        require(amptToken.transferFrom(_owner, address(this), amptDepositAmount), toString(Error.AMPT_TOKEN_TRANSFER_FAILED));
    }

    function _setBorrowerDebtCeiling(address borrower, uint256 debtCeiling) internal returns (uint256) {
        Borrower storage _borrower = borrowers[borrower];

        if (_borrower.whitelisted) {
            _borrower.debtCeiling = debtCeiling;
            emit DebtCeilingChanged(borrower, debtCeiling);
        }
        return uint256(Error.NO_ERROR);
    }

    function _setBorrowerRating(address borrower, uint256 rating) internal returns (uint256) {
        require(1e18 - rating >= 0, "Rating must be between 0 and 1");
        Borrower storage _borrower = borrowers[borrower];

        if (_borrower.whitelisted) {
            _borrower.ratingMantissa = rating;
            emit RatingChanged(borrower, rating);
        }
        return uint256(Error.NO_ERROR);
    }

    function grantRewardInternal(address account, uint256 amount) internal override returns (uint256) {
        uint amptRemaining = amptToken.balanceOf(address(this));
        if (amount > 0 && amount <= amptRemaining) {
            assert(amptToken.transfer(account, amount));
            return 0;
        }
        return amount;
    }

    function getBorrowerTotalPrincipal(address pool, address holder) internal override virtual view returns (uint256) {
        return Pool(pool).getBorrowerTotalPrincipal(holder);
    }

    function getSupplierBalance(address pool, address holder) internal override virtual view returns (uint256) {
        return Pool(pool).balanceOf(holder);
    }

    function getPoolInfo(address pool) internal override view returns (uint256, uint256) {
        Pool _pool = Pool(pool);
        return (_pool.totalSupply(), _pool.totalPrincipal());
    }

    function getBlockNumber() public virtual override view returns (uint256) {
        return block.number;
    }

    function getBlockTimestamp() public virtual view returns (uint256) {
        return block.timestamp;
    }
}