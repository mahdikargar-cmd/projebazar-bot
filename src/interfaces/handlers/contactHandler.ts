import { CustomContext } from '../../types/telegraf';
import { userRepo } from '../../shared/container';

export const contactHandler = async (ctx: CustomContext) => {
    const contact = (ctx.message as any)?.contact;
    if (!contact) return;

    const phone = contact.phone_number;
    const telegramId = String(contact.user_id);

    await userRepo.setUserPhone(telegramId, phone);

    ctx.reply("✅ شماره شما ثبت شد. حالا می‌تونی پروژه‌ات رو ثبت کنی یا دعوت‌نامه ارسال کنی.");
};