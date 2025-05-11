import { CustomContext } from '../../types/telegraf';
import { userRepo } from '../../shared/container';

export const referralHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);

    const user = await userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply('☺️ شما هنوز ثبت‌نام نکرده‌اید. لطفاً با /start شروع کنید.');
        return;
    }

    const referralLink = `t.me/${process.env.BOT_USERNAME}?start=ref_${telegramId}`;
    const referralCount = await userRepo.getReferralCount(telegramId);

    ctx.reply(
        `📨 لینک دعوت شما:\n${referralLink}\n\n` +
        `👥 تعداد دوستان دعوت‌شده: ${referralCount}\n` +
        `💰 به ازای هر دوست که با لینک شما ثبت‌نام کند، 10 سکه دریافت می‌کنید!`
    );
};