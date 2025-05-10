"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactHandler = void 0;
const container_1 = require("../../shared/container");
const contactHandler = async (ctx) => {
    const contact = ctx.message?.contact;
    if (!contact)
        return;
    const phone = contact.phone_number;
    const telegramId = String(contact.user_id);
    // بررسی فرمت شماره تلفن (مثال ساده)
    if (!phone.match(/^\+?\d{10,15}$/)) {
        ctx.reply('⚠️ شماره تلفن معتبر نیست. لطفاً شماره واقعی وارد کنید.');
        return;
    }
    // بررسی وجود شماره در سیستم
    const phoneExists = await container_1.userRepo.checkPhoneExists(phone);
    if (phoneExists) {
        ctx.reply('⚠️ این شماره قبلاً ثبت شده است.');
        return;
    }
    await container_1.userRepo.setUserPhone(telegramId, phone);
    ctx.reply('✅ شماره شما با موفقیت ثبت شد! حالا می‌تونی آگهی ثبت کنی یا سکه‌هات رو استعلام بگیری.');
};
exports.contactHandler = contactHandler;
