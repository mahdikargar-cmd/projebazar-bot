import { PgUserRepository } from '../infrastructure/db/PgUserRepository';
import { PgProjectRepository } from '../infrastructure/db/PgProjectRepository';
import { RegisterUser } from '../application/user/registerUser';
import { RegisterProject } from '../application/project/registerProject';

export const userRepo = new PgUserRepository();
export const projectRepo = new PgProjectRepository();
export const registerUser = new RegisterUser(userRepo);
export const registerProject = new RegisterProject(userRepo, projectRepo);