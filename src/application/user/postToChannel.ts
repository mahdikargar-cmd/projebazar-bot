import { Telegraf } from "telegraf";

export const postToChannel = async (
    bot: Telegraf,
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

    await bot.telegram.sendMessage("@projebazar", message);
};
