import { Context as TelegrafContext } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

interface SessionData {
    isPinned?: boolean;
    telegramId?: string;
    phone?: string;
    title?: string; // فیلد جدید برای عنوان
    description?: string;
    deadline?: string;
    telegramUsername?: string;
    step?: 'awaiting_phone' | 'select_ad_type' | 'awaiting_price_type' | 'awaiting_amount' | 'awaiting_pin_option' | 'awaiting_title' | 'awaiting_description' | 'awaiting_deadline' | 'awaiting_username';
    adType?: 'free' | 'paid';
    amount?: number;
    isAgreedPrice?: boolean; // نشان‌دهنده قیمت توافقی
}

export interface CustomContext extends TelegrafContext<Update> {
    session: SessionData;
}