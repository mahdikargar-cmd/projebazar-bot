"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToChannel = void 0;
const telegraf_1 = require("telegraf");
const startHandler_1 = require("./handlers/startHandler");
const contactHandler_1 = require("./handlers/contactHandler");
const projectHandler_1 = require("./handlers/projectHandler");
const coinsHandler_1 = require("./handlers/coinsHandler");
const referralHandler_1 = require("./handlers/referralHandler");
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
bot.on('text', async (ctx, next) => {
    if (ctx.session.step === 'awaiting_description') {
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
const postToChannel = async (bot, { description, budget, deadline, telegramId, telegramUsername }) => {
    const message = `📢 آگهی جدید ثبت شد!

📝 توضیحات: ${description}
💰 بودجه: ${budget}
⏰ مهلت: ${deadline}
📩 ارتباط با کارفرما: ${telegramUsername || '@' + telegramId}`;
    await bot.telegram.sendMessage(process.env.CHANNEL_ID, message);
};
exports.postToChannel = postToChannel;
