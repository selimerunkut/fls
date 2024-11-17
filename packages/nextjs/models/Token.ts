export type TokenId = string;

export interface Token {
    name: string;
    symbol: string;
    icon: string;
    id: TokenId;
}
export const Tokens: { [key: string]: Token } = {
    PEPO: {
        name: "Pepo",
        symbol: "PEPO",
        icon: "🐸",
        id: "PEPO",
    },
};
