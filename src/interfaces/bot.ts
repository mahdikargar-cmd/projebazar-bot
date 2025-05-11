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
bot.hears('💎 استعلام سکه‌ها', coinsHandler);
bot.hears('📝 ثبت آگهی', projectHandler);
bot.hears('📨 دعوت دوستان', referralHandler);

// مدیریت دکمه پرداخت
// مدیریت دکمه پرداخت
bot.action(/pay_(.+)/, async (ctx) => {
    const projectId = parseInt(ctx.match[1]);
    const project = await projectRepo.getProjectById(projectId);

    if (!project) {
        ctx.reply('⚠️ پروژه یافت نشد.');
        return;
    }

    try {
        await projectRepo.updatePaymentStatus(projectId, 'completed');
        console.log(`Posting to channel - Project: ${JSON.stringify(project, null, 2)}`);

        await postToChannel(ctx.telegram, {
            title: project.title,
            description: project.description,
            budget: project.budget,
            deadline: project.deadline || 'بدون مهلت',
            telegramId: project.telegramId,
            telegramUsername: project.telegramUsername ?? undefined,
            isPinned: project.isPinned || false,
            role: project.role,
        });

        await ctx.reply(
            '✅ پرداخت با موفقیت انجام شد و آگهی شما در کانال منتشر شد!\n' +
            '☺️ توصیه: برای امنیت بیشتر، حتماً از پرداخت امن واسط ادمین (@projebazar_admin) استفاده کنید.',
            { reply_markup: { remove_keyboard: true } }
        );
        ctx.session = { isPinned: false };
        console.log(`Payment completed and session reset: ${JSON.stringify(ctx.session, null, 2)}`);
    } catch (error: any) {
        console.error(`Error in payment handler: ${error.message}`);
        await ctx.reply('☺️ خطایی رخ داد. لطفاً دوباره امتحان کنید.');
    }
});

// مدیریت پیام‌های متنی
bot.on('text', async (ctx) => {
    console.log(`Text message received: ${(ctx.message as any)?.text}`);
    console.log(`Current session step: ${ctx.session.step}`);

    try {
        if (ctx.session.step === 'select_ad_type' || ctx.session.step === 'awaiting_price_type' || ctx.session.step === 'awaiting_amount' || ctx.session.step === 'awaiting_pin_option' || ctx.session.step === 'awaiting_title' || ctx.session.step === 'awaiting_description' || ctx.session.step === 'awaiting_role') {
            await textHandler(ctx);
        } else if (ctx.session.step === 'awaiting_deadline') {
            await deadlineHandler(ctx);
        } else if (ctx.session.step === 'awaiting_username') {
            await usernameHandler(ctx);
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