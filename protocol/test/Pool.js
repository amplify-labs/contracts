const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    deployFactory,
    deployCollectible,
    createStableCoin,
    deployFakeToken,
    createNFT,
    createPool,
    depositInPool,
    parseBN
} = require("./utils");

describe("Pool", async function () {
    let poolAddr, stableCoin;
    const minDeposit = ethers.utils.parseEther("0.1");

    beforeEach(async () => {
        let factory = await deployFactory();
        stableCoin = await createStableCoin(factory);
        poolAddr = await createPool(factory, stableCoin, minDeposit);
    });

    it("has the declared values", async () => {
        let pool = await ethers.getContractAt("Pool", poolAddr);

        expect(await pool.name()).to.equal('MATIC-1',);
        expect(await pool.structureType()).to.equal('discounting');
        expect(await pool.stableCoin()).to.equal(stableCoin);
        expect(parseBN(await pool.minDeposit())).to.equal(parseBN(minDeposit));
        expect(parseBN(await pool.totalDeposited())).to.equal(0);
        expect(parseBN(await pool.totalBorrowed())).to.equal(0);
    });

    it("opens credit line", async () => {
        const [owner] = await ethers.getSigners();
        const assetValue = ethers.utils.parseEther("100");

        // init pool contract
        let pool = await ethers.getContractAt("Pool", poolAddr);

        // deploy asset
        let asset = await deployCollectible();

        // create nft
        tokenId = await createNFT(asset, assetValue, "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", 1631462793, "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08.png");

        // Transfer NFT to the Pool contract
        let ntfFactory = await ethers.getContractAt("Asset", asset);
        await ntfFactory.transferFrom(owner.address, poolAddr, tokenId);

        // open credit line
        let tx = await pool.createLoan(asset, tokenId)
        let awaitTx = await tx.wait();

        expect(parseBN(awaitTx.events[0].args.loanId)).to.equal(0);
        expect(parseBN(awaitTx.events[0].args.tokenId)).to.equal(parseBN(tokenId));

        let creditLine = await pool.loans(awaitTx.events[0].args.loanId);
        expect(parseBN(creditLine.borrowedAmount)).to.equal(0);
        expect(creditLine.nftFactory).to.equal(asset);
    });

    describe("Pool Lender", async () => {
        let signers = [];
        const amount = ethers.utils.parseEther("200");
        let stableCoinContract, pool;

        beforeEach(async () => {
            signers = await ethers.getSigners();

            // init pool contract
            pool = await ethers.getContractAt("Pool", poolAddr);

            // init stable coin
            stableCoinContract = await ethers.getContractAt("FakeToken", stableCoin);

            // Mint some tokens
            let mintTx = await stableCoinContract.mint(signers[1].address, amount);
            await mintTx.wait();
        })

        it("can deposit tokens", async () => {
            const [owner, addr1] = signers;

            // Approve Pool contract to use your tokens
            let txAprove = await stableCoinContract.connect(addr1).approve(poolAddr, amount);
            await txAprove.wait();

            // Deposit in the pool
            await depositInPool(pool, addr1, amount);

            // Check that the pool info is correct
            expect(parseBN(await pool.totalDeposited())).to.equal(parseBN(amount));
            expect(parseBN(await pool.balances(addr1.address))).to.equal(parseBN(amount));
            expect(parseBN(await pool.lockedTokens(addr1.address))).to.equal(parseBN(amount));

            // Check that the stable coin info is correct
            let lpToken = await pool.lpToken();
            let poolTokenContract = await ethers.getContractAt("PoolToken", lpToken);
            expect(parseBN(await poolTokenContract.totalSupply())).to.equal(parseBN(amount));
            expect(parseBN(await poolTokenContract.balanceOf(addr1.address))).to.equal(parseBN(amount));
        })

        describe("deposit and withdraw", async () => {
            beforeEach(async () => {
                const [owner, addr1] = signers;

                // Approve Pool contract to use your tokens
                let txAprove = await stableCoinContract.connect(addr1).approve(poolAddr, amount);
                await txAprove.wait();

                // Deposit in the pool
                await depositInPool(pool, addr1, amount);
            })

            it("can withdraw tokens", async () => {
                const [owner, addr1] = signers;
                const amountToWithdraw = ethers.utils.parseEther("1");

                // init LPToken
                let lpToken = await pool.lpToken();
                let poolTokenContract = await ethers.getContractAt("PoolToken", lpToken);

                // Approve Pool contract to use your LPtokens
                let approveTx = await poolTokenContract.connect(addr1).approve(poolAddr, amountToWithdraw);
                await approveTx.wait();


                // currentValues;
                let currentTotalDeposited = await pool.totalDeposited();
                let currentBalance = await pool.balances(addr1.address);
                let currentLockedTokens = await pool.lockedTokens(addr1.address);

                let currentLpTotalSupply = await poolTokenContract.totalSupply();
                let currentLpBalanceOf = await poolTokenContract.balanceOf(addr1.address);
                let currentAccountBalance = await stableCoinContract.balanceOf(addr1.address);


                // withdraw
                let withdrawTx = await pool.connect(addr1).withdraw(amountToWithdraw);
                let txWait = await withdrawTx.wait();

                // Check that the pool info is correct
                expect(parseBN(await pool.totalDeposited())).to.equal(parseBN(currentTotalDeposited.sub(amountToWithdraw)));
                expect(parseBN(await pool.balances(addr1.address))).to.equal(parseBN(currentBalance.sub(amountToWithdraw)));
                expect(parseBN(await pool.lockedTokens(addr1.address))).to.equal(parseBN(currentLockedTokens.sub(amountToWithdraw)));

                // Check that the PoolToken  info is correct
                expect(parseBN(await poolTokenContract.totalSupply())).to.equal(parseBN(currentLpTotalSupply.sub(amountToWithdraw)));
                expect(parseBN(await poolTokenContract.balanceOf(addr1.address))).to.equal(parseBN(currentLpBalanceOf.sub(amountToWithdraw)));

                // Check lender balance
                expect(parseBN(await stableCoinContract.balanceOf(addr1.address) / 1e18)).to.equal(parseBN(currentAccountBalance.add(amountToWithdraw) / 1e18));

            })


            describe("borrow and repay", async () => {
                let asset, tokenId, ntfFactory, loanId;
                const loanAmount = ethers.utils.parseEther("10");

                beforeEach(async () => {
                    const [owner] = signers;
                    const assetValue = ethers.utils.parseEther("100");

                    // deploy asset
                    asset = await deployCollectible();

                    // create nft
                    tokenId = await createNFT(asset, assetValue, "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", 1631462793, "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08.png");

                    // Transfer NFT to the Pool contract
                    ntfFactory = await ethers.getContractAt("Asset", asset);
                    await ntfFactory.transferFrom(owner.address, poolAddr, tokenId);

                    // open credit line
                    let tx = await pool.createLoan(asset, tokenId)
                    let awaitTx = await tx.wait();

                    loanId = awaitTx.events[0].args.loanId;
                    expect(await pool.lockedAssetsIds(tokenId)).to.equal(true);
                })

                describe("borrow", async () => {
                    it("borrow info", async () => {
                        let borrowTx = await pool.borrow(loanId, loanAmount);
                        await borrowTx.wait();

                        expect(parseBN((await pool.creditLines(loanId)).debt)).to.equal(parseBN(loanAmount));

                    });

                    describe("repay", async () => {
                        beforeEach(async () => {
                            let borrowTx = await pool.borrow(loanId, loanAmount);
                            await borrowTx.wait();
                        })

                        it("can repay tokens", async () => {
                            const repayAmount = ethers.utils.parseEther("1");

                            // Approve Pool contract to use your tokens
                            let txRepayAprove = await stableCoinContract.approve(poolAddr, repayAmount);
                            await txRepayAprove.wait();

                            let currentLoanAmount = (await pool.creditLines(loanId)).debt;

                            // repay
                            let repayTx = await pool.repay(loanId, repayAmount);
                            await repayTx.wait();

                            let newLoanAmount = (await pool.creditLines(loanId)).debt;

                            expect(parseBN(newLoanAmount)).to.equal(parseBN(currentLoanAmount.sub(repayAmount)));
                        })

                        it("can repay full", async () => {
                            const repayAmount = loanAmount;

                            // Approve Pool contract to use your tokens
                            let txRepayAprove = await stableCoinContract.approve(poolAddr, repayAmount);
                            await txRepayAprove.wait();

                            // repay
                            let repayTx = await pool.repay(loanId, repayAmount);
                            await repayTx.wait();

                            let creditLine = await pool.creditLines(loanId);
                            expect(parseBN(creditLine.debt)).to.equal(0);
                            expect(creditLine.isClosed).to.equal(true);

                            // asset should be unlocked
                            expect(await pool.lockedAssetsIds(tokenId)).to.equal(false);

                            // asset shoud be redeemed
                            let assetIsRedeemed = await ntfFactory.getRedeemStatus(tokenId);
                            expect(assetIsRedeemed).to.equal(true);


                        })
                    })
                })

                it("can close close credit line if no borrow", async () => {
                    let closeTx = await pool.closeLoan(loanId);
                    await closeTx.wait();

                    let creditLine = await pool.creditLines(loanId);
                    expect(creditLine.isClosed).to.equal(true);

                    // asset should be unlocked
                    expect(await pool.lockedAssetsIds(tokenId)).to.equal(false);

                    // asset shoud be redeemed
                    let assetIsRedeemed = await ntfFactory.getRedeemStatus(tokenId);
                    expect(assetIsRedeemed).to.equal(true);
                });

                it("can unlockAsset if loan is closed", async () => {
                    const [owner] = signers;

                    let closeTx = await pool.closeLoan(loanId);
                    await closeTx.wait();


                    let unlockTx = await pool.unlockAsset(loanId);
                    await unlockTx.wait();

                    // asset shoud be unlocked
                    let assetOwner = await ntfFactory.ownerOf(tokenId);
                    expect(assetOwner).to.equal(owner.address);
                })
            });
        });
    })
});