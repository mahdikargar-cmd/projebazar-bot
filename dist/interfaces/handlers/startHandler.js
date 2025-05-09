"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHandler = void 0;
const container_1 = require("../../shared/container");
const startHandler = async (ctx) => {
    const telegramId = String(ctx.from?.id);
    const fullName = ctx.from?.first_name || '';
    const args = ctx.message?.text?.split(' ');
    const refPhone = args?.[1];
    await container_1.registerUser.execute(telegramId, fullName, refPhone);
    ctx.reply("سلام! لطفاً شماره‌ت رو با دکمه زیر ارسال کن:", {
        reply_markup: {
            keyboard: [[{ text: "📱 ارسال شماره من", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    });
};
exports.startHandler = startHandler;
