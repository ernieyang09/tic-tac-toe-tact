import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTicTacToeGameContract } from "../../hooks/useTicTokToeGameContract";
import { useMemo, useCallback } from "react";
import { useTonSender } from "../../hooks/useTonSender";
import { toNano } from "@ton/core";

const isEmpty = (obj) => Object.keys(obj).length === 0;

const emptyFn = () => {};

const Cell = ({ cell, makeMove, position }) => {
  // cell = 0 - empty, 1 - X, 2 - O
  const cellContent = {
    [0]: " ",
    [1]: "X",
    [2]: "O",
  }[cell];

  return (
    <div
      className="tic-tac-toe-cell"
      style={{
        cursor:
          makeMove === emptyFn || cellContent !== " " ? "default" : "pointer",
      }}
      onClick={async () => {
        await makeMove(position);
      }}
    >
      {cellContent}
    </div>
  );
};

const BoardPage = () => {
  const { board } = useParams();
  const ticTacToeGameContract = useTicTacToeGameContract(board);
  const sender = useTonSender();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["board", board],
    queryFn: async () => {
      return await ticTacToeGameContract.getGetState();
    },
    enabled: !!ticTacToeGameContract,
  });

  const transformedData = useMemo(() => {
    const res = {};
    if (data) {
      res.board = Array.from({ length: 3 }, (_, i) =>
        data.board.split("").slice(i * 3, i * 3 + 3)
      );
      res.status = {
        [0n]: "In progress",
        [1n]: "Game has winner",
        [2n]: "Draw game",
      }[data.status];
      res.turn = {
        [1n]: "Player 1",
        [2n]: "Player 2",
      }[data.turn];
      res.winner = data.winner ? data.winner.toString() : null;
      res.playerOne = data.playerOne.toString();
      res.playerTwo = data.playerTwo.toString();
      res.gameId = data.gameId.toString();
      res.turn = {
        [1n]: "Player 1",
        [2n]: "Player 2",
      }[data.turn];
    }

    return res;
  }, [data]);

  const makeMove = useCallback(
    async (position) => {
      await ticTacToeGameContract.send(
        sender,
        {
          value: toNano("0.03"),
        },
        {
          $$type: "MakeMove",
          position: BigInt(position),
        }
      );
    },
    [sender, ticTacToeGameContract]
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error: {error.message}</div>}
      {!isEmpty(transformedData) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
              <div>Game Id</div>
              <div>{transformedData.gameId}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
              <div>Player 1</div>
              <div>{transformedData.playerOne}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
              <div>Player 2</div>
              <div>{transformedData.playerTwo}</div>
            </div>
            {transformedData.status === "In progress" && (
              <div
                style={{ display: "flex", flexDirection: "row", gap: "10px" }}
              >
                <div>Turn</div>
                <div>{transformedData.turn}</div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
              <div>Game status</div>
              <div>{transformedData.status}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
              <div>Winner</div>
              <div>
                {transformedData.status === "Game has winner"
                  ? transformedData.turn
                  : ""}
              </div>
            </div>
          </div>
          <div className="tic-tac-toe-board">
            {transformedData.board.map((row, rowIndex) => (
              <div key={rowIndex} className="tic-tac-toe-row">
                {row.map((cell, cellIndex) => (
                  <Cell
                    key={`${rowIndex}-${cellIndex}-${cell}`}
                    cell={cell}
                    position={rowIndex * 3 + cellIndex}
                    makeMove={
                      transformedData.status === "In progress"
                        ? makeMove
                        : emptyFn
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
