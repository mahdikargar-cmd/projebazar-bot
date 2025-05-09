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
    async increaseCoinsByPhone(phone, amount) {
        await pool_1.pool.query(`UPDATE users SET coins = coins + $1 WHERE phone = $2`, [amount, phone]);
    }
    async decreaseCoinsByPhone(phone, amount) {
        await pool_1.pool.query(`UPDATE users SET coins = coins - $1 WHERE phone = $2`, [amount, phone]);
    }
    async setUserPhone(telegramId, phone) {
        await pool_1.pool.query(`UPDATE users SET phone = $1 WHERE telegram_id = $2`, [phone, telegramId]);
    }
    async getUserByTelegramId(telegramId) {
        const result = await pool_1.pool.query(`SELECT * FROM users WHERE telegram_id = $1`, [telegramId]);
        if (result.rows.length === 0)
            return null;
        return result.rows[0];
    }
    async checkPhoneExists(phone) {
        const result = await pool_1.pool.query(`SELECT 1 FROM users WHERE phone = $1`, [phone]);
        return result.rows.length > 0;
    }
}
exports.PgUserRepository = PgUserRepository;
