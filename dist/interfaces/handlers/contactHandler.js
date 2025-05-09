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
    await container_1.userRepo.setUserPhone(telegramId, phone);
    ctx.reply("✅ شماره شما ثبت شد. حالا می‌تونی پروژه‌ات رو ثبت کنی یا دعوت‌نامه ارسال کنی.");
};
exports.contactHandler = contactHandler;
