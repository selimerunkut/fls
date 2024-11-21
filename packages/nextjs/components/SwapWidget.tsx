'use client';
import { useEffect, useState } from 'react';
import { AiOutlineArrowDown, AiOutlineDown } from 'react-icons/ai';
import { Tokens, Token } from "~~/models/Token";
import { fetchPriceFromPyth } from "~~/utils/pyth/fetchPriceFromPyth";
import { fetchPriceFromBang } from "~~/utils/bang";
import { useEthersProvider } from "~~/hooks/useEthersProvider";
import { useEthersSigner } from "~~/hooks/useEthersSigner";
import { requestApproval } from "~~/utils/token/requestApproval";
import { useAccount } from "wagmi";
import { bangSwap } from "~~/utils/bang/bangSwap";
import { hasApproval } from "~~/utils/token/hasApproval";

const SwapWidget: React.FC = () => {
    const tokenList: Token[] = Object.values(Tokens);

    const [fromAmount, setFromAmount] = useState<number>(0);
    const [toAmount, setToAmount] = useState<number>(0);
    const [realToAmount, setRealToAmount] = useState<number>(0);
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [selectedToken, setSelectedToken] = useState<Token>(tokenList[0]);
    const [showTokenList, setShowTokenList] = useState<boolean>(false);
    const [allowance, setAllowance] = useState<number>(0);
    const provider = useEthersProvider();
    const signer = useEthersSigner();
    const { address } = useAccount();

    const handleTokenSelect = (token: Token) => {
        setSelectedToken(token);
        setShowTokenList(false);
    };

    useEffect(() => {
        if (!address) return;
        hasApproval(address, provider).then((_allowance) => {
            setAllowance(_allowance);
        });
    }, [address]);


    useEffect(() => {
        const timer = setTimeout(() => {
            Promise.all([
                fetchPriceFromBang(fromAmount, provider),
                fetchPriceFromPyth(selectedToken.id)]
            ).then(([bangPrice, pythPrice]) => {
                if (!selectedToken || fromAmount === 0) {
                    setToAmount(0);
                    setRealToAmount(0);
                    setDiscountPercentage(0);
                    return;
                }

                setToAmount(bangPrice * fromAmount);
                setRealToAmount(pythPrice * fromAmount);
                setDiscountPercentage(((((bangPrice * fromAmount) / (pythPrice * fromAmount))) - 1) * 100);
            });
        }, 200);
        return () => clearTimeout(timer);
    }, [fromAmount, selectedToken, address]);

    return (
        <div className="max-w-md mx-auto bg-gray-900 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-3xl font-bold text-center mb-6">
                Swap instantly, <br /> anywhere.
            </h2>

            {/* From Token Section */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Sell</span>
                    <div
                        className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full cursor-pointer"
                        onClick={() => setShowTokenList(!showTokenList)}
                    >
                        {selectedToken.icon}
                        <span className="font-medium pl-2">{selectedToken.id}</span>
                        <AiOutlineDown />
                    </div>
                </div>

                {/* Token List Dropdown */}
                {/*TODO: Move into its own component */}
                {showTokenList && (
                    <div className="absolute bg-gray-600 rounded-lg shadow-lg min-w-72 mt-2 max-h-72 scroll-auto overflow-scroll">
                        {tokenList.map((token) => (
                            <div
                                key={token.id}
                                className="flex items-center space-x-2 p-4 hover:bg-gray-700 cursor-pointer"
                                onClick={() => handleTokenSelect(token)}
                            >
                                {token.icon}
                                <p className="font-medium ml-2">{token.name}</p>
                                <p className="text-sm text-gray-400 ml-2">{token.symbol}</p>
                            </div>
                        ))}
                    </div>
                )}

                <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(Number(e.target.value))}
                    className="w-full bg-transparent text-3xl font-semibold outline-none"
                />
                <p className="text-gray-400 text-sm mt-1">${realToAmount}</p>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center mb-4">
                <div className="bg-gray-800 rounded-full p-2">
                    <AiOutlineArrowDown className="text-xl" />
                </div>
            </div>

            {/* To Token Section */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Buy</span>
                    <div className="flex items-center space-x-2 bg-blue-600 px-3 py-1 rounded-full cursor-pointer">
                        <span className="font-medium">USDC</span>
                    </div>
                </div>
                <input
                    type="number"
                    value={toAmount}
                    disabled={true}
                    className="w-full bg-transparent text-3xl font-semibold outline-none"
                />
                {fromAmount !== 0 && <p className="text-gray-400 text-red-400 text-sm mt-1">
                    {Math.round(discountPercentage)}%
                </p>}
            </div>

            {/* Swap Button */}
            <div
                disabled={toAmount === 0}
                className={`w-full bg-purple-600 text-white
                 py-3 rounded-lg font-bold hover:bg-purple-700 
                 transition btn`}
                onClick={() => {
                    if (toAmount > allowance) {
                        requestApproval(
                            fromAmount.toString(),
                            address!,
                            signer
                        ).then(() => bangSwap(fromAmount, address!, signer));
                        return;
                    }
                    bangSwap(fromAmount, address!, signer)
                }}>
                {toAmount === 0 ? 'Input a number to get started' : toAmount > allowance ? 'Approve tokens' : 'Swap'}
            </div>
        </div>
    );
};

export default SwapWidget;
