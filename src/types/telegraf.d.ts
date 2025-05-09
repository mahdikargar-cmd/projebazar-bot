import { Context as TelegrafContext } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

interface SessionData {
    telegramId?: string;
    description?: string;
    budget?: string;
    deadline?: string;
}

export interface CustomContext extends TelegrafContext<Update> {
    session: SessionData;
}