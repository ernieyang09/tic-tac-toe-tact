import { useState, useEffect } from "react";
import { tonClient } from "../libs/client";
import { TicTacToeGame } from "../contracts/TicTacToeMaster_TicTacToeGame";
import { Address } from "@ton/core";

export const useTicTacToeGameContract = (addr) => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    try {
      const contract = new TicTacToeGame(Address.parse(addr));
      const ticTacToeGameContract = tonClient.open(contract);
      setContract(ticTacToeGameContract);
    } catch {
      console.warn("Invalid address");
      return;
    }
  }, [addr]);

  return contract;
};
