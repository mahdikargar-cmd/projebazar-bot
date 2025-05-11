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

// فعال‌سازی session
bot.use(session());

bot.start(startHandler);
bot.on('contact', contactHandler);
bot.command('newproject', projectHandler);
bot.command('coins', coinsHandler);
bot.command('referral', referralHandler);
bot.hears('💎 استعلام سکه‌ها', coinsHandler);
bot.hears('📝 ثبت آگهی', projectHandler);
bot.hears('📨 دعوت دوستان', referralHandler);

// هندل کردن دکمه پرداخت
bot.action(/pay_(.+)/, async (ctx) => {
    const projectId = parseInt(ctx.match[1]);
    const project = await projectRepo.getProjectById(projectId);

    if (!project) {
        ctx.reply('⚠️ پروژه یافت نشد.');
        return;
    }

    // شبیه‌سازی پرداخت موفق
    await projectRepo.updatePaymentStatus(projectId, 'completed');

    // ارسال آگهی به کانال
    await postToChannel(ctx.telegram, {
        description: project.description,
        budget: project.budget,
        deadline: project.deadline,
        telegramId: project.telegramId,
        telegramUsername: project.telegramUsername,
    });

    ctx.reply(
        '✅ پرداخت با موفقیت انجام شد و آگهی شما در کانال منتشر شد!\n' +
        '⚠️ توصیه: برای امنیت بیشتر، حتماً از پرداخت امن واسط ادمین (@AdminID) استفاده کنید.'
    );
    ctx.session = {}; // پاک کردن session
});

bot.on('text', async (ctx, next) => {
    if (ctx.session.step === 'select_ad_type' || ctx.session.step === 'awaiting_amount' || ctx.session.step === 'awaiting_description') {
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