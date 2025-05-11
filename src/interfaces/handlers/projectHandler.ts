import { CustomContext } from '../../types/telegraf';
import { projectRepo, registerProject, userRepo } from '../../shared/container';

export const projectHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);

    const user = await userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply('⚠️ شما هنوز ثبت‌نام نکرده‌اید. لطفاً با /start شروع کنید.');
        return;
    }

    if (!user.phone) {
        ctx.session = { telegramId, step: 'awaiting_phone', isPinned: false };
        ctx.reply('⚠️ لطفاً شماره تلفن اکانت تلگرام خود را با دکمه زیر ارسال کنید:', {
            reply_markup: {
                keyboard: [[{ text: '📱 ارسال شماره تلفن', request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
        return;
    }

    ctx.session = { telegramId, phone: user.phone, step: 'select_ad_type', isPinned: false };
    ctx.reply('لطفاً نوع آگهی را انتخاب کنید:' +
        '⚠️ توصیه: برای امنیت بیشتر، حتماً از پرداخت امن واسط ادمین (@projebazar_admin) استفاده کنید.', {
        reply_markup: {
            keyboard: [[{ text: '📝 آگهی رایگان (30 سکه)' }, { text: '💳 آگهی پولی' }]],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
};

export const deadlineHandler = async (ctx: CustomContext) => {
    const message = (ctx.message as any)?.text;
    console.log(`deadlineHandler - Message: ${message}, Session: ${JSON.stringify(ctx.session, null, 2)}`);

    if (!ctx.session.step || ctx.session.step !== 'awaiting_deadline') {
        ctx.reply('☺️ لطفاً ابتدا متن آگهی را وارد کنید.');
        return;
    }

    // ذخیره مهلت (اختیاری)
    ctx.session.deadline = message === 'فوری' ? 'فوری' : message || '';
    ctx.session.step = 'awaiting_username';
    ctx.reply('📩 لطفاً نام کاربری تلگرام خود را برای نمایش در آگهی وارد کنید (مثال: @Username):', {
        reply_markup: { remove_keyboard: true },
    });
};

export const textHandler = async (ctx: CustomContext) => {
    const message = (ctx.message as any)?.text;
    console.log(`textHandler - Message: ${message}, Session: ${JSON.stringify(ctx.session, null, 2)}`);

    if (!message || !ctx.session.step) {
        ctx.reply('⚠️ لطفاً ابتدا دستور /newproject را اجرا کنید.');
        return;
    }

    // تابع کمکی برای اعتبارسنجی Markdown
    const isValidMarkdown = (text: string): boolean => {
        const boldCount = (text.match(/\*/g) || []).length;
        const italicCount = (text.match(/\_/g) || []).length;
        return boldCount % 2 === 0 && italicCount % 2 === 0; // تعداد * و _ باید زوج باشد
    };

    try {
        if (ctx.session.step === 'select_ad_type') {
            // ... کد قبلی بدون تغییر ...
        } else if (ctx.session.step === 'awaiting_role') {
            // ... کد قبلی بدون تغییر ...
        } else if (ctx.session.step === 'awaiting_price_type') {
            // ... کد قبلی بدون تغییر ...
        } else if (ctx.session.step === 'awaiting_amount') {
            // ... کد قبلی بدون تغییر ...
        } else if (ctx.session.step === 'awaiting_pin_option') {
            // ... کد قبلی بدون تغییر ...
        } else if (ctx.session.step === 'awaiting_title') {
            ctx.session.title = message;
            ctx.session.step = 'awaiting_description';
            ctx.reply(
                '📄 لطفاً متن آگهی را وارد کنید. می‌توانید از Markdown استفاده کنید:\n' +
                '- *متن بولد* با ستاره\n' +
                '- _متن ایتالیک_ با آندرلاین\n' +
                '- [لینک](https://example.com) برای لینک\n' +
                'مثال: *پروژه حرفه‌ای* با _کیفیت بالا_\n' +
                '⚠️ اطمینان حاصل کنید که نشانه‌گذاری‌ها کامل باشند (مثلاً *متن* بدون فاصله اضافی).',
                { reply_markup: { remove_keyboard: true } }
            );
        } else if (ctx.session.step === 'awaiting_description') {
            if (!isValidMarkdown(message)) {
                ctx.reply(
                    '⚠️ نشانه‌گذاری Markdown ناقص است. لطفاً مطمئن شوید که تمام * و _ به‌درستی بسته شده‌اند (مثلاً *متن* یا _متن_). دوباره امتحان کنید:',
                    { reply_markup: { remove_keyboard: true } }
                );
                return;
            }
            ctx.session.description = message;
            ctx.session.step = 'awaiting_deadline';
            ctx.reply('⏰ لطفاً مهلت پروژه را وارد کنید (مثال: 1404/01/01)، یا گزینه‌های زیر را انتخاب کنید:', {
                reply_markup: {
                    keyboard: [[{ text: 'فوری' }, { text: 'زمان آزاد' }]],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            });
        }
    } catch (error: any) {
        console.error(`Error in textHandler: ${error.message}`);
        ctx.reply('⚠️ خطا: ' + error.message);
    }
};



export const usernameHandler = async (ctx: CustomContext) => {
    const message = (ctx.message as any)?.text;
    console.log(`usernameHandler - Message: ${message}, Session: ${JSON.stringify(ctx.session, null, 2)}`);

    if (!message || !ctx.session.step || ctx.session.step !== 'awaiting_username') {
        ctx.reply('☺️ لطفاً ابتدا زمان تحویل را وارد کنید یا /newproject را اجرا کنید.');
        return;
    }

    if (!message.startsWith('@')) {
        ctx.reply('☺️ آیدی تلگرام باید با @ شروع شود (مثال: @Username).');
        return;
    }

    const { telegramId, title, description, deadline, phone, adType, amount, isPinned, isAgreedPrice, role } = ctx.session;
    if (!telegramId || !title || !description || !phone || !role) {
        ctx.reply('☺️ اطلاعات آگهی ناقص است. لطفاً دوباره با /newproject شروع کنید.');
        return;
    }

    try {
        ctx.session.telegramUsername = message;
        console.log(`usernameHandler - Saving telegramUsername: ${message}`);

        const budget = adType === 'free' ? 'رایگان' : isAgreedPrice ? 'توافقی' : `${amount} تومان`;

        await registerProject.execute(
            telegramId,
            title,
            description,
            budget,
            deadline || '',
            'gateway',
            ctx.telegram,
            message,
            role, // role قبل از پارامترهای اختیاری
            adType,
            adType === 'paid' ? amount : undefined,
            isPinned || false
        );

        if (adType === 'free') {
            ctx.reply(
                '✅ آگهی شما با موفقیت در کانال منتشر شد!\n' +
                '☺️ توصیه: برای امنیت بیشتر، حتماً از پرداخت امن واسط ادمین (@projebazar_admin) استفاده کنید.',
                { reply_markup: { remove_keyboard: true } }
            );
            ctx.session = { isPinned: false };
        } else {
            const projectId = await projectRepo.getLatestProjectId();
            const paymentMessage = isAgreedPrice && !isPinned
                ? 'لطفاً برای انتشار آگهی توافقی، تأیید کنید:'
                : `لطفاً برای انتشار آگهی، مبلغ ${amount} تومان را پرداخت کنید:`;
            ctx.reply(paymentMessage, {
                reply_markup: {
                    inline_keyboard: [[{ text: '💳 پرداخت', callback_data: `pay_${projectId}` }]],
                },
            });
        }
    } catch (error: any) {
        console.error(`Error in usernameHandler: ${error.message}`);
        ctx.reply('☺️ خطا: ' + error.message);
    }
};