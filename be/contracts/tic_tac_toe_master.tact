import "./array.tact";
import "./tic_tac_toe_game.tact";

message(0x756dc4c8) DeployGame {
    playerOne: Address;
    playerTwo: Address;
    playerOnePublicKey: Int as uint256;
    playerTwoPublicKey: Int as uint256;
}

const MAX_GAMES_PER_PLAYER: Int = 20;


contract TicTacToeMaster {
  gameCount: Int as uint128;
  playerGames: map<Address, AddressArray>;

  init() {
    self.gameCount = 0;
    // this should save at personal level
    self.playerGames = emptyMap();
  }

  receive(msg: DeployGame) {
    self.gameCount += 1;
    let id = self.gameCount;

    let statInit = initOf TicTacToeGame(GameInit {
        playerOne: msg.playerOne,
        playerTwo: msg.playerTwo,
        playerOnePublicKey: msg.playerOnePublicKey,
        playerTwoPublicKey: msg.playerTwoPublicKey,
        gameId: id,
    });

    deploy(DeployParameters {
      value: 0, // This value will be the initial balance of the deployed TicTacToeGame contract
      bounce: true,
      mode: SendRemainingValue,
      init: statInit,
    });

    let gameAddress = contractAddress(statInit);

    self.insertGameRolling(msg.playerOne, gameAddress);
    if (msg.playerOne != msg.playerTwo) {
      self.insertGameRolling(msg.playerTwo, gameAddress);
    }
  }

  receive() {
    cashback(sender());
  }

  fun insertGameRolling(player: Address, gameAddress: Address) {
    let array: AddressArray? = self.playerGames.get(player);
    if (array == null) {
      array = AddressArray {
        length: 0,
        m: emptyMap(),
      };
    }

    if (array!!.length == 0) {
      array = array!!.append(gameAddress);
      
    } else {
      array = array!!.insert(gameAddress, 0);
    }
    
    if (array!!.length >= MAX_GAMES_PER_PLAYER) {
      array = array!!.deleteLast();
    }

    self.playerGames.set(player, array);
  }

  get fun games(player: Address, skip: Int): AddressArray {
    let array: AddressArray? = self.playerGames.get(player);
    if (array == null) {
      array = AddressArray {
        length: 0,
        m: emptyMap(),
      };
    }

    let result = AddressArray {
      length: 0,
      m: emptyMap(),
    };

    let i = 0;
    while (i < array!!.length) {
      if (i >= skip) {
        result = result.append(array!!.m.get(i)!!);
      }
      i += 1;
    }

    return result;
    
  }

  get fun totalGames(): Int {
    return self.gameCount;
  }
}