import { CustomContext } from '../../types/telegraf';
import { userRepo } from '../../shared/container';
import { escapeMarkdownV2 } from '../../utils/markdown';

export const referralHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);

    const user = await userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply(escapeMarkdownV2('😕 هنوز ثبت‌نام نکردی! با /start شروع کن.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }

    const referralLink = `t.me/${process.env.BOT_USERNAME}?start=ref_${telegramId}`;
    const referralCount = await userRepo.getReferralCount(telegramId);

    ctx.reply(
        escapeMarkdownV2(
            `📨 *لینک دعوت اختصاصی تو:* 👇\n` +
            `${referralLink}\n\n` +
            `👥 *دوستان دعوت‌شده:* ${referralCount} نفر\n` +
            `💰 هر دوست = *10 سکه* جایزه! 🚀\n` +
            `✨ حالا لینک رو به اشتراک بذار و سکه جمع کن!`
        ),
        {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                keyboard: [
                    [{ text: '💎 سکه‌های من' }, { text: '📝 ثبت آگهی رایگان' }],
                    [{ text: '📨 دعوت دوستان' }, { text: '📊 مدیریت آگهی' }],
                ],
                resize_keyboard: true,
                one_time_keyboard: false,
            },
        }
    );
};