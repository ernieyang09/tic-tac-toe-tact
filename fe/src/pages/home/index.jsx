import { useNavigate } from "react-router-dom";

import {
  useTonAddress,
  UserRejectsError,
  useTonWallet,
} from "@tonconnect/ui-react";
import { useTicTacToeMasterContract } from "../../hooks/useTicTokToeMasterContract";
import { useMemo, useState, useRef, useEffect } from "react";
import { Address } from "@ton/core";
import { useTonSender } from "../../hooks/useTonSender";
import { useQuery } from "@tanstack/react-query";
import { toNano } from "@ton/core";

const HomePage = () => {
  const creatingRef = useRef(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const userFriendlyAddress = useTonAddress();
  const wallet = useTonWallet();
  const ticTacToeMasterContract = useTicTacToeMasterContract();
  const sender = useTonSender();

  const { data: gameHistory } = useQuery({
    queryKey: ["games", userFriendlyAddress],
    queryFn: async () => {
      return await ticTacToeMasterContract.getGames(
        Address.parse(userFriendlyAddress),
        0n
      );
    },
    enabled: !!ticTacToeMasterContract,
    refetchInterval: 3000,
  });

  const gameHistoryList = useMemo(() => {
    if (!gameHistory) return [];
    return gameHistory.m.values().map((gameAddr) => {
      return gameAddr.toString();
    });
  }, [gameHistory]);

  useEffect(() => {
    if (creatingRef.current) {
      setLoading(false);
      creatingRef.current = false;
      const newGame = gameHistoryList[0];
      navigate(`/${newGame}`);
    }
  }, [gameHistoryList?.length, navigate]);

  const handleCreateGame = async () => {
    try {
      setLoading(true);
      await ticTacToeMasterContract.send(
        sender,
        {
          value: toNano("0.2"),
        },
        {
          $$type: "DeployGame",
          playerOne: Address.parse(userFriendlyAddress),
          playerTwo: Address.parse(userFriendlyAddress),
          playerOnePublicKey: BigInt(`0x${wallet.account.publicKey}`),
          playerTwoPublicKey: BigInt(`0x${wallet.account.publicKey}`),
        }
      );
      creatingRef.current = true;
    } catch (e) {
      console.log(e);
      if (e instanceof UserRejectsError) {
        creatingRef.current = false;
        setLoading(false);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        // background: "#f7f7f7", // no background
      }}
    >
      <h1 style={{ marginBottom: 32 }}>Tic-Tac-Toe</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column", // column-based layout
          gap: "40px",
          width: "100%",
          maxWidth: 600,
          justifyContent: "center",
        }}
      >
        {/* Game History Section */}
        <section
          style={{
            borderRadius: 12,
            padding: 0,
            minWidth: 350,
            flex: 1,
            marginBottom: 24,
          }}
        >
          <h2 style={{ marginBottom: 16 }}>Game History</h2>
          {gameHistoryList.length === 0 ? (
            <div style={{ color: "#888" }}>No games found.</div>
          ) : (
            gameHistoryList.map((addr, idx) => (
              <div
                key={addr}
                onClick={() => {
                  navigate(`/${addr}`);
                }}
                style={{
                  cursor: "pointer",
                  padding: "8px 0",
                  color: "#007bff",
                }}
              >
                {addr}
              </div>
            ))
          )}
        </section>
        {/* Create Game Section */}
        <section
          style={{
            // background: "#fff", // remove white background
            borderRadius: 12,
            // boxShadow: "0 2px 8px rgba(0,0,0,0.07)", // remove shadow
            padding: 0,
            minWidth: 350,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2 style={{ marginBottom: 16 }}>Create New Game</h2>
          <input
            type="text"
            disabled
            placeholder="Player 1 Address"
            value={userFriendlyAddress}
            style={{
              margin: "8px 0",
              padding: "8px",
              fontSize: "1rem",
              background: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: 6,
              width: 450,
            }}
          />
          <input
            type="text"
            disabled
            placeholder="Player 2 Address"
            value={userFriendlyAddress}
            style={{
              margin: "8px 0",
              padding: "8px",
              fontSize: "1rem",
              background: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: 6,
              width: 450,
            }}
          />
          <button
            onClick={handleCreateGame}
            disabled={loading}
            style={{
              marginTop: "24px",
              padding: "12px 32px",
              fontSize: "1rem",
              background: loading ? "#cccccc" : "#007bff",
              color: loading ? "#888" : "#fff",
              border: "none",
              borderRadius: 6,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            Create Game
          </button>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
