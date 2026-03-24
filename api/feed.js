const { sources } = require('../lib/sources');
const { parseFeed } = require('../lib/parser');

/**
 * Deduplication + Trending Detection
 * Groups similar articles (first 30 chars of title) and marks trending/breaking
 */
function findTrendingAndDedup(allArticles) {
    const groups = {};
    for (const a of allArticles) {
        if (!a || !a.t) continue;
        // Normalize: lowercase, remove special chars, first 30 chars
        const key = a.t.toLowerCase().replace(/[^\w\s]/g, '').substring(0, 30).trim();
        if (!key) continue;
        if (!groups[key]) groups[key] = [];
        groups[key].push(a);
    }

    const dedupedLineup = [];
    for (const key in groups) {
        const group = groups[key];
        group.sort((x, y) => y.p - x.p);
        const mainArt = { ...group[0] };
        if (group.length > 1) {
            // Collect unique alt sources
            const altSet = new Set(group.slice(1).map(x => x.s));
            mainArt.as = [...altSet];
            if (group.length >= 5) mainArt.tr = 2; // 🔴 BREAKING
            else if (group.length >= 3) mainArt.tr = 1; // 🔥 TRENDING
        }
        dedupedLineup.push(mainArt);
    }
    return dedupedLineup;
}

/**
 * Mix videos into the feed at regular intervals
 * Every 5th item becomes a video (if available)
 */
function mixVideosIntoFeed(articles, videos) {
    if (videos.length === 0) return articles;

    const mixed = [];
    let vidIdx = 0;

    for (let i = 0; i < articles.length; i++) {
        mixed.push(articles[i]);

        // After every 5 articles, insert a video
        if ((i + 1) % 5 === 0 && vidIdx < videos.length) {
            mixed.push(videos[vidIdx]);
            vidIdx++;
        }
    }

    // Append remaining videos at the end
    while (vidIdx < videos.length) {
        mixed.push(videos[vidIdx]);
        vidIdx++;
    }

    return mixed;
}

/**
 * Main API Handler
 * 
 * Query params:
 *   cat   = category (all, india, world, technology, sports, etc.)
 *   p     = page number (1, 2, 3...)
 *   lang  = language filter (hi, en, all)  [DEFAULT: all]
 *   boost = comma-separated categories to boost (personalization)
 *           e.g. boost=sports,technology → these categories appear first
 */
module.exports = async function handler(req, res) {
    const category = (req.query.cat || 'all').toLowerCase();
    const page = Math.max(1, parseInt(req.query.p || '1', 10));
    const lang = (req.query.lang || 'all').toLowerCase();
    const boostRaw = req.query.boost || '';
    const perPage = 30;

    // Filter sources by category
    let targetSources = sources;
    if (category !== 'all' && category !== 'trending') {
        targetSources = sources.filter(s => s.category === category);
    }

    // Filter by language
    if (lang !== 'all') {
        const langFiltered = targetSources.filter(s => s.language === lang);
        if (langFiltered.length > 0) targetSources = langFiltered;
    }

    // Safety: at least use all sources if filter is too aggressive
    if (targetSources.length === 0) targetSources = sources;

    // Limit concurrent fetches to 60 for speed
    if (targetSources.length > 60) {
        // Prioritize: shuffle and take 60
        targetSources = targetSources.sort(() => Math.random() - 0.5).slice(0, 60);
    }

    const TS = Date.now();
    let textArticles = [];
    let videoArticles = [];

    // Parallel fetch with timeout
    const promises = targetSources.map(async (source) => {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 8000);
            const response = await fetch(source.url, {
                signal: controller.signal,
                headers: { 'User-Agent': 'Chromux-NewsBot/2.0' }
            });
            clearTimeout(timer);

            if (response.ok) {
                const xml = await response.text();
                return { items: parseFeed(xml, source), isVideo: source.type === 'video' };
            }
        } catch (error) {
            // Silently skip failed sources
        }
        return { items: [], isVideo: false };
    });

    const results = await Promise.allSettled(promises);
    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.items.length > 0) {
            if (result.value.isVideo) {
                videoArticles.push(...result.value.items);
            } else {
                textArticles.push(...result.value.items);
            }
        }
    });

    // Deduplicate text articles
    let finalArticles = findTrendingAndDedup(textArticles);

    // Sort by date
    finalArticles.sort((a, b) => b.p - a.p);
    videoArticles.sort((a, b) => b.p - a.p);

    // Trending filter
    if (category === 'trending') {
        finalArticles = finalArticles.filter(a => a.tr > 0);
    }

    // 🎯 PERSONALIZATION: Boost user's favorite categories
    if (boostRaw) {
        const boostCats = boostRaw.split(',').map(c => c.trim().toLowerCase());
        // Separate boosted and non-boosted
        const boosted = finalArticles.filter(a => boostCats.includes(a.c));
        const rest = finalArticles.filter(a => !boostCats.includes(a.c));
        // Put boosted articles first, interleaved
        finalArticles = [];
        let bIdx = 0, rIdx = 0;
        while (bIdx < boosted.length || rIdx < rest.length) {
            // 2 boosted, then 1 rest
            if (bIdx < boosted.length) finalArticles.push(boosted[bIdx++]);
            if (bIdx < boosted.length) finalArticles.push(boosted[bIdx++]);
            if (rIdx < rest.length) finalArticles.push(rest[rIdx++]);
        }
    }

    // Mix videos into text articles  
    const mixedFeed = mixVideosIntoFeed(finalArticles, videoArticles.slice(0, 15));

    // Pagination
    const totalPages = Math.ceil(mixedFeed.length / perPage);
    const paginated = mixedFeed.slice((page - 1) * perPage, page * perPage);

    // VERCEL EDGE CACHE: 15 minutes global CDN cache + stale-while-revalidate
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=120');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Total-Sources', targetSources.length);
    res.setHeader('X-Articles-Found', mixedFeed.length);

    res.status(200).json({
        v: 2,
        ts: TS,
        page: page,
        totalPages: totalPages,
        total: mixedFeed.length,
        articles: paginated
    });
};
