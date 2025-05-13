import { IUserRepository } from '../../domain/user/IUserRepository';
import { IProjectRepository } from '../../domain/project/IProjectRepository';
import { Project } from '../../domain/project/Project';
import { postToChannel } from '../../interfaces/postToChannel';
import { paymentRepo } from "../../domain/payment/IPaymentRepository";

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
        paymentMethod: 'gateway' | 'admin' | 'crypto' | 'other',
        telegram: any,
        telegramUsername: string,
        role: 'performer' | 'client' | 'hire',
        adType: 'free' | 'paid' = 'free',
        amount?: number,
        isPinned: boolean = false
    ): Promise<number> {
        const user = await this.userRepo.getUserByTelegramId(telegramId);
        if (!user || !user.phone) {
            throw new Error('لطفاً ابتدا شماره تلفن خود را ثبت کنید.');
        }

        // برای آگهی رایگان، بررسی سکه‌ها
        const requiredCoins = 30; // 30 سکه برای آگهی رایگان
        if (adType === 'free' && user.coins < requiredCoins) {
            throw new Error(`سکه‌های کافی ندارید. حداقل ${requiredCoins} سکه نیاز است.`);
        }

        // کسر سکه برای آگهی رایگان
        if (adType === 'free') {
            await this.userRepo.decreaseCoinsByPhone(user.phone, requiredCoins);
        }

        const project: Project = {
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
        console.log(`Project created with ID: ${projectId}`);

        // ثبت پرداخت در جدول Payment
        if (adType === 'paid') {
            await paymentRepo.createPayment({
                projectId,
                telegramId,
                amount: 0, // چون آگهی پولی رایگان است
                status: 'completed', // مستقیماً تأیید می‌شود
                paymentMethod: 'none',
                createdAt: new Date(),
                description: `آگهی پولی رایگان برای ${title}`,
            });

            // انتشار مستقیم آگهی پولی در کانال
            await postToChannel(telegram, {
                title,
                description,
                budget,
                deadline,
                telegramId,
                telegramUsername,
                isPinned,
                role,
                projectId
            });
        } else {
            // برای آگهی رایگان
            await paymentRepo.createPayment({
                projectId,
                telegramId,
                amount: 0,
                status: 'completed',
                paymentMethod: 'none',
                createdAt: new Date(),
                description: `آگهی رایگان برای ${title}`,
            });

            await postToChannel(telegram, {
                title,
                description,
                budget,
                deadline,
                telegramId,
                telegramUsername,
                isPinned,
                role,
                projectId
            });
        }

        return projectId;
    }
}