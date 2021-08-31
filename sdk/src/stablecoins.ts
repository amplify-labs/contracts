import type { AmplifyInstance, StableCoin } from './types';
import { address, supportedStableCoins } from './constants';
import { ethAddressLowerCase } from './util';

export function coins(network: string): Record<string, Partial<StableCoin>> {
    let stablecoins: Record<string, Partial<StableCoin>>;

    Object.entries(supportedStableCoins).forEach(([k, v]) => {
        stablecoins[address[network][k]] = v;
    })

    return stablecoins
}

export async function loadStableCoins(sdk: AmplifyInstance, networkId: string): Promise<StableCoin[]> {
    let stableCoins: StableCoin[] = [];

    try {
        const _coins = await sdk.getStableCoins();
        const coinsList = coins(networkId);
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