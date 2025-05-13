import { Project } from './Project';

export interface IProjectRepository {
    createProject(project: Project): Promise<number>;
    updatePaymentStatus(projectId: number, status: 'completed' | 'failed'): Promise<void>;
    getProjectById(projectId: number): Promise<Project | null>;
    getLatestProjectId(): Promise<number | null>;
    updateMessageId(projectId: number, messageId: number): Promise<void>; // متد جدید
    getProjectsByTelegramId(telegramId: string): Promise<Project[]>; // متد جدید
}