"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterProject = void 0;
const postToChannel_1 = require("../../interfaces/postToChannel");
class RegisterProject {
    constructor(userRepo, projectRepo) {
        this.userRepo = userRepo;
        this.projectRepo = projectRepo;
    }
    async execute(telegramId, title, description, budget, deadline, paymentMethod, telegram, telegramUsername, role, // اضافه کردن hire
    adType = 'free', amount, isPinned = false) {
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
            paymentStatus: adType === 'free' ? 'completed' : 'pending',
            paymentMethod,
            telegramUsername: telegramUsername || undefined,
            adType,
            amount: adType === 'paid' ? amount : undefined,
            isPinned,
            role,
        };
        // لاگ‌گذاری برای دیباگ
        console.log(`Creating project: ${JSON.stringify(project, null, 2)}`);
        await this.projectRepo.createProject(project);
        if (adType === 'free') {
            await (0, postToChannel_1.postToChannel)(telegram, { title, description, budget, deadline, telegramId, telegramUsername, isPinned, role });
        }
    }
}
exports.RegisterProject = RegisterProject;
