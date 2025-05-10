"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coinsHandler = void 0;
const container_1 = require("../../shared/container");
const coinsHandler = async (ctx) => {
    const telegramId = String(ctx.from?.id);
    const user = await container_1.userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply('شما هنوز ثبت‌نام نکرده‌اید. لطفاً با /start شروع کنید.');
        return;
    }
    if (!user.phone) {
        ctx.reply('لطفاً ابتدا شماره تلفن خود را با دکمه "📱 ثبت شماره تلفن" ثبت کنید.');
        return;
    }
    ctx.reply(`💎 تعداد سکه‌های شما: ${user.coins}`);
};
exports.coinsHandler = coinsHandler;
