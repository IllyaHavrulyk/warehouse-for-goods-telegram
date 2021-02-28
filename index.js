import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import config from "config";

const TOKEN = config.get("token");
const bot = new TelegramBot(TOKEN, { polling: true })
const logo = "some logo";

const product_list_keyboard = "List of products";

const keyboard = [
    [product_list_keyboard],
    ["Home"]
]

bot.onText(/\/start/, message => {
    const { chat: { id } } = message;
    bot.sendMessage(id, "Greetings, you have now activated bot for storing items. Now you can use it's functionality via keyboard.", {
        reply_markup: {
            keyboard
        }
    })
})

bot.onText(new RegExp(`${product_list_keyboard}`), message => {
    console.log(message);
    const { chat: { id } } = message;
    const message_text = message.text;
    switch (message_text) {
        case product_list_keyboard:
            axios.get("http://localhost:8080/product/list").then(res => {

                let { data } = res;
                console.log(data);
                data.map((item, index) => {
                    bot.sendPhoto(id, item.imgUrl, {
                        caption: `${item.name}\n\n${item.description}\nDate added : ${item.dateAdded}\nQuantity : ${item.quantity}\nPrice : ${item.price}`
                    })
                })
            })
    }
})