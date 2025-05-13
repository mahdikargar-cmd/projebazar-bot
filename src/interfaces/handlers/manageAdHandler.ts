import { CustomContext } from '../../types/telegraf';
import { projectRepo, userRepo } from '../../shared/container';
import { escapeMarkdownV2 } from '../../utils/markdown';
import { Telegram } from 'telegraf';

export const manageAdHandler = async (ctx: CustomContext) => {
    const telegramId = String(ctx.from?.id);

    const user = await userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply(escapeMarkdownV2('😕 هنوز ثبت‌نام نکردی! با /start شروع کن.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }

    const projects = await projectRepo.getProjectsByTelegramId(telegramId);
    if (projects.length === 0) {
        ctx.reply(escapeMarkdownV2('📭 هیچ آگهی ثبت‌شده‌ای ندارید!'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }

    const inlineKeyboard = projects.map(project => [
        {
            text: `آگهی: ${project.title}`,
            callback_data: `manage_${project.id}`,
        },
    ]);

    ctx.reply(escapeMarkdownV2('📊 آگهی‌های شما:'), {
        parse_mode: 'MarkdownV2',
        reply_markup: {
            inline_keyboard: inlineKeyboard,
        },
    });
};

// تابع ویرایش پست در کانال
const editChannelPost = async (
    telegram: Telegram,
    project: {
        title: string;
        description: string;
        budget: string;
        deadline?: string;
        role: 'performer' | 'client' | 'hire';
        messageId: number;
    }
) => {
    const channelId = process.env.CHANNEL_ID;
    if (!channelId) throw new Error('CHANNEL_ID is not set');

    const cleanedTitle = escapeMarkdownV2(project.title);
    const cleanedDescription = escapeMarkdownV2(project.description);
    const cleanedBudget = escapeMarkdownV2(project.budget);
    const cleanedDeadline = escapeMarkdownV2(project.deadline || 'بدون مهلت');
    const hashtag = escapeMarkdownV2(
        project.role === 'performer' ? '#فریلنسر' : project.role === 'client' ? '#کارفرما' : '#فرصت_شغلی'
    );
    const roleText = project.role === 'performer' ? 'انجام‌دهنده' : project.role === 'client' ? 'درخواست‌کننده' : 'استخدام';

    const message = `${hashtag}\n\n*${cleanedTitle}*\n\n📝 توضیحات: ${cleanedDescription}\n\n💰 بودجه: ${cleanedBudget}\n\n⏰ مهلت: ${cleanedDeadline}\n\n👤 نقش: ${escapeMarkdownV2(roleText)}\n📩 ارتباط: انجام شد`;

    await telegram.editMessageText(channelId, project.messageId, undefined, message, {
        parse_mode: 'MarkdownV2',
    });
};

// مدیریت کلیک روی دکمه‌های مدیریت آگهی
export const manageAdActionHandler = async (ctx: CustomContext) => {
    // اطمینان از وجود callbackQuery و پراپرتی data
    const callbackData = (ctx.callbackQuery as any)?.data as string | undefined;
    if (!callbackData || !callbackData.startsWith('manage_')) {
        ctx.reply(escapeMarkdownV2('⚠️ درخواست نامعتبر است.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }

    const projectId = parseInt(callbackData.replace('manage_', ''));
    const project = await projectRepo.getProjectById(projectId);
    if (!project || !project.messageId) {
        ctx.reply(escapeMarkdownV2('⚠️ آگهی یافت نشد یا قابل ویرایش نیست.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }

    try {
        await editChannelPost(ctx.telegram, {
            title: project.title,
            description: project.description,
            budget: project.budget,
            deadline: project.deadline,
            role: project.role,
            messageId: project.messageId,
        });

        ctx.reply(
            escapeMarkdownV2(
                '✅ آگهی شما با موفقیت ویرایش شد و وضعیت به «انجام شد» تغییر کرد.\n' +
                '⚠️ در صورت هرگونه مشکل به ادمین (@projebazar_admin) پیام دهید.'
            ),
            {
                parse_mode: 'MarkdownV2',
            }
        );

        // پاسخ به callback برای حذف پیام "در حال پردازش"
        await ctx.answerCbQuery();
    } catch (error: any) {
        console.error(`Error in manageAdActionHandler: ${error.message}`);
        ctx.reply(escapeMarkdownV2('⚠️ خطایی در ویرایش آگهی رخ داد. لطفاً دوباره امتحان کنید.'), {
            parse_mode: 'MarkdownV2',
        });
    }
};