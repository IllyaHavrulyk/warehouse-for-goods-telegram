import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import config from "config";

const TOKEN = config.get("token");
const bot = new TelegramBot(TOKEN, { polling: true })
const logo = "some logo";


const PRODUCT_NAME_FIELD = "name";
const PRODUCT_PRICE_FIELD = "price";
const PRODUCT_QUANTITY_FIELD = "quantity";
const PRODUCT_DESCRIPTION_FIELD = "description";
const PRODUCT_IMG_URL_FIELD = "imgUrl";
const PRODUCT_DATE_ADDED_FIELD = "dateAdded";

const PRODUCT_LIST_KEYBOARD = `List of products ${String.fromCodePoint(0x1f4f0)}`;
const PRODUCT_DELETE_KEYBOARD = `Delete certain product. ${String.fromCodePoint(0x274c)}`;
const PRODUCT_EDIT_KEYBOARD = `Edit product ${String.fromCodePoint(0x1f4f0)}`;
const PRODUCT_CREATE_KEYBOARD = `Create product. ${String.fromCodePoint(0x2705)}`;
const PRODUCT_GET_KEYBOARD = `Get some product. ${String.fromCodePoint(0x1f504)}`;
const PRODUCT_STOP_EDITING_KEYBOARD = `Stop editing ${String.fromCodePoint(0x274c)}`;

const keyboard = [
    [PRODUCT_GET_KEYBOARD],
    [PRODUCT_EDIT_KEYBOARD, PRODUCT_CREATE_KEYBOARD, PRODUCT_DELETE_KEYBOARD],
    [PRODUCT_LIST_KEYBOARD],
    [`Home ${String.fromCodePoint(0x21aa)}`]
]

const editing_keyboard = [
    [PRODUCT_STOP_EDITING_KEYBOARD],
    [`Home ${String.fromCodePoint(0x21aa)}`]
]

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

bot.onText(new RegExp(`${PRODUCT_GET_KEYBOARD}(.*)`), message => {
    console.log(message);

    const { chat: { id } } = message;
    const message_text = message.text;
    bot.sendMessage(id, "Send id of product you want to get from database.");
    switch (message_text) {
        case PRODUCT_GET_KEYBOARD:
            bot.addListener("message", message => {
                const { text } = message;
                const entityId = Number.parseInt(text);
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
                }).catch(err => {
                    console.log(err);
                })
                bot.removeListener("message");
            })
    }
})

bot.onText(new RegExp(`${PRODUCT_DELETE_KEYBOARD}(.*)`), message => {
    console.log(message);

    const { chat: { id } } = message;
    const message_text = message.text;
    bot.sendMessage(id, "Send id of product you want to delete from database.");
    switch (message_text) {
        case PRODUCT_DELETE_KEYBOARD:
            bot.addListener("message", message => {
                const { text } = message;
                const entityId = Number.parseInt(text);
                axios.delete(`${PATH}/get/${entityId}`).catch(err => {
                    console.log(err);
                })
                bot.sendMessage(id, "Product deleted");
                bot.removeListener("message");
            })
    }
})

bot.onText(new RegExp(`${PRODUCT_EDIT_KEYBOARD}(.*)`), message => {
    console.log(message);
    const { chat: { id } } = message;
    let entityId;
    bot.sendMessage(id, "Enter id of product which you want to edit.");
    entityId = Number.parseInt(message_text);
    if (entityId !== undefined) {
        bot.addListener("message", msg => {
            bot.sendMessage(id, "Enter field which you want to edit in the next format - fieldName:fieldValue", {
                reply_markup: {
                    keyboard: editing_keyboard
                }
            });
            const [fieldName, fieldValue] = msg.text.split(":");
            console.log("FIELD NAME ---", fieldName);
            switch (fieldName) {
                case PRODUCT_NAME_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    bot.sendMessage(id, "Do you want to continue editing ? Type 'End' if you want to save edited values or if you don't, just keep typing properties and their values.");
                    break;
                case PRODUCT_DESCRIPTION_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    bot.sendMessage(id, "Do you want to continue editing ? Type 'End' if you want to save edited values or if you don't, just keep typing properties and their values.");
                    break;
                case PRODUCT_IMG_URL_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    bot.sendMessage(id, "Do you want to continue editing ? Type 'End' if you want to save edited values or if you don't, just keep typing properties and their values.");
                    break;
                case PRODUCT_PRICE_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    bot.sendMessage(id, "Do you want to continue editing ? Type 'End' if you want to save edited values or if you don't, just keep typing properties and their values.");
                    break;
                case PRODUCT_QUANTITY_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    bot.sendMessage(id, "Do you want to continue editing ? Type 'End' if you want to save edited values or if you don't, just keep typing properties and their values.");
                    break;
                case PRODUCT_DATE_ADDED_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    bot.sendMessage(id, "Do you want to continue editing ? Type 'End' if you want to save edited values or if you don't, just keep typing properties and their values.");
                    break;
                case "End":
                    bot.sendMessage(id, "You've succesfully updated product.");
                    bot.removeListener("message");
                    axios.post(`${PATH}/update/${entityId}`, updatedEntity).then(res => {
                        console.log("RES DATA --- ", res.data);
                        console.log("RES STATUS --- ", res.status);
                    });
                    isEditing = false;
                    break;
                case `${PRODUCT_STOP_EDITING_KEYBOARD}`:
                    break;
                default:
                    bot.sendMessage(id, "You've sent wrong , please enter valid field.");
                    break;
            }
            console.log("Object to update --- ", updatedEntity);
        })
    }
    console.log(entityId);
    bot.removeListener("message");
    let updatedEntity = {
        quantity: 321
    };

    if (entityId) {

    }
})


