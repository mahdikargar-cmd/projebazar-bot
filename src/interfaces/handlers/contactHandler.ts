import { CustomContext } from '../../types/telegraf';
import { userRepo } from '../../shared/container';

export const contactHandler = async (ctx: CustomContext) => {
    const contact = (ctx.message as any)?.contact;
    if (!contact) return;

    const phone = contact.phone_number;
    const telegramId = String(contact.user_id);

    // بررسی فرمت شماره تلفن (مثال ساده)
    if (!phone.match(/^\+?\d{10,15}$/)) {
        ctx.reply('⚠️ شماره تلفن معتبر نیست. لطفاً شماره واقعی وارد کنید.');
        return;
    }

    // بررسی وجود شماره در سیستم
    const phoneExists = await userRepo.checkPhoneExists(phone);
    if (phoneExists) {
        ctx.reply('⚠️ این شماره قبلاً ثبت شده است.');
        return;
    }

    await userRepo.setUserPhone(telegramId, phone);
    ctx.reply('✅ شماره شما با موفقیت ثبت شد! حالا می‌تونی آگهی ثبت کنی یا سکه‌هات رو استعلام بگیری.');
};