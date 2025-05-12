//src/interfaces/handlers/contactHandler.ts

import { CustomContext } from '../../types/telegraf';
import { userRepo } from '../../shared/container';

// تابع نرمال‌سازی شماره تلفن
const normalizePhoneNumber = (rawPhone: string): string | null => {
    try {
        // حذف تمام کاراکترهای غیرعددی
        let phone = rawPhone.replace(/[^0-9]/g, '');

        // پشتیبانی از فرمت‌های مختلف
        if (phone.startsWith('98') && phone.length === 12) {
            return phone; // 989123456789
        } else if (phone.startsWith('09') && phone.length === 11) {
            return `98${phone.slice(1)}`; // 09123456789 -> 989123456789
        } else if (phone.startsWith('0098') && phone.length === 14) {
            return phone.slice(2); // 00989123456789 -> 989123456789
        } else if (phone.startsWith('989') && phone.length === 12) {
            return phone; // 989123456789
        }

        console.log(`Invalid phone format: ${rawPhone}`);
        return null;
    } catch (error) {
        console.error(`Error in normalizePhoneNumber: ${error}`);
        return null;
    }
};

// تابع اصلی مدیریت دریافت شماره تلفن
export const contactHandler = async (ctx: CustomContext) => {
    // لاگ‌گذاری برای دیباگ
    console.log('Received message:', JSON.stringify(ctx.message, null, 2));

    const contact = (ctx.message as any)?.contact;
    if (!contact) {
        console.log('No contact information provided');
        ctx.reply(
            '⚠️ لطفاً فقط از دکمه "📱 ارسال شماره تلفن" استفاده کنید. شماره را به‌صورت دستی وارد نکنید.'
        );
        return;
    }

    const phone = contact.phone_number;
    const telegramId = String(ctx.from?.id || '');
    console.log(`Contact received - Phone: ${phone}, Telegram ID: ${telegramId}`);

    // بررسی تطابق telegramId با user_id
    if (!contact.user_id || String(contact.user_id) !== telegramId) {
        console.log('Phone number does not belong to the user');
        ctx.reply('⚠️ لطفاً شماره تلفن مربوط به اکانت تلگرام خودتان را ارسال کنید.');
        return;
    }

    // نرمال‌سازی شماره تلفن
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
        console.log(`Invalid phone number: ${phone}`);
        ctx.reply(
            '⚠️ شماره تلفن معتبر نیست. لطفاً یک شماره معتبر (مثل 09123456789 یا +989123456789) وارد کنید.'
        );
        return;
    }

    try {
        // ذخیره شماره در session
        ctx.session.phone = normalizedPhone;
        console.log(`Normalized phone: ${normalizedPhone}`);

        // بررسی وجود شماره در دیتابیس
        const phoneExists = await userRepo.checkPhoneExists(normalizedPhone);
        console.log(`Phone exists in DB: ${phoneExists}`);

        // ذخیره یا به‌روزرسانی شماره در دیتابیس
        if (!phoneExists) {
            await userRepo.setUserPhone(telegramId, normalizedPhone);
            console.log(`Phone number saved for telegramId: ${telegramId}`);
            ctx.reply(
                '✅ شماره تلفن شما با موفقیت ثبت شد! حالا می‌توانید نوع آگهی را انتخاب کنید:',
                {
                    reply_markup: {
                        remove_keyboard: true,
                    },
                }
            );
        } else {
            console.log(`Phone number already exists for telegramId: ${telegramId}`);
            ctx.reply(
                '✅ شماره تلفن شما قبلاً ثبت شده است. لطفاً نوع آگهی را انتخاب کنید:',
                {
                    reply_markup: {
                        remove_keyboard: true,
                    },
                }
            );
        }

        // انتقال به مرحله بعدی (انتخاب نوع آگهی)
        ctx.session = { telegramId, phone: normalizedPhone, step: 'select_ad_type', isPinned: false };
        ctx.reply('لطفاً نوع آگهی را انتخاب کنید:', {
            reply_markup: {
                keyboard: [[{ text: '📝 آگهی رایگان (30 سکه)' }, { text: '💳 آگهی پولی' }]],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    } catch (error: any) {
        console.error(`Error in contactHandler: ${error.message}`);
        ctx.reply('⚠️ خطایی رخ داد. لطفاً دوباره امتحان کنید یا با پشتیبانی تماس بگیرید.');
    }
};