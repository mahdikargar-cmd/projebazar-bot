import { Telegram } from 'telegraf';
import schedule from 'node-cron';

// تابع تمیز کردن متن از نویزها و کاراکترهای نامرئی
const cleanText = (text: string): string => {
    return text.trim().replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[\r\n\t]+/g, ' ');
};

// تابع فرار دادن کاراکترهای خاص برای MarkdownV2
const escapeMarkdownV2 = (text: string): string => {
    return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
};



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
        role,
    }: {
        title: string;
        description: string;
        budget: string;
        deadline?: string;
        telegramId: string;
        telegramUsername?: string;
        isPinned?: boolean;
        role: 'performer' | 'client' | 'hire';
    }
) => {
    try {
        if (!telegram) throw new Error('Telegram object is undefined');

        const channelId = process.env.CHANNEL_ID;
        if (!channelId) throw new Error('CHANNEL_ID is not set in environment variables');

        // تمیز و امن‌سازی فیلدها
        const cleanedTitle = escapeMarkdownV2(cleanText(title));
        const cleanedDescription = escapeMarkdownV2(cleanText(description));
        const cleanedBudget = escapeMarkdownV2(cleanText(budget));
        const cleanedDeadline = escapeMarkdownV2(cleanText(deadline || 'بدون مهلت'));
        const cleanedTelegramUsername = escapeMarkdownV2(cleanText(telegramUsername || '@' + telegramId));

        // تعیین هشتگ بر اساس نقش
        const hashtag = escapeMarkdownV2(
            role === 'performer' ? '#فریلنسر' : role === 'client' ? '#کارفرما' : '#فرصت_شغلی'
        );
        const roleText = role === 'performer' ? 'انجام‌دهنده' : role === 'client' ? 'درخواست‌کننده' : 'استخدام';

        const message = `${hashtag}\n\n*${cleanedTitle}*\n\n📝 توضیحات: ${cleanedDescription}\n💰 بودجه: ${cleanedBudget}\n⏰ مهلت: ${cleanedDeadline}\n👤 نقش: ${escapeMarkdownV2(roleText)}\n📩 ارتباط: ${cleanedTelegramUsername}`;

        console.log(`Message to be sent: ${message}`);

        const sentMessage = await telegram.sendMessage(channelId, message, {
            parse_mode: 'MarkdownV2',
        });

        console.log(`Message posted to channel: ${message}`);

        if (isPinned) {
            await telegram.pinChatMessage(channelId, sentMessage.message_id, {
                disable_notification: true,
            });
            console.log(`Message pinned: ${sentMessage.message_id}`);

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