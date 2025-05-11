import { Telegram } from 'telegraf';
import schedule from 'node-cron';

// تابع کمکی برای تمیز کردن متن و حذف کاراکترهای غیرمجاز
const cleanText = (text: string): string => {
    // حذف فاصله‌های اضافی و کاراکترهای نامرئی
    let cleanedText = text.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

    // جایگزینی کاراکترهای خاص که ممکن است مشکل ایجاد کنند
    cleanedText = cleanedText.replace(/[\r\n\t]+/g, ' '); // حذف خطوط جدید و تب
    cleanedText = cleanedText.replace(/[^\x20-\x7E\u0600-\u06FF]/g, ''); // فقط کاراکترهای مجاز (ASCII و فارسی)

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

        // تمیز کردن تمام فیلدها
        const cleanedTitle = cleanText(title);
        const cleanedDescription = cleanText(description);
        const cleanedBudget = cleanText(budget);
        const cleanedDeadline = deadline ? cleanText(deadline) : 'بدون مهلت';
        const cleanedTelegramUsername = telegramUsername ? cleanText(telegramUsername) : '@' + telegramId;

        const roleText = role === 'performer' ? 'انجام‌دهنده' : 'درخواست‌کننده';
        const message: string = `*${cleanedTitle}*\n\n📝 توضیحات: ${cleanedDescription}\n💰 بودجه: ${cleanedBudget}\n⏰ مهلت: ${cleanedDeadline}\n👤 نقش: ${roleText}\n📩 ارتباط با کارفرما: ${cleanedTelegramUsername}`;

        // لاگ‌گذاری متن پیام برای دیباگ
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