import { Telegraf, session } from 'telegraf';
import { CustomContext } from '../types/telegraf';
import { startHandler } from './handlers/startHandler';
import { contactHandler } from './handlers/contactHandler';
import { projectHandler, textHandler, deadlineHandler, usernameHandler } from './handlers/projectHandler';
import { coinsHandler } from './handlers/coinsHandler';
import { referralHandler } from './handlers/referralHandler';
import { projectRepo } from '../shared/container';
import { postToChannel } from './postToChannel';

const bot = new Telegraf<CustomContext>(process.env.BOT_TOKEN!);

// فعال‌سازی session با تنظیمات پیش‌فرض
bot.use(session({
    defaultSession: () => ({ isPinned: false }) // مقدار پیش‌فرض برای isPinned
}));

// لاگ‌گذاری برای بررسی دریافت پیام‌ها
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
bot.hears('💎 استعلام سکه‌ها', coinsHandler);
bot.hears('📝 ثبت آگهی', projectHandler);
bot.hears('📨 دعوت دوستان', referralHandler);

// مدیریت دکمه پرداخت
bot.action(/pay_(.+)/, async (ctx) => {
    const projectId = parseInt(ctx.match[1]);
    const project = await projectRepo.getProjectById(projectId);

    if (!project) {
        ctx.reply('⚠️ پروژه یافت نشد.');
        return;
    }

    try {
        // شبیه‌سازی پرداخت موفق
        await projectRepo.updatePaymentStatus(projectId, 'completed');

        // ارسال آگهی به کانال
        await postToChannel(ctx.telegram, {
            description: project.description,
            budget: project.budget,
            deadline: project.deadline || 'بدون مهلت',
            telegramId: project.telegramId,
            telegramUsername: project.telegramUsername,
            isPinned: project.isPinned || false,
        });

        ctx.reply(
            '✅ پرداخت با موفقیت انجام شد و آگهی شما در کانال منتشر شد!\n' +
            '⚠️ توصیه: برای امنیت بیشتر، حتماً از پرداخت امن واسط ادمین (@AdminID) استفاده کنید.'
        );
        ctx.session = { isPinned: false }; // پاک کردن session با مقدار پیش‌فرض
    } catch (error: any) {
        console.error(`Error in payment handler: ${error.message}`);
        ctx.reply('⚠️ خطایی رخ داد. لطفاً دوباره امتحان کنید.');
    }
});

// مدیریت پیام‌های متنی
bot.on('text', async (ctx) => {
    console.log(`Text message received: ${(ctx.message as any)?.text}`);
    console.log(`Current session step: ${ctx.session.step}`);

    try {
        if (ctx.session.step === 'select_ad_type' || ctx.session.step === 'awaiting_amount' || ctx.session.step === 'awaiting_description' || ctx.session.step === 'awaiting_pin_option') {
            await textHandler(ctx);
        } else if (ctx.session.step === 'awaiting_deadline') {
            await deadlineHandler(ctx);
        } else if (ctx.session.step === 'awaiting_username') {
            await usernameHandler(ctx);
        } else {
            console.log('No matching session step, ignoring message');
            ctx.reply('⚠️ لطفاً دستور مناسب (مثل /newproject) را اجرا کنید.');
        }
    } catch (error: any) {
        console.error(`Error in text event handler: ${error.message}`);
        ctx.reply('⚠️ خطایی رخ داد. لطفاً دوباره امتحان کنید.');
    }
});

export default bot;