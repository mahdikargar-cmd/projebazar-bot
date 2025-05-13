"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.containsProhibitedWords = void 0;
// src/utils/filterText.ts
const prohibitedWords_1 = require("./prohibitedWords");
const containsProhibitedWords = (input) => {
    if (!input)
        return false;
    const normalizedInput = input
        .toLowerCase()
        .replace(/[.,:;!?*()_\[\]{}"'@%\-ـ–]/g, '') // فقط علائم مزاحم
        .replace(/\s+/g, ' '); // فاصله‌های اضافی به یک فاصله ساده
    return prohibitedWords_1.prohibitedWords.some((word) => {
        const normalizedWord = word
            .toLowerCase()
            .replace(/[.,:;!?*()_\[\]{}"'@%\-ـ–]/g, '');
        const pattern = new RegExp(`\\b${normalizedWord}\\b`, 'i'); // تطبیق دقیق کلمات ممنوعه
        return pattern.test(normalizedInput);
    });
};
exports.containsProhibitedWords = containsProhibitedWords;
