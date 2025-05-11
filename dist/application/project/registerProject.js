"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterProject = void 0;
const postToChannel_1 = require("../../interfaces/postToChannel");
class RegisterProject {
    constructor(userRepo, projectRepo) {
        this.userRepo = userRepo;
        this.projectRepo = projectRepo;
    }
    async execute(telegramId, description, budget, deadline, paymentMethod, bot, // Will be updated to ctx.telegram in the future
    telegramUsername, adType = 'free', amount) {
        const user = await this.userRepo.getUserByTelegramId(telegramId);
        if (!user || !user.phone) {
            throw new Error('لطفاً ابتدا شماره تلفن خود را ثبت کنید.');
        }
        // برای آگهی رایگان، بررسی سکه‌ها
        if (adType === 'free' && user.coins < 30) {
            throw new Error('سکه‌های کافی ندارید. حداقل 30 سکه نیاز است.');
        }
        // کسر سکه برای آگهی رایگان
        if (adType === 'free') {
            await this.userRepo.decreaseCoinsByPhone(user.phone, 30);
        }
        const project = {
            telegramId,
            description,
            budget,
            deadline,
            paymentStatus: adType === 'free' ? 'completed' : 'pending',
            paymentMethod,
            telegramUsername,
            adType,
            amount: adType === 'paid' ? amount : undefined,
        };
        await this.projectRepo.createProject(project);
        // برای آگهی رایگان، مستقیماً به کانال ارسال شود
        if (adType === 'free') {
            await (0, postToChannel_1.postToChannel)(bot.telegram, { description, budget, deadline, telegramId, telegramUsername });
        }
    }
}
exports.RegisterProject = RegisterProject;
