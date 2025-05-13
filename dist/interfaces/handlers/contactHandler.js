"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactHandler = void 0;
const container_1 = require("../../shared/container");
const markdown_1 = require("../../utils/markdown");
const normalizePhoneNumber = (rawPhone) => {
    try {
        let phone = rawPhone.replace(/[^0-9]/g, '');
        if (phone.startsWith('98') && phone.length === 12) {
            return phone;
        }
        else if (phone.startsWith('09') && phone.length === 11) {
            return `98${phone.slice(1)}`;
        }
        else if (phone.startsWith('0098') && phone.length === 14) {
            return phone.slice(2);
        }
        else if (phone.startsWith('989') && phone.length === 12) {
            return phone;
        }
        console.log(`Invalid phone format: ${rawPhone}`);
        return null;
    }
    catch (error) {
        console.error(`Error in normalizePhoneNumber: ${error}`);
        return null;
    }
};
const contactHandler = async (ctx) => {
    console.log('Received message:', JSON.stringify(ctx.message, null, 2));
    const contact = ctx.message?.contact;
    if (!contact) {
        console.log('No contact information provided');
        ctx.reply((0, markdown_1.escapeMarkdownV2)('⚠️ لطفاً فقط از دکمه "📱 ارسال شماره تلفن" استفاده کنید. شماره را به‌صورت دستی وارد نکنید.'), {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                keyboard: [[{ text: '📲 ارسال شماره', request_contact: true }, { text: '🔙 بازگشت' }]],
                resize_keyboard: true,
                one_time_keyboard: false,
            },
        });
        return;
    }
    const phone = contact.phone_number;
    const telegramId = String(ctx.from?.id || '');
    console.log(`Contact received - Phone: ${phone}, Telegram ID: ${telegramId}`);
    if (!contact.user_id || String(contact.user_id) !== telegramId) {
        console.log('Phone number does not belong to the user');
        ctx.reply((0, markdown_1.escapeMarkdownV2)('⚠️ لطفاً شماره تلفن مربوط به اکانت تلگرام خودتان را ارسال کنید.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
        console.log(`Invalid phone number: ${phone}`);
        ctx.reply((0, markdown_1.escapeMarkdownV2)('⚠️ شماره تلفن معتبر نیست. لطفاً یک شماره معتبر (مثل 09123456789 یا +989123456789) وارد کنید.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }
    try {
        ctx.session.phone = normalizedPhone;
        console.log(`Normalized phone: ${normalizedPhone}`);
        const phoneExists = await container_1.userRepo.checkPhoneExists(normalizedPhone);
        console.log(`Phone exists in DB: ${phoneExists}`);
        if (!phoneExists) {
            await container_1.userRepo.setUserPhone(telegramId, normalizedPhone);
            console.log(`Phone number saved for telegramId: ${telegramId}`);
            ctx.reply((0, markdown_1.escapeMarkdownV2)('✅ شماره تلفن شما با موفقیت ثبت شد! حالا می‌توانید نوع آگهی را انتخاب کنید:'), {
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    keyboard: [[{ text: '📢 رایگان (30 سکه)' }, { text: '💰 پولی' }], [{ text: '🔙 بازگشت' }]],
                    resize_keyboard: true,
                    one_time_keyboard: false,
                },
            });
        }
        else {
            console.log(`Phone number already exists for telegramId: ${telegramId}`);
            ctx.reply((0, markdown_1.escapeMarkdownV2)('✅ شماره تلفن شما قبلاً ثبت شده است. لطفاً نوع آگهی را انتخاب کنید:'), {
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    keyboard: [[{ text: '📢 رایگان (30 سکه)' }, { text: '💰 پولی' }], [{ text: '🔙 بازگشت' }]],
                    resize_keyboard: true,
                    one_time_keyboard: false,
                },
            });
        }
    }
    catch (error) {
        console.error(`Error in contactHandler: ${error.message}`);
        ctx.reply((0, markdown_1.escapeMarkdownV2)('⚠️ خطایی رخ داد. لطفاً دوباره امتحان کنید یا با پشتیبانی تماس بگیرید.'), {
            parse_mode: 'MarkdownV2',
        });
    }
};
exports.contactHandler = contactHandler;
