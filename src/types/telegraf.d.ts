import { Context as TelegrafContext } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

interface SessionData {
    telegramId?: string;
    phone?: string;
    description?: string;
    deadline?: string;
    telegramUsername?: string;
    step?: 'awaiting_phone' | 'awaiting_description' | 'awaiting_deadline' | 'awaiting_username';
}

export interface CustomContext extends TelegrafContext<Update> {
    session: SessionData;
}