import { IUserRepository } from '../../domain/user/IUserRepository';
import { IProjectRepository } from '../../domain/project/IProjectRepository';
import { Project } from '../../domain/project/Project';
import { postToChannel } from '../../interfaces/postToChannel';
import { Telegraf } from 'telegraf';
import { CustomContext } from '../../types/telegraf';

export class RegisterProject {
    constructor(
        private userRepo: IUserRepository,
        private projectRepo: IProjectRepository
    ) {}

    async execute(
        telegramId: string,
        description: string,
        budget: string,
        deadline: string,
        paymentMethod: 'gateway' | 'admin',
        bot: Telegraf<CustomContext>,
        telegramUsername: string
    ): Promise<void> {
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

        const project: Project = {
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
            await postToChannel(bot, { description, budget, deadline, telegramId });
        }
    }

    async getLatestProjectId(): Promise<number | null> {
        return this.projectRepo.getLatestProjectId();
    }

    async getProjectById(projectId: number): Promise<Project | null> {
        return this.projectRepo.getProjectById(projectId);
    }

    async updatePaymentStatus(projectId: number, status: 'completed' | 'failed'): Promise<void> {
        await this.projectRepo.updatePaymentStatus(projectId, status);
    }
}