bot.onText(new RegExp(`${PRODUCT_STOP_EDITING_KEYBOARD}(.*)`), message => {
    const { chat: { id } } = message;
    bot.removeListener("message");
    bot.sendMessage(id, "You quit editing bot.", {
        reply_markup: {
            keyboard
        }
    })
})

bot.on("callback_query", query => {
    console.log("CALLBACK DATA --- \n", query);
    const { message: { chat: { id } } } = query;
    console.log("QUERY --- ", query);
    console.log("Query Data", query.data);
    const action = query.data.split('-')[0];
    if (action === PRODUCT_GET_CALLBACK) {
        let entityId = query.data.split('-')[1];
        console.log("ENTITY ID --- ")
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
        }).catch(err => {
            console.log(err);
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
        const entityId = Number.parseInt(query.data.split('-')[1].trim());
        console.log(`UPDATE ENTITY ID:${entityId}`);
        let isEditing = true;
        let updatedEntity = {
            quantity: 321
        };
        bot.sendMessage(id, "Enter field which you want to edit in the next format - fieldName:fieldValue", {
            reply_markup: {
                keyboard: editing_keyboard
            }
        });
        bot.addListener("message", msg => {
            const [fieldName, fieldValue] = msg.text.split(":");
            console.log("FIELD NAME ---", fieldName);
            switch (fieldName) {
                case PRODUCT_NAME_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    bot.sendMessage(id, "Do you want to continue editing ? Type 'End' if you want to save edited values or if you don't, just keep typing properties and their values.");
                    break;
                case PRODUCT_DESCRIPTION_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    bot.sendMessage(id, "Do you want to continue editing ? Type 'End' if you want to save edited values or if you don't, just keep typing properties and their values.");
                    break;
                case PRODUCT_IMG_URL_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    bot.sendMessage(id, "Do you want to continue editing ? Type 'End' if you want to save edited values or if you don't, just keep typing properties and their values.");
                    break;
                case PRODUCT_PRICE_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    bot.sendMessage(id, "Do you want to continue editing ? Type 'End' if you want to save edited values or if you don't, just keep typing properties and their values.");
                    break;
                case PRODUCT_QUANTITY_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    bot.sendMessage(id, "Do you want to continue editing ? Type 'End' if you want to save edited values or if you don't, just keep typing properties and their values.");
                    break;
                case PRODUCT_DATE_ADDED_FIELD:
                    updatedEntity[fieldName] = fieldValue;
                    bot.sendMessage(id, "Do you want to continue editing ? Type 'End' if you want to save edited values or if you don't, just keep typing properties and their values.");
                    break;
                case "End":
                    bot.sendMessage(id, "You've succesfully updated product.");
                    bot.removeListener("message");
                    axios.post(`${PATH}/update/${entityId}`, updatedEntity).then(res => {
                        console.log("RES DATA --- ", res.data);
                        console.log("RES STATUS --- ", res.status);
                    });
                    isEditing = false;
                    break;
                case `${PRODUCT_STOP_EDITING_KEYBOARD}`:
                    break;
                default:
                    bot.sendMessage(id, "You've sent wrong , please enter valid field.");
                    break;
            }


            console.log("Object to update --- ", updatedEntity);
        })
    }
})