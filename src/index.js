require("dotenv").config();
const lark = require("@larksuiteoapi/node-sdk");
const { chat } = require("./claude");

const client = new lark.Client({
  appId: process.env.APP_ID,
  appSecret: process.env.APP_SECRET,
});

const wsClient = new lark.WSClient({
  appId: process.env.APP_ID,
  appSecret: process.env.APP_SECRET,
  loggerLevel: lark.LoggerLevel.info,
});

wsClient.start({
  eventDispatcher: new lark.EventDispatcher({}).register({
    "im.message.receive_v1": async (data) => {
      const { message, sender } = data;
      const msgType = message.message_type;

      if (msgType !== "text") return;

      let userText;
      try {
        userText = JSON.parse(message.content).text;
      } catch {
        return;
      }

      const chatId = message.chat_id;
      const senderId = sender.sender_id.open_id;

      console.log(`[${senderId}]: ${userText}`);

      try {
        const reply = await chat(userText);

        await client.im.message.create({
          data: {
            receive_id: chatId,
            msg_type: "text",
            content: JSON.stringify({ text: reply }),
          },
          params: { receive_id_type: "chat_id" },
        });

        console.log(`[Bot]: ${reply.slice(0, 100)}...`);
      } catch (err) {
        console.error("Error:", err.message);

        await client.im.message.create({
          data: {
            receive_id: chatId,
            msg_type: "text",
            content: JSON.stringify({ text: "抱歉，处理消息时出错了。" }),
          },
          params: { receive_id_type: "chat_id" },
        });
      }
    },
  }),
});

console.log("飞书机器人已启动（长连接模式）...");
