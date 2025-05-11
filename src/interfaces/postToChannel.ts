import { Telegram } from 'telegraf';

export const postToChannel = async (
    telegram: Telegram, // Change from Telegraf to Telegram
    {
        description,
        budget,
        deadline,
        telegramId,
        telegramUsername,
    }: {
        description: string;
        budget: string;
        deadline: string;
        telegramId: string;
        telegramUsername?: string;
    }
) => {
    const message: string = `📢 آگهی جدید ثبت شد!

📝 توضیحات: ${description}
💰 بودجه: ${budget}
⏰ مهلت: ${deadline}
📩 ارتباط با کارفرما: ${telegramUsername || '@' + telegramId}`;

    await telegram.sendMessage(process.env.CHANNEL_ID!, message);
};