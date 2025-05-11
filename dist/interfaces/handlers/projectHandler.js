"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usernameHandler = exports.textHandler = exports.deadlineHandler = exports.projectHandler = void 0;
const container_1 = require("../../shared/container");
const projectHandler = async (ctx) => {
    const telegramId = String(ctx.from?.id);
    const user = await container_1.userRepo.getUserByTelegramId(telegramId);
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
    ctx.reply('لطفاً نوع آگهی را انتخاب کنید:', {
        reply_markup: {
            keyboard: [[{ text: '📝 آگهی رایگان (30 سکه)' }, { text: '💳 آگهی پولی' }]],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
};
exports.projectHandler = projectHandler;
const deadlineHandler = async (ctx) => {
    const message = ctx.message?.text;
    console.log(`deadlineHandler - Message: ${message}, Session: ${JSON.stringify(ctx.session, null, 2)}`);
    if (!ctx.session.step || ctx.session.step !== 'awaiting_deadline') {
        ctx.reply('⚠️ لطفاً ابتدا متن آگهی را وارد کنید.');
        return;
    }
    // ذخیره مهلت (اختیاری)
    ctx.session.deadline = message === 'فوری' ? 'فوری' : message || '';
    ctx.session.step = 'awaiting_username';
    ctx.reply('📩 لطفاً آیدی تلگرام خود را برای نمایش در آگهی وارد کنید (مثال: @Username):', {
        reply_markup: { remove_keyboard: true },
    });
};
exports.deadlineHandler = deadlineHandler;
const textHandler = async (ctx) => {
    const message = ctx.message?.text;
    console.log(`textHandler - Message: ${message}, Session: ${JSON.stringify(ctx.session, null, 2)}`);
    if (!message || !ctx.session.step) {
        ctx.reply('⚠️ لطفاً ابتدا دستور /newproject را اجرا کنید.');
        return;
    }
    try {
        if (ctx.session.step === 'select_ad_type') {
            if (message === '📝 آگهی رایگان (30 سکه)') {
                const user = await container_1.userRepo.getUserByTelegramId(ctx.session.telegramId);
                if (!user || user.coins < 30) {
                    ctx.reply(`⚠️ برای آگهی رایگان، حداقل 30 سکه نیاز دارید. سکه‌های فعلی شما: ${user?.coins || 0}`);
                    return;
                }
                ctx.session.adType = 'free';
                ctx.session.step = 'awaiting_pin_option';
                ctx.reply('📌 آیا می‌خواهید آگهی شما برای 12 ساعت پین شود؟ (هزینه اضافی: 50 سکه)', {
                    reply_markup: {
                        keyboard: [[{ text: 'بله، پین شود' }, { text: 'خیر، بدون پین' }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
            }
            else if (message === '💳 آگهی پولی') {
                ctx.session.adType = 'paid';
                ctx.session.step = 'awaiting_price_type';
                ctx.reply('لطفاً نوع قیمت را انتخاب کنید:', {
                    reply_markup: {
                        keyboard: [[{ text: '💵 قیمت مشخص' }, { text: '🤝 توافقی' }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
            }
            else {
                ctx.reply('⚠️ لطفاً یکی از گزینه‌های معتبر را انتخاب کنید.');
            }
        }
        else if (ctx.session.step === 'awaiting_price_type') {
            if (message === '💵 قیمت مشخص') {
                ctx.session.isAgreedPrice = false;
                ctx.session.step = 'awaiting_amount';
                ctx.reply('💵 لطفاً مبلغ آگهی (به تومان) را وارد کنید:', {
                    reply_markup: { remove_keyboard: true },
                });
            }
            else if (message === '🤝 توافقی') {
                ctx.session.isAgreedPrice = true;
                ctx.session.amount = 0; // مبلغ صفر برای توافقی
                ctx.session.step = 'awaiting_pin_option';
                ctx.reply('📌 آیا می‌خواهید آگهی شما برای 12 ساعت پین شود؟ (هزینه: 10,000 تومان)', {
                    reply_markup: {
                        keyboard: [[{ text: 'بله، پین شود' }, { text: 'خیر، بدون پین' }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
            }
            else {
                ctx.reply('⚠️ لطفاً یکی از گزینه‌های معتبر را انتخاب کنید.');
            }
        }
        else if (ctx.session.step === 'awaiting_amount') {
            const amount = parseInt(message);
            if (isNaN(amount) || amount <= 0) {
                ctx.reply('⚠️ لطفاً یک مبلغ معتبر وارد کنید.');
                return;
            }
            ctx.session.amount = amount;
            ctx.session.step = 'awaiting_pin_option';
            ctx.reply('📌 آیا می‌خواهید آگهی شما برای 12 ساعت پین شود؟ (هزینه اضافی: 10,000 تومان)', {
                reply_markup: {
                    keyboard: [[{ text: 'بله، پین شود' }, { text: 'خیر، بدون پین' }]],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            });
        }
        else if (ctx.session.step === 'awaiting_pin_option') {
            if (message === 'بله، پین شود') {
                if (ctx.session.adType === 'free') {
                    const user = await container_1.userRepo.getUserByTelegramId(ctx.session.telegramId);
                    if (!user || user.coins < 80) {
                        ctx.reply(`⚠️ برای آگهی با پین، حداقل 80 سکه نیاز دارید. سکه‌های فعلی شما: ${user?.coins || 0}`);
                        return;
                    }
                    ctx.session.isPinned = true;
                }
                else {
                    ctx.session.isPinned = true;
                    ctx.session.amount = (ctx.session.amount || 0) + 10000; // اضافه کردن 10,000 تومان برای پین
                }
            }
            else {
                ctx.session.isPinned = false;
            }
            ctx.session.step = 'awaiting_title';
            ctx.reply('📝 لطفاً عنوان آگهی را وارد کنید:', {
                reply_markup: { remove_keyboard: true },
            });
        }
        else if (ctx.session.step === 'awaiting_title') {
            ctx.session.title = message;
            ctx.session.step = 'awaiting_description';
            ctx.reply('📄 لطفاً متن آگهی را وارد کنید. می‌توانید از Markdown استفاده کنید:\n' +
                '- *متن بولد* با ستاره\n' +
                '- _متن ایتالیک_ با آندرلاین\n' +
                '- [لینک](https://example.com) برای لینک\n' +
                'مثال: *پروژه حرفه‌ای* با _کیفیت بالا_', { reply_markup: { remove_keyboard: true } });
        }
        else if (ctx.session.step === 'awaiting_description') {
            ctx.session.description = message;
            ctx.session.step = 'awaiting_deadline';
            ctx.reply('⏰ لطفاً مهلت پروژه را وارد کنید (مثال: 1404/01/01)، یا گزینه‌های زیر را انتخاب کنید:', {
                reply_markup: {
                    keyboard: [[{ text: 'فوری' }, { text: 'بدون مهلت' }]],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            });
        }
    }
    catch (error) {
        console.error(`Error in textHandler: ${error.message}`);
        ctx.reply('⚠️ خطا: ' + error.message);
    }
};
exports.textHandler = textHandler;
const usernameHandler = async (ctx) => {
    const message = ctx.message?.text;
    console.log(`usernameHandler - Message: ${message}, Session: ${JSON.stringify(ctx.session, null, 2)}`);
    if (!message || !ctx.session.step || ctx.session.step !== 'awaiting_username') {
        ctx.reply('⚠️ لطفاً ابتدا زمان تحویل را وارد کنید یا /newproject را اجرا کنید.');
        return;
    }
    if (!message.startsWith('@')) {
        ctx.reply('⚠️ آیدی تلگرام باید با @ شروع شود (مثال: @Username).');
        return;
    }
    const { telegramId, title, description, deadline, phone, adType, amount, isPinned, isAgreedPrice } = ctx.session;
    if (!telegramId || !title || !description || !phone) {
        ctx.reply('⚠️ اطلاعات آگهی ناقص است. لطفاً دوباره با /newproject شروع کنید.');
        return;
    }
    try {
        // ذخیره آیدی در session
        ctx.session.telegramUsername = message;
        // لاگ‌گذاری برای دیباگ
        console.log(`usernameHandler - Saving telegramUsername: ${message}`);
        // تنظیم بودجه بر اساس نوع قیمت
        const budget = adType === 'free' ? 'رایگان' : isAgreedPrice ? 'توافقی' : `${amount} تومان`;
        // ثبت پروژه در دیتابیس
        await container_1.registerProject.execute(telegramId, title, // استفاده از عنوان
        description, budget, deadline || '', 'gateway', ctx.telegram, message, adType, adType === 'paid' ? amount : undefined, isPinned || false);
        if (adType === 'free') {
            ctx.reply('✅ آگهی شما با موفقیت در کانال منتشر شد!\n' +
                '⚠️ توصیه: برای امنیت بیشتر، حتماً از پرداخت امن واسط ادمین (@AdminID) استفاده کنید.', { reply_markup: { remove_keyboard: true } });
            ctx.session = { isPinned: false };
        }
        else {
            const projectId = await container_1.projectRepo.getLatestProjectId();
            const paymentMessage = isAgreedPrice && !isPinned
                ? 'لطفاً برای انتشار آگهی توافقی، تأیید کنید:'
                : `لطفاً برای انتشار آگهی، مبلغ ${amount} تومان را پرداخت کنید:`;
            ctx.reply(paymentMessage, {
                reply_markup: {
                    inline_keyboard: [[{ text: '💳 پرداخت', callback_data: `pay_${projectId}` }]],
                },
            });
        }
    }
    catch (error) {
        console.error(`Error in usernameHandler: ${error.message}`);
        ctx.reply('⚠️ خطا: ' + error.message);
    }
};
exports.usernameHandler = usernameHandler;
