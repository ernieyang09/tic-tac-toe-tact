import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, toNano } from '@ton/core';
import { TicTacToeGame } from '../build/TicTacToeGame/TicTacToeGame_TicTacToeGame';
import * as nacl from 'tweetnacl';
import '@ton/test-utils';

describe('TicTacToeGame', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let ticTacToeGame: SandboxContract<TicTacToeGame>;
    let playerOneKeyPair = nacl.sign.keyPair();

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        ticTacToeGame = blockchain.openContract(
            await TicTacToeGame.fromInit({
                $$type: 'GameInit',
                playerOne: deployer.address,
                playerTwo: deployer.address,
                playerOnePublicKey: BigInt(`0x${Buffer.from(playerOneKeyPair.publicKey).toString('hex')}`),
                playerTwoPublicKey: BigInt(`0x${Buffer.from(playerOneKeyPair.publicKey).toString('hex')}`),
                gameId: 1n,
            }),
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await ticTacToeGame.send(
            deployer.getSender(),
            {
                value: toNano('0.1'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: ticTacToeGame.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        expect(ticTacToeGame).toBeDefined();
    });

    /* 
    {
      '$$type': 'GameState',
      gameId: 1n,
      playerOne: EQBGhqLAZseEqRXz4ByFPTGV7SVMlI4hrbs-Sps_Xzx01x8G,
      playerTwo: EQBGhqLAZseEqRXz4ByFPTGV7SVMlI4hrbs-Sps_Xzx01x8G,
      board: '100000000',
      turn: 2n,
      status: 0n,
      winner: null
    }
    */
    it('should make move', async () => {
        await ticTacToeGame.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'MakeMove',
                position: 0n,
            },
        );

        const state = await ticTacToeGame.getGetState();

        expect(state.status).toBe(0n);
        expect(state.turn).toBe(2n);
        expect(state.winner).toBe(null);
        expect(state.board).toBe('100000000');
    });

    /*
    {
      '$$type': 'GameState',
      gameId: 1n,
      playerOne: EQBGhqLAZseEqRXz4ByFPTGV7SVMlI4hrbs-Sps_Xzx01x8G,
      playerTwo: EQBGhqLAZseEqRXz4ByFPTGV7SVMlI4hrbs-Sps_Xzx01x8G,
      board: '122100100',
      turn: 1n,
      status: 1n,
      winner: EQBGhqLAZseEqRXz4ByFPTGV7SVMlI4hrbs-Sps_Xzx01x8G
    }
    */
    it('should player 1 win', async () => {
        await ticTacToeGame.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'MakeMove',
                position: 0n,
            },
        );

        await ticTacToeGame.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'MakeMove',
                position: 1n,
            },
        );

        await ticTacToeGame.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'MakeMove',
                position: 3n,
            },
        );

        await ticTacToeGame.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'MakeMove',
                position: 2n,
            },
        );

        await ticTacToeGame.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'MakeMove',
                position: 6n,
            },
        );

        const state = await ticTacToeGame.getGetState();

        expect(state.status).toBe(1n);
        expect(state.turn).toBe(1n);
        expect(state.winner?.toString()).toBe(deployer.address.toString());
        expect(state.board).toBe('122100100');
    });

    /* 
    {
      '$$type': 'GameState',
      gameId: 1n,
      playerOne: EQBGhqLAZseEqRXz4ByFPTGV7SVMlI4hrbs-Sps_Xzx01x8G,
      playerTwo: EQBGhqLAZseEqRXz4ByFPTGV7SVMlI4hrbs-Sps_Xzx01x8G,
      board: '121221112',
      turn: 1n,
      status: 2n,
      winner: null
    }
    */
    it('should draw', async () => {
        for (let i of [0, 1, 2, 3, 5, 4, 6, 8, 7]) {
            await ticTacToeGame.send(
                deployer.getSender(),
                {
                    value: toNano('0.05'),
                },
                {
                    $$type: 'MakeMove',
                    position: BigInt(i),
                },
            );
        }

        const state = await ticTacToeGame.getGetState();

        expect(state.status).toBe(2n);
        expect(state.turn).toBe(1n);
        expect(state.winner).toBe(null);
        expect(state.board).toBe('121221112');
    });

    it('should relay move', async () => {
        const message = beginCell()
            .storeAddress(ticTacToeGame.address)
            .storeUint(4n, 4)
            .storeAddress(deployer.address)
            .endCell();
        const hash = message.hash();
        const signature = nacl.sign.detached(hash, playerOneKeyPair.secretKey);

        const relayResult = await ticTacToeGame.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'RelayMove',
                position: 4n,
                player: deployer.address,
                signature: beginCell().storeBuffer(Buffer.from(signature)).asSlice(),
            },
        );

        expect(relayResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: ticTacToeGame.address,
            success: true,
        });
    });

    it('should not relay move', async () => {
        const message = beginCell()
            .storeAddress(ticTacToeGame.address)
            .storeUint(4n, 4)
            .storeAddress(deployer.address)
            .endCell();
        const hash = message.hash();
        const signature = nacl.sign.detached(hash, playerOneKeyPair.secretKey);

        const relayResult = await ticTacToeGame.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'RelayMove',
                position: 4n,
                player: deployer.address,
                signature: beginCell()
                    .storeBuffer(Buffer.from('0000000000000000000000000000000000000000000000000000000000000000'))
                    .asSlice(),
            },
        );

        expect(relayResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: ticTacToeGame.address,
            success: false,
            exitCode: 8231,
        });
    });
});
