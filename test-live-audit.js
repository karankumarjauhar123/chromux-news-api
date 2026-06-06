/**
 * 🔍 CHROMUX NEWS — LIVE Channel-by-Channel Logo Audit
 * Fetches EVERY RSS source and checks if any logos are leaking through
 * Run: node test-live-audit.js
 */

const { parseFeed } = require('./lib/parser');
const { isLikelyLogo } = require('./lib/imageProxy');
const https = require('https');
const http = require('http');
const { sources } = require('./lib/sources');

const { fetchHttp2 } = require('./api/cron');

// Fetch URL using HTTP/2 first, fallback to standard HTTP/1.1
async function fetchUrl(url, timeoutMs = 10000) {
    try {
        const result = await fetchHttp2(url, timeoutMs);
        if (result.status !== 200 || !result.body) {
            throw new Error(`HTTP/2 returned status ${result.status}`);
        }
        return { status: result.status, body: result.body };
    } catch (e) {
        return new Promise((resolve, reject) => {
            const proto = url.startsWith('https') ? https : http;
            const req = proto.get(url, { 
                headers: { 'User-Agent': 'Chromux-NewsBot/2.0' },
                timeout: timeoutMs 
            }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    // Follow redirect
                    fetchUrl(res.headers.location, timeoutMs).then(resolve).catch(reject);
                    return;
                }
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, body: data }));
            });
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        });
    }
}

