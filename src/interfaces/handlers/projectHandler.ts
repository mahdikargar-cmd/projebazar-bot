import { CustomContext } from '../../types/telegraf';
import {projectRepo, registerProject, userRepo} from '../../shared/container';

export const projectHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);

    const user = await userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply('⚠️ شما هنوز ثبت‌نام نکرده‌اید. لطفاً با /start شروع کنید.');
        return;
    }

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

    // انتخاب نوع آگهی
    ctx.session = { telegramId, phone: user.phone, step: 'select_ad_type' };
    ctx.reply('لطفاً نوع آگهی را انتخاب کنید:', {
        reply_markup: {
            keyboard: [[{ text: '📝 آگهی رایگان (30 سکه)' }, { text: '💳 آگهی پولی' }]],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
};

export const textHandler = async (ctx: CustomContext) => {
    const message = (ctx.message as any)?.text;
    console.log(`textHandler - Message: ${message}, Session: ${JSON.stringify(ctx.session, null, 2)}`);

    if (!message) {
        console.log('No text message provided');
        ctx.reply('⚠️ لطفاً یک پیام متنی معتبر وارد کنید.');
        return;
    }

    if (!ctx.session.step || !ctx.session.telegramId) {
        console.log('Missing session step or telegramId');
        ctx.reply('⚠️ لطفاً ابتدا دستور /newproject را اجرا کنید.');
        return;
    }

    try {
        if (ctx.session.step === 'select_ad_type') {
            if (message === '📝 آگهی رایگان (30 سکه)') {
                const user = await userRepo.getUserByTelegramId(ctx.session.telegramId);
                if (!user || user.coins < 30) {
                    console.log(`Insufficient coins: ${user?.coins || 0}`);
                    ctx.reply(
                        `⚠️ برای آگهی رایگان، حداقل 30 سکه نیاز دارید. سکه‌های فعلی شما: ${user?.coins || 0}`
                    );
                    return;
                }
                ctx.session.adType = 'free';
                ctx.session.step = 'awaiting_description';
                ctx.reply('✅ لطفاً متن آگهی را وارد کنید:', {
                    reply_markup: { remove_keyboard: true },
                });
            } else if (message === '💳 آگهی پولی') {
                ctx.session.adType = 'paid';
                ctx.session.step = 'awaiting_amount';
                ctx.reply('💵 لطفاً مبلغ آگهی (به تومان) را وارد کنید:', {
                    reply_markup: { remove_keyboard: true },
                });
            } else {
                console.log(`Invalid ad type: ${message}`);
                ctx.reply('⚠️ لطفاً یکی از گزینه‌های معتبر (آگهی رایگان یا پولی) را انتخاب کنید.');
            }
        } else if (ctx.session.step === 'awaiting_amount') {
            const amount = parseInt(message);
            if (isNaN(amount) || amount <= 0) {
                console.log(`Invalid amount: ${message}`);
                ctx.reply('⚠️ لطفاً یک مبلغ معتبر (بزرگ‌تر از صفر) وارد کنید.');
                return;
            }
            ctx.session.amount = amount;
            ctx.session.step = 'awaiting_description';
            ctx.reply('✅ لطفاً متن آگهی را وارد کنید:', {
                reply_markup: { remove_keyboard: true },
            });
        } else if (ctx.session.step === 'awaiting_description') {
            ctx.session.description = message;
            ctx.session.step = 'awaiting_deadline';
            console.log(`Description saved: ${message}, Moving to awaiting_deadline`);
            ctx.reply('⏰ لطفاً زمان تحویل پروژه را وارد کنید (مثال: 1404/01/01):', {
                reply_markup: { remove_keyboard: true },
            });
        } else {
            console.log(`Unexpected session step: ${ctx.session.step}`);
            ctx.reply('⚠️ مرحله نامعتبری شناسایی شد. لطفاً با /newproject شروع کنید.');
        }
    } catch (error: any) {
        console.error(`Error in textHandler: ${error.message}`);
        ctx.reply('⚠️ خطایی رخ داد. لطفاً دوباره امتحان کنید یا با پشتیبانی تماس بگیرید.');
    }
};


export const deadlineHandler = async (ctx: CustomContext) => {
    const message = (ctx.message as any)?.text;
    if (!message || !ctx.session.step || ctx.session.step !== 'awaiting_deadline') {
        ctx.reply('⚠️ لطفاً ابتدا متن آگهی را وارد کنید.');
        return;
    }

    ctx.session.deadline = message;
    ctx.session.step = 'awaiting_username';
    ctx.reply('📩 لطفاً آیدی تلگرام خود را برای نمایش در آگهی وارد کنید (مثال: @Username):');
};

export const usernameHandler = async (ctx: CustomContext) => {
    const message = (ctx.message as any)?.text;
    if (!message || !ctx.session.step || ctx.session.step !== 'awaiting_username') {
        ctx.reply('⚠️ لطفاً ابتدا زمان تحویل را وارد کنید.');
        return;
    }

    if (!message.startsWith('@')) {
        ctx.reply('⚠️ آیدی تلگرام باید با @ شروع شود (مثال: @Username).');
        return;
    }

    const { telegramId, description, deadline, phone, adType, amount } = ctx.session;
    if (!telegramId || !description || !deadline || !phone) {
        ctx.reply('⚠️ اطلاعات آگهی ناقص است. لطفاً دوباره با /newproject شروع کنید.');
        return;
    }

    try {
        // ثبت پروژه در دیتابیس
        await registerProject.execute(
            telegramId,
            description,
            adType === 'free' ? 'رایگان' : amount + ' تومان',
            deadline,
            'gateway',
            ctx.telegram,
            message,
            adType,
            adType === 'paid' ? amount : undefined
        );

        if (adType === 'free') {
            ctx.reply(
                '✅ آگهی شما با موفقیت در کانال منتشر شد!\n' +
                '⚠️ توصیه: برای امنیت بیشتر، حتماً از پرداخت امن واسط ادمین (@AdminID) استفاده کنید.'
            );
            ctx.session = {};
        } else {
            // برای آگهی پولی، دکمه پرداخت نمایش داده شود
            const projectId = await projectRepo.getLatestProjectId();
            ctx.reply('لطفاً برای انتشار آگهی، پرداخت را انجام دهید:', {
                reply_markup: {
                    inline_keyboard: [[{ text: '💳 پرداخت', callback_data: `pay_${projectId}` }]],
                },
            });
        }
    } catch (error: any) {
        ctx.reply('⚠️ خطا: ' + error.message);
    }
};