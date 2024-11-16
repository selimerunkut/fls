'use client';
import {Tokens} from "~~/models/Token";
import {fetchPriceFromPyth} from "~~/utils/pyth/fetchPriceFromPyth";
import {useState} from "react";
import {HermesClient} from "@pythnetwork/hermes-client";
import {useScaffoldWriteContract} from "~~/hooks/scaffold-eth";
import {parseEther} from "viem";

const UpdatePythPrice: React.FC = () => {
    const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("PythPriceOracle");

    const [tokenInput, setTokenInput] = useState<string>(Tokens.UNI.id);



    return (
        <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
            <input
                value={tokenInput} onInput={e => setTokenInput(e.target.value)}
                className={`input`}
            />
            <button
                className={`btn btn-secondary btn-sm font-light hover:border-transparent`}
                onClick={async () => {
                    const connection = new HermesClient("https://hermes.pyth.network", {});
                    const priceUpdates = await connection.getLatestPriceUpdates(['0x15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864']);
                    await writeYourContractAsync({
                        functionName: "updatePrice",
                        args: [
                            priceUpdates.binary.data,
                            '0x6Cb8Cc1e323357Af5da49d90FCb7160B7f09e6Cd',
                            '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d'
                        ],
                        value: parseEther("0.1"),
                    });
                }}
            >
                Update Pyth Price in {"Hardhat"}
            </button>
        </div>
    );
};

export default UpdatePythPrice;
