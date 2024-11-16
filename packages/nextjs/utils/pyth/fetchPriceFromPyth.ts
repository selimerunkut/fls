import {TokenId} from "~~/models/Token";

const TOKEN_TO_FEED: {[key: TokenId]: string} = {
    'PEPO': '0x15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864',
}

export async function fetchPriceFromPyth(tokenId: TokenId): Promise<number> {
    const url = `https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${TOKEN_TO_FEED[tokenId]}`;
    const priceResponse = await fetch(url);
    // TODO: Validate schema and response
    const pythPriceResponse = await priceResponse.json();
    const pythPrice = pythPriceResponse.parsed[0].price;
    return pythPrice.price * Math.pow(10, pythPrice.expo);
}
