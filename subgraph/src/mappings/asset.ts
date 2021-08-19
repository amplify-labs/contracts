import { TokenizeAsset } from "../../generated/Asset/AssetAbi"
import { Asset } from "../../generated/schema"

export function handleTokenizeAsset(event: TokenizeAsset): void {
    let asset = Asset.load(event.params.tokenId.toHex())

    if (asset == null) {
        asset = new Asset(event.params.tokenId.toHex())
        asset.hash = event.params.tokenHash;
        asset.rating = event.params.tokenRating;
        asset.uploadedAt = event.params.uploadedAt;
        asset.value = event.params.value;
        asset.uri = event.params.tokenURI;
        asset.factor = event.transaction.from;
        asset.maturity = event.params.maturity;
        asset.isLocked = false;
    }
    asset.save()
}