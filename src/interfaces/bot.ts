import { Telegraf, session } from 'telegraf';
import { CustomContext } from '../types/telegraf';
import { startHandler } from './handlers/startHandler';
import { contactHandler } from './handlers/contactHandler';
import { projectHandler, paymentMethodHandler } from './handlers/projectHandler';

const bot = new Telegraf<CustomContext>(process.env.BOT_TOKEN!);

// فعال‌سازی session
bot.use(session());

bot.start(startHandler);
bot.on('contact', contactHandler);
bot.command('newproject', projectHandler);
bot.action(['gateway', 'admin'], paymentMethodHandler);

export default bot;
export { postToChannel } from './postToChannel';