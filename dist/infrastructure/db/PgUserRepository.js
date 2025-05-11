"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgUserRepository = void 0;
const pool_1 = require("./pool");
class PgUserRepository {
    async createUser(user) {
        await pool_1.pool.query(`
                INSERT INTO users (telegram_id, full_name, phone, referred_by, coins)
                VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (telegram_id) DO NOTHING
            `, [user.telegramId, user.fullName, user.phone || null, user.referredBy || null, user.coins]);
    }
    async increaseCoinsByTelegramId(telegramId, amount) {
        await pool_1.pool.query(`UPDATE users SET coins = coins + $1 WHERE telegram_id = $2`, [amount, telegramId]);
    }
    async decreaseCoinsByPhone(phone, amount) {
        await pool_1.pool.query(`UPDATE users SET coins = coins - $1 WHERE phone = $2`, [amount, phone]);
    }
    async setUserPhone(telegramId, phone) {
        await pool_1.pool.query(`UPDATE users SET phone = $1 WHERE telegram_id = $2`, [phone, telegramId]);
    }
    async getUserByTelegramId(telegramId) {
        try {
            console.log(`Fetching user with telegramId: ${telegramId}`);
            const result = await pool_1.pool.query(`SELECT * FROM users WHERE telegram_id = $1`, [telegramId]);
            console.log(`User fetch result: ${result.rows.length} rows`);
            if (result.rows.length === 0)
                return null;
            return result.rows[0];
        }
        catch (error) {
            console.error(`Error in getUserByTelegramId: ${error.message}`);
            throw error;
        }
    }
    async checkPhoneExists(phone) {
        const result = await pool_1.pool.query(`SELECT 1 FROM users WHERE phone = $1`, [phone]);
        return result.rows.length > 0;
    }
    async getReferralCount(telegramId) {
        const result = await pool_1.pool.query(`SELECT COUNT(*) FROM users WHERE referred_by = $1`, [telegramId]);
        return parseInt(result.rows[0].count, 10);
    }
}
exports.PgUserRepository = PgUserRepository;
