import { IUserRepository } from '../../domain/user/IUserRepository';
import { User } from '../../domain/user/User';
import { pool } from './pool';

export class PgUserRepository implements IUserRepository {
    async createUser(user: User): Promise<void> {
        await pool.query(
            `
                INSERT INTO users (telegram_id, full_name, phone, referred_by, coins)
                VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (telegram_id) DO NOTHING
            `,
            [user.telegramId, user.fullName, user.phone || null, user.referredBy || null, user.coins]
        );
    }

    async increaseCoinsByPhone(phone: string, amount: number): Promise<void> {
        await pool.query(`UPDATE users SET coins = coins + $1 WHERE phone = $2`, [amount, phone]);
    }

    async decreaseCoinsByPhone(phone: string, amount: number): Promise<void> {
        await pool.query(`UPDATE users SET coins = coins - $1 WHERE phone = $2`, [amount, phone]);
    }

    async setUserPhone(telegramId: string, phone: string): Promise<void> {
        await pool.query(`UPDATE users SET phone = $1 WHERE telegram_id = $2`, [phone, telegramId]);
    }

    async getUserByTelegramId(telegramId: string): Promise<User | null> {
        const result = await pool.query(`SELECT * FROM users WHERE telegram_id = $1`, [telegramId]);
        if (result.rows.length === 0) return null;
        return result.rows[0] as User;
    }

    async checkPhoneExists(phone: string): Promise<boolean> {
        const result = await pool.query(`SELECT 1 FROM users WHERE phone = $1`, [phone]);
        return result.rows.length > 0;
    }
}