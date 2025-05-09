import { Project } from './Project';

export interface IProjectRepository {
    createProject(project: Project): Promise<void>;
    updatePaymentStatus(projectId: number, status: 'completed' | 'failed'): Promise<void>;
    getProjectById(projectId: number): Promise<Project | null>;
    getLatestProjectId(): Promise<number | null>;
}