import { CustomContext } from '../../types/telegraf';
import { registerUser } from '../../shared/container';

export const startHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);
    const fullName = ctx.from?.first_name || '';
    const args = (ctx.message as any)?.text?.split(' ');
    const refPhone = args?.[1];

    await registerUser.execute(telegramId, fullName, refPhone);

    ctx.reply("سلام! لطفاً شماره‌ت رو با دکمه زیر ارسال کن:", {
        reply_markup: {
            keyboard: [[{ text: "📱 ارسال شماره من", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    });
};