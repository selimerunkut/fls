import {useEffect, useState} from 'react';
import {AiOutlineArrowDown, AiOutlineDown} from 'react-icons/ai';
import {Tokens, Token} from "~~/models/Token";
import {fetchPriceFromPyth} from "~~/utils/pyth/fetchPriceFromPyth";
import {fetchPriceFromBang} from "~~/utils/bang";

const SwapWidget: React.FC = () => {
    const tokenList: Token[] = Object.values(Tokens);

    const [fromAmount, setFromAmount] = useState<number>(0);
    const [toAmount, setToAmount] = useState<number>(0);
    const [realToAmount, setRealToAmount] = useState<number>(0);
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [selectedToken, setSelectedToken] = useState<Token>(tokenList[0]);
    const [showTokenList, setShowTokenList] = useState<boolean>(false);

    const handleTokenSelect = (token: Token) => {
        setSelectedToken(token);
        setShowTokenList(false);
    };

    useEffect(() => {
        if(!selectedToken || !fromAmount) {
            setToAmount(0);
        }
        fetchPriceFromBang(selectedToken.id, '').then((bangPrice) => {
            setToAmount(bangPrice * fromAmount);
        });
        fetchPriceFromPyth(selectedToken.id).then((pythPrice) => {
            setRealToAmount(pythPrice * fromAmount);
        });
    }, [fromAmount, selectedToken]);

    useEffect(() => {
        if(!toAmount || !realToAmount || realToAmount === 0) {
            setDiscountPercentage(0);
        }
        setDiscountPercentage(((toAmount / realToAmount) - 1)* 100);
    }, [toAmount, realToAmount]);

    return (
        <div className="max-w-md mx-auto bg-gray-900 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-3xl font-bold text-center mb-6">
                Swap instantly, <br/> anywhere.
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
                    type="text"
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
                    type="text"
                    value={toAmount}
                    disabled={true}
                    className="w-full bg-transparent text-3xl font-semibold outline-none"
                />
                <p className="text-gray-400 text-red-400 text-sm mt-1">
                    {Math.round(discountPercentage)}%
                </p>
            </div>

            {/* Swap Button */}
            <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition">
                Get started
            </button>
        </div>
    );
};

export default SwapWidget;
