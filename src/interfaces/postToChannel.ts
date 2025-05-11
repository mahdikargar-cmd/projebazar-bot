import { Telegram } from 'telegraf';
import schedule from 'node-cron';

export const postToChannel = async (
    telegram: Telegram,
    {
        title,
        description,
        budget,
        deadline,
        telegramId,
        telegramUsername,
        isPinned = false,
    }: {
        title: string;
        description: string;
        budget: string;
        deadline?: string;
        telegramId: string;
        telegramUsername?: string;
        isPinned?: boolean;
    }
) => {
    try {
        if (!telegram) {
            throw new Error('Telegram object is undefined');
        }
        const channelId = process.env.CHANNEL_ID;
        if (!channelId) {
            throw new Error('CHANNEL_ID is not set in environment variables');
        }

        // لاگ‌گذاری برای دیباگ
        console.log(`postToChannel - telegramUsername: ${telegramUsername}, telegramId: ${telegramId}`);

        const message: string = `*${title}*\n\n📝 توضیحات: ${description}\n💰 بودجه: ${budget}\n⏰ مهلت: ${deadline || 'بدون مهلت'}\n📩 ارتباط با کارفرما: ${telegramUsername || '@' + telegramId}`;

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
            schedule.schedule('0 0 */12 * * *', async () => {
                try {
                    await telegram.unpinChatMessage(channelId, sentMessage.message_id);
                    console.log(`Message unpinned: ${sentMessage.message_id}`);
                } catch (error: any) {
                    console.error(`Error unpinning message: ${error.message}`);
                }
            });
        }
    } catch (error: any) {
        console.error(`Error in postToChannel: ${error.message}`);
        throw new Error(`Failed to post to channel: ${error.message}`);
    }
};