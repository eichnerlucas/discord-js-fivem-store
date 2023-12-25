const { Client, Message  } = require('discord.js');
const pingCommand = require('../commands/info/ping');

jest.mock('discord.js', () => {
    const original = jest.requireActual('discord.js');
    return {
        ...original,
        Message: jest.fn(() => ({
            channel: {
                send: jest.fn(),
            },
        })),
        Client: jest.fn(() => ({
            ws: {
                ping: 123,
            },
        })),
    };
});

describe('Ping command', () => {
    it('should send ping', async () => {
        const client = new Client();
        const message = new Message();

        await pingCommand.run(client, message, []);

        expect(message.channel.send).toHaveBeenCalledWith('123 ping');
    });
});