"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUser = void 0;
class RegisterUser {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async execute(telegramId, fullName, refPhone) {
        const user = {
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
exports.RegisterUser = RegisterUser;
