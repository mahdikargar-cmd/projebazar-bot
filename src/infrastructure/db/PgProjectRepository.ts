import { IProjectRepository } from '../../domain/project/IProjectRepository';
import { Project } from '../../domain/project/Project';
import { pool } from './pool';

export class PgProjectRepository implements IProjectRepository {
    async createProject(project: Project): Promise<number> {
        try {
            console.log(`Creating project: ${JSON.stringify(project, null, 2)}`);
            const result = await pool.query(
                `INSERT INTO projects (telegram_id, title, description, budget, deadline, telegram_username, ad_type, amount, is_pinned, role, message_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                     RETURNING id`,
                [
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
                    project.messageId || null,
                ]
            );
            const projectId = result.rows[0].id;
            console.log(`Project created successfully with ID: ${projectId}`);
            return projectId;
        } catch (error: any) {
            console.error(`Error in createProject: ${error.message}`);
            throw error;
        }
    }

    async updatePaymentStatus(projectId: number, status: 'completed' | 'failed'): Promise<void> {
        await pool.query(`UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = $2`, [status, projectId]);
    }

    async getProjectById(projectId: number): Promise<Project | null> {
        const result = await pool.query(`SELECT * FROM projects WHERE id = $1`, [projectId]);
        if (result.rows.length === 0) return null;

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
            messageId: row.message_id || undefined,
        } as Project;
    }

    async getLatestProjectId(): Promise<number | null> {
        const result = await pool.query('SELECT id FROM projects ORDER BY id DESC LIMIT 1');
        return result.rows.length > 0 ? result.rows[0].id : null;
    }

    async updateMessageId(projectId: number, messageId: number): Promise<void> {
        await pool.query(`UPDATE projects SET message_id = $1 WHERE id = $2`, [messageId, projectId]);
    }

    async getProjectsByTelegramId(telegramId: string): Promise<Project[]> {
        const result = await pool.query(`SELECT * FROM projects WHERE telegram_id = $1`, [telegramId]);
        return result.rows.map(row => ({
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
            messageId: row.message_id || undefined,
        }));
    }
}