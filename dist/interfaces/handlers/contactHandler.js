"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactHandler = void 0;
const container_1 = require("../../shared/container");
const contactHandler = async (ctx) => {
    const contact = ctx.message?.contact;
    if (!contact) {
        ctx.reply('⚠️ لطفاً از دکمه "📱 ارسال شماره تلفن" استفاده کنید.');
        return;
    }
    const phone = contact.phone_number;
    const telegramId = String(contact.user_id);
    // بررسی اینکه شماره از اکانت تلگرام کاربر است
    if (!contact.user_id || String(contact.user_id) !== telegramId) {
        ctx.reply('⚠️ لطفاً شماره تلفن اکانت خودتان را ارسال کنید.');
        return;
    }
    // بررسی فرمت شماره تلفن
    if (!phone.match(/^\+\d{10,15}$/)) {
        ctx.reply('⚠️ شماره تلفن معتبر نیست. لطفاً از شماره واقعی اکانت تلگرام خود استفاده کنید.');
        return;
    }
    // بررسی وجود شماره در سیستم
    const phoneExists = await container_1.userRepo.checkPhoneExists(phone);
    if (phoneExists) {
        ctx.reply('⚠️ این شماره قبلاً ثبت شده است. اگر مشکلی دارید، با ادمین (@AdminID) تماس بگیرید.');
        return;
    }
    // ثبت شماره تلفن
    await container_1.userRepo.setUserPhone(telegramId, phone);
    ctx.reply('✅ شماره تلفن شما با موفقیت ثبت شد! حالا می‌توانید آگهی ثبت کنید یا سکه‌هایتان را استعلام بگیرید.');
};
exports.contactHandler = contactHandler;
