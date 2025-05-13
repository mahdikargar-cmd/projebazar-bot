"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageAdActionHandler = exports.manageAdHandler = void 0;
const container_1 = require("../../shared/container");
const markdown_1 = require("../../utils/markdown");
const manageAdHandler = async (ctx) => {
    const telegramId = String(ctx.from?.id);
    const user = await container_1.userRepo.getUserByTelegramId(telegramId);
    if (!user) {
        ctx.reply((0, markdown_1.escapeMarkdownV2)('😕 هنوز ثبت‌نام نکردی! با /start شروع کن.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }
    const projects = await container_1.projectRepo.getProjectsByTelegramId(telegramId);
    if (projects.length === 0) {
        ctx.reply((0, markdown_1.escapeMarkdownV2)('📭 هیچ آگهی ثبت‌شده‌ای ندارید!'), {
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
    ctx.reply((0, markdown_1.escapeMarkdownV2)('📊 آگهی‌های شما:'), {
        parse_mode: 'MarkdownV2',
        reply_markup: {
            inline_keyboard: inlineKeyboard,
        },
    });
};
exports.manageAdHandler = manageAdHandler;
// تابع ویرایش پست در کانال
const editChannelPost = async (telegram, project) => {
    const channelId = process.env.CHANNEL_ID;
    if (!channelId)
        throw new Error('CHANNEL_ID is not set');
    const cleanedTitle = (0, markdown_1.escapeMarkdownV2)(project.title);
    const cleanedDescription = (0, markdown_1.escapeMarkdownV2)(project.description);
    const cleanedBudget = (0, markdown_1.escapeMarkdownV2)(project.budget);
    const cleanedDeadline = (0, markdown_1.escapeMarkdownV2)(project.deadline || 'بدون مهلت');
    const hashtag = (0, markdown_1.escapeMarkdownV2)(project.role === 'performer' ? '#فریلنسر' : project.role === 'client' ? '#کارفرما' : '#فرصت_شغلی');
    const roleText = project.role === 'performer' ? 'انجام‌دهنده' : project.role === 'client' ? 'درخواست‌کننده' : 'استخدام';
    const message = `${hashtag}\n\n*${cleanedTitle}*\n\n📝 توضیحات: ${cleanedDescription}\n\n💰 بودجه: ${cleanedBudget}\n\n⏰ مهلت: ${cleanedDeadline}\n\n👤 نقش: ${(0, markdown_1.escapeMarkdownV2)(roleText)}\n📩 ارتباط: انجام شد`;
    await telegram.editMessageText(channelId, project.messageId, undefined, message, {
        parse_mode: 'MarkdownV2',
    });
};
// مدیریت کلیک روی دکمه‌های مدیریت آگهی
const manageAdActionHandler = async (ctx) => {
    // اطمینان از وجود callbackQuery و پراپرتی data
    const callbackData = ctx.callbackQuery?.data;
    if (!callbackData || !callbackData.startsWith('manage_')) {
        ctx.reply((0, markdown_1.escapeMarkdownV2)('⚠️ درخواست نامعتبر است.'), {
            parse_mode: 'MarkdownV2',
        });
        return;
    }
    const projectId = parseInt(callbackData.replace('manage_', ''));
    const project = await container_1.projectRepo.getProjectById(projectId);
    if (!project || !project.messageId) {
        ctx.reply((0, markdown_1.escapeMarkdownV2)('⚠️ آگهی یافت نشد یا قابل ویرایش نیست.'), {
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
        ctx.reply((0, markdown_1.escapeMarkdownV2)('✅ آگهی شما با موفقیت ویرایش شد و وضعیت به «انجام شد» تغییر کرد.\n' +
            '⚠️ در صورت هرگونه مشکل به ادمین (@projebazar_admin) پیام دهید.'), {
            parse_mode: 'MarkdownV2',
        });
        // پاسخ به callback برای حذف پیام "در حال پردازش"
        await ctx.answerCbQuery();
    }
    catch (error) {
        console.error(`Error in manageAdActionHandler: ${error.message}`);
        ctx.reply((0, markdown_1.escapeMarkdownV2)('⚠️ خطایی در ویرایش آگهی رخ داد. لطفاً دوباره امتحان کنید.'), {
            parse_mode: 'MarkdownV2',
        });
    }
};
exports.manageAdActionHandler = manageAdActionHandler;
