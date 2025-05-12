"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterProject = void 0;
const postToChannel_1 = require("../../interfaces/postToChannel");
const paymentRepo_1 = require("../../domain/payment/paymentRepo");
class RegisterProject {
    constructor(userRepo, projectRepo) {
        this.userRepo = userRepo;
        this.projectRepo = projectRepo;
    }
    async execute(telegramId, title, description, budget, deadline, paymentMethod, // حذف از پارامترها
    telegram, telegramUsername, role, adType = 'free', amount, isPinned = false) {
        const user = await this.userRepo.getUserByTelegramId(telegramId);
        if (!user || !user.phone) {
            throw new Error('لطفاً ابتدا شماره تلفن خود را ثبت کنید.');
        }
        // برای آگهی رایگان، بررسی سکه‌ها
        const requiredCoins = isPinned ? 80 : 30;
        if (adType === 'free' && user.coins < requiredCoins) {
            throw new Error(`سکه‌های کافی ندارید. حداقل ${requiredCoins} سکه نیاز است.`);
        }
        // کسر سکه برای آگهی رایگان
        if (adType === 'free') {
            await this.userRepo.decreaseCoinsByPhone(user.phone, requiredCoins);
        }
        const project = {
            telegramId,
            title,
            description,
            budget,
            deadline: deadline || undefined,
            telegramUsername: telegramUsername || undefined,
            adType,
            amount: adType === 'paid' ? amount : undefined,
            isPinned,
            role,
        };
        // لاگ‌گذاری برای دیباگ
        console.log(`Creating project: ${JSON.stringify(project, null, 2)}`);
        // ثبت پروژه و دریافت projectId
        const projectId = await this.projectRepo.createProject(project);
        // ثبت پرداخت در جدول Payment
        if (adType === 'paid') {
            await paymentRepo_1.paymentRepo.createPayment({
                projectId,
                telegramId,
                amount: amount || 0,
                status: 'pending',
                paymentMethod: paymentMethod || 'gateway', // استفاده از مقدار پیش‌فرض
                createdAt: new Date(),
                description: `پرداخت برای آگهی ${title}`,
            });
        }
        else {
            // برای آگهی رایگان
            await paymentRepo_1.paymentRepo.createPayment({
                projectId,
                telegramId,
                amount: 0,
                status: 'completed',
                paymentMethod: 'none',
                createdAt: new Date(),
                description: `آگهی رایگان برای ${title}`,
            });
        }
        if (adType === 'free') {
            await (0, postToChannel_1.postToChannel)(telegram, { title, description, budget, deadline, telegramId, telegramUsername, isPinned, role });
        }
        return projectId;
    }
}
exports.RegisterProject = RegisterProject;
