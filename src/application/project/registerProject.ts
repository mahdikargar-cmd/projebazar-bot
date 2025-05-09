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
        bot: any
    ): Promise<void> {
        const user = await this.userRepo.getUserByTelegramId(telegramId);
        if (!user || !user.phone) {
            throw new Error('کاربر ثبت‌نام نکرده یا شماره تلفن ندارد.');
        }

        // بررسی سکه‌ها برای انتشار رایگان
        if (user.coins >= 30) {
            await this.userRepo.decreaseCoinsByPhone(user.phone, 30);
            const project: Project = {
                telegramId,
                description,
                budget,
                deadline,
                paymentStatus: 'completed',
            };
            await this.projectRepo.createProject(project);
            await postToChannel(bot, { description, budget, deadline, telegramId });
            return;
        }

        // ثبت پروژه با وضعیت پرداخت در انتظار
        const project: Project = {
            telegramId,
            description,
            budget,
            deadline,
            paymentStatus: 'pending',
            paymentMethod,
        };
        await this.projectRepo.createProject(project);

        if (paymentMethod === 'admin') {
            throw new Error('لطفاً با ادمین (@AdminID) تماس بگیرید.');
        } else {
            // حالت تستی: فرض می‌کنیم پرداخت موفق است
            await this.projectRepo.updatePaymentStatus(1, 'completed'); // برای تست، فرض می‌کنیم projectId=1
            await postToChannel(bot, { description, budget, deadline, telegramId });
            throw new Error('پرداخت تستی موفق بود! پست به کانال ارسال شد.');
        }
    }
}