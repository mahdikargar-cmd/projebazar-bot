import { Telegram } from 'telegraf';
import schedule from 'node-cron';

// تابع کمکی برای تمیز کردن متن Markdown
const cleanMarkdown = (text: string): string => {
    // حذف فاصله‌های اضافی در ابتدا و انتهای نشانه‌گذاری‌ها
    let cleanedText = text.trim();

    // بررسی و اصلاح نشانه‌گذاری‌های ناقص
    const markdownRegex = /(\*[^\*]*?\*|\_[^\_]*?\_)/g;
    cleanedText = cleanedText.replace(markdownRegex, (match) => {
        // حذف فاصله‌های اضافی داخل نشانه‌گذاری
        return match.replace(/\s*(\*|_)\s*/g, '$1').trim();
    });

    // اگر نشانه‌گذاری باز شده اما بسته نشده، آن را اصلاح کنیم
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
        role: 'performer' | 'client';
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
        console.log(`postToChannel - telegramUsername: ${telegramUsername}, telegramId: ${telegramId}, role: ${role}`);

        const roleText = role === 'performer' ? 'انجام‌دهنده' : 'درخواست‌کننده';
        const cleanedDescription = cleanMarkdown(description); // تمیز کردن توضیحات
        const message: string = `*${title}*\n\n📝 توضیحات: ${cleanedDescription}\n💰 بودجه: ${budget}\n⏰ مهلت: ${deadline || 'بدون مهلت'}\n👤 نقش: ${roleText}\n📩 ارتباط با کارفرما: ${telegramUsername || '@' + telegramId}`;

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