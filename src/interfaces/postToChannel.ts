import { Telegraf } from 'telegraf';
import { CustomContext } from '../types/telegraf';

export const postToChannel = async (
    bot: Telegraf<CustomContext>,
    { description, budget, deadline, telegramId }: {
        description: string;
        budget: string;
        deadline: string;
        telegramId: string;
    }
) => {
    const message = `📢 پروژه جدید ثبت شد!

📝 توضیحات: ${description}
💰 بودجه: ${budget}
⏰ مهلت: ${deadline}

📩 ارتباط با کارفرما: @${telegramId}`;

    await bot.telegram.sendMessage(process.env.CHANNEL_ID!, message);
};