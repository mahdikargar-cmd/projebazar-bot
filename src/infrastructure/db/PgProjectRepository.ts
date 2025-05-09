import { IProjectRepository } from '../../domain/project/IProjectRepository';
import { Project } from '../../domain/project/Project';
import { pool } from './pool';

export class PgProjectRepository implements IProjectRepository {
    async createProject(project: Project): Promise<void> {
        await pool.query(
            `
                INSERT INTO projects (telegram_id, description, budget, deadline, payment_status, payment_method)
                VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [
                project.telegramId,
                project.description,
                project.budget,
                project.deadline,
                project.paymentStatus,
                project.paymentMethod || null,
            ]
        );
    }

    async updatePaymentStatus(projectId: number, status: 'completed' | 'failed'): Promise<void> {
        await pool.query(`UPDATE projects SET payment_status = $1 WHERE id = $2`, [status, projectId]);
    }

    async getProjectById(projectId: number): Promise<Project | null> {
        const result = await pool.query(`SELECT * FROM projects WHERE id = $1`, [projectId]);
        if (result.rows.length === 0) return null;
        return result.rows[0] as Project;
    }

    async getLatestProjectId(): Promise<number | null> {
        const result = await pool.query('SELECT id FROM projects ORDER BY id DESC LIMIT 1');
        return result.rows.length > 0 ? result.rows[0].id : null;
    }
}