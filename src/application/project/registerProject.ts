import { IUserRepository } from '../../domain/user/IUserRepository';
import { IProjectRepository } from '../../domain/project/IProjectRepository';
import { Project } from '../../domain/project/Project';
import { postToChannel } from '../../interfaces/bot';

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
        bot: any,
        telegramUsername: string
    ): Promise<void> {
        const user = await this.userRepo.getUserByTelegramId(telegramId);
        if (!user || !user.phone) {
            throw new Error('لطفاً ابتدا شماره تلفن خود را ثبت کنید.');
        }

        // کسر 30 سکه برای آگهی رایگان
        if (user.coins < 30) {
            throw new Error('سکه‌های کافی ندارید. حداقل 30 سکه نیاز است.');
        }

        await this.userRepo.decreaseCoinsByPhone(user.phone, 30);
        const project: Project = {
            telegramId,
            description,
            budget,
            deadline,
            paymentStatus: 'completed',
            telegramUsername,
        };
        await this.projectRepo.createProject(project);
        await postToChannel(bot, { description, budget, deadline, telegramId, telegramUsername });
    }
}