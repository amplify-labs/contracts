import { TokenizeAsset, AddRiskItemCall, RemoveRiskItemCall } from "../../generated/Asset/AssetAbi"
import { Asset } from "../../generated/schema"

export function handleTokenizeAsset(event: TokenizeAsset): void {
    let asset = Asset.load(event.params.tokenId.toHex())

    if (asset == null) {
        asset = new Asset(event.params.tokenId.toHex())
        asset.hash = event.params.tokenHash;
        asset.rating = event.params.tokenRating;
        asset.uploadedAt = event.params.uploadedAt
        asset.value = event.params.value
        asset.uri = event.params.tokenURI
        asset.maturity = event.params.maturity
    }
    asset.save()
}

// export function handleAddRiskItem(call: AddRiskItemCall): void {
//     let id = call.transaction.hash.toHex();

//     let riskInfo = new RiskInfo(id);
//     riskInfo.rating = call.inputs.rating;
//     riskInfo.interestRate = call.inputs.interestRate;
//     riskInfo.advanceRate = call.inputs.advanceRate;

//     riskInfo.save();
// }

// export function handleRemoveRiskItem(call: RemoveRiskItemCall): void {
//     let id = call.transaction.hash.toHex();
//     let riskInfo = RiskInfo.load(id);

//     riskInfo.unset(id);
// }