"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToChannel = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const container_1 = require("../shared/container");
// تابع تمیز کردن متن از نویزها و کاراکترهای نامرئی
const cleanText = (text) => {
    return text.trim().replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[\r\n\t]+/g, ' ');
};
// تابع فرار دادن کاراکترهای خاص برای MarkdownV2
const escapeMarkdownV2 = (text) => {
    return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
};
const postToChannel = async (telegram, { title, description, budget, deadline, telegramId, telegramUsername, isPinned = false, role, projectId, // اضافه کردن projectId برای ذخیره message_id
 }) => {
    try {
        if (!telegram)
            throw new Error('Telegram object is undefined');
        const channelId = process.env.CHANNEL_ID;
        if (!channelId)
            throw new Error('CHANNEL_ID is not set in environment variables');
        // تمیز و امن‌سازی فیلدها
        const cleanedTitle = escapeMarkdownV2(cleanText(title));
        const cleanedDescription = escapeMarkdownV2(cleanText(description));
        const cleanedBudget = escapeMarkdownV2(cleanText(budget));
        const cleanedDeadline = escapeMarkdownV2(cleanText(deadline || 'بدون مهلت'));
        const cleanedTelegramUsername = escapeMarkdownV2(cleanText(telegramUsername || '@' + telegramId));
        // تعیین هشتگ بر اساس نقش
        const hashtag = escapeMarkdownV2(role === 'performer' ? '#فریلنسر' : role === 'client' ? '#کارفرما' : '#فرصت_شغلی');
        const roleText = role === 'performer' ? 'انجام‌دهنده' : role === 'client' ? 'درخواست‌کننده' : 'استخدام';
        const message = `${hashtag}\n\n*${cleanedTitle}*\n\n📝 توضیحات: ${cleanedDescription}\n\n💰 بودجه: ${cleanedBudget}\n\n⏰ مهلت: ${cleanedDeadline}\n\n👤 نقش: ${escapeMarkdownV2(roleText)}\n📩 ارتباط: ${cleanedTelegramUsername}`;
        console.log(`Message to be sent: ${message}`);
        const sentMessage = await telegram.sendMessage(channelId, message, {
            parse_mode: 'MarkdownV2',
        });
        console.log(`Message posted to channel: ${message}`);
        // ذخیره message_id در دیتابیس
        await container_1.projectRepo.updateMessageId(projectId, sentMessage.message_id);
        if (isPinned) {
            await telegram.pinChatMessage(channelId, sentMessage.message_id, {
                disable_notification: true,
            });
            console.log(`Message pinned: ${sentMessage.message_id}`);
            node_cron_1.default.schedule('0 0 */12 * * *', async () => {
                try {
                    await telegram.unpinChatMessage(channelId, sentMessage.message_id);
                    console.log(`Message unpinned: ${sentMessage.message_id}`);
                }
                catch (error) {
                    console.error(`Error unpinning message: ${error.message}`);
                }
            });
        }
    }
    catch (error) {
        console.error(`Error in postToChannel: ${error.message}`);
        throw new Error(`Failed to post to channel: ${error.message}`);
    }
};
exports.postToChannel = postToChannel;
