"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterProject = void 0;
const postToChannel_1 = require("../../interfaces/postToChannel");
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
        if (budget === 'رایگان' && user.coins < 30) {
            throw new Error('سکه‌های کافی ندارید. حداقل 30 سکه نیاز است.');
        }
        if (budget === 'رایگان') {
            await this.userRepo.decreaseCoinsByPhone(user.phone, 30);
        }
        const project = {
            telegramId,
            description,
            budget,
            deadline,
            paymentStatus: budget === 'رایگان' ? 'completed' : 'pending',
            paymentMethod,
            telegramUsername,
        };
        await this.projectRepo.createProject(project);
        if (budget === 'رایگان') {
            await (0, postToChannel_1.postToChannel)(bot, { description, budget, deadline, telegramId });
        }
    }
    async getLatestProjectId() {
        return this.projectRepo.getLatestProjectId();
    }
    async getProjectById(projectId) {
        return this.projectRepo.getProjectById(projectId);
    }
    async updatePaymentStatus(projectId, status) {
        await this.projectRepo.updatePaymentStatus(projectId, status);
    }
}
exports.RegisterProject = RegisterProject;
