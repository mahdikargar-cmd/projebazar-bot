"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgProjectRepository = void 0;
const pool_1 = require("./pool");
class PgProjectRepository {
    async createProject(project) {
        try {
            console.log(`Creating project: ${JSON.stringify(project, null, 2)}`);
            const result = await pool_1.pool.query(`INSERT INTO projects (telegram_id, title, description, budget, deadline, telegram_username, ad_type, amount, is_pinned, role)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 RETURNING id`, [
                project.telegramId,
                project.title,
                project.description,
                project.budget,
                project.deadline || null,
                project.telegramUsername || null,
                project.adType,
                project.amount || null,
                project.isPinned || false,
                project.role,
            ]);
            const projectId = result.rows[0].id;
            console.log(`Project created successfully with ID: ${projectId}`);
            return projectId;
        }
        catch (error) {
            console.error(`Error in createProject: ${error.message}`);
            throw error;
        }
    }
    async updatePaymentStatus(projectId, status) {
        // این متد باید به paymentRepo منتقل شود
        await pool_1.pool.query(`UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = $2`, [status, projectId]);
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
            telegramUsername: row.telegram_username || undefined,
            adType: row.ad_type,
            amount: row.amount || undefined,
            isPinned: row.is_pinned || false,
            role: row.role,
        };
    }
    async getLatestProjectId() {
        const result = await pool_1.pool.query('SELECT id FROM projects ORDER BY id DESC LIMIT 1');
        return result.rows.length > 0 ? result.rows[0].id : null;
    }
}
exports.PgProjectRepository = PgProjectRepository;
