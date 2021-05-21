const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const config = require("config");

const TOKEN = config.get("token");
const bot = new TelegramBot(TOKEN, { polling: true });

const WAREHOUSE_LIST_KEYBOARD = `List of warehouses ${String.fromCodePoint(
  0x1f4f0
)}`;

const STATS_KEYBOARD = `Stats ${String.fromCodePoint(
  0x1f4d2
)}`

const HOME_KEYBOARD = `Home ${String.fromCodePoint(0x21aa)}`;

const keyboard = [
  [WAREHOUSE_LIST_KEYBOARD,],
  [STATS_KEYBOARD]
];

const USER_PATH = "http://warehouseforgoods-env-1.us-east-2.elasticbeanstalk.com/";

let userToRegister;

bot.onText(/\/start/, async (message) => {
  console.log(message);
  const {
    chat: { id, username },
  } = message;

  userToRegister = {
    username,
    password: id,
  };
  axios
    .post(`${USER_PATH}registration`, userToRegister)
    .then((res) => {
      console.log("REGISTRATION SUCCESFULL --- ", res.config.data);
      bot.sendMessage(
        id,
        "Greetings, you have now activated bot for storing items. Now you can use it's functionality via keyboard.",
        {
          reply_markup: {
            keyboard,
          },
        }
      );
    })
    .catch((e) => {
      bot.sendMessage(
        id,
        "Looks like have already registered, keep using WarehouseForGoods.",
        {
          reply_markup: {
            keyboard,
          },
        }
      );
    });

  axios
    .get(`${USER_PATH}login`, {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            userToRegister.username + ":" + userToRegister.password
          ).toString("base64"),
      },
    })
    .then((res) => {
      console.log(res.data);
    })
    .catch((e) => {
      console.error(e);
    });
});



bot.onText(new RegExp(`${STATS_KEYBOARD}(.*)`), (message) => {
  const {
    chat: { id },
  } = message;
  getStats(id, userToRegister);
})

bot.onText(new RegExp(`${WAREHOUSE_LIST_KEYBOARD}(.*)`), (message) => {
  const { chat: { id } } = message;
  getWarehouses(id, userToRegister)

});


bot.on("callback_query", (query) => {
  console.log("CALLBACK DATA --- \n", query);
  const {
    message: {
      chat: { id },
    },
  } = query;
  console.log("QUERY --- ", query);
  console.log("Query Data", query.data);
  const action = query.data.split("-")[0];
});

async function getStats(id, userToRegister) {
  try {
    const { data } = await axios
      .get(`${USER_PATH}stats/list`, {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              userToRegister.username + ":" + userToRegister.password
            ).toString("base64"),
        },
      });
    let result = "";
    for (const key in data) {
      result += `\n---${key}---\n`
      for (const innerKey in data[key]) {
        result += `   ${innerKey}   :   ${data[key][innerKey]}\n`
      }
    }
    bot.sendMessage(id, result);
  } catch (err) {
    console.log(err.message);
  }
}

async function getWarehouses(id, userToRegister) {
  try {
    const { data } = await axios
      .get(`${USER_PATH}warehouse/list`, {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              userToRegister.username + ":" + userToRegister.password
            ).toString("base64"),
        },
      });
    if (data.length !== 0) {
      let result = "";
      for (let i = 0; i < data.length; i++) {
        result += `\n${JSON.stringify(data[i], null, 2)}\n`
        if (data[i].products.length > 0) {
          for (let j = 0; j < data[i].products.length; j++) {
            result += `\t${JSON.stringify(data[i].products[j], null, 2)}\n`
          }
        }
      }
      bot.sendMessage(id, result);
    } else {
      bot.sendMessage(id, "There are no warehouses on your account")
    }
  } catch (error) {
    console.log(error.message);
  }
}