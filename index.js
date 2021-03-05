import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import config from "config";

const TOKEN = config.get("token");
const bot = new TelegramBot(TOKEN, { polling: true })
const logo = "some logo";


const PRODUCT_NAME_FIELD = "name";
const PRODUCT_PRICE_FIELD = "price";
const PRODUCT_QUANTITY_FIELD = "quantity";
const PRODUCT_DESCRIPTION_FIELD = "name";
const PRODUCT_IMG_URL_FIELD = "imgUrl";
const PRODUCT_DATE_ADDED_FIELD = "dateAdded";

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

const PRODUCT_UPDATE_COMMAND = "/edit";

const PRODUCT_GET_CALLBACK = "Get product by ID";
const PRODUCT_DELETE_CALLBACK = "Delete product by ID";
const PRODUCT_UPDATE_CALLBACK = "Update product by ID with input data.";


const PATH = "http://localhost:8080/product";

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
            axios.get(`${PATH}/list`).then(res => {
                let { data } = res;
                console.log(data);
                bot.sendMessage(id, "Here's list of items I've got.");
                data.map((item, index) => {
                    bot.sendPhoto(id, item.imgUrl, {
                        parseMode: "Markup",
                        caption: `${item.name}\n\n${item.description}\n\nDate added : ${item.dateAdded}\nQuantity : ${item.quantity}\nPrice : ${item.price}`,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: `Get this product ${String.fromCodePoint(0x1f504)}`,
                                        callback_data: `${PRODUCT_GET_CALLBACK}-${item.id}`
                                    }
                                ],
                                [
                                    {
                                        text: `Edit this product ${String.fromCodePoint(0x270f)}`,
                                        callback_data: `${PRODUCT_UPDATE_CALLBACK}-${item.id}`
                                    }
                                ],
                                [
                                    {
                                        text: `Delete this product ${String.fromCodePoint(0x274c)}`,
                                        callback_data: `${PRODUCT_DELETE_CALLBACK}-${item.id}`
                                    }
                                ]
                            ]
                        }
                    })
                })
            })
    }
})

bot.onText(new RegExp(`${PRODUCT_UPDATE_COMMAND} (.*)`), (message, [source, match]) => {
    console.log(JSON.parse(match));
    const { chat: { id } } = message
    bot.addListener("message", msg => {
        console.log(msg);
        bot.sendMessage(id, "message was sent by listener");
        bot.removeAllListeners();
    })

})

bot.on("document", query => {
    console.log(query);
})

bot.onReplyToMessage()

bot.on("callback_query", query => {
    const { message: { chat: { id }, message_id, text } = {} } = query;
    console.log("QUERY --- ", query);
    console.log("Query Data", query.data);

    const action = query.data.split('-')[0];
    if (action === PRODUCT_GET_CALLBACK) {
        let entityId = query.data.split('-')[1];
        bot.sendMessage(id, "Here's the item you got.");
        axios.get(`${PATH}/get/${entityId}`).then(res => {
            const { data } = res;
            bot.sendPhoto(id, data.imgUrl, {
                parseMode: "Markup",
                caption: `${data.name}\n\n${data.description}\n\nDate added : ${data.dateAdded}\nQuantity : ${data.quantity}\nPrice : ${data.price}`,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: `Get this product ${String.fromCodePoint(0x1f504)}`,
                                callback_data: `${PRODUCT_GET_CALLBACK}-${entityId}`
                            }
                        ],
                        [
                            {
                                text: `Edit this product ${String.fromCodePoint(0x270f)}`,
                                callback_data: `${PRODUCT_UPDATE_CALLBACK}-${entityId}}`
                            }
                        ],
                        [
                            {
                                text: `Delete this product ${String.fromCodePoint(0x274c)}`,
                                callback_data: `${PRODUCT_DELETE_CALLBACK}-${entityId}`
                            }
                        ]
                    ]
                }
            })
        })
    } else if (action === PRODUCT_DELETE_CALLBACK) {
        const entityId = query.data.split('-')[1];
        axios.delete(`${PATH}/delete/${entityId}`).then(res => {
            console.log(res);
            console.log("DELETE RESULT --- ", res.data);
            bot.answerCallbackQuery(query.id, "Item deleted.");
        }).catch(err => {
            console.log("STATUS --- ", err.status)
            console.log(err.stack);
        });
    } else if (action === PRODUCT_UPDATE_CALLBACK) {
        const entityId = query.data.split('-')[1];
        bot.sendMessage(id, "Enter field which you want to edit in the next format - fieldName:fieldValue");
        bot.addListener("message", msg => {
            const [fieldName, fieldValue] = msg.text.split(":");
            let updatedEntity = {
                id: entityId,
            }
            switch (fieldName) {
                case PRODUCT_NAME_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    break;
                case PRODUCT_DESCRIPTION_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    break;
                case PRODUCT_IMG_URL_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    break;
                case PRODUCT_PRICE_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    break;
                case PRODUCT_NAME_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    break;
                case PRODUCT_NAME_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    break;
            }
            bot.sendMessage(id, "Do you want to continue editing ?")
        })
        axios.get(`${PATH}/get/${id}`).then(res => {
            bot.sendMessage(id, "Enter field which you want to edit in the next format - fieldName:fieldValue");

        })

    }
})