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
        title: string,
        description: string,
        budget: string,
        deadline: string,
        paymentMethod: 'gateway' | 'admin',
        telegram: any,
        telegramUsername: string,
        adType: 'free' | 'paid' = 'free',
        amount?: number,
        isPinned: boolean = false
    ): Promise<void> {
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

        const project: Project = {
            telegramId,
            title, // ذخیره عنوان
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

        // لاگ‌گذاری برای دیباگ
        console.log(`Creating project: ${JSON.stringify(project, null, 2)}`);

        await this.projectRepo.createProject(project);

        if (adType === 'free') {
            await postToChannel(telegram, { title, description, budget, deadline, telegramId, telegramUsername, isPinned });
        }
    }
}