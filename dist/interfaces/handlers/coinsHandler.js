"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coinsHandler = void 0;
const container_1 = require("../../shared/container");
const markdown_1 = require("../../utils/markdown");
const coinsHandler = async (ctx) => {
    const telegramId = String(ctx.from?.id);
    const user = await container_1.userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply((0, markdown_1.escapeMarkdownV2)('😕 هنوز ثبت‌نام نکردی! با /start شروع کن.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }
    if (!user.phone) {
        ctx.reply((0, markdown_1.escapeMarkdownV2)('📱 لطفاً ابتدا شماره تلفن خود را با دکمه "📲 ارسال شماره" ثبت کنید.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }
    ctx.reply((0, markdown_1.escapeMarkdownV2)(`💎 *سکه‌های تو: ${user.coins}* ✨\n\n` +
        `📢 با 30 سکه می‌تونی آگهی رایگان ثبت کنی!\n` +
        `💰 دوستانت رو دعوت کن و سکه بیشتر جمع کن!`), {
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
exports.coinsHandler = coinsHandler;
