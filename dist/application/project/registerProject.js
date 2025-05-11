"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterProject = void 0;
const postToChannel_1 = require("../../interfaces/postToChannel");
class RegisterProject {
    constructor(userRepo, projectRepo) {
        this.userRepo = userRepo;
        this.projectRepo = projectRepo;
    }
    async execute(telegramId, description, budget, deadline, paymentMethod, telegram, telegramUsername, adType = 'free', amount, isPinned = false) {
        const user = await this.userRepo.getUserByTelegramId(telegramId);
        if (!user || !user.phone) {
            throw new Error('لطفاً ابتدا شماره تلفن خود را ثبت کنید.');
        }
        // برای آگهی رایگان، بررسی سکه‌ها
        const requiredCoins = isPinned ? 80 : 30; // 30 برای آگهی + 50 برای پین
        if (adType === 'free' && user.coins < requiredCoins) {
            throw new Error(`سکه‌های کافی ندارید. حداقل ${requiredCoins} سکه نیاز است.`);
        }
        // کسر سکه برای آگهی رایگان
        if (adType === 'free') {
            await this.userRepo.decreaseCoinsByPhone(user.phone, requiredCoins);
        }
        const project = {
            telegramId,
            description,
            budget,
            deadline: deadline || undefined,
            paymentStatus: adType === 'free' ? 'completed' : 'pending',
            paymentMethod,
            telegramUsername,
            adType,
            amount: adType === 'paid' ? amount : undefined,
            isPinned,
        };
        await this.projectRepo.createProject(project);
        if (adType === 'free') {
            await (0, postToChannel_1.postToChannel)(telegram, { description, budget, deadline, telegramId, telegramUsername, isPinned });
        }
    }
}
exports.RegisterProject = RegisterProject;
