"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUser = void 0;
class RegisterUser {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async execute(telegramId, fullName, refTelegramId) {
        const user = {
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
exports.RegisterUser = RegisterUser;
