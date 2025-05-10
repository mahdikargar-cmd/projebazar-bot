import { CustomContext } from '../../types/telegraf';
import { registerUser } from '../../shared/container';

export const startHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);
    const fullName = ctx.from?.first_name || '';
    const args = (ctx.message as any)?.text?.split(' ');
    const refPhone = args?.[1];

    // ثبت کاربر جدید یا به‌روزرسانی اطلاعات
    await registerUser.execute(telegramId, fullName, refPhone);

    // پیام خوش‌آمدگویی
    const welcomeMessage = `🎉 به ربات پروژه‌بازار خوش آمدید!

💡 اینجا می‌تونی پروژه‌هات رو ثبت کنی و با فریلنسرها ارتباط برقرار کنی.
💰 با دعوت دوستانت، به ازای هر نفر 10 سکه دریافت می‌کنی!
📢 با 30 سکه می‌تونی آگهی رایگان در کانال ما ثبت کنی.

⚠️ برای شروع، لطفاً شماره تلفن ثبت‌شده در اکانت تلگرام خود را با دکمه زیر ارسال کنید:`;

    ctx.reply(welcomeMessage, {
        reply_markup: {
            keyboard: [
                [{ text: "📱 ارسال شماره تلفن", request_contact: true }],
                [{ text: "💎 استعلام سکه‌ها" }],
                [{ text: "📝 ثبت آگهی" }],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
};