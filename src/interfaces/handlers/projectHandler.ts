import { CustomContext } from '../../types/telegraf';
import { registerProject } from '../../shared/container';

export const projectHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);
    const message = (ctx.message as any)?.text?.split('\n');

    if (!message || message.length < 3) {
        ctx.reply('لطفاً اطلاعات پروژه را به این شکل وارد کنید:\nتوضیحات\nبودجه\nمهلت');
        return;
    }

    const [description, budget, deadline] = message;

    ctx.reply('روش پرداخت را انتخاب کنید:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'تست پرداخت (موقت)', callback_data: 'gateway' }],
                [{ text: 'واسط ادمین', callback_data: 'admin' }],
            ],
        },
    });

    ctx.session = { telegramId, description, budget, deadline };
};

export const paymentMethodHandler = async (ctx: CustomContext) => {
    const paymentMethod = (ctx.callbackQuery as any)?.data as 'gateway' | 'admin';
    const { telegramId, description, budget, deadline } = ctx.session || {};

    if (!telegramId || !description || !budget || !deadline) {
        ctx.reply('خطا در اطلاعات پروژه.');
        return;
    }

    try {
        await registerProject.execute(telegramId, description, budget, deadline, paymentMethod, ctx.telegram);
        ctx.reply('پردازش پروژه انجام شد.');
    } catch (error: any) {
        ctx.reply(error.message);
    }
};