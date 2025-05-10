"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHandler = void 0;
const container_1 = require("../../shared/container");
const startHandler = async (ctx) => {
    const telegramId = String(ctx.from?.id);
    const fullName = ctx.from?.first_name || '';
    const args = ctx.message?.text?.split(' ');
    const refTelegramId = args?.[1]?.startsWith('ref_') ? args[1].replace('ref_', '') : undefined;
    await container_1.registerUser.execute(telegramId, fullName, refTelegramId);
    const welcomeMessage = `🎉 به ربات پروژه‌بازار خوش آمدید!

💡 اینجا می‌تونی پروژه‌هات رو ثبت کنی و با فریلنسرها ارتباط برقرار کنی.
💰 با دعوت دوستانت، به ازای هر نفر 10 سکه دریافت می‌کنی!
📢 با 30 سکه می‌تونی آگهی رایگان در کانال ما ثبت کنی.

لطفاً یکی از گزینه‌های زیر رو انتخاب کن:`;
    ctx.reply(welcomeMessage, {
        reply_markup: {
            keyboard: [
                [{ text: "💎 استعلام سکه‌ها" }],
                [{ text: "📝 ثبت آگهی رایگان" }],
                [{ text: "📨 دعوت دوستان" }],
                [{ text: "ثبت آگهی" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
};
exports.startHandler = startHandler;
