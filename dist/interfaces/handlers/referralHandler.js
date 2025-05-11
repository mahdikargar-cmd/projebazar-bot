"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralHandler = void 0;
const container_1 = require("../../shared/container");
const referralHandler = async (ctx) => {
    const telegramId = String(ctx.from?.id);
    const user = await container_1.userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply('☺️ شما هنوز ثبت‌نام نکرده‌اید. لطفاً با /start شروع کنید.');
        return;
    }
    const referralLink = `t.me/${process.env.BOT_USERNAME}?start=ref_${telegramId}`;
    const referralCount = await container_1.userRepo.getReferralCount(telegramId);
    ctx.reply(`📨 لینک دعوت شما:\n${referralLink}\n\n` +
        `👥 تعداد دوستان دعوت‌شده: ${referralCount}\n` +
        `💰 به ازای هر دوست که با لینک شما ثبت‌نام کند، 10 سکه دریافت می‌کنید!`);
};
exports.referralHandler = referralHandler;
