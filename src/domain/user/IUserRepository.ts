import { User } from './User';

export interface IUserRepository {
    createUser(user: User): Promise<void>;
    increaseCoinsByTelegramId(telegramId: string, amount: number): Promise<void>;
    setUserPhone(telegramId: string, phone: string): Promise<void>;
    getUserByTelegramId(telegramId: string): Promise<User | null>;
    decreaseCoinsByPhone(phone: string, amount: number): Promise<void>;
    checkPhoneExists(phone: string): Promise<boolean>;
    getReferralCount(telegramId: string): Promise<number>;
}