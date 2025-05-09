import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx) => ctx.reply('سلام! ربات کار می‌کنه.'));

bot.launch()
    .then(() => console.log('تست ربات شروع شد'))
    .catch((err) => console.error('خطای تست ربات:', err));
