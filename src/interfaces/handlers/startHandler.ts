import { CustomContext } from '../../types/telegraf';
import { registerUser } from '../../shared/container';

export const startHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);
    const fullName = ctx.from?.first_name || '';
    const args = (ctx.message as any)?.text?.split(' ');
    const refTelegramId = args?.[1]?.startsWith('ref_') ? args[1].replace('ref_', '') : undefined;

    await registerUser.execute(telegramId, fullName, refTelegramId);

    const welcomeMessage = `🎉 به ربات پروژه‌بازار خوش آمدید!

💡 اینجا می‌تونی پروژه‌هات رو ثبت کنی و با فریلنسرها ارتباط برقرار کنی.
💰 با دعوت دوستانت، به ازای هر نفر 10 سکه دریافت می‌کنی!
📢 با 30 سکه می‌تونی آگهی رایگان در کانال ما ثبت کنی.

لطفاً یکی از گزینه‌های زیر رو انتخاب کن:`;

    ctx.reply(welcomeMessage, {
        reply_markup: {
            keyboard: [
                [{ text: "💎 استعلام سکه‌ها" }],
                [{ text: "📝 ثبت آگهی رایگان" }],
                [{ text: "📨 دعوت دوستان" }],
                [{text: "ثبت آگهی"}]
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
};