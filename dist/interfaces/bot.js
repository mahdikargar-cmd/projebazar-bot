"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const startHandler_1 = require("./handlers/startHandler");
const contactHandler_1 = require("./handlers/contactHandler");
const projectHandler_1 = require("./handlers/projectHandler");
const coinsHandler_1 = require("./handlers/coinsHandler");
const referralHandler_1 = require("./handlers/referralHandler");
const manageAdHandler_1 = require("./handlers/manageAdHandler");
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
bot.use((0, telegraf_1.session)({
    defaultSession: () => ({ isPinned: false })
}));
bot.use(async (ctx, next) => {
    console.log(`Received update: ${JSON.stringify(ctx.update, null, 2)}`);
    console.log(`Session before: ${JSON.stringify(ctx.session, null, 2)}`);
    await next();
    console.log(`Session after: ${JSON.stringify(ctx.session, null, 2)}`);
});
bot.start(startHandler_1.startHandler);
bot.on('contact', contactHandler_1.contactHandler);
bot.command('newproject', projectHandler_1.projectHandler);
bot.command('coins', coinsHandler_1.coinsHandler);
bot.command('referral', referralHandler_1.referralHandler);
bot.hears('💎 سکه‌های من', coinsHandler_1.coinsHandler);
bot.hears('📝 ثبت آگهی رایگان', projectHandler_1.projectHandler);
bot.hears('📨 دعوت دوستان', referralHandler_1.referralHandler);
bot.hears('📊 مدیریت آگهی', manageAdHandler_1.manageAdHandler);
// مدیریت اکشن‌های مدیریت آگهی
bot.action(/manage_(.+)/, manageAdHandler_1.manageAdActionHandler);
// مدیریت پیام‌های متنی
bot.on('text', async (ctx) => {
    console.log(`Text message received: ${ctx.message?.text}`);
    console.log(`Current session step: ${ctx.session.step}`);
    try {
        if (ctx.session.step === 'awaiting_deadline') {
            await (0, projectHandler_1.deadlineHandler)(ctx);
        }
        else if (ctx.session.step === 'awaiting_username') {
            await (0, projectHandler_1.usernameHandler)(ctx);
        }
        else if (ctx.session.step === 'select_ad_type' ||
            ctx.session.step === 'awaiting_role' ||
            ctx.session.step === 'awaiting_price_type' ||
            ctx.session.step === 'awaiting_amount' ||
            ctx.session.step === 'awaiting_pin_option' ||
            ctx.session.step === 'awaiting_title' ||
            ctx.session.step === 'awaiting_description') {
            await (0, projectHandler_1.textHandler)(ctx);
        }
        else {
            console.log('No matching session step, ignoring message');
            ctx.reply('☺️ لطفاً دستور مناسب (مثل /newproject) را اجرا کنید.');
        }
    }
    catch (error) {
        console.error(`Error in text event handler: ${error.message}`);
        ctx.reply('☺️ خطایی رخ داد. لطفاً دوباره امتحان کنید.');
    }
});
exports.default = bot;
