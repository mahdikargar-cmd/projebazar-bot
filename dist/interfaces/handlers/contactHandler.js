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
        ctx.session.phone = phone; // ذخیره شماره برای ادامه فرآیند
        ctx.reply('✅ شماره شما قبلاً ثبت شده است. لطفاً متن آگهی را وارد کنید:');
        return;
    }
    // ثبت شماره تلفن
    await container_1.userRepo.setUserPhone(telegramId, phone);
    ctx.session.phone = phone; // ذخیره شماره برای ادامه فرآیند
    ctx.reply('✅ شماره تلفن شما با موفقیت ثبت شد! لطفاً متن آگهی را وارد کنید:');
};
exports.contactHandler = contactHandler;
