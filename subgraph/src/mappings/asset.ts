import { TokenizeAsset } from "../../generated/Asset/AssetAbi";
import { Asset } from "../../generated/schema";

export function handleTokenizeAsset(event: TokenizeAsset): void {
    let asset = Asset.load(event.params.tokenId.toHex())

    if (asset == null) {
        asset = new Asset(event.params.tokenId.toHex())
        asset.hash = event.params.tokenHash;
        asset.riskRating = event.params.tokenRating;
        asset.uploadedAt = event.params.uploadedAt;
        asset.value = event.params.value;
        asset.uri = event.params.tokenURI;
        asset.factor = event.transaction.from;
        asset.maturityDate = event.params.maturity;

        asset.isLocked = false;
        asset.isRedeemed = false;
    }
    asset.save()
}

export function handleAssetLock(tokenId: string, loanId: string): void {
    let asset = Asset.load(tokenId);

    asset.isLocked = true;
    asset.loanInfo = loanId;
    asset.save();
}


export function handleAssetUnlock(tokenId: string): void {
    let asset = Asset.load(tokenId);

    asset.isLocked = false;
    asset.save();
}

export function handleAssetRedeem(tokenId: string): void {
    let asset = Asset.load(tokenId);

    asset.isRedeemed = true;
    asset.save();
}