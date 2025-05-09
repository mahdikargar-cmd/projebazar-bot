import { IUserRepository } from '../../domain/user/IUserRepository';
import { User } from '../../domain/user/User';

export class RegisterUser {
    constructor(private userRepo: IUserRepository) {}

    async execute(telegramId: string, fullName: string, refPhone?: string) {
        const user: User = {
            telegramId,
            fullName,
            referredBy: refPhone,
            coins: 0,
        };
        await this.userRepo.createUser(user);

        if (refPhone) {
            await this.userRepo.increaseCoinsByPhone(refPhone, 10);
        }
    }
}
