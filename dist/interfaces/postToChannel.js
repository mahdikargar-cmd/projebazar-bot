"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToChannel = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const postToChannel = async (telegram, { title, description, budget, deadline, telegramId, telegramUsername, isPinned = false, role, }) => {
    try {
        if (!telegram) {
            throw new Error('Telegram object is undefined');
        }
        const channelId = process.env.CHANNEL_ID;
        if (!channelId) {
            throw new Error('CHANNEL_ID is not set in environment variables');
        }
        // لاگ‌گذاری برای دیباگ
        console.log(`postToChannel - telegramUsername: ${telegramUsername}, telegramId: ${telegramId}, role: ${role}`);
        const roleText = role === 'performer' ? 'انجام‌دهنده' : 'درخواست‌کننده';
        const message = `*${title}*\n\n📝 توضیحات: ${description}\n💰 بودجه: ${budget}\n⏰ مهلت: ${deadline || 'بدون مهلت'}\n👤 نقش: ${roleText}\n📩 ارتباط با کارفرما: ${telegramUsername || '@' + telegramId}`;
        const sentMessage = await telegram.sendMessage(channelId, message, {
            parse_mode: 'Markdown',
        });
        console.log(`Message posted to channel: ${message}`);
        if (isPinned) {
            await telegram.pinChatMessage(channelId, sentMessage.message_id, {
                disable_notification: true,
            });
            console.log(`Message pinned: ${sentMessage.message_id}`);
            // زمان‌بندی برای unpin کردن بعد از 12 ساعت
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
