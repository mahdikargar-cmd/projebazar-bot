"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const startHandler_1 = require("./handlers/startHandler");
const contactHandler_1 = require("./handlers/contactHandler");
const projectWithCoinHandler_1 = require("./handlers/projectWithCoinHandler");
const ProjectPaidHandler_1 = require("./handlers/ProjectPaidHandler");
const coinsHandler_1 = require("./handlers/coinsHandler");
const referralHandler_1 = require("./handlers/referralHandler");
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
// فعال‌سازی session
bot.use((0, telegraf_1.session)());
bot.start(startHandler_1.startHandler);
bot.on('contact', contactHandler_1.contactHandler);
bot.command('newproject', projectWithCoinHandler_1.projectWithCoinHandler);
bot.command('paidproject', ProjectPaidHandler_1.ProjectPaidHandler);
bot.command('coins', coinsHandler_1.coinsHandler);
bot.command('referral', referralHandler_1.referralHandler);
bot.hears('💎 استعلام سکه‌ها', coinsHandler_1.coinsHandler);
bot.hears('📝 ثبت آگهی رایگان', projectWithCoinHandler_1.projectWithCoinHandler);
bot.hears('📝 ثبت آگهی', ProjectPaidHandler_1.ProjectPaidHandler);
bot.hears('📨 دعوت دوستان', referralHandler_1.referralHandler);
bot.on('text', async (ctx, next) => {
    if (ctx.session.step === 'awaiting_description') {
        if (ctx.session.paymentId) {
            await (0, ProjectPaidHandler_1.textHandler)(ctx);
        }
        else {
            await (0, projectWithCoinHandler_1.textHandler)(ctx);
        }
    }
    else if (ctx.session.step === 'awaiting_deadline') {
        if (ctx.session.paymentId) {
            await (0, ProjectPaidHandler_1.deadlineHandler)(ctx);
        }
        else {
            await (0, projectWithCoinHandler_1.deadlineHandler)(ctx);
        }
    }
    else if (ctx.session.step === 'awaiting_username') {
        if (ctx.session.paymentId) {
            await (0, ProjectPaidHandler_1.usernameHandler)(ctx);
        }
        else {
            await (0, projectWithCoinHandler_1.usernameHandler)(ctx);
        }
    }
    else {
        await next();
    }
});
// هندلر برای callback پرداخت
bot.command('payment_callback', ProjectPaidHandler_1.paymentCallbackHandler);
exports.default = bot;
