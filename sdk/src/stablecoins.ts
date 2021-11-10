import type { AmplifyInstance, StableCoin } from './types';
import { address, supportedStableCoins } from './constants';
import { ethAddressLowerCase, getNetNameWithChainId } from './util';

export function coins(network: number): Record<string, Partial<StableCoin>> {
    let stablecoins: Record<string, Partial<StableCoin>> = {};
    const networkAddr = address[getNetNameWithChainId(network)];

    Object.entries(supportedStableCoins).forEach(([k, v]) => {
        if (networkAddr && networkAddr[k].length) {
            if (k === "AMPT") {
                stablecoins = Object.assign(stablecoins, {
                    "AMPT": {
                        ...v,
                        address: ethAddressLowerCase(networkAddr[k])
                    }
                });
            } else {
                stablecoins = Object.assign(stablecoins, {
                    [ethAddressLowerCase(networkAddr[k])]: v
                });
            }
        }
    });

    return stablecoins
}

export async function loadStableCoins(sdk: AmplifyInstance, networkId: number): Promise<StableCoin[]> {
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