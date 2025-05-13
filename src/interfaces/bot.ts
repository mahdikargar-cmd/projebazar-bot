import { Telegraf, session } from 'telegraf';
import { CustomContext } from '../types/telegraf';
import { startHandler } from './handlers/startHandler';
import { contactHandler } from './handlers/contactHandler';
import { projectHandler, textHandler, deadlineHandler, usernameHandler } from './handlers/projectHandler';
import { coinsHandler } from './handlers/coinsHandler';
import { referralHandler } from './handlers/referralHandler';
import { manageAdHandler, manageAdActionHandler } from './handlers/manageAdHandler';

const bot = new Telegraf<CustomContext>(process.env.BOT_TOKEN!);

bot.use(session({
    defaultSession: () => ({ isPinned: false })
}));

bot.use(async (ctx, next) => {
    console.log(`Received update: ${JSON.stringify(ctx.update, null, 2)}`);
    console.log(`Session before: ${JSON.stringify(ctx.session, null, 2)}`);
    await next();
    console.log(`Session after: ${JSON.stringify(ctx.session, null, 2)}`);
});

bot.start(startHandler);
bot.on('contact', contactHandler);
bot.command('newproject', projectHandler);
bot.command('coins', coinsHandler);
bot.command('referral', referralHandler);
bot.hears('💎 سکه‌های من', coinsHandler);
bot.hears('📝 ثبت آگهی رایگان', projectHandler);
bot.hears('📨 دعوت دوستان', referralHandler);
bot.hears('📊 مدیریت آگهی', manageAdHandler);

// مدیریت اکشن‌های مدیریت آگهی
bot.action(/manage_(.+)/, manageAdActionHandler);

// مدیریت پیام‌های متنی
bot.on('text', async (ctx) => {
    console.log(`Text message received: ${(ctx.message as any)?.text}`);
    console.log(`Current session step: ${ctx.session.step}`);

    try {
        if (ctx.session.step === 'awaiting_deadline') {
            await deadlineHandler(ctx);
        } else if (ctx.session.step === 'awaiting_username') {
            await usernameHandler(ctx);
        } else if (
            ctx.session.step === 'select_ad_type' ||
            ctx.session.step === 'awaiting_role' ||
            ctx.session.step === 'awaiting_price_type' ||
            ctx.session.step === 'awaiting_amount' ||
            ctx.session.step === 'awaiting_pin_option' ||
            ctx.session.step === 'awaiting_title' ||
            ctx.session.step === 'awaiting_description'
        ) {
            await textHandler(ctx);
        } else {
            console.log('No matching session step, ignoring message');
            ctx.reply('☺️ لطفاً دستور مناسب (مثل /newproject) را اجرا کنید.');
        }
    } catch (error: any) {
        console.error(`Error in text event handler: ${error.message}`);
        ctx.reply('☺️ خطایی رخ داد. لطفاً دوباره امتحان کنید.');
    }
});

export default bot;