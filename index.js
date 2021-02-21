import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import config from "config";

const TOKEN = config.get("token");
const bot = new TelegramBot(TOKEN, { polling: true })
const logo = "some logo";

bot.on("message", message => {
    const { chat: { id } } = message;
    bot.sendMessage(id, "Init message");
})