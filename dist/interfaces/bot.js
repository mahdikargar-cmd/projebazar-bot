"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const startHandler_1 = require("./handlers/startHandler");
const contactHandler_1 = require("./handlers/contactHandler");
const projectHandler_1 = require("./handlers/projectHandler");
const coinsHandler_1 = require("./handlers/coinsHandler");
const referralHandler_1 = require("./handlers/referralHandler");
const container_1 = require("../shared/container");
const postToChannel_1 = require("./postToChannel");
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
// فعال‌سازی session
bot.use((0, telegraf_1.session)());
bot.start(startHandler_1.startHandler);
bot.on('contact', contactHandler_1.contactHandler);
bot.command('newproject', projectHandler_1.projectHandler);
bot.command('coins', coinsHandler_1.coinsHandler);
bot.command('referral', referralHandler_1.referralHandler);
bot.hears('💎 استعلام سکه‌ها', coinsHandler_1.coinsHandler);
bot.hears('📝 ثبت آگهی', projectHandler_1.projectHandler);
bot.hears('📨 دعوت دوستان', referralHandler_1.referralHandler);
// هندل کردن دکمه پرداخت
bot.action(/pay_(.+)/, async (ctx) => {
    const projectId = parseInt(ctx.match[1]);
    const project = await container_1.projectRepo.getProjectById(projectId);
    if (!project) {
        ctx.reply('⚠️ پروژه یافت نشد.');
        return;
    }
    // شبیه‌سازی پرداخت موفق
    await container_1.projectRepo.updatePaymentStatus(projectId, 'completed');
    // ارسال آگهی به کانال
    await (0, postToChannel_1.postToChannel)(ctx.telegram, {
        description: project.description,
        budget: project.budget,
        deadline: project.deadline,
        telegramId: project.telegramId,
        telegramUsername: project.telegramUsername,
    });
    ctx.reply('✅ پرداخت با موفقیت انجام شد و آگهی شما در کانال منتشر شد!\n' +
        '⚠️ توصیه: برای امنیت بیشتر، حتماً از پرداخت امن واسط ادمین (@AdminID) استفاده کنید.');
    ctx.session = {}; // پاک کردن session
});
bot.on('text', async (ctx, next) => {
    if (ctx.session.step === 'select_ad_type' || ctx.session.step === 'awaiting_amount' || ctx.session.step === 'awaiting_description') {
        await (0, projectHandler_1.textHandler)(ctx);
    }
    else if (ctx.session.step === 'awaiting_deadline') {
        await (0, projectHandler_1.deadlineHandler)(ctx);
    }
    else if (ctx.session.step === 'awaiting_username') {
        await (0, projectHandler_1.usernameHandler)(ctx);
    }
    else {
        await next();
    }
});
exports.default = bot;
