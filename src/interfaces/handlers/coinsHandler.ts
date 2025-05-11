import { CustomContext } from '../../types/telegraf';
import { userRepo } from '../../shared/container';

export const coinsHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);

    const user = await userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply('شما هنوز ثبت‌نام نکرده‌اید. لطفاً با /start شروع کنید.');
        return;
    }

    if (!user.phone) {
        ctx.reply('لطفاً ابتدا شماره تلفن خود را با دکمه "📱 ارسال شماره تلفن" ثبت کنید.');
        return;
    }

    ctx.reply(`💎 تعداد سکه‌های شما: ${user.coins}`);
};