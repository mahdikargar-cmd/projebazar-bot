import { CustomContext } from '../../types/telegraf';
import { registerProject, userRepo } from '../../shared/container';
import { postToChannel } from '../../interfaces/postToChannel';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export const ProjectPaidHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);

    // بررسی وجود کاربر
    const user = await userRepo.getUserByTelegramId(telegramId);
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

export const textHandler = async (ctx: CustomContext) => {
    const message = (ctx.message as any)?.text;
    if (!message || !ctx.session || !ctx.session.step || ctx.session.step !== 'awaiting_description') {
        ctx.reply('⚠️ لطفاً ابتدا دستور /paidproject را اجرا کنید.');
        return;
    }

    ctx.session.description = message;
    ctx.session.step = 'awaiting_deadline';
    ctx.reply('⏰ لطفاً زمان تحویل پروژه را وارد کنید (مثال: 1404/01/01):');
};

export const deadlineHandler = async (ctx: CustomContext) => {
    const message = (ctx.message as any)?.text;
    if (!message || !ctx.session || !ctx.session.step || ctx.session.step !== 'awaiting_deadline') {
        ctx.reply('⚠️ لطفاً ابتدا متن آگهی را وارد کنید.');
        return;
    }

    ctx.session.deadline = message;
    ctx.session.step = 'awaiting_username';
    ctx.reply('📩 لطفاً آیدی تلگرام خود را برای نمایش در آگهی وارد کنید (مثال: @Username):');
};

export const usernameHandler = async (ctx: CustomContext) => {
    const message = (ctx.message as any)?.text;
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
        const paymentId = uuidv4();
        ctx.session.paymentId = paymentId;

        // ثبت پروژه با استفاده از RegisterProject
        await registerProject.execute(
            telegramId,
            description,
            'پرداخت',
            deadline,
            'gateway',
            ctx.bot, // استفاده از ctx.bot به جای ctx.telegram
            message
        );

        // دریافت آخرین projectId
        const projectId = await registerProject.getLatestProjectId();
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
    } catch (error: any) {
        ctx.reply('⚠️ خطا: ' + error.message);
    }
};

// تابع برای ایجاد لینک پرداخت
async function generatePaymentUrl(projectId: number, paymentId: string, telegramId: string): Promise<string> {
    const paymentGatewayUrl = process.env.PAYMENT_GATEWAY_URL!;
    const callbackUrl = `https://your-bot-domain.com/payment-callback?projectId=${projectId}&paymentId=${paymentId}&telegramId=${telegramId}`;

    const response = await axios.post(paymentGatewayUrl, {
        amount: 10000, // مبلغ به تومان (مثال)
        callback_url: callbackUrl,
        description: `پرداخت برای آگهی پروژه ${projectId}`,
        metadata: { projectId, paymentId, telegramId },
    });

    return response.data.payment_url; // فرض می‌کنیم درگاه یک URL برای پرداخت برمی‌گرداند
}

// هندلر برای مدیریت callback پرداخت
export const paymentCallbackHandler = async (ctx: CustomContext) => {
    const query = (ctx.message as any)?.text; // فرض می‌کنیم callback از طریق پیام متنی دریافت می‌شود
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
        const project = await registerProject.getProjectById(projectId);
        if (!project || project.telegramId !== telegramId) {
            ctx.reply('⚠️ پروژه یافت نشد یا متعلق به شما نیست.');
            return;
        }

        if (status === 'success') {
            // به‌روزرسانی وضعیت پرداخت
            await registerProject.updatePaymentStatus(projectId, 'completed');

            // انتشار آگهی در کانال
            await postToChannel(ctx.bot, {
                description: project.description,
                budget: project.budget,
                deadline: project.deadline,
                telegramId,
            });

            ctx.reply(
                '✅ آگهی شما با موفقیت در کانال منتشر شد!\n' +
                '⚠️ توصیه: برای امنیت بیشتر، حتماً از پرداخت امن واسط ادمین (@AdminID) استفاده کنید.'
            );
        } else {
            await registerProject.updatePaymentStatus(projectId, 'failed');
            ctx.reply('⚠️ پرداخت ناموفق بود. لطفاً دوباره امتحان کنید.');
        }

        ctx.session = {}; // پاک کردن session
    } catch (error: any) {
        ctx.reply('⚠️ خطا: ' + error.message);
    }
};