// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Asset is ERC721URIStorage {

    event TokenizeAsset(string tokenId, uint256 value, string tokenURI, uint256 maturity, uint256 uploadedAt);

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("AmplifyAsset", "AAT") {}

    function tokenizeAsset(address addr, string memory tokenId, uint256 value, uint256 maturity, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newAssetId = _tokenIds.current();
        _mint(addr, newAssetId);
        _setTokenURI(newAssetId, tokenURI);

        emit TokenizeAsset(tokenId, value, tokenURI, maturity, block.timestamp);

        return newAssetId;
    }

    function totalSupply()
        public
        view
        returns (uint256)
    {
        return _tokenIds.current();
    }
}
