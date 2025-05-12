"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralHandler = void 0;
const container_1 = require("../../shared/container");
const referralHandler = async (ctx) => {
    const telegramId = String(ctx.from?.id);
    const user = await container_1.userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply('😕 هنوز ثبت‌نام نکردی! با /start شروع کن.');
        return;
    }
    const referralLink = `t.me/${process.env.BOT_USERNAME}?start=ref_${telegramId}`;
    const referralCount = await container_1.userRepo.getReferralCount(telegramId);
    ctx.reply(`📨 *لینک دعوت اختصاصی تو:* 👇\n` +
        `${referralLink}\n\n` +
        `👥 *دوستان دعوت‌شده:* ${referralCount} نفر\n` +
        `💰 هر دوست = *10 سکه* جایزه! 🚀\n` +
        `✨ حالا لینک رو به اشتراک بذار و سکه جمع کن!`, { parse_mode: 'MarkdownV2' });
};
exports.referralHandler = referralHandler;
