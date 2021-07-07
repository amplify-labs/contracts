pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Asset is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("AmplifyAsset", "AAT") {}

    function tokenizeAsset(address addr, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newAssetId = _tokenIds.current();
        _mint(addr, newAssetId);
        _setTokenURI(newAssetId, tokenURI);

        return newAssetId;
    }
}