async function auditAllSources() {
    console.log('🔍 CHROMUX NEWS — LIVE Channel-by-Channel Logo Audit');
    console.log('='.repeat(80));
    console.log(`📡 Testing ${sources.length} sources...\n`);

    const results = {
        success: [],      // Sources that returned articles
        failed: [],       // Sources that failed to fetch
        withImages: [],   // Sources with articles that have images
        noImages: [],     // Sources where all articles lack images
        suspiciousLogos: [], // ⚠️ Sources where same image repeats (possible logo leak)
    };

    // Process sources in batches of 10
    const batchSize = 10;
    for (let i = 0; i < sources.length; i += batchSize) {
        const batch = sources.slice(i, i + batchSize);
        const promises = batch.map(async (source) => {
            try {
                const { status, body } = await fetchUrl(source.url);
                
                if (status !== 200 || !body || body.length < 100) {
                    results.failed.push({ name: source.name, reason: `HTTP ${status}`, lang: source.language });
                    return;
                }

                const articles = parseFeed(body, source);
                
                if (articles.length === 0) {
                    results.failed.push({ name: source.name, reason: 'No articles parsed', lang: source.language });
                    return;
                }

                results.success.push({ name: source.name, count: articles.length, lang: source.language });

                // Check images
                const withImg = articles.filter(a => a.i && a.i.length > 10);
                const noImg = articles.filter(a => !a.i || a.i.length <= 10);

                if (withImg.length === 0) {
                    results.noImages.push({ name: source.name, total: articles.length, lang: source.language });
                } else {
                    results.withImages.push({ 
                        name: source.name, 
                        total: articles.length, 
                        withImg: withImg.length, 
                        noImg: noImg.length,
                        lang: source.language
                    });
                }

                // 🔍 CRITICAL CHECK: Detect repeated images (logo leaks)
                const imgCounts = {};
                for (const art of articles) {
                    if (art.i && art.i.length > 10) {
                        // Unwrap wsrv proxy to get raw URL
                        let rawImg = art.i;
                        if (rawImg.includes('wsrv.nl')) {
                            try {
                                const match = rawImg.match(/[?&]url=([^&]+)/);
                                if (match) rawImg = decodeURIComponent(match[1]);
                            } catch (_) {}
                        }
                        const key = rawImg.toLowerCase().replace(/^https?:\/\/(www\.)?/, '');
                        imgCounts[key] = (imgCounts[key] || 0) + 1;
                    }
                }

                // If any image appears in 40%+ of articles, it's likely a logo leak
                const threshold = Math.max(2, Math.floor(articles.length * 0.4));
                for (const [imgUrl, count] of Object.entries(imgCounts)) {
                    if (count >= threshold) {
                        results.suspiciousLogos.push({
                            source: source.name,
                            imgUrl: imgUrl.substring(0, 80),
                            count: count,
                            total: articles.length,
                            pct: Math.round(count / articles.length * 100),
                            lang: source.language
                        });
                    }
                }

            } catch (err) {
                results.failed.push({ name: source.name, reason: err.message || 'Unknown error', lang: source.language });
            }
        });

        await Promise.all(promises);
        
        // Progress indicator
        const done = Math.min(i + batchSize, sources.length);
        process.stdout.write(`\r  Progress: ${done}/${sources.length} sources checked...`);
    }

    console.log('\n');

    // ═══════════ REPORT ═══════════

    // 1. Success Summary
    console.log('='.repeat(80));
    console.log(`✅ SUCCESSFULLY PARSED: ${results.success.length}/${sources.length} sources`);
    console.log('='.repeat(80));
    
    // Group by language
    const hiSuccess = results.success.filter(s => s.lang === 'hi');
    const enSuccess = results.success.filter(s => s.lang === 'en');
    console.log(`  Hindi: ${hiSuccess.length} sources | English: ${enSuccess.length} sources`);
    console.log();

    // 2. Image Coverage
    console.log('='.repeat(80));
    console.log('🖼️  IMAGE COVERAGE');
    console.log('='.repeat(80));
    for (const s of results.withImages) {
        const pct = Math.round(s.withImg / s.total * 100);
        const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
        console.log(`  ${s.lang.toUpperCase()} ${s.name.padEnd(25)} ${bar} ${pct}% (${s.withImg}/${s.total} have images)`);
    }
    console.log();

    // 3. No Images
    if (results.noImages.length > 0) {
        console.log('='.repeat(80));
        console.log(`📭 NO IMAGES AVAILABLE: ${results.noImages.length} sources`);
        console.log('='.repeat(80));
        for (const s of results.noImages) {
            console.log(`  ${s.lang.toUpperCase()} ${s.name} (${s.total} articles, 0 images)`);
        }
        console.log();
    }

    // 4. ⚠️ SUSPICIOUS LOGOS (THE KEY CHECK!)
    console.log('='.repeat(80));
    if (results.suspiciousLogos.length === 0) {
        console.log('🎉 NO LOGO LEAKS DETECTED! All channels pass the logo filter.');
    } else {
        console.log(`⚠️  SUSPICIOUS LOGO LEAKS: ${results.suspiciousLogos.length} found!`);
        console.log('='.repeat(80));
        for (const s of results.suspiciousLogos) {
            console.log(`  ❌ ${s.source} — Same image in ${s.count}/${s.total} articles (${s.pct}%)`);
            console.log(`     URL: ${s.imgUrl}...`);
        }
    }
    console.log('='.repeat(80));
    console.log();

    // 5. Failed Sources
    if (results.failed.length > 0) {
        console.log('='.repeat(80));
        console.log(`⚠️  FAILED TO FETCH: ${results.failed.length} sources (network/timeout/403)`);
        console.log('='.repeat(80));
        for (const s of results.failed) {
            console.log(`  ${s.lang ? s.lang.toUpperCase() : '??'} ${s.name}: ${s.reason}`);
        }
        console.log();
    }

    // 6. FINAL VERDICT
    console.log('='.repeat(80));
    console.log('📊 FINAL AUDIT SUMMARY');
    console.log('='.repeat(80));
    console.log(`  Total Sources:        ${sources.length}`);
    console.log(`  Successfully Parsed:  ${results.success.length}`);
    console.log(`  Failed (network):     ${results.failed.length}`);
    console.log(`  With Images:          ${results.withImages.length}`);
    console.log(`  Without Images:       ${results.noImages.length}`);
    console.log(`  Logo Leaks Found:     ${results.suspiciousLogos.length}`);
    console.log('='.repeat(80));

    if (results.suspiciousLogos.length === 0) {
        console.log('🏆 VERDICT: ALL CLEAN — No logo leaks in any channel!');
    } else {
        console.log(`🔴 VERDICT: ${results.suspiciousLogos.length} channel(s) need attention`);
    }
    console.log('='.repeat(80));
}

auditAllSources().catch(err => console.error('Audit failed:', err));
