import { IUserRepository } from '../../domain/user/IUserRepository';
import { IProjectRepository } from '../../domain/project/IProjectRepository';
import { Project } from '../../domain/project/Project';
import { postToChannel } from '../../interfaces/postToChannel';

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
        bot: any, // Will be updated to ctx.telegram in the future
        telegramUsername: string,
        adType: 'free' | 'paid' = 'free',
        amount?: number
    ): Promise<void> {
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

        const project: Project = {
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
            await postToChannel(bot.telegram, { description, budget, deadline, telegramId, telegramUsername });
        }
    }
}