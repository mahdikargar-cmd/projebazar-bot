import * as dotenv from 'dotenv';
dotenv.config();

import bot from './interfaces/bot';

bot.launch()
    .then(() => console.log('ربات با موفقیت شروع شد'))
    .catch((err) => console.error('خطا در شروع ربات:', err));
