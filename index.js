const { TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");

const input = require("input");
const fs = require("fs");
require("dotenv").config();

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
//const stringSession = new StringSession(""); // Empty string on first run
const storeSession = new StoreSession("auth");

(async () => {
    const client = new TelegramClient(storeSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text("Phone number: "),
        password: async () => await input.text("2FA password: "),
        phoneCode: async () => await input.text("Code: "),
        onError: (err) => console.log(err),
    });

    console.log("Logged in!");
    //console.log("Session string:", client.session.save());
    client.session.save()

    const chat = await client.getEntity("@vivekvismayam");
    const messages = await client.getMessages(chat, { limit: 5 });

    for (const message of messages) {
        if (message.media) {
            console.log("Message Id " + message.id)
            const filePath = process.env.DOWNLOADPATH;
            await replyToAMessage(chat, "Downloading started.... ", message.id);
            await client.downloadMedia(message, {
                outputFile: filePath
            });
            // Delete the message
            await replyToAMessage(chat, "Downloaded to " + filePath, message.id);
            await client.deleteMessages(chat, [message.id], { revoke: true });
            console.log("Downloaded:", filePath);
        }
    }

    await client.disconnect();

    async function replyToAMessage(chat, replyText, messageIdToReplyTo) {

        await client.sendMessage(chat, {
            message: replyText,
            replyTo: messageIdToReplyTo,
        });
    }
})();




