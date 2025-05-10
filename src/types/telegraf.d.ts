import { Context as TelegrafContext } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { Telegraf } from 'telegraf';

interface SessionData {
    telegramId?: string;
    phone?: string;
    description?: string;
    deadline?: string;
    telegramUsername?: string;
    paymentId?: string;
    projectId?: number;
    step?: 'awaiting_phone' | 'awaiting_description' | 'awaiting_deadline' | 'awaiting_username' | 'awaiting_payment';
}

export interface CustomContext extends TelegrafContext<Update> {
    session: SessionData;
    bot: Telegraf<CustomContext>;
}