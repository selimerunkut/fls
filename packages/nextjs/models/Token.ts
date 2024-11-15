export type TokenId = string;

export interface Token {
    name: string;
    symbol: string;
    icon: Element | string;
    id: TokenId;
}
export const Tokens: {[key: string]: Token} = {
    UNI: {
        name: "Uniswap",
        symbol: "UNI",
        icon: "🦄",
        id: "UNI",
    },
    AAVE: {
        name: "Aave",
        symbol: "AAVE",
        icon: "🦉",
        id: "AAVE",
    },
    LINK: {
        name: "Chainlink",
        symbol: "LINK",
        icon: "🔗",
        id: "LINK",
    },
};
