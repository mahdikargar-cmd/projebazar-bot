"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToChannel = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
// تابع کمکی برای تمیز کردن متن و حذف کاراکترهای غیرمجاز
const cleanText = (text) => {
    // حذف فاصله‌های اضافی و کاراکترهای نامرئی
    let cleanedText = text.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
    // جایگزینی کاراکترهای خاص که ممکن است مشکل ایجاد کنند
    cleanedText = cleanedText.replace(/[\r\n\t]+/g, ' '); // حذف خطوط جدید و تب
    // اجازه دادن به کاراکترهای ASCII استاندارد، فارسی، و خط فاصله (_)
    cleanedText = cleanedText.replace(/[^\x20-\x7E\u0600-\u06FF_]/g, '');
    // اصلاح نشانه‌گذاری‌های Markdown
    const markdownRegex = /(\*[^\*]*?\*|\_[^\_]*?\_)/g;
    cleanedText = cleanedText.replace(markdownRegex, (match) => {
        return match.replace(/\s*(\*|_)\s*/g, '$1').trim();
    });
    // اصلاح نشانه‌گذاری‌های ناقص
    const unbalancedBold = cleanedText.match(/\*([^\*]*)$/);
    if (unbalancedBold) {
        cleanedText = cleanedText.replace(/\*([^\*]*)$/, '*$1*');
    }
    const unbalancedItalic = cleanedText.match(/\_([^\_]*)$/);
    if (unbalancedItalic) {
        cleanedText = cleanedText.replace(/\_([^\_]*)$/, '_$1_');
    }
    return cleanedText;
};
const postToChannel = async (telegram, { title, description, budget, deadline, telegramId, telegramUsername, isPinned = false, role, }) => {
    try {
        if (!telegram) {
            throw new Error('Telegram object is undefined');
        }
        const channelId = process.env.CHANNEL_ID;
        if (!channelId) {
            throw new Error('CHANNEL_ID is not set in environment variables');
        }
        console.log(`postToChannel - telegramUsername: ${telegramUsername}, telegramId: ${telegramId}, role: ${role}`);
        // تمیز کردن تمام فیلدها
        const cleanedTitle = cleanText(title);
        const cleanedDescription = cleanText(description);
        const cleanedBudget = cleanText(budget);
        const cleanedDeadline = deadline ? cleanText(deadline) : 'بدون مهلت';
        const cleanedTelegramUsername = telegramUsername ? cleanText(telegramUsername) : '@' + telegramId;
        const roleText = role === 'performer' ? 'انجام‌دهنده' : 'درخواست‌کننده';
        const message = `*${cleanedTitle}*\n\n📝 توضیحات: ${cleanedDescription}\n💰 بودجه: ${cleanedBudget}\n⏰ مهلت: ${cleanedDeadline}\n👤 نقش: ${roleText}\n📩 ارتباط با کارفرما: ${cleanedTelegramUsername}`;
        console.log(`Message to be sent: ${message}`);
        const sentMessage = await telegram.sendMessage(channelId, message, {
            parse_mode: 'Markdown',
        });
        console.log(`Message posted to channel: ${message}`);
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
