// functions/api/admin/ai-debug.js
// 临时诊断端点：检查 env.AI 绑定、模型名、能不能调通
// 调通后可以删
import { resolveWorkersAiModel } from '../../lib/workers-ai-models';

export async function onRequestGet(context) {
    const { env } = context;

    const result = {
        hasAI: false,
        aiType: typeof env?.AI,
        aiKeys: env?.AI ? Object.keys(env.AI) : [],
        envModel: env?.WORKERS_AI_MODEL || null,
        resolvedModel: null,
        testSuccess: null,
        testError: null,
        testResponseExcerpt: null,
        note: 'TEMP DEBUG — 无需登录，问题查完后会加回 isAdminAuthenticated 并删掉本文件',
    };

    result.hasAI = !!env?.AI;

    if (!result.hasAI) {
        result.message = 'env.AI is NOT defined. Check Cloudflare Pages → Settings → Bindings → Workers AI → variable name must be "AI" (uppercase).';
        return new Response(JSON.stringify(result, null, 2), {
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
    }

    result.resolvedModel = resolveWorkersAiModel(env.WORKERS_AI_MODEL);

    try {
        const response = await env.AI.run(result.resolvedModel, {
            messages: [
                { role: 'system', content: 'You are a translator. Reply with just the word OK.' },
                { role: 'user', content: 'Test' }
            ]
        });
        result.testSuccess = true;
        const text = typeof response === 'string'
            ? response
            : JSON.stringify(response);
        result.testResponseExcerpt = String(text).slice(0, 500);
    } catch (e) {
        result.testSuccess = false;
        result.testError = e?.message || String(e);
    }

    return new Response(JSON.stringify(result, null, 2), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}
