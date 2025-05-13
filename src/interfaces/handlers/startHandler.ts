
import { CustomContext } from '../../types/telegraf';
import { registerUser } from '../../shared/container';


export const startHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);
    const fullName = ctx.from?.first_name || '';
    const args = (ctx.message as any)?.text?.split(' ');
    const refTelegramId = args?.[1]?.startsWith('ref_') ? args[1].replace('ref_', '') : undefined;

    await registerUser.execute(telegramId, fullName, refTelegramId);

    const welcomeMessage = `🎉 *خوش اومدی به پروژه‌بازار\\!* 🚀

✨ اینجا جاییه که می‌تونی پروژه‌هات رو  رایگان ثبت کنی و با حرفه‌ای‌ها کار کنی\\!
💰 با دعوت هر دوست، *10 سکه* جایزه می‌گیری\\!
📢 فقط با *30 سکه* می‌تونی آگهی رایگان ثبت کنی\\!

💡 حالا یکی از گزینه‌های زیر رو انتخاب کن:`;


    ctx.reply(welcomeMessage, {
        parse_mode: 'MarkdownV2',
        reply_markup: {
            keyboard: [
                [{ text: '💎 سکه‌های من' },{ text: '📝 ثبت آگهی رایگان' }],
                [{ text: '📨 دعوت دوستان' }],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
};