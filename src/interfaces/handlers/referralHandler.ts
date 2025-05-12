import { CustomContext } from '../../types/telegraf';
import { userRepo } from '../../shared/container';

export const referralHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);

    const user = await userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply('😕 هنوز ثبت‌نام نکردی! با /start شروع کن.');
        return;
    }

    const referralLink = `t.me/${process.env.BOT_USERNAME}?start=ref_${telegramId}`;
    const referralCount = await userRepo.getReferralCount(telegramId);

    ctx.reply(
        `📨 *لینک دعوت اختصاصی تو:* 👇\n` +
        `${referralLink}\n\n` +
        `👥 *دوستان دعوت‌شده:* ${referralCount} نفر\n` +
        `💰 هر دوست = *10 سکه* جایزه! 🚀\n` +
        `✨ حالا لینک رو به اشتراک بذار و سکه جمع کن!`,
        { parse_mode: 'MarkdownV2' }
    );
};