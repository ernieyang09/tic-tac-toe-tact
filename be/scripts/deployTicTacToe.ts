import { toNano } from '@ton/core';
import { TicTacToeMaster } from '../build/TicTacToeMaster/TicTacToeMaster_TicTacToeMaster';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ticTacToe = provider.open(await TicTacToeMaster.fromInit());

    await ticTacToe.send(
        provider.sender(),
        {
            value: toNano('0.1'),
        },
        null,
    );

    await provider.waitForDeploy(ticTacToe.address);

    console.log('addr', ticTacToe.address);
}
