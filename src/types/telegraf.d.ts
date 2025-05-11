import { Context as TelegrafContext } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

interface SessionData {
    telegramId?: string;
    phone?: string;
    description?: string;
    deadline?: string;
    telegramUsername?: string;
    step?: 'awaiting_phone' | 'select_ad_type' | 'awaiting_amount' | 'awaiting_description' | 'awaiting_deadline' | 'awaiting_username';
    adType?: 'free' | 'paid';
    amount?: number;
}

export interface CustomContext extends TelegrafContext<Update> {
    session: SessionData;
}