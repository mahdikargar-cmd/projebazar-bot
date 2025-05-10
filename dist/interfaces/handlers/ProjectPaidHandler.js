"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentCallbackHandler = exports.usernameHandler = exports.deadlineHandler = exports.textHandler = exports.ProjectPaidHandler = void 0;
const container_1 = require("../../shared/container");
const postToChannel_1 = require("../../interfaces/postToChannel");
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const ProjectPaidHandler = async (ctx) => {
    const telegramId = String(ctx.from?.id);
    // بررسی وجود کاربر
    const user = await container_1.userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply('⚠️ شما هنوز ثبت‌نام نکرده‌اید. لطفاً با /start شروع کنید.');
        return;
    }
    // اگر شماره تلفن ثبت نشده باشد، درخواست شماره
    if (!user.phone) {
        ctx.session = { telegramId, step: 'awaiting_phone' };
        ctx.reply('⚠️ لطفاً شماره تلفن اکانت تلگرام خود را با دکمه زیر ارسال کنید:', {
            reply_markup: {
                keyboard: [[{ text: '📱 ارسال شماره تلفن', request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
        return;
    }
    // شماره تلفن وجود دارد، شروع فرآیند ثبت آگهی
    ctx.session = { telegramId, phone: user.phone, step: 'awaiting_description' };
    ctx.reply('✅ لطفاً متن آگهی را وارد کنید:');
};
exports.ProjectPaidHandler = ProjectPaidHandler;
const textHandler = async (ctx) => {
    const message = ctx.message?.text;
    if (!message || !ctx.session || !ctx.session.step || ctx.session.step !== 'awaiting_description') {
        ctx.reply('⚠️ لطفاً ابتدا دستور /paidproject را اجرا کنید.');
        return;
    }
    ctx.session.description = message;
    ctx.session.step = 'awaiting_deadline';
    ctx.reply('⏰ لطفاً زمان تحویل پروژه را وارد کنید (مثال: 1404/01/01):');
};
exports.textHandler = textHandler;
const deadlineHandler = async (ctx) => {
    const message = ctx.message?.text;
    if (!message || !ctx.session || !ctx.session.step || ctx.session.step !== 'awaiting_deadline') {
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
    if (!message || !ctx.session || !ctx.session.step || ctx.session.step !== 'awaiting_username') {
        ctx.reply('⚠️ لطفاً ابتدا زمان تحویل را وارد کنید.');
        return;
    }
    if (!message.startsWith('@')) {
        ctx.reply('⚠️ آیدی تلگرام باید با @ شروع شود (مثال: @Username).');
        return;
    }
    const { telegramId, description, deadline, phone } = ctx.session;
    if (!telegramId || !description || !deadline || !phone) {
        ctx.reply('⚠️ اطلاعات آگهی ناقص است. لطفاً دوباره با /paidproject شروع کنید.');
        return;
    }
    try {
        // ایجاد یک شناسه موقت برای پرداخت
        const paymentId = (0, uuid_1.v4)();
        ctx.session.paymentId = paymentId;
        // ثبت پروژه با استفاده از RegisterProject
        await container_1.registerProject.execute(telegramId, description, 'پرداخت', deadline, 'gateway', ctx.bot, // استفاده از ctx.bot به جای ctx.telegram
        message);
        // دریافت آخرین projectId
        const projectId = await container_1.registerProject.getLatestProjectId();
        if (!projectId) {
            throw new Error('خطا در ثبت پروژه.');
        }
        // ایجاد لینک پرداخت
        const paymentUrl = await generatePaymentUrl(projectId, paymentId, telegramId);
        ctx.reply(`لطفاً برای تکمیل پرداخت به لینک زیر مراجعه کنید:\n${paymentUrl}`, {
            reply_markup: {
                inline_keyboard: [[{ text: '💳 پرداخت', url: paymentUrl }]],
            },
        });
        ctx.session.projectId = projectId;
        ctx.session.step = 'awaiting_payment';
    }
    catch (error) {
        ctx.reply('⚠️ خطا: ' + error.message);
    }
};
exports.usernameHandler = usernameHandler;
// تابع برای ایجاد لینک پرداخت
async function generatePaymentUrl(projectId, paymentId, telegramId) {
    const paymentGatewayUrl = process.env.PAYMENT_GATEWAY_URL;
    const callbackUrl = `https://your-bot-domain.com/payment-callback?projectId=${projectId}&paymentId=${paymentId}&telegramId=${telegramId}`;
    const response = await axios_1.default.post(paymentGatewayUrl, {
        amount: 10000, // مبلغ به تومان (مثال)
        callback_url: callbackUrl,
        description: `پرداخت برای آگهی پروژه ${projectId}`,
        metadata: { projectId, paymentId, telegramId },
    });
    return response.data.payment_url; // فرض می‌کنیم درگاه یک URL برای پرداخت برمی‌گرداند
}
// هندلر برای مدیریت callback پرداخت
const paymentCallbackHandler = async (ctx) => {
    const query = ctx.message?.text; // فرض می‌کنیم callback از طریق پیام متنی دریافت می‌شود
    if (!query) {
        ctx.reply('⚠️ خطا در پردازش پرداخت.');
        return;
    }
    const params = new URLSearchParams(query);
    const projectId = Number(params.get('projectId'));
    const paymentId = params.get('paymentId');
    const telegramId = params.get('telegramId');
    const status = params.get('status'); // فرض می‌کنیم درگاه وضعیت را برمی‌گرداند
    if (!projectId || !paymentId || !telegramId || !ctx.session || ctx.session.paymentId !== paymentId) {
        ctx.reply('⚠️ خطا در پردازش پرداخت.');
        return;
    }
    try {
        const project = await container_1.registerProject.getProjectById(projectId);
        if (!project || project.telegramId !== telegramId) {
            ctx.reply('⚠️ پروژه یافت نشد یا متعلق به شما نیست.');
            return;
        }
        if (status === 'success') {
            // به‌روزرسانی وضعیت پرداخت
            await container_1.registerProject.updatePaymentStatus(projectId, 'completed');
            // انتشار آگهی در کانال
            await (0, postToChannel_1.postToChannel)(ctx.bot, {
                description: project.description,
                budget: project.budget,
                deadline: project.deadline,
                telegramId,
            });
            ctx.reply('✅ آگهی شما با موفقیت در کانال منتشر شد!\n' +
                '⚠️ توصیه: برای امنیت بیشتر، حتماً از پرداخت امن واسط ادمین (@AdminID) استفاده کنید.');
        }
        else {
            await container_1.registerProject.updatePaymentStatus(projectId, 'failed');
            ctx.reply('⚠️ پرداخت ناموفق بود. لطفاً دوباره امتحان کنید.');
        }
        ctx.session = {}; // پاک کردن session
    }
    catch (error) {
        ctx.reply('⚠️ خطا: ' + error.message);
    }
};
exports.paymentCallbackHandler = paymentCallbackHandler;
