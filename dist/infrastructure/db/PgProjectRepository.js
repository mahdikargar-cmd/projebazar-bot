"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgProjectRepository = void 0;
const pool_1 = require("./pool");
class PgProjectRepository {
    async createProject(project) {
        try {
            console.log(`Creating project: ${JSON.stringify(project, null, 2)}`);
            await pool_1.pool.query(`INSERT INTO projects (telegram_id, title, description, budget, deadline, payment_status, payment_method, telegram_username, ad_type, amount, is_pinned)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [
                project.telegramId,
                project.title, // اضافه کردن title
                project.description,
                project.budget,
                project.deadline || null,
                project.paymentStatus,
                project.paymentMethod || null,
                project.telegramUsername || null,
                project.adType,
                project.amount || null,
                project.isPinned || false,
            ]);
            console.log('Project created successfully');
        }
        catch (error) {
            console.error(`Error in createProject: ${error.message}`);
            throw error;
        }
    }
    async updatePaymentStatus(projectId, status) {
        await pool_1.pool.query(`UPDATE projects SET payment_status = $1 WHERE id = $2`, [status, projectId]);
    }
    async getProjectById(projectId) {
        const result = await pool_1.pool.query(`SELECT * FROM projects WHERE id = $1`, [projectId]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            id: row.id,
            telegramId: row.telegram_id,
            title: row.title,
            description: row.description,
            budget: row.budget,
            deadline: row.deadline || undefined,
            paymentStatus: row.payment_status,
            paymentMethod: row.payment_method || undefined,
            telegramUsername: row.telegram_username || undefined, // تبدیل null به undefined
            adType: row.ad_type,
            amount: row.amount || undefined,
            isPinned: row.is_pinned || false,
        };
    }
    async getLatestProjectId() {
        const result = await pool_1.pool.query('SELECT id FROM projects ORDER BY id DESC LIMIT 1');
        return result.rows.length > 0 ? result.rows[0].id : null;
    }
}
exports.PgProjectRepository = PgProjectRepository;
