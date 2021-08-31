import type { AmplifyInstance, StableCoin } from './types';
import { address, supportedStableCoins } from './constants';
import { ethAddressLowerCase } from './util';

export const coins = (network: string) => {
    let stablecoins: Record<string, Partial<StableCoin>> = { };

    Object.entries(supportedStableCoins).forEach(([k, v]) => {
        let coinAddr = address[network][k];
        stablecoins[coinAddr] = v;
    })
    return stablecoins
}

export async function loadStableCoins(sdk: AmplifyInstance, networkId: string): Promise<StableCoin[]> {
    let stableCoins: StableCoin[] = [];

    try {
        const _coins = await sdk.getStableCoins();
        let coinsList = coins(networkId);
        stableCoins = _coins.map(coin => ({
            address: coin,
            symbol: coinsList[ethAddressLowerCase(coin)].symbol,
            decimals: coinsList[ethAddressLowerCase(coin)].decimals,
            logoUrl: coinsList[ethAddressLowerCase(coin)].logoUrl,
        }));
    }
    catch (e) {
        // ignore
        console.error("failed to load stable coins", e);
    }
    return stableCoins;
}