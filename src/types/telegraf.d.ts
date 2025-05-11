import { Context as TelegrafContext } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

interface SessionData {
    isPinned?: boolean; // اختیاری کردن isPinned
    telegramId?: string;
    phone?: string;
    description?: string;
    deadline?: string;
    telegramUsername?: string;
    step?: 'awaiting_phone' | 'select_ad_type' | 'awaiting_amount' | 'awaiting_description' | 'awaiting_deadline' | 'awaiting_username' | 'awaiting_pin_option'; // اضافه کردن awaiting_pin_option
    adType?: 'free' | 'paid';
    amount?: number;
}

export interface CustomContext extends TelegrafContext<Update> {
    session: SessionData;
}