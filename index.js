import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import config from "config";

const TOKEN = config.get("token");
const bot = new TelegramBot(TOKEN, { polling: true })
const logo = "some logo";

const PRODUCT_LIST_KEYBOARD = `List of products ${String.fromCodePoint(0x1f4f0)}`;
const PRODUCT_DELETE_KEYBOARD = `Delete certain product. ${String.fromCodePoint(0x274c)}`;
const PRODUCT_UPDATE_KEYBOARD = `Edit certain product. 	${String.fromCodePoint(0x270f)}`;
const PRODUCT_CREATE_KEYBOARD = `Create product. ${String.fromCodePoint(0x2705)}`;
const PRODUCT_GET_KEYBOARD = `Get some product. ${String.fromCodePoint(0x1f504)}`;

const keyboard = [
    [PRODUCT_GET_KEYBOARD],
    [PRODUCT_UPDATE_KEYBOARD, PRODUCT_CREATE_KEYBOARD, PRODUCT_DELETE_KEYBOARD],
    [PRODUCT_LIST_KEYBOARD],
    [`Home ${String.fromCodePoint(0x21aa)}`]
]

const PRODUCT_GET_CALLBACK = "Get product by ID";
const PRODUCT_DELETE_CALLBACK = "Delete product by ID";
const PRODUCT_UPDATE_CALLBACK = "Update product by ID with input data.";

bot.onText(/\/start/, message => {
    const { chat: { id } } = message;
    bot.sendMessage(id, "Greetings, you have now activated bot for storing items. Now you can use it's functionality via keyboard.", {
        reply_markup: {
            keyboard
        }
    })
})

bot.onText(new RegExp(`${PRODUCT_LIST_KEYBOARD}(.*)`), message => {
    console.log(message);
    const { chat: { id } } = message;
    const message_text = message.text;
    switch (message_text) {
        case PRODUCT_LIST_KEYBOARD:
            axios.get("http://localhost:8080/product/list").then(res => {

                let { data } = res;
                console.log(data);
                data.map((item, index) => {
                    bot.sendPhoto(id, item.imgUrl, {
                        parseMode: "Markup",
                        caption: `${item.name}\n\n${item.description}\nDate added : ${item.dateAdded}\nQuantity : ${item.quantity}\nPrice : ${item.price}`,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: `Get this product ${String.fromCodePoint(0x1f504)}`,
                                        callback_data: `${PRODUCT_GET_CALLBACK} ${item.id}`
                                    }
                                ],
                                [
                                    {
                                        text: `Edit this product ${String.fromCodePoint(0x270f)}`,
                                        callback_data: `${PRODUCT_UPDATE_CALLBACK} ${item.id}}`
                                    }
                                ],
                                [
                                    {
                                        text: `Delete this product ${String.fromCodePoint(0x274c)}`,
                                        callback_data: `${PRODUCT_DELETE_CALLBACK} ${item.id}`
                                    }
                                ]
                            ]
                        }
                    })
                })
            })
    }
})