// src/utils/filterText.ts
import { prohibitedWords } from './prohibitedWords';

export const containsProhibitedWords = (input: string): boolean => {
    if (!input) return false;

    const normalizedInput = input
        .toLowerCase()
        .replace(/[.,:;!?*()_\[\]{}"'@%\-ـ–]/g, '') // فقط علائم مزاحم
        .replace(/\s+/g, ' '); // فاصله‌های اضافی به یک فاصله ساده

    return prohibitedWords.some((word) => {
        const normalizedWord = word
            .toLowerCase()
            .replace(/[.,:;!?*()_\[\]{}"'@%\-ـ–]/g, '');

        const pattern = new RegExp(`\\b${normalizedWord}\\b`, 'i'); // تطبیق دقیق کلمات ممنوعه
        return pattern.test(normalizedInput);
    });
};

