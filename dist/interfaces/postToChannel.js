"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToChannel = void 0;
const postToChannel = async (bot, { description, budget, deadline, telegramId }) => {
    const message = `📢 پروژه جدید ثبت شد!

📝 توضیحات: ${description}
💰 بودجه: ${budget}
⏰ مهلت: ${deadline}

📩 ارتباط با کارفرما: @${telegramId}`;
    await bot.telegram.sendMessage(process.env.CHANNEL_ID, message);
};
exports.postToChannel = postToChannel;
