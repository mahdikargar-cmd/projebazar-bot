import { CustomContext } from '../../types/telegraf';
import { registerProject, userRepo } from '../../shared/container';
import { containsProhibitedWords } from '../../utils/filterText';
import { escapeMarkdownV2 } from '../../utils/markdown';

// تابع کمکی برای اعتبارسنجی متن
const isValidText = (text: string): boolean => {
    const validTextRegex = /^[\w\s\u0600-\u06FF*_\-\[\]\(\)https?:\/\/\.\w]+$/;
    return validTextRegex.test(text);
};

// تابع کمکی برای اعتبارسنجی Markdown
const isValidMarkdown = (text: string): boolean => {
    const boldCount = (text.match(/\*/g) || []).length;
    const italicCount = (text.match(/\_/g) || []).length;
    return boldCount % 2 === 0 && italicCount % 2 === 0;
};

// تابع کمکی برای شمارش کلمات
const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const projectHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);

    const user = await userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply(escapeMarkdownV2('⚠️ شما هنوز ثبت‌نام نکرده‌اید. لطفاً با /start شروع کنید!'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }

    if (!user.phone) {
        ctx.session = { telegramId, step: 'awaiting_phone', isPinned: false };
        ctx.reply(escapeMarkdownV2('📱 برای ثبت آگهی، لطفاً شماره تلفن اکانت تلگرام خود را با دکمه زیر ارسال کنید:'), {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                keyboard: [[{ text: '📲 ارسال شماره', request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
        return;
    }

    ctx.session = { telegramId, phone: user.phone, step: 'select_ad_type', isPinned: false };
    ctx.reply(
        escapeMarkdownV2(
            '✨ نوع آگهی خود را انتخاب کنید:\n' +
            '💸 آگهی رایگان با سکه یا آگهی پولی با امکانات ویژه!\n' +
            '⚠️ برای امنیت بیشتر، از پرداخت امن واسط ادمین (@projebazar_admin) استفاده کنید.'
        ),
        {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                keyboard: [[{ text: '📢 رایگان (30 سکه)' }, { text: '💰 پولی' }]],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        }
    );
};

export const deadlineHandler = async (ctx: CustomContext) => {
    const message = (ctx.message as any)?.text;
    console.log(`deadlineHandler - Message: ${message}, Session: ${JSON.stringify(ctx.session, null, 2)}`);

    if (!ctx.session.step || ctx.session.step !== 'awaiting_deadline') {
        ctx.reply(escapeMarkdownV2('☺️ لطفاً ابتدا متن آگهی را وارد کنید!'), {
            parse_mode: 'MarkdownV2',
            reply_markup: { remove_keyboard: true },
        });
        return;
    }

    ctx.session.deadline = message === '🚀 فوری' ? 'فوری' : message === '⏳ زمان آزاد' ? 'زمان آزاد' : message || '';
    ctx.session.step = 'awaiting_username';
    ctx.reply(escapeMarkdownV2('📩 لطفاً نام کاربری تلگرام خود را برای نمایش در آگهی وارد کنید (مثال: @Username):'), {
        parse_mode: 'MarkdownV2',
        reply_markup: { remove_keyboard: true },
    });
};

export const textHandler = async (ctx: CustomContext) => {
    const message = (ctx.message as any)?.text;
    console.log(`textHandler - Message: ${message}, Session: ${JSON.stringify(ctx.session, null, 2)}`);

    if (!message || !ctx.session.step) {
        ctx.reply(escapeMarkdownV2('⚠️ لطفاً ابتدا دستور /newproject را اجرا کنید!'), {
            parse_mode: 'MarkdownV2',
            reply_markup: { remove_keyboard: true },
        });
        return;
    }

    try {
        if (ctx.session.step === 'select_ad_type') {
            if (message === '📢 رایگان (30 سکه)') {
                const user = await userRepo.getUserByTelegramId(ctx.session.telegramId!);
                if (!user || user.coins < 30) {
                    ctx.reply(
                        escapeMarkdownV2(`😕 برای آگهی رایگان، حداقل 30 سکه نیاز دارید. سکه‌های فعلی شما: ${user?.coins || 0}`),
                        { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } }
                    );
                    return;
                }
                ctx.session.adType = 'free';
                ctx.session.step = 'awaiting_role';
                console.log(`Updated session to awaiting_role: ${JSON.stringify(ctx.session, null, 2)}`);
                await ctx.reply(escapeMarkdownV2('👤 لطفاً نقش خود را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔨 انجام‌دهنده' }, { text: '👩‍💼 درخواست‌کننده' }, { text: '💼 استخدام' }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
            } else if (message === '💰 پولی') {
                ctx.session.adType = 'paid';
                ctx.session.step = 'awaiting_role';
                console.log(`Updated session to awaiting_role: ${JSON.stringify(ctx.session, null, 2)}`);
                await ctx.reply(escapeMarkdownV2('👤 لطفاً نقش خود را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔨 انجام‌دهنده' }, { text: '👩‍💼 درخواست‌کننده' }, { text: '💼 استخدام' }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
            } else {
                ctx.reply(escapeMarkdownV2('☺️ لطفاً یکی از گزینه‌های معتبر را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '📢 رایگان (30 سکه)' }, { text: '💰 پولی' }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
            }
        } else if (ctx.session.step === 'awaiting_role') {
            if (message === '🔨 انجام‌دهنده') {
                ctx.session.role = 'performer';
            } else if (message === '👩‍💼 درخواست‌کننده') {
                ctx.session.role = 'client';
            } else if (message === '💼 استخدام') {
                ctx.session.role = 'hire';
            } else {
                ctx.reply(escapeMarkdownV2('☺️ لطفاً یکی از گزینه‌های معتبر را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔨 انجام‌دهنده' }, { text: '👩‍💼 درخواست‌کننده' }, { text: '💼 استخدام' }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
                return;
            }
            ctx.session.step = ctx.session.adType === 'free' ? 'awaiting_pin_option' : 'awaiting_price_type';
            console.log(`Updated session to ${ctx.session.step}: ${JSON.stringify(ctx.session, null, 2)}`);
            if (ctx.session.adType === 'free') {
                await ctx.reply(escapeMarkdownV2('📌 آیا تمایل دارید آگهی شما برای 12 ساعت پین شود؟ (هزینه اضافی: 50 سکه)'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '✅ بله، پین شود' }, { text: '❌ خیر، بدون پین' }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
            } else {
                await ctx.reply(escapeMarkdownV2('💸 نوع قیمت را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '💵 قیمت مشخص' }, { text: '🤝 توافقی' }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
            }
        } else if (ctx.session.step === 'awaiting_price_type') {
            if (message === '💵 قیمت مشخص') {
                ctx.session.isAgreedPrice = false;
                ctx.session.step = 'awaiting_amount';
                ctx.reply(escapeMarkdownV2('💵 لطفاً مبلغ آگهی (به تومان) را وارد کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: { remove_keyboard: true },
                });
            } else if (message === '🤝 توافقی') {
                ctx.session.isAgreedPrice = true;
                ctx.session.amount = 0;
                ctx.session.step = 'awaiting_pin_option';
                ctx.reply(escapeMarkdownV2('📌 آیا می‌خواهید آگهی شما برای 12 ساعت پین شود؟ (هزینه: 10,000 تومان)'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '✅ بله، پین شود' }, { text: '❌ خیر، بدون پین' }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
            } else {
                ctx.reply(escapeMarkdownV2('☺️ لطفاً یکی از گزینه‌های معتبر را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '💵 قیمت مشخص' }, { text: '🤝 توافقی' }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
            }
        } else if (ctx.session.step === 'awaiting_amount') {
            const amount = parseInt(message);
            if (isNaN(amount) || amount <= 0) {
                ctx.reply(escapeMarkdownV2('☺️ لطفاً یک مبلغ معتبر (بزرگ‌تر از صفر) وارد کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: { remove_keyboard: true },
                });
                return;
            }
            ctx.session.amount = amount;
            ctx.session.step = 'awaiting_pin_option';
            ctx.reply(escapeMarkdownV2('📌 آیا می‌خواهید آگهی شما برای 12 ساعت پین شود؟ (هزینه: 10,000 تومان)'), {
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    keyboard: [[{ text: '✅ بله، پین شود' }, { text: '❌ خیر، بدون پین' }]],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            });
        } else if (ctx.session.step === 'awaiting_pin_option') {
            if (message === '✅ بله، پین شود') {
                if (ctx.session.adType === 'free') {
                    const user = await userRepo.getUserByTelegramId(ctx.session.telegramId!);
                    if (!user || user.coins < 80) {
                        ctx.reply(
                            escapeMarkdownV2(`😕 برای آگهی با پین، حداقل 80 سکه نیاز دارید. سکه‌های فعلی شما: ${user?.coins || 0}`),
                            { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } }
                        );
                        return;
                    }
                    ctx.session.isPinned = true;
                } else {
                    ctx.session.isPinned = true;
                    ctx.session.amount = (ctx.session.amount || 0) + 10000;
                }
            } else if (message === '❌ خیر، بدون پین') {
                ctx.session.isPinned = false;
            } else {
                ctx.reply(escapeMarkdownV2('☺️ لطفاً یکی از گزینه‌های معتبر را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '✅ بله، پین شود' }, { text: '❌ خیر، بدون پین' }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
                return;
            }
            ctx.session.step = 'awaiting_title';
            ctx.reply(escapeMarkdownV2('📝 لطفاً عنوان آگهی را وارد کنید:'), {
                parse_mode: 'MarkdownV2',
                reply_markup: { remove_keyboard: true },
            });
        } else if (ctx.session.step === 'awaiting_title') {
            if (!isValidText(message)) {
                ctx.reply(
                    escapeMarkdownV2('⚠️ عنوان فقط می‌تواند شامل حروف، اعداد، فاصله و نشانه‌گذاری‌های مجاز (*, _, -, [], ()) باشد. دوباره امتحان کنید:'),
                    { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } }
                );
                return;
            }
            if (containsProhibitedWords(message)) {
                ctx.reply(
                    escapeMarkdownV2('⚠️ عنوان حاوی کلمات نامناسب است. لطفاً از کلمات مناسب استفاده کنید:'),
                    { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } }
                );
                return;
            }
            ctx.session.title = message;
            ctx.session.step = 'awaiting_description';
            await ctx.reply(
                escapeMarkdownV2(
                    '📄 لطفاً متن آگهی را وارد کنید (حداکثر 5000 کلمه). می‌توانید از Markdown استفاده کنید:\n' +
                    '- *متن بولد* با ستاره\n' +
                    '- _متن ایتالیک_ با آندرلاین\n' +
                    '- [لینک](https://example.com) برای لینک\n' +
                    '⚠️ اطمینان حاصل کنید که نشانه‌گذاری‌ها کامل باشند (مثلاً *متن* بدون فاصله اضافی).'
                ),
                { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } }
            );
        } else if (ctx.session.step === 'awaiting_description') {
            if (!isValidText(message)) {
                ctx.reply(
                    escapeMarkdownV2(
                        '⚠️ متن آگهی فقط می‌تواند شامل حروف، اعداد، فاصله و نشانه‌گذاری‌های مجاز (*, _, -, [], ()) باشد. دوباره امتحان کنید:'
                    ),
                    { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } }
                );
                return;
            }
            if (!isValidMarkdown(message)) {
                ctx.reply(
                    escapeMarkdownV2('⚠️ نشانه‌گذاری Markdown ناقص است (مثلاً * یا _ بدون جفت). لطفاً متن را اصلاح کنید:'),
                    { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } }
                );
                return;
            }
            if (containsProhibitedWords(message)) {
                ctx.reply(
                    escapeMarkdownV2('⚠️ متن آگهی حاوی کلمات نامناسب است. لطفاً از کلمات مناسب استفاده کنید:'),
                    { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } }
                );
                return;
            }
            const wordCount = countWords(message);
            if (wordCount > 5000) {
                ctx.reply(
                    escapeMarkdownV2(`⚠️ متن آگهی نمی‌تواند بیش از 5000 کلمه باشد. تعداد کلمات فعلی: ${wordCount}. لطفاً متن را کوتاه‌تر کنید:`),
                    { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } }
                );
                return;
            }
            ctx.session.description = message;
            ctx.session.step = 'awaiting_deadline';
            await ctx.reply(escapeMarkdownV2('⏰ لطفاً مهلت پروژه را وارد کنید (مثال: 1404/01/01)، یا گزینه‌های زیر را انتخاب کنید:'), {
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    keyboard: [[{ text: '🚀 فوری' }, { text: '⏳ زمان آزاد' }]],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            });
        } else {
            ctx.reply(escapeMarkdownV2('☺️ لطفاً دستور مناسب را اجرا کنید یا گزینه‌ای معتبر انتخاب کنید!'), {
                parse_mode: 'MarkdownV2',
                reply_markup: { remove_keyboard: true },
            });
        }
    } catch (error: any) {
        console.error(`Error in textHandler: ${error.message}`);
        ctx.reply(escapeMarkdownV2('⚠️ خطا رخ داد. لطفاً دوباره امتحان کنید!'), {
            parse_mode: 'MarkdownV2',
            reply_markup: { remove_keyboard: true },
        });
    }
};

export const usernameHandler = async (ctx: CustomContext) => {
    const message = (ctx.message as any)?.text;
    if (!message || ctx.session.step !== 'awaiting_username') {
        return ctx.reply(escapeMarkdownV2('☺️ ابتدا زمان تحویل یا /newproject را وارد کنید!'), { parse_mode: 'MarkdownV2' });
    }

    if (!/^@[A-Za-z0-9_]+$/.test(message)) {
        return ctx.reply(escapeMarkdownV2('☺️ آیدی با @ شروع شود و فقط حروف، اعداد و _ باشد (مثال: @Username).'), {
            parse_mode: 'MarkdownV2',
        });
    }

    const { telegramId, title, description, deadline, phone, adType, amount, isPinned, isAgreedPrice, role } = ctx.session;
    if (!telegramId || !title || !description || !phone || !role) {
        return ctx.reply(escapeMarkdownV2('☺️ اطلاعات ناقص است. با /newproject شروع کنید!'), { parse_mode: 'MarkdownV2' });
    }

    try {
        ctx.session.telegramUsername = message;
        const budget = adType === 'free' ? 'رایگان' : isAgreedPrice ? 'توافقی' : `${amount} تومان`;

        // ثبت پروژه
        const projectId = await registerProject.execute(
            telegramId,
            title,
            description,
            budget,
            deadline || '',
            'gateway', // مقدار پیش‌فرض برای paymentMethod
            ctx.telegram,
            message,
            role,
            adType,
            adType === 'paid' ? amount : undefined,
            isPinned || false
        );

        if (adType === 'free') {
            ctx.reply(
                escapeMarkdownV2('✅ آگهی منتشر شد!\n☺️ از پرداخت امن (@projebazar_admin) استفاده کنید!'),
                { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } }
            );
            ctx.session = { isPinned: false };
        } else {
            const paymentMessage = isAgreedPrice && !isPinned ? 'تأیید آگهی توافقی:' : `پرداخت ${amount} تومان برای انتشار:`;
            ctx.reply(escapeMarkdownV2(paymentMessage), {
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    inline_keyboard: [[{ text: '💳 نشر پست', callback_data: `pay_${projectId}` }]],
                },
            });
        }
    } catch (error: any) {
        console.error(`Error in usernameHandler: ${error.message}`);
        ctx.reply(escapeMarkdownV2(`☺️ خطا: ${error.message}`), { parse_mode: 'MarkdownV2' });
    }
};