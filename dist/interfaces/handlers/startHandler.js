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
    const welcomeMessage = `🎉 *خوش اومدی به پروژه‌بازار!* 🚀

✨ اینجا جاییه که می‌تونی پروژه‌هات رو ثبت کنی و با حرفه‌ای‌ها کار کنی!
💰 با دعوت هر دوست، *10 سکه* جایزه می‌گیری!
📢 فقط با *30 سکه* می‌تونی آگهی رایگان ثبت کنی!

💡 حالا یکی از گزینه‌های زیر رو انتخاب کن:`;
    ctx.reply(welcomeMessage, {
        parse_mode: 'MarkdownV2',
        reply_markup: {
            inline_keyboard: [
                [{ text: '💎 سکه‌های من', callback_data: 'check_coins' }],
                [{ text: '📝 ثبت آگهی جدید', callback_data: 'new_project' }],
                [{ text: '📨 دعوت دوستان', callback_data: 'referral' }],
            ],
        },
    });
};
exports.startHandler = startHandler;
