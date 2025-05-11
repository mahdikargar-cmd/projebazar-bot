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

    // بررسی اینکه شماره از اکانت خود کاربر است
    if (!contact.user_id || String(contact.user_id) !== telegramId) {
        ctx.reply('⚠️ لطفاً شماره تلفن اکانت خودتان را ارسال کنید.');
        return;
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    if (!normalizedPhone) {
        ctx.reply('⚠️ شماره تلفن معتبر نیست. لطفاً شماره‌ای واقعی وارد کنید.');
        return;
    }

    // بررسی وجود شماره در سیستم
    const phoneExists = await userRepo.checkPhoneExists(normalizedPhone);
    ctx.session.phone = normalizedPhone;

    if (phoneExists) {
        ctx.reply('✅ شماره شما قبلاً ثبت شده است. لطفاً متن آگهی را وارد کنید:');
    } else {
        await userRepo.setUserPhone(telegramId, normalizedPhone);
        ctx.reply('✅ شماره تلفن شما با موفقیت ثبت شد! لطفاً متن آگهی را وارد کنید:');
    }
};

// تبدیل شماره به فرمت 989... بدون +
const normalizePhoneNumber = (rawPhone: string): string | null => {
    let phone = rawPhone.replace(/[^0-9]/g, '');

    if (phone.startsWith('98')) {
        return phone;
    }

    if (phone.startsWith('09')) {
        return `98${phone.slice(1)}`;
    }

    return null;
};
