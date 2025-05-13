"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralHandler = void 0;
const container_1 = require("../../shared/container");
const markdown_1 = require("../../utils/markdown");
const referralHandler = async (ctx) => {
    const telegramId = String(ctx.from?.id);
    const user = await container_1.userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply((0, markdown_1.escapeMarkdownV2)('😕 هنوز ثبت‌نام نکردی! با /start شروع کن.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }
    const referralLink = `t.me/${process.env.BOT_USERNAME}?start=ref_${telegramId}`;
    const referralCount = await container_1.userRepo.getReferralCount(telegramId);
    ctx.reply((0, markdown_1.escapeMarkdownV2)(`📨 *لینک دعوت اختصاصی تو:* 👇\n` +
        `${referralLink}\n\n` +
        `👥 *دوستان دعوت‌شده:* ${referralCount} نفر\n` +
        `💰 هر دوست = *10 سکه* جایزه! 🚀\n` +
        `✨ حالا لینک رو به اشتراک بذار و سکه جمع کن!`), {
        parse_mode: 'MarkdownV2',
        reply_markup: {
            keyboard: [
                [{ text: '💎 سکه‌های من' }, { text: '📝 ثبت آگهی رایگان' }],
                [{ text: '📨 دعوت دوستان' }, { text: '📊 مدیریت آگهی' }],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
        },
    });
};
exports.referralHandler = referralHandler;
