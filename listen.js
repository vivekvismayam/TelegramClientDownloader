const { TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events"); // ✅ correct import

const input = require("input");
const fs = require("fs");
require("dotenv").config();

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
let filePath = process.env.MOVIES_DOWNLOADPATH;
let fileType='Movie';

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
    //new code
    const chat = await client.getEntity("@vivekvismayam");
    console.log("👀 Listening for new messages...");
    await client.sendMessage(chat, {message: "👀 Listening for new messages..."});
    client.addEventHandler(async (event) => {
        const message = event.message;
        if (message && message.media) {
            console.log(`[${message.senderId}] ${message.text}`);
            try {
                await replyToAMessage(chat, "Downloading started to "+fileType, message.id);
                await client.downloadMedia(message, {
                    outputFile: filePath
                });
                // Delete the message
                await replyToAMessage(chat, "Deleting message. File Downloaded to folder"+fileType+" \nPath : "+ filePath, message.id);
                await client.deleteMessages(chat, [message.id], { revoke: true });
                //console.log("Downloaded:", filePath);
            }catch(e){
                console.log("Error:", e);
                await replyToAMessage(chat, "ERROR OCCURED "+JSON.stringify(e), message.id);
            }
        }else if(message?.text?.toUpperCase()=='PATH'){
            await client.sendMessage(chat, {message: "PATH is "+fileType+"\nPath : "+filePath});
        }else if(message?.text?.toUpperCase()=='CHANGEPATH'){
            filePath=filePath==process.env.MOVIES_DOWNLOADPATH?process.env.SERIES_DOWNLOADPATH:process.env.MOVIES_DOWNLOADPATH;
            fileType=fileType=='Movie'?'Series':'Movie'
            await client.sendMessage(chat, {message: "PATH is Change to "+fileType+"\n Path : "+filePath});
        }
    }, new NewMessage({ chats: ["@vivekvismayam"], incoming: true }));

    async function replyToAMessage(chat, replyText, messageIdToReplyTo) {

        await client.sendMessage(chat, {
            message: replyText,
            replyTo: messageIdToReplyTo,
        });
    }
})();




