message GameInit {
  playerOne: Address;
  playerTwo: Address;
  playerOnePublicKey: Int as uint256;
  playerTwoPublicKey: Int as uint256;
  gameId: Int as uint128;
}

message(0x6d204a5b) MakeMove {
  position: Int as uint4;
}

message(0x7351aee5) RelayMove {
  position: Int as uint4;
  player: Address;
  signature: Slice;
}

struct GameState {
  gameId: Int as uint128;
  playerOne: Address;
  playerTwo: Address;
  
  board: String;
  turn: Int as uint2;
  status: Int as uint2;
  winner: Address?;
}

contract TicTacToeGame {
  playerOne: Address;
  playerTwo: Address;
  playerOnePublicKey: Int as uint256;
  playerTwoPublicKey: Int as uint256;
  gameId: Int as uint128;
  board: Cell;
  turn: Int as uint2;
  status: Int as uint2;
  winner: Address?;

  init(msg: GameInit) {
    require(context().value >= ton("0.05"), "Requires at least 0.05 TON for initialization");
    self.gameId = msg.gameId;
    self.playerOne = msg.playerOne;
    self.playerTwo = msg.playerTwo;
    self.playerOnePublicKey = msg.playerOnePublicKey;
    self.playerTwoPublicKey = msg.playerTwoPublicKey;
    self.board = makeBoard();
    self.turn = 1;
    self.status = 0;
  }

  receive(msg: MakeMove) {
    let sender = context().sender;
    self.applyMove(msg.position, sender);
  }

  receive(msg: RelayMove) {
    require(self.status == 0, "Game over");
    if (self.turn == 1) {
      require(msg.player == self.playerOne, "Not X's turn");
    } else {
      require(msg.player == self.playerTwo, "Not O's turn");
    }
    let toSign = beginCell()
      .storeAddress(myAddress())
      .storeUint(msg.position, 4)
      .storeAddress(msg.player)
      .endCell();
    let hash = toSign.hash();
    let pubkey = msg.player == self.playerOne ? self.playerOnePublicKey : self.playerTwoPublicKey;
    require(checkSignature(hash, msg.signature, pubkey), "Bad signature");
    self.applyMove(msg.position, msg.player);
  }

  receive() {
    cashback(sender());
  }

  get fun getState(): GameState {
    return GameState {
      gameId: self.gameId,
      playerOne: self.playerOne,
      playerTwo: self.playerTwo,
      board: boardToString(self.board),
      turn: self.turn,
      status: self.status,
      winner: self.winner
    };
  }

  inline fun applyMove(pos: Int, sender: Address) {
    require(self.status == 0, "Game over");
    require(self.turn == 1 ? sender == self.playerOne : sender == self.playerTwo, "Not your turn");
    require(pos >= 0 && pos < 9, "Invalid position");
    let cellMap = self.getCellMap();
    require(cellMap.get(pos) == 0, "Cell already taken");
    cellMap.set(pos, self.turn);
    let newBoard = beginCell();
    let i = 0;
    while (i < 9) {
      newBoard = newBoard.storeUint(cellMap.get(i)!!, 2);
      i += 1;
    }
    self.board = newBoard.endCell();
    let result = checkGame(cellMap, self.turn);
    if (result == 0) {
      self.turn = self.turn == 1 ? 2 : 1;
    } else if (result == 1) {
      self.status = 1;
      self.winner = self.turn == 1 ? self.playerOne : self.playerTwo;
    } else {
      self.status = 2;
    }
  }

  inline fun getCellMap(): map<Int, Int as uint2> {
    let cellMap: map<Int, Int as uint2> = emptyMap();
    let s = self.board.beginParse();
    let i: Int = 0;
    while (i < 9) {
      cellMap.set(i, s.loadUint(2));
      i += 1;
    }
    return cellMap;
  }
}

inline fun boardToString(board: Cell): String {
  let s:StringBuilder = beginString();
  let boardSlice = board.beginParse();
  let i: Int = 0;
  while (i < 9) {
    s.append(boardSlice.loadUint(2).toString());
    i += 1;
  }
  return s.toString();
}

inline fun makeBoard(): Cell {
  return beginCell()
    .storeUint(0, 2).storeUint(0, 2).storeUint(0, 2)
    .storeUint(0, 2).storeUint(0, 2).storeUint(0, 2)
    .storeUint(0, 2).storeUint(0, 2).storeUint(0, 2)
    .endCell();
}

inline fun checkGame(cellMap: map<Int, Int as uint2>, turn: Int): Int {
  if (cellMap.get(0) == turn && cellMap.get(1) == turn && cellMap.get(2) == turn) { return 1; }
  if (cellMap.get(3) == turn && cellMap.get(4) == turn && cellMap.get(5) == turn) { return 1; }
  if (cellMap.get(6) == turn && cellMap.get(7) == turn && cellMap.get(8) == turn) { return 1; }
  if (cellMap.get(0) == turn && cellMap.get(3) == turn && cellMap.get(6) == turn) { return 1; }
  if (cellMap.get(1) == turn && cellMap.get(4) == turn && cellMap.get(7) == turn) { return 1; }
  if (cellMap.get(2) == turn && cellMap.get(5) == turn && cellMap.get(8) == turn) { return 1; }
  if (cellMap.get(0) == turn && cellMap.get(4) == turn && cellMap.get(8) == turn) { return 1; }
  if (cellMap.get(2) == turn && cellMap.get(4) == turn && cellMap.get(6) == turn) { return 1; }
  let i = 0;
  while (i < 9) {
    if (cellMap.get(i) == 0) {
      return 0;
    }
    i += 1;
  }
  return 2;
}
