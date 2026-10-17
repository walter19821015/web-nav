// functions/api/admin/backfill-translations.js
// 一次性 backfill：把现有 sites/category 的中文字段过 Workers AI 翻成英文
// 调用：POST /api/admin/backfill-translations（需 admin 认证）
import { isAdminAuthenticated, errorResponse, jsonResponse, markHomeCacheDirty } from '../../_middleware';
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

export async function onRequestPost(context) {
    const { request, env } = context;

    if (!(await isAdminAuthenticated(request, env))) {
        return errorResponse('Unauthorized', 401);
    }

    if (!env || !env.AI) {
        return errorResponse('Workers AI binding (env.AI) not found. Please bind AI in Cloudflare Pages settings first.', 500);
    }

    const stats = {
        sites_total: 0,
        sites_translated: 0,
        sites_skipped: 0,
        categories_total: 0,
        categories_translated: 0,
        categories_skipped: 0,
    };
    const errors = [];

    try {
        await translateCategories(env, stats, errors);
        await translateSites(env, stats, errors);

        // 翻译完成 -> 标记首页缓存失效
        await markHomeCacheDirty(env, 'all');

        return jsonResponse({
            code: 200,
            message: 'Backfill completed',
            data: { stats, errors }
        });
    } catch (e) {
        return errorResponse(`Backfill failed: ${e.message}`, 500);
    }
}
