import { CustomContext } from '../../types/telegraf';
import { userRepo } from '../../shared/container';

export const contactHandler = async (ctx: CustomContext) => {
    const contact = (ctx.message as any)?.contact;
    if (!contact) {
        ctx.reply('⚠️ لطفاً از دکمه "📱 ارسال شماره تلفن" استفاده کنید.');
        return;
    }

    const phone = contact.phone_number;
    const telegramId = String(ctx.from?.id || '');

    // بررسی اینکه شماره از اکانت تلگرام کاربر است
    if (!contact.user_id || String(contact.user_id) !== telegramId) {
        ctx.reply('⚠️ لطفاً شماره تلفن اکانت خودتان را ارسال کنید.');
        return;
    }

    // نرمال‌سازی شماره تلفن به فرمت +98...
    const normalizedPhone = normalizePhoneNumber(phone);

    if (!normalizedPhone) {
        ctx.reply('⚠️ شماره تلفن معتبر نیست. لطفاً از شماره واقعی اکانت تلگرام خود استفاده کنید.');
        return;
    }

    // بررسی وجود شماره در سیستم
    const phoneExists = await userRepo.checkPhoneExists(normalizedPhone);
    ctx.session.phone = normalizedPhone; // ذخیره شماره برای ادامه فرآیند

    if (phoneExists) {
        ctx.reply('✅ شماره شما قبلاً ثبت شده است. لطفاً متن آگهی را وارد کنید:');
    } else {
        await userRepo.setUserPhone(telegramId, normalizedPhone);
        ctx.reply('✅ شماره تلفن شما با موفقیت ثبت شد! لطفاً متن آگهی را وارد کنید:');
    }
};

// تابع کمکی برای نرمال‌سازی شماره تلفن
const normalizePhoneNumber = (rawPhone: string): string | null => {
    let phone = rawPhone.trim();

    // حذف علامت‌های اضافی
    phone = phone.replace(/[^0-9]/g, '');

    // اگر با 98 شروع شده باشه (بدون +)
    if (phone.startsWith('98')) {
        return `+${phone}`;
    }

    // اگر با 09 شروع شده باشه (داخل ایران)
    if (phone.startsWith('09')) {
        return `+98${phone.slice(1)}`;
    }

    // اگر با +98 شروع شده باشه و معتبر باشه
    if (rawPhone.startsWith('+98') && phone.length >= 11) {
        return rawPhone;
    }

    return null; // فرمت نامعتبر
};
