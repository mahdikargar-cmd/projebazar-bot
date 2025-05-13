import { CustomContext } from '../../types/telegraf';
import { userRepo } from '../../shared/container';
import { escapeMarkdownV2 } from '../../utils/markdown';

export const coinsHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);

    const user = await userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply(escapeMarkdownV2('😕 هنوز ثبت‌نام نکردی! با /start شروع کن.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }

    if (!user.phone) {
        ctx.reply(escapeMarkdownV2('📱 لطفاً ابتدا شماره تلفن خود را با دکمه "📲 ارسال شماره" ثبت کنید.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }

    ctx.reply(
        escapeMarkdownV2(
            `💎 *سکه‌های تو: ${user.coins}* ✨\n\n` +
            `📢 با 30 سکه می‌تونی آگهی رایگان ثبت کنی!\n` +
            `💰 دوستانت رو دعوت کن و سکه بیشتر جمع کن!`
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