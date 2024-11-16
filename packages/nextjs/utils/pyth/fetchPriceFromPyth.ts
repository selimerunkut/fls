import {TokenId} from "~~/models/Token";

const TOKEN_TO_FEED: {[key: TokenId]: string} = {
    'UNI': '0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
    'LINK': '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
    'AAVE': '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445'
}

export async function fetchPriceFromPyth(tokenId: TokenId): Promise<number> {
    const url = `https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${TOKEN_TO_FEED[tokenId]}`;
    const priceResponse = await fetch(url);
    // TODO: Validate schema and response
    const pythPriceResponse = await priceResponse.json();
    const pythPrice = pythPriceResponse.parsed[0].price;
    return pythPrice.price * Math.pow(10, pythPrice.expo);
}
