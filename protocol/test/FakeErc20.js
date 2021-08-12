async function deployFakeToken(name, symbol) {
    const Contract = await ethers.getContractFactory("FakeToken");
    const factory = await Contract.deploy(name, symbol);
    await factory.deployed();

    return factory.address;
}


module.exports = {
    deployFakeToken,
}