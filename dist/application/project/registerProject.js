"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterProject = void 0;
const bot_1 = require("../../interfaces/bot");
class RegisterProject {
    constructor(userRepo, projectRepo) {
        this.userRepo = userRepo;
        this.projectRepo = projectRepo;
    }
    async execute(telegramId, description, budget, deadline, paymentMethod, bot, telegramUsername) {
        const user = await this.userRepo.getUserByTelegramId(telegramId);
        if (!user || !user.phone) {
            throw new Error('لطفاً ابتدا شماره تلفن خود را ثبت کنید.');
        }
        // کسر 30 سکه برای آگهی رایگان
        if (user.coins < 30) {
            throw new Error('سکه‌های کافی ندارید. حداقل 30 سکه نیاز است.');
        }
        await this.userRepo.decreaseCoinsByPhone(user.phone, 30);
        const project = {
            telegramId,
            description,
            budget,
            deadline,
            paymentStatus: 'completed',
            telegramUsername,
        };
        await this.projectRepo.createProject(project);
        await (0, bot_1.postToChannel)(bot, { description, budget, deadline, telegramId, telegramUsername });
    }
}
exports.RegisterProject = RegisterProject;
