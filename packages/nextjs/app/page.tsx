"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import SwapWidget from "~~/components/SwapWidget";
const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
              <SwapWidget />
          </div>
      </div>
    </>
  );
};

export default Home;
