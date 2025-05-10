import { CustomContext } from '../../types/telegraf';
import { registerProject, userRepo } from '../../shared/container';

export const projectHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);
    const message = (ctx.message as any)?.text?.split('\n');

    // بررسی ثبت شماره تلفن
    const user = await userRepo.getUserByTelegramId(telegramId);
    if (!user || !user.phone) {
        ctx.reply('لطفاً ابتدا شماره تلفن خود را با دکمه "📱 ثبت شماره تلفن" ثبت کنید.');
        return;
    }

    if (!message || message.length < 3) {
        ctx.reply('لطفاً اطلاعات آگهی را به این شکل وارد کنید:\nتوضیحات\nبودجه\nمهلت');
        return;
    }

    const [description, budget, deadline] = message;

    ctx.reply(`💎 سکه‌های شما: ${user.coins}\nبرای انتشار رایگان آگهی، نیاز به 30 سکه دارید. روش پرداخت را انتخاب کنید:`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '💸 تست پرداخت (موقت)', callback_data: 'gateway' }],
                [{ text: '👨‍💼 واسط ادمین', callback_data: 'admin' }],
            ],
        },
    });

    ctx.session = { telegramId, description, budget, deadline };
};

export const paymentMethodHandler = async (ctx: CustomContext) => {
    const paymentMethod = (ctx.callbackQuery as any)?.data as 'gateway' | 'admin';
    const { telegramId, description, budget, deadline } = ctx.session || {};

    if (!telegramId || !description || !budget || !deadline) {
        ctx.reply('خطا در اطلاعات آگهی.');
        return;
    }

    try {
        await registerProject.execute(telegramId, description, budget, deadline, paymentMethod, ctx.telegram);
        ctx.reply('✅ آگهی با موفقیت ثبت شد.');
    } catch (error: any) {
        ctx.reply(error.message);
    }
};