"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToChannel = void 0;
const postToChannel = async (telegram, // Change from Telegraf to Telegram
{ description, budget, deadline, telegramId, telegramUsername, }) => {
    const message = `📢 آگهی جدید ثبت شد!

📝 توضیحات: ${description}
💰 بودجه: ${budget}
⏰ مهلت: ${deadline}
📩 ارتباط با کارفرما: ${telegramUsername || '@' + telegramId}`;
    await telegram.sendMessage(process.env.CHANNEL_ID, message);
};
exports.postToChannel = postToChannel;
