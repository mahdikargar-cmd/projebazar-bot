import { Telegraf, session } from 'telegraf';
import { CustomContext } from '../types/telegraf';
import { startHandler } from './handlers/startHandler';
import { contactHandler } from './handlers/contactHandler';
import { projectWithCoinHandler, textHandler as coinTextHandler, deadlineHandler as coinDeadlineHandler, usernameHandler as coinUsernameHandler } from './handlers/projectWithCoinHandler';
import { ProjectPaidHandler, textHandler as paidTextHandler, deadlineHandler as paidDeadlineHandler, usernameHandler as paidUsernameHandler, paymentCallbackHandler } from './handlers/ProjectPaidHandler';
import { coinsHandler } from './handlers/coinsHandler';
import { referralHandler } from './handlers/referralHandler';

const bot = new Telegraf<CustomContext>(process.env.BOT_TOKEN!);

// تنظیم bot در context
bot.use(async (ctx, next) => {
    ctx.bot = bot;
    if (!ctx.session) {
        ctx.session = {};
    }
    await next();
});

// فعال‌سازی session
bot.use(session());

bot.start(startHandler);
bot.on('contact', contactHandler);
bot.command('newproject', projectWithCoinHandler);
bot.command('paidproject', ProjectPaidHandler);
bot.command('coins', coinsHandler);
bot.command('referral', referralHandler);
bot.hears('💎 استعلام سکه‌ها', coinsHandler);
bot.hears('📝 ثبت آگهی رایگان', projectWithCoinHandler);
bot.hears(['📝 ثبت آگهی', 'ثبت آگهی'], ProjectPaidHandler);
bot.hears('📨 دعوت دوستان', referralHandler);
bot.on('text', async (ctx, next) => {
    const text = (ctx.message as any)?.text;
    console.log('Text received:', text); // لاگ برای دیباگ
    // نادیده گرفتن پیام‌های خاص که توسط bot.hears مدیریت می‌شوند
    if (text === '📝 ثبت آگهی' || text === '📝 ثبت آگهی رایگان' || text === '💎 استعلام سکه‌ها' || text === '📨 دعوت دوستان') {
        await next();
        return;
    }
    if (ctx.session && ctx.session.step) {
        if (ctx.session.step === 'awaiting_description') {
            if (ctx.session.paymentId) {
                await paidTextHandler(ctx);
            } else {
                await coinTextHandler(ctx);
            }
        } else if (ctx.session.step === 'awaiting_deadline') {
            if (ctx.session.paymentId) {
                await paidDeadlineHandler(ctx);
            } else {
                await coinDeadlineHandler(ctx);
            }
        } else if (ctx.session.step === 'awaiting_username') {
            if (ctx.session.paymentId) {
                await paidUsernameHandler(ctx);
            } else {
                await coinUsernameHandler(ctx);
            }
        } else {
            await next();
        }
    } else {
        await next();
    }
});

// هندلر برای callback پرداخت
bot.command('payment_callback', paymentCallbackHandler);

export default bot;