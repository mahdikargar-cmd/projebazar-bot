import { Telegraf, session } from 'telegraf';
import { CustomContext } from '../types/telegraf';
import { startHandler } from './handlers/startHandler';
import { contactHandler } from './handlers/contactHandler';
import { projectHandler, textHandler, deadlineHandler, usernameHandler } from './handlers/projectHandler';
import { coinsHandler } from './handlers/coinsHandler';

const bot = new Telegraf<CustomContext>(process.env.BOT_TOKEN!);

// فعال‌سازی session
bot.use(session());

bot.start(startHandler);
bot.on('contact', contactHandler);
bot.command('newproject', projectHandler);
bot.command('coins', coinsHandler);
bot.hears('💎 استعلام سکه‌ها', coinsHandler);
bot.hears('📝 ثبت آگهی', projectHandler);
bot.on('text', async (ctx, next) => {
    if (ctx.session.step === 'awaiting_description') {
        await textHandler(ctx);
    } else if (ctx.session.step === 'awaiting_deadline') {
        await deadlineHandler(ctx);
    } else if (ctx.session.step === 'awaiting_username') {
        await usernameHandler(ctx);
    } else {
        await next();
    }
});

export default bot;

export const postToChannel = async (
    bot: Telegraf,
    { description, budget, deadline, telegramId, telegramUsername }: {
        description: string;
        budget: string;
        deadline: string;
        telegramId: string;
        telegramUsername?: string;
    }
) => {
    const message = `📢 آگهی جدید ثبت شد!

📝 توضیحات: ${description}
💰 بودجه: ${budget}
⏰ مهلت: ${deadline}
📩 ارتباط با کارفرما: ${telegramUsername || '@' + telegramId}`;

    await bot.telegram.sendMessage(process.env.CHANNEL_ID!, message);
};