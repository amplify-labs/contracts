import { TokenizeAsset } from "../../generated/Asset/AssetAbi"
import { Asset } from "../../generated/schema"

export function handleTokenizeAsset(event: TokenizeAsset): void {
    let asset = Asset.load(event.params.tokenId)

    if (asset == null) {
        asset = new Asset(event.params.tokenId)
        asset.uploaded_at = event.params.uploadedAt
        asset.value = event.params.value
        asset.uri = event.params.tokenURI
        asset.maturity = event.params.maturity
    }
    asset.save()
}