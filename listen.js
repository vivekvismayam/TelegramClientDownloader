const { TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");

const input = require("input");
const fs = require("fs");
const { exit } = require("process");
require("dotenv").config();

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const admin=process.env.ADMIN_USERNAME;
const deleteFilePostDownload = process.env.DELETE_FILES_POST_DOWNLOAD == 'DELETE';
let filePath = process.env.MOVIES_DOWNLOADPATH;
let fileType = 'Movie';

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
    client.session.save()
    const chat = await client.getEntity(admin);
    console.log("👀 Listening for new messages...");
    await client.sendMessage(chat, { message: "👀 Listening for new messages..." });
    client.addEventHandler(async (event) => {
        const message = event.message;
        if (message?.media) {
            console.log(`[${message.senderId}] ${message.text}`);
            let fileName = '';
            try {
                let msgPercent = 0;
                let msgStep = 10;
                let fileName = message?.media?.document?.attributes?.find((attr) => attr.className === "DocumentAttributeFilename")?.fileName||'';
                console.log("📄 File Name:" , fileName||'No File Name Found');
                await replyToAMessage(chat, "Downloading started to " + fileType, message.id);
                await client.downloadMedia(message, {
                    outputFile: filePath + (fileName||''),
                    progressCallback: (received, total) => {
                        const percent = ((received / total) * 100).toFixed(2);
                        if (percent > msgStep && msgPercent < msgStep) {
                            replyToAMessage(chat, "🚧Download crossed " + msgStep+"%", message.id);
                            msgStep += 10;
                            msgPercent += 10;
                        }
                    },
                });
                // Delete the message
                await replyToAMessage(chat, "File Downloaded to folder" + fileType + " \nPath : " + filePath + "\nDelete File : " + deleteFilePostDownload, message.id);
                if (deleteFilePostDownload) {
                    await client.deleteMessages(chat, [message.id], { revoke: true });
                }
            } catch (e) {
                console.log("Error:", e);
                await replyToAMessage(chat, "ERROR OCCURED " + JSON.stringify(e), message.id);
            }
        } else if (message?.text?.toUpperCase() == 'PATH') {
            await client.sendMessage(chat, { message: "PATH is " + fileType + "\nPath : " + filePath });
        } else if (message?.text?.toUpperCase() == 'CHANGEPATH') {
            filePath = filePath == process.env.MOVIES_DOWNLOADPATH ? process.env.SERIES_DOWNLOADPATH : process.env.MOVIES_DOWNLOADPATH;
            fileType = fileType == 'Movie' ? 'Series' : 'Movie'
            await client.sendMessage(chat, { message: "PATH is Change to " + fileType + "\n Path : " + filePath });
        }
    }, new NewMessage({ chats: ["@vivekvismayam"], incoming: true }));

    async function replyToAMessage(chat, replyText, messageIdToReplyTo) {
        await client.sendMessage(chat, {
            message: replyText,
            replyTo: messageIdToReplyTo,
        });
    }
})();




