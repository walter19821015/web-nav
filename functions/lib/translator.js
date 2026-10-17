// functions/lib/translator.js
// 中→英 翻译封装，基于 Cloudflare Workers AI
// 失败时静默返回空串，调用方需自行决定是否回退

import { resolveWorkersAiModel } from './workers-ai-models';

const TRANSLATION_SYSTEM_PROMPT =
  'You are a translation engine. Translate the user\'s text into natural, concise English suitable for a navigation website bookmark name or short description. Output ONLY the translated text — no quotes, no prefix, no explanation, no markdown. If the input is empty or already in English, return it as-is.';

const MAX_INPUT_LENGTH = 500;

function extractAiText(response) {
    if (typeof response === 'string') return response;
    if (!response || typeof response !== 'object') return '';

    if (typeof response.response === 'string') return response.response;

    const choiceContent = response.choices?.[0]?.message?.content;
    if (typeof choiceContent === 'string') return choiceContent;
    if (Array.isArray(choiceContent)) {
        return choiceContent
            .map((part) => (typeof part === 'string' ? part : (part?.text || '')))
            .join('');
    }
    if (typeof response.result?.response === 'string') return response.result.response;
    return '';
}

function cleanTranslation(raw) {
    return String(raw || '')
        .replace(/```(?:json|text|markdown)?/gi, '')
        .replace(/```/g, '')
        .replace(/^[\s"'`\u201c\u201d\u2018\u2019]+/, '')
        .replace(/[\s"'`\u201c\u201d\u2018\u2019]+$/, '')
        .replace(/^(translation|translated|英文|english)\s*[:：\-]\s*/i, '')
        .trim();
}

export function isLikelyChinese(text) {
    if (!text) return false;
    // 命中 CJK 表意文字即视为中文
    return /[\u3400-\u9fff]/.test(text);
}

/**
 * 单条文本翻译。env.AI 不可用时返回空串。
 * @param {object} env - Cloudflare Pages env
 * @param {string} text - 待翻译文本
 * @param {object} [options]
 * @param {string} [options.model] - 覆盖默认模型
 * @returns {Promise<string>} 英文译文；失败时返回空串
 */
export async function translateToEnglish(env, text, options = {}) {
    if (!text || !String(text).trim()) return '';
    if (!env || !env.AI) return '';
    if (!isLikelyChinese(text)) {
        // 已经是英文（或无中文）就直接返回原文，避免无谓调用
        return String(text).trim();
    }

    const trimmed = String(text).slice(0, MAX_INPUT_LENGTH);
    const model = resolveWorkersAiModel(options.model, env.WORKERS_AI_MODEL);

    try {
        const response = await env.AI.run(model, {
            messages: [
                { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
                { role: 'user', content: trimmed }
            ]
        });
        return cleanTranslation(extractAiText(response));
    } catch (error) {
        console.warn('translateToEnglish failed:', error?.message || error);
        return '';
    }
}

/**
 * 批量翻译（去重后并发）。
 * @param {object} env
 * @param {string[]} texts
 * @param {object} [options]
 * @returns {Promise<string[]>} 与入参等长的译文数组
 */
export async function translateBatchToEnglish(env, texts, options = {}) {
    if (!Array.isArray(texts) || texts.length === 0) return [];
    const unique = [...new Set(texts.filter((t) => t && String(t).trim()))];
    if (unique.length === 0) return texts.map(() => '');

    const results = await Promise.all(unique.map((t) => translateToEnglish(env, t, options)));
    const map = new Map();
    unique.forEach((t, i) => map.set(t, results[i]));
    return texts.map((t) => (t ? (map.get(t) || '') : ''));
}
