//src/application/user/registerUser.ts
import { IUserRepository } from '../../domain/user/IUserRepository';
import { User } from '../../domain/user/User';

export class RegisterUser {
    constructor(private userRepo: IUserRepository) {}

    async execute(telegramId: string, fullName: string, refTelegramId?: string) {
        const user: User = {
            telegramId,
            fullName,
            referredBy: refTelegramId,
            coins: 0,
        };
        await this.userRepo.createUser(user);

        if (refTelegramId) {
            const referrer = await this.userRepo.getUserByTelegramId(refTelegramId);
            if (referrer) {
                await this.userRepo.increaseCoinsByTelegramId(refTelegramId, 10);
            }
        }
    }
}