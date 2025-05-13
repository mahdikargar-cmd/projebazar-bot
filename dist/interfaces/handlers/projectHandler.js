"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usernameHandler = exports.textHandler = exports.deadlineHandler = exports.projectHandler = void 0;
const container_1 = require("../../shared/container");
const filterText_1 = require("../../utils/filterText");
const markdown_1 = require("../../utils/markdown");
// تابع کمکی برای اعتبارسنجی Markdown
const isValidMarkdown = (text) => {
    const boldCount = (text.match(/\*/g) || []).length;
    const italicCount = (text.match(/\_/g) || []).length;
    return boldCount % 2 === 0 && italicCount % 2 === 0;
};
// تابع کمکی برای شمارش کلمات
const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};
// تابع بررسی عضویت در کانال
const checkChannelMembership = async (telegram, userId, channelId) => {
    try {
        const chatMember = await telegram.getChatMember(channelId, userId);
        console.log(`Channel membership check for user ${userId}: ${JSON.stringify(chatMember, null, 2)}`);
        return ['member', 'administrator', 'creator'].includes(chatMember.status);
    }
    catch (error) {
        console.error(`Error checking channel membership for user ${userId}: ${error.message}`);
        return false;
    }
};
const projectHandler = async (ctx) => {
    try {
        const telegramId = String(ctx.from?.id);
        console.log(`projectHandler - telegramId: ${telegramId}`);
        const channelId = '@projehbazar';
        console.log(`Checking channel membership for ${telegramId} in ${channelId}`);
        const isMember = await checkChannelMembership(ctx.telegram, telegramId, channelId);
        if (!isMember) {
            console.log(`User ${telegramId} is not a member of ${channelId}`);
            await ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ برای ثبت آگهی، ابتدا باید در کانال @projehbazar عضو شوید!\n' +
                '📢 لطفاً عضو کانال شوید و دوباره امتحان کنید.'), {
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    inline_keyboard: [[{ text: '📢 عضویت در کانال', url: 'https://t.me/projehbazar' }]],
                },
            });
            return;
        }
        console.log(`Fetching user for telegramId: ${telegramId}`);
        const user = await container_1.userRepo.getUserByTelegramId(telegramId);
        console.log(`User fetch result: ${user ? JSON.stringify(user, null, 2) : 'null'}`);
        if (!user) {
            console.log(`User ${telegramId} not found`);
            ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ شما هنوز ثبت‌نام نکرده‌اید. لطفاً با /start شروع کنید!'), {
                parse_mode: 'MarkdownV2',
            });
            return;
        }
        if (!user.phone) {
            console.log(`User ${telegramId} has no phone number`);
            ctx.session = { telegramId, step: 'awaiting_phone', isPinned: false };
            ctx.reply((0, markdown_1.escapeMarkdownV2)('📱 برای ثبت آگهی، لطفاً شماره تلفن اکانت تلگرام خود را با دکمه زیر ارسال کنید:'), {
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    keyboard: [[{ text: '📲 ارسال شماره', request_contact: true }, { text: '🔙 بازگشت' }]],
                    resize_keyboard: true,
                    one_time_keyboard: false,
                },
            });
            return;
        }
        console.log(`User ${telegramId} is registered with phone, proceeding to ad type selection`);
        ctx.session = { telegramId, phone: user.phone, step: 'select_ad_type', isPinned: false };
        ctx.reply((0, markdown_1.escapeMarkdownV2)('✨ نوع آگهی خود را انتخاب کنید:\n' +
            '💸 آگهی رایگان با سکه یا آگهی پولی با امکانات ویژه!\n' +
            '☺️ برای امنیت بیشتر، از پرداخت امن واسط ادمین (@projebazar_admin) استفاده کنید.'), {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                keyboard: [[{ text: '📢 رایگان (30 سکه)' }, { text: '💰 پولی' }], [{ text: '🔙 بازگشت' }]],
                resize_keyboard: true,
                one_time_keyboard: false,
            },
        });
        console.log(`Sent ad type selection keyboard to user ${telegramId}`);
    }
    catch (error) {
        console.error(`Error in projectHandler for telegramId ${ctx.from?.id}: ${error.message}`);
        ctx.reply((0, markdown_1.escapeMarkdownV2)('⚠️ خطایی رخ داد. لطفاً دوباره امتحان کنید یا با پشتیبانی تماس بگیرید.'), {
            parse_mode: 'MarkdownV2',
        });
    }
};
exports.projectHandler = projectHandler;
const deadlineHandler = async (ctx) => {
    const message = ctx.message?.text;
    console.log(`deadlineHandler - Message: ${message}, Session: ${JSON.stringify(ctx.session, null, 2)}`);
    if (!ctx.session.step || ctx.session.step !== 'awaiting_deadline') {
        ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ لطفاً ابتدا متن آگهی را وارد کنید!'), {
            parse_mode: 'MarkdownV2',
            reply_markup: { remove_keyboard: true },
        });
        return;
    }
    if (message === '🔙 بازگشت') {
        ctx.session.step = 'awaiting_description';
        ctx.reply((0, markdown_1.escapeMarkdownV2)('📄 لطفاً متن آگهی را وارد کنید (حداکثر 5000 کلمه). می‌توانید از Markdown استفاده کنید:\n' +
            '- *متن بولد* با ستاره\n' +
            '- _متن ایتالیک_ با آندرلاین\n' +
            '- [لینک](https://example.com) برای لینک\n' +
            '⚠️ اطمینان حاصل کنید که نشانه‌گذاری‌ها کامل باشند (مثلاً *متن* بدون فاصله اضافی).'), { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } });
        return;
    }
    ctx.session.deadline = message === '🚀 فوری' ? 'فوری' : message === '⏳ زمان آزاد' ? 'زمان آزاد' : message || '';
    ctx.session.step = 'awaiting_username';
    ctx.reply((0, markdown_1.escapeMarkdownV2)('📩 لطفاً نام کاربری تلگرام خود را برای نمایش در آگهی وارد کنید (مثال: @Username):'), {
        parse_mode: 'MarkdownV2',
        reply_markup: {
            keyboard: [[{ text: '🔙 بازگشت' }]],
            resize_keyboard: true,
            one_time_keyboard: false,
        },
    });
};
exports.deadlineHandler = deadlineHandler;
const textHandler = async (ctx) => {
    const message = ctx.message?.text;
    console.log(`textHandler - Message: ${message}, Session: ${JSON.stringify(ctx.session, null, 2)}`);
    if (!message || !ctx.session.step) {
        ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ لطفاً ابتدا دستور /newproject را اجرا کنید!'), {
            parse_mode: 'MarkdownV2',
            reply_markup: { remove_keyboard: true },
        });
        return;
    }
    try {
        if (message === '🔙 بازگشت') {
            if (ctx.session.step === 'select_ad_type') {
                ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ به منوی اصلی بازگشتید!'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [
                            [{ text: '💎 سکه‌های من' }, { text: '📝 ثبت آگهی رایگان' }],
                            [{ text: '📨 دعوت دوستان' }, { text: '📊 مدیریت آگهی' }],
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                ctx.session = { isPinned: false };
                return;
            }
            else if (ctx.session.step === 'awaiting_role') {
                ctx.session.step = 'select_ad_type';
                ctx.reply((0, markdown_1.escapeMarkdownV2)('✨ نوع آگهی خود را انتخاب کنید:\n' +
                    '💸 آگهی رایگان با سکه یا آگهی پولی با امکانات ویژه!\n' +
                    '☺️ برای امنیت بیشتر، از پرداخت امن واسط ادمین (@projebazar_admin) استفاده کنید.'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '📢 رایگان (30 سکه)' }, { text: '💰 پولی' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
            else if (ctx.session.step === 'awaiting_price_type') {
                ctx.session.step = 'awaiting_role';
                ctx.reply((0, markdown_1.escapeMarkdownV2)('👤 لطفاً نقش خود را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔨 انجام‌دهنده' }, { text: '👩‍💼 درخواست‌کننده' }, { text: '💼 استخدام' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
            else if (ctx.session.step === 'awaiting_amount') {
                ctx.session.step = 'awaiting_price_type';
                ctx.reply((0, markdown_1.escapeMarkdownV2)('💸 نوع قیمت را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '💵 قیمت مشخص' }, { text: '🤝 توافقی' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
            else if (ctx.session.step === 'awaiting_pin_option') {
                ctx.session.step = ctx.session.adType === 'free' ? 'awaiting_role' : 'awaiting_price_type';
                if (ctx.session.adType === 'free') {
                    ctx.reply((0, markdown_1.escapeMarkdownV2)('👤 لطفاً نقش خود را انتخاب کنید:'), {
                        parse_mode: 'MarkdownV2',
                        reply_markup: {
                            keyboard: [[{ text: '🔨 انجام‌دهنده' }, { text: '👩‍💼 درخواست‌کننده' }, { text: '💼 استخدام' }], [{ text: '🔙 بازگشت' }]],
                            resize_keyboard: true,
                            one_time_keyboard: false,
                        },
                    });
                }
                else {
                    ctx.reply((0, markdown_1.escapeMarkdownV2)('💸 نوع قیمت را انتخاب کنید:'), {
                        parse_mode: 'MarkdownV2',
                        reply_markup: {
                            keyboard: [[{ text: '💵 قیمت مشخص' }, { text: '🤝 توافقی' }], [{ text: '🔙 بازگشت' }]],
                            resize_keyboard: true,
                            one_time_keyboard: false,
                        },
                    });
                }
                return;
            }
            else if (ctx.session.step === 'awaiting_title') {
                ctx.session.step = 'awaiting_pin_option';
                ctx.reply((0, markdown_1.escapeMarkdownV2)('📌 آیا تمایل دارید آگهی شما برای 12 ساعت پین شود؟ (هزینه اضافی: 30 سکه)'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '✅ بله، پین شود' }, { text: '❌ خیر، بدون پین' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
            else if (ctx.session.step === 'awaiting_description') {
                ctx.session.step = 'awaiting_title';
                ctx.reply((0, markdown_1.escapeMarkdownV2)('📝 لطفاً عنوان آگهی را وارد کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
            else if (ctx.session.step === 'awaiting_username') {
                ctx.session.step = 'awaiting_deadline';
                ctx.reply((0, markdown_1.escapeMarkdownV2)('⏰ لطفاً مهلت پروژه را وارد کنید (مثال: 1404/01/01)، یا گزینه‌های زیر را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🚀 فوری' }, { text: '⏳ زمان آزاد' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
        }
        if (ctx.session.step === 'select_ad_type') {
            if (message === '📢 رایگان (30 سکه)') {
                const user = await container_1.userRepo.getUserByTelegramId(ctx.session.telegramId);
                if (!user || user.coins < 30) {
                    ctx.reply((0, markdown_1.escapeMarkdownV2)(`😕 برای آگهی رایگان، حداقل 30 سکه نیاز دارید. سکه‌های فعلی شما: ${user?.coins || 0}`), { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } });
                    return;
                }
                ctx.session.adType = 'free';
                ctx.session.step = 'awaiting_role';
                console.log(`Updated session to awaiting_role: ${JSON.stringify(ctx.session, null, 2)}`);
                await ctx.reply((0, markdown_1.escapeMarkdownV2)('👤 لطفاً نقش خود را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔨 انجام‌دهنده' }, { text: '👩‍💼 درخواست‌کننده' }, { text: '💼 استخدام' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
            }
            else if (message === '💰 پولی') {
                ctx.session.adType = 'paid';
                ctx.session.step = 'awaiting_role';
                console.log(`Updated session to awaiting_role: ${JSON.stringify(ctx.session, null, 2)}`);
                await ctx.reply((0, markdown_1.escapeMarkdownV2)('👤 لطفاً نقش خود را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔨 انجام‌دهنده' }, { text: '👩‍💼 درخواست‌کننده' }, { text: '💼 استخدام' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
            }
            else {
                ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ لطفاً یکی از گزینه‌های معتبر را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '📢 رایگان (30 سکه)' }, { text: '💰 پولی' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
            }
        }
        else if (ctx.session.step === 'awaiting_role') {
            if (message === '🔨 انجام‌دهنده') {
                ctx.session.role = 'performer';
            }
            else if (message === '👩‍💼 درخواست‌کننده') {
                ctx.session.role = 'client';
            }
            else if (message === '💼 استخدام') {
                ctx.session.role = 'hire';
            }
            else {
                ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ لطفاً یکی از گزینه‌های معتبر را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔨 انجام‌دهنده' }, { text: '👩‍💼 درخواست‌کننده' }, { text: '💼 استخدام' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
            ctx.session.step = ctx.session.adType === 'free' ? 'awaiting_pin_option' : 'awaiting_price_type';
            console.log(`Updated session to ${ctx.session.step}: ${JSON.stringify(ctx.session, null, 2)}`);
            if (ctx.session.adType === 'free') {
                await ctx.reply((0, markdown_1.escapeMarkdownV2)('📌 آیا تمایل دارید آگهی شما برای 12 ساعت پین شود؟ (هزینه اضافی: 30 سکه)'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '✅ بله، پین شود' }, { text: '❌ خیر، بدون پین' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
            }
            else {
                await ctx.reply((0, markdown_1.escapeMarkdownV2)('💸 نوع قیمت را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '💵 قیمت مشخص' }, { text: '🤝 توافقی' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
            }
        }
        else if (ctx.session.step === 'awaiting_price_type') {
            if (message === '💵 قیمت مشخص') {
                ctx.session.isAgreedPrice = false;
                ctx.session.step = 'awaiting_amount';
                ctx.reply((0, markdown_1.escapeMarkdownV2)('💵 لطفاً مبلغ آگهی (به تومان) را وارد کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
            }
            else if (message === '🤝 توافقی') {
                ctx.session.isAgreedPrice = true;
                ctx.session.amount = 0;
                ctx.session.step = 'awaiting_pin_option';
                ctx.reply((0, markdown_1.escapeMarkdownV2)('📌 آیا تمایل دارید آگهی شما برای 12 ساعت پین شود؟ (هزینه اضافی: 30 سکه)'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '✅ بله، پین شود' }, { text: '❌ خیر، بدون پین' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
            }
            else {
                ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ لطفاً یکی از گزینه‌های معتبر را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '💵 قیمت مشخص' }, { text: '🤝 توافقی' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
            }
        }
        else if (ctx.session.step === 'awaiting_amount') {
            const amount = parseInt(message);
            if (isNaN(amount) || amount <= 0) {
                ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ لطفاً یک مبلغ معتبر (بزرگ‌تر از صفر) وارد کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
            ctx.session.amount = amount;
            ctx.session.step = 'awaiting_pin_option';
            ctx.reply((0, markdown_1.escapeMarkdownV2)('📌 آیا تمایل دارید آگهی شما برای 12 ساعت پین شود؟ (هزینه اضافی: 30 سکه)'), {
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    keyboard: [[{ text: '✅ بله، پین شود' }, { text: '❌ خیر، بدون پین' }], [{ text: '🔙 بازگشت' }]],
                    resize_keyboard: true,
                    one_time_keyboard: false,
                },
            });
        }
        else if (ctx.session.step === 'awaiting_pin_option') {
            if (message === '✅ بله، پین شود') {
                const user = await container_1.userRepo.getUserByTelegramId(ctx.session.telegramId);
                if (!user || user.coins < 30) {
                    ctx.reply((0, markdown_1.escapeMarkdownV2)(`😕 برای پین کردن آگهی، حداقل 30 سکه نیاز دارید. سکه‌های فعلی شما: ${user?.coins || 0}`), {
                        parse_mode: 'MarkdownV2',
                        reply_markup: {
                            keyboard: [[{ text: '✅ بله، پین شود' }, { text: '❌ خیر، بدون پین' }], [{ text: '🔙 بازگشت' }]],
                            resize_keyboard: true,
                            one_time_keyboard: false,
                        },
                    });
                    return;
                }
                await container_1.userRepo.decreaseCoinsByPhone(user.phone, 30); // کسر 30 سکه برای پین
                ctx.session.isPinned = true;
            }
            else if (message === '❌ خیر، بدون پین') {
                ctx.session.isPinned = false;
            }
            else {
                ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ لطفاً یکی از گزینه‌های معتبر را انتخاب کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '✅ بله، پین شود' }, { text: '❌ خیر، بدون پین' }], [{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
            ctx.session.step = 'awaiting_title';
            ctx.reply((0, markdown_1.escapeMarkdownV2)('📝 لطفاً عنوان آگهی را وارد کنید:'), {
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    keyboard: [[{ text: '🔙 بازگشت' }]],
                    resize_keyboard: true,
                    one_time_keyboard: false,
                },
            });
        }
        else if (ctx.session.step === 'awaiting_title') {
            if ((0, filterText_1.containsProhibitedWords)(message)) {
                ctx.reply((0, markdown_1.escapeMarkdownV2)('⚠️ عنوان حاوی کلمات نامناسب است. لطفاً از کلمات مناسب استفاده کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
            ctx.session.title = message;
            ctx.session.step = 'awaiting_description';
            await ctx.reply((0, markdown_1.escapeMarkdownV2)('📄 لطفاً متن آگهی را وارد کنید (حداکثر 5000 کلمه). می‌توانید از Markdown استفاده کنید:\n' +
                '- *متن بولد* با ستاره\n' +
                '- _متن ایتالیک_ با آندرلاین\n' +
                '- [لینک](https://example.com) برای لینک\n' +
                '⚠️ اطمینان حاصل کنید که نشانه‌گذاری‌ها کامل باشند (مثلاً *متن* بدون فاصله اضافی).'), {
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    keyboard: [[{ text: '🔙 بازگشت' }]],
                    resize_keyboard: true,
                    one_time_keyboard: false,
                },
            });
        }
        else if (ctx.session.step === 'awaiting_description') {
            if (!isValidMarkdown(message)) {
                ctx.reply((0, markdown_1.escapeMarkdownV2)('⚠️ نشانه‌گذاری Markdown ناقص است (مثلاً * یا _ بدون جفت). لطفاً متن را اصلاح کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
            if ((0, filterText_1.containsProhibitedWords)(message)) {
                ctx.reply((0, markdown_1.escapeMarkdownV2)('⚠️ متن آگهی حاوی کلمات نامناسب است. لطفاً از کلمات مناسب استفاده کنید:'), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
            const wordCount = countWords(message);
            if (wordCount > 5000) {
                ctx.reply((0, markdown_1.escapeMarkdownV2)(`⚠️ متن آگهی نمی‌تواند بیش از 5000 کلمه باشد. تعداد کلمات فعلی: ${wordCount}. لطفاً متن را کوتاه‌تر کنید:`), {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        keyboard: [[{ text: '🔙 بازگشت' }]],
                        resize_keyboard: true,
                        one_time_keyboard: false,
                    },
                });
                return;
            }
            ctx.session.description = message;
            ctx.session.step = 'awaiting_deadline';
            await ctx.reply((0, markdown_1.escapeMarkdownV2)('⏰ لطفاً مهلت پروژه را وارد کنید (مثال: 1404/01/01)، یا گزینه‌های زیر را انتخاب کنید:'), {
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    keyboard: [[{ text: '🚀 فوری' }, { text: '⏳ زمان آزاد' }], [{ text: '🔙 بازگشت' }]],
                    resize_keyboard: true,
                    one_time_keyboard: false,
                },
            });
        }
    }
    catch (error) {
        console.error(`Error in textHandler: ${error.message}`);
        ctx.reply((0, markdown_1.escapeMarkdownV2)('⚠️ خطا رخ داد. لطفاً دوباره امتحان کنید!'), {
            parse_mode: 'MarkdownV2',
            reply_markup: { remove_keyboard: true },
        });
    }
};
exports.textHandler = textHandler;
const usernameHandler = async (ctx) => {
    const message = ctx.message?.text;
    console.log(`usernameHandler - Message: ${message}, Session: ${JSON.stringify(ctx.session, null, 2)}`);
    if (!message || ctx.session.step !== 'awaiting_username') {
        return ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ ابتدا زمان تحویل یا /newproject را وارد کنید!'), { parse_mode: 'MarkdownV2' });
    }
    if (message === '🔙 بازگشت') {
        ctx.session.step = 'awaiting_deadline';
        ctx.reply((0, markdown_1.escapeMarkdownV2)('⏰ لطفاً مهلت پروژه را وارد کنید (مثال: 1404/01/01)، یا گزینه‌های زیر را انتخاب کنید:'), {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                keyboard: [[{ text: '🚀 فوری' }, { text: '⏳ زمان آزاد' }], [{ text: '🔙 بازگشت' }]],
                resize_keyboard: true,
                one_time_keyboard: false,
            },
        });
        return;
    }
    if (!/^@[A-Za-z0-9_]+$/.test(message)) {
        return ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ آیدی با @ شروع شود و فقط حروف، اعداد و _ باشد (مثال: @Username).'), {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                keyboard: [[{ text: '🔙 بازگشت' }]],
                resize_keyboard: true,
                one_time_keyboard: false,
            },
        });
    }
    const { telegramId, title, description, deadline, phone, adType, amount, isPinned, isAgreedPrice, role } = ctx.session;
    if (!telegramId || !title || !description || !phone || !role) {
        return ctx.reply((0, markdown_1.escapeMarkdownV2)('☺️ اطلاعات ناقص است. با /newproject شروع کنید!'), { parse_mode: 'MarkdownV2' });
    }
    try {
        ctx.session.telegramUsername = message;
        const budget = adType === 'free' ? 'رایگان' : isAgreedPrice ? 'توافقی' : `${amount} تومان`;
        console.log(`Calling registerProject.execute with: ${JSON.stringify({ telegramId, title, description, budget, deadline, paymentMethod: 'gateway', telegramUsername: message, role, adType, amount, isPinned }, null, 2)}`);
        const projectId = await container_1.registerProject.execute(telegramId, title, description, budget, deadline || '', 'gateway', ctx.telegram, message, role, adType, adType === 'paid' ? amount : undefined, isPinned || false);
        console.log(`Project registered successfully with ID: ${projectId}`);
        if (adType === 'free') {
            ctx.reply((0, markdown_1.escapeMarkdownV2)('✅ آگهی منتشر شد!\n☺️ توصیه میشه برای امنیت کامل از پرداخت امن توسط واسط ادمین (@projebazar_admin) استفاده کنید!'), { parse_mode: 'MarkdownV2', reply_markup: { remove_keyboard: true } });
            ctx.session = { isPinned: false };
        }
        else {
            const paymentMessage = isAgreedPrice && !isPinned ? 'تأیید آگهی توافقی:' : `تأیید آگهی پولی:`;
            ctx.reply((0, markdown_1.escapeMarkdownV2)(paymentMessage), {
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    inline_keyboard: [[{ text: '💳 نشر پست ', callback_data: `pay_${projectId}` }]],
                },
            });
        }
    }
    catch (error) {
        console.error(`Error in usernameHandler: ${error.message}`);
        ctx.reply((0, markdown_1.escapeMarkdownV2)(`☺️ خطا: ${error.message}`), { parse_mode: 'MarkdownV2' });
    }
};
exports.usernameHandler = usernameHandler;
