"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgProjectRepository = void 0;
const pool_1 = require("./pool");
class PgProjectRepository {
    async createProject(project) {
        await pool_1.pool.query(`
                INSERT INTO projects (telegram_id, description, budget, deadline, payment_status, payment_method, telegram_username)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
            project.telegramId,
            project.description,
            project.budget,
            project.deadline,
            project.paymentStatus,
            project.paymentMethod || null,
            project.telegramUsername || null,
        ]);
    }
    async updatePaymentStatus(projectId, status) {
        await pool_1.pool.query(`UPDATE projects SET payment_status = $1 WHERE id = $2`, [status, projectId]);
    }
    async getProjectById(projectId) {
        const result = await pool_1.pool.query(`SELECT * FROM projects WHERE id = $1`, [projectId]);
        if (result.rows.length === 0)
            return null;
        return result.rows[0];
    }
    async getLatestProjectId() {
        const result = await pool_1.pool.query('SELECT id FROM projects ORDER BY id DESC LIMIT 1');
        return result.rows.length > 0 ? result.rows[0].id : null;
    }
}
exports.PgProjectRepository = PgProjectRepository;
