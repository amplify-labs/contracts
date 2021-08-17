const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    deployCollectible,
    createNFT,
    parseBN
} = require("./utils");


describe('Deploy Asset', () => {
    it("should be deployed", async () => {
        let asset = await deployCollectible();
        expect(asset).to.be.not.null;
    });
});

describe('TokenizeAsset', () => {
    it("should have an asset", async () => {
        let asset = await deployCollectible();
        let tokenId = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

        let nftTokenId = await createNFT(asset, 20000, tokenId, 1628782737, tokenId + ".png");
        expect(nftTokenId.toString(), tokenId);
    });
});