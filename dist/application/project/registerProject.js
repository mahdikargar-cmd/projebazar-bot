"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterProject = void 0;
const bot_1 = require("../../interfaces/bot");
class RegisterProject {
    constructor(userRepo, projectRepo) {
        this.userRepo = userRepo;
        this.projectRepo = projectRepo;
    }
    async execute(telegramId, description, budget, deadline, paymentMethod, bot) {
        const user = await this.userRepo.getUserByTelegramId(telegramId);
        if (!user || !user.phone) {
            throw new Error('لطفاً ابتدا شماره تلفن خود را ثبت کنید.');
        }
        // بررسی سکه‌ها برای انتشار رایگان
        if (user.coins >= 30) {
            await this.userRepo.decreaseCoinsByPhone(user.phone, 30);
            const project = {
                telegramId,
                description,
                budget,
                deadline,
                paymentStatus: 'completed',
            };
            await this.projectRepo.createProject(project);
            await (0, bot_1.postToChannel)(bot, { description, budget, deadline, telegramId });
            return;
        }
        // ثبت پروژه با وضعیت پرداخت در انتظار
        const project = {
            telegramId,
            description,
            budget,
            deadline,
            paymentStatus: 'pending',
            paymentMethod,
        };
        await this.projectRepo.createProject(project);
        if (paymentMethod === 'admin') {
            throw new Error('لطفاً با ادمین (@AdminID) تماس بگیرید.');
        }
        else {
            // حالت تستی: فرض می‌کنیم پرداخت موفق است
            const latestProjectId = await this.projectRepo.getLatestProjectId();
            if (!latestProjectId)
                throw new Error('خطا در ثبت پروژه.');
            await this.projectRepo.updatePaymentStatus(latestProjectId, 'completed');
            await (0, bot_1.postToChannel)(bot, { description, budget, deadline, telegramId });
            throw new Error('پرداخت تستی موفق بود! آگهی شما در کانال منتشر شد.');
        }
    }
}
exports.RegisterProject = RegisterProject;
