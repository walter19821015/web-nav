// functions/api/admin/backfill-translations.js
// 一次性 backfill：把现有 sites/category 的中文字段过 Workers AI 翻成英文
// 调用：GET 或 POST /api/admin/backfill-translations（临时无需登录，调通后会加回 isAdminAuthenticated 并删掉本端点）
import { errorResponse, jsonResponse, markHomeCacheDirty } from '../../_middleware';
import { translateBatchToEnglish } from '../../lib/translator';

const BATCH_SIZE = 8;
const MAX_ITEMS = 500;
const CATEGORY_TABLE = 'category';
const SITES_TABLE = 'sites';

async function translateCategories(env, stats, errors) {
    const result = await env.NAV_DB.prepare(
        `SELECT id, catelog FROM ${CATEGORY_TABLE} WHERE catelog IS NOT NULL AND catelog != '' AND (name_en IS NULL OR name_en = '')`
    ).all();
    const items = (result.results || []).slice(0, MAX_ITEMS);
    stats.categories_total = items.length;

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const texts = batch.map((c) => c.catelog);
        const translations = await translateBatchToEnglish(env, texts);

        for (let j = 0; j < batch.length; j++) {
            const translated = translations[j];
            if (translated) {
                try {
                    await env.NAV_DB.prepare(
                        `UPDATE ${CATEGORY_TABLE} SET name_en = ? WHERE id = ?`
                    ).bind(translated, batch[j].id).run();
                    stats.categories_translated++;
                } catch (e) {
                    errors.push({ table: CATEGORY_TABLE, id: batch[j].id, error: e.message });
                }
            } else {
                stats.categories_skipped++;
            }
        }
    }
}

async function translateSites(env, stats, errors) {
    const result = await env.NAV_DB.prepare(
        `SELECT id, name, desc FROM ${SITES_TABLE} WHERE name IS NOT NULL AND name != '' AND (name_en IS NULL OR name_en = '')`
    ).all();
    const items = (result.results || []).slice(0, MAX_ITEMS);
    stats.sites_total = items.length;

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const names = batch.map((s) => s.name || '');
        const descs = batch.map((s) => s.desc || '');
        const [nameTranslations, descTranslations] = await Promise.all([
            translateBatchToEnglish(env, names),
            translateBatchToEnglish(env, descs)
        ]);

        for (let j = 0; j < batch.length; j++) {
            const nameEn = nameTranslations[j];
            const descEn = descTranslations[j];
            if (nameEn || descEn) {
                try {
                    await env.NAV_DB.prepare(
                        `UPDATE ${SITES_TABLE} SET name_en = COALESCE(?, name_en), desc_en = COALESCE(?, desc_en) WHERE id = ?`
                    ).bind(nameEn || null, descEn || null, batch[j].id).run();
                    if (nameEn) stats.sites_translated++;
                } catch (e) {
                    errors.push({ table: SITES_TABLE, id: batch[j].id, error: e.message });
                }
            } else {
                stats.sites_skipped++;
            }
        }
    }
}

async function runBackfill(env) {
    const stats = {
        sites_total: 0,
        sites_translated: 0,
        sites_skipped: 0,
        categories_total: 0,
        categories_translated: 0,
        categories_skipped: 0,
    };
    const errors = [];

    await translateCategories(env, stats, errors);
    await translateSites(env, stats, errors);

    await markHomeCacheDirty(env, 'all');

    return { stats, errors };
}

function respond(result) {
    return new Response(JSON.stringify({
        code: 200,
        message: 'Backfill completed',
        data: result
    }, null, 2), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

function notReady() {
    return new Response(JSON.stringify({
        code: 500,
        message: 'Workers AI binding (env.AI) not found. Please bind AI in Cloudflare Pages settings first.'
    }, null, 2), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

export async function onRequestGet(context) {
    const { env } = context;
    if (!env || !env.AI) return notReady();
    try {
        const result = await runBackfill(env);
        return respond(result);
    } catch (e) {
        return errorResponse(`Backfill failed: ${e.message}`, 500);
    }
}

export async function onRequestPost(context) {
    const { env } = context;
    if (!env || !env.AI) return notReady();
    try {
        const result = await runBackfill(env);
        return respond(result);
    } catch (e) {
        return errorResponse(`Backfill failed: ${e.message}`, 500);
    }
}
