import { useState, useEffect } from "react";
import { tonClient } from "../libs/client";
import { TicTacToeMaster } from "../../../be/build/TicTacToeMaster/TicTacToeMaster_TicTacToeMaster";
import { address } from "@ton/ton";

export const useTicTacToeMasterContract = () => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const contract = new TicTacToeMaster(
      address(import.meta.env.VITE_TON_TIC_TOK_TOE_MASTER_CONTRACT_ADDR)
    );
    const ticTacToeMasterContract = tonClient.open(contract);
    setContract(ticTacToeMasterContract);
  }, []);

  return contract;
};
