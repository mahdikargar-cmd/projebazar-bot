"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usernameHandler = exports.deadlineHandler = exports.textHandler = exports.projectHandler = void 0;
const container_1 = require("../../shared/container");
const projectHandler = async (ctx) => {
    const telegramId = String(ctx.from?.id);
    // بررسی سکه‌های کاربر
    const user = await container_1.userRepo.getUserByTelegramId(telegramId);
    if (!user || user.coins < 30) {
        ctx.reply('⚠️ برای ثبت آگهی رایگان، حداقل 30 سکه نیاز دارید. سکه‌های فعلی شما: ' + (user?.coins || 0));
        return;
    }
    // اگر شماره تلفن ثبت نشده باشد، درخواست شماره
    if (!user.phone) {
        ctx.session = { telegramId, step: 'awaiting_phone' };
        ctx.reply('⚠️ لطفاً شماره تلفن اکانت تلگرام خود را با دکمه زیر ارسال کنید:', {
            reply_markup: {
                keyboard: [[{ text: "📱 ارسال شماره تلفن", request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
        return;
    }
    // شماره تلفن وجود دارد، مستقیم به مرحله بعدی
    ctx.session = { telegramId, phone: user.phone, step: 'awaiting_description' };
    ctx.reply('✅ لطفاً متن آگهی را وارد کنید:');
};
exports.projectHandler = projectHandler;
const textHandler = async (ctx) => {
    const message = ctx.message?.text;
    if (!message || !ctx.session.step || ctx.session.step !== 'awaiting_description') {
        ctx.reply('⚠️ لطفاً ابتدا دستور /newproject را اجرا کنید.');
        return;
    }
    ctx.session.description = message;
    ctx.session.step = 'awaiting_deadline';
    ctx.reply('⏰ لطفاً زمان تحویل پروژه را وارد کنید (مثال: 1404/01/01):');
};
exports.textHandler = textHandler;
const deadlineHandler = async (ctx) => {
    const message = ctx.message?.text;
    if (!message || !ctx.session.step || ctx.session.step !== 'awaiting_deadline') {
        ctx.reply('⚠️ لطفاً ابتدا متن آگهی را وارد کنید.');
        return;
    }
    ctx.session.deadline = message;
    ctx.session.step = 'awaiting_username';
    ctx.reply('📩 لطفاً آیدی تلگرام خود را برای نمایش در آگهی وارد کنید (مثال: @Username):');
};
exports.deadlineHandler = deadlineHandler;
const usernameHandler = async (ctx) => {
    const message = ctx.message?.text;
    if (!message || !ctx.session.step || ctx.session.step !== 'awaiting_username') {
        ctx.reply('⚠️ لطفاً ابتدا زمان تحویل را وارد کنید.');
        return;
    }
    if (!message.startsWith('@')) {
        ctx.reply('⚠️ آیدی تلگرام باید با @ شروع شود (مثال: @Username).');
        return;
    }
    const { telegramId, description, deadline, phone } = ctx.session;
    if (!telegramId || !description || !deadline || !phone) {
        ctx.reply('⚠️ اطلاعات آگهی ناقص است. لطفاً دوباره با /newproject شروع کنید.');
        return;
    }
    try {
        await container_1.registerProject.execute(telegramId, description, 'رایگان', deadline, 'gateway', ctx.telegram, message);
        ctx.reply('✅ آگهی شما با موفقیت در کانال منتشر شد!\n' +
            '⚠️ توصیه: برای امنیت بیشتر، حتماً از پرداخت امن واسط ادمین (@AdminID) استفاده کنید.');
        ctx.session = {}; // پاک کردن session
    }
    catch (error) {
        ctx.reply('⚠️ خطا: ' + error.message);
    }
};
exports.usernameHandler = usernameHandler;
