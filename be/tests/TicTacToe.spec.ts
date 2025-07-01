import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { address, Address, toNano } from '@ton/core';
import { TicTacToeMaster } from '../build/TicTacToeMaster/TicTacToeMaster_TicTacToeMaster';
import { TicTacToeGame } from '../build/TicTacToeGame/TicTacToeGame_TicTacToeGame';
import * as nacl from 'tweetnacl';
import '@ton/test-utils';

describe('TicTacToeMaster', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let ticTacToeMaster: SandboxContract<TicTacToeMaster>;
    let ticTacToeGame: SandboxContract<TicTacToeGame>;
    let playerOneKeyPair = nacl.sign.keyPair();

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        ticTacToeMaster = blockchain.openContract(await TicTacToeMaster.fromInit());
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

        await ticTacToeMaster.send(
            deployer.getSender(),
            {
                value: toNano('0.1'),
            },
            null,
        );
    });
    it('should deploy', async () => {
        expect(ticTacToeMaster).toBeDefined();
    });

    it('should deploy game', async () => {
        const deployResult = await ticTacToeMaster.send(
            deployer.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'DeployGame',
                playerOne: deployer.address,
                playerTwo: deployer.address,
                playerOnePublicKey: BigInt(`0x${Buffer.from(playerOneKeyPair.publicKey).toString('hex')}`),
                playerTwoPublicKey: BigInt(`0x${Buffer.from(playerOneKeyPair.publicKey).toString('hex')}`),
            },
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: ticTacToeMaster.address,
            to: ticTacToeGame.address,
            success: true,
            deploy: true,
        });
    });

    it('should deploy multiple games', async () => {
        await ticTacToeMaster.send(
            deployer.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'DeployGame',
                playerOne: deployer.address,
                playerTwo: deployer.address,
                playerOnePublicKey: BigInt(`0x${Buffer.from(playerOneKeyPair.publicKey).toString('hex')}`),
                playerTwoPublicKey: BigInt(`0x${Buffer.from(playerOneKeyPair.publicKey).toString('hex')}`),
            },
        );

        await ticTacToeMaster.send(
            deployer.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'DeployGame',
                playerOne: deployer.address,
                playerTwo: deployer.address,
                playerOnePublicKey: BigInt(`0x${Buffer.from(playerOneKeyPair.publicKey).toString('hex')}`),
                playerTwoPublicKey: BigInt(`0x${Buffer.from(playerOneKeyPair.publicKey).toString('hex')}`),
            },
        );

        await ticTacToeMaster.send(
            deployer.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'DeployGame',
                playerOne: deployer.address,
                playerTwo: deployer.address,
                playerOnePublicKey: BigInt(`0x${Buffer.from(playerOneKeyPair.publicKey).toString('hex')}`),
                playerTwoPublicKey: BigInt(`0x${Buffer.from(playerOneKeyPair.publicKey).toString('hex')}`),
            },
        );

        const totalGames = await ticTacToeMaster.getTotalGames();
        const games = await ticTacToeMaster.getGames(deployer.address, 0n);

        expect(totalGames).toBe(3n);
        expect(games.length).toBe(3n);

        // console.log(await ticTacToeMaster.getGetGames(deployer.address, 0n));
    });
});
