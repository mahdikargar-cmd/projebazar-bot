//src/interfaces/handlers/coinsHandler.ts

import { CustomContext } from '../../types/telegraf';
import { userRepo } from '../../shared/container';

export const coinsHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);

    const user = await userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply('😕 هنوز ثبت‌نام نکردی! با /start شروع کن.');
        return;
    }

    if (!user.phone) {
        ctx.reply('📱 لطفاً ابتدا شماره تلفن خود را با دکمه "📲 ارسال شماره" ثبت کنید.');
        return;
    }

    ctx.reply(`💎 *سکه‌های تو: ${user.coins}* ✨\n\n` +
        `📢 با 30 سکه می‌تونی آگهی رایگان ثبت کنی!\n` +
        `💰 دوستانت رو دعوت کن و سکه بیشتر جمع کن!`, {
        parse_mode: 'MarkdownV2',
    });
};