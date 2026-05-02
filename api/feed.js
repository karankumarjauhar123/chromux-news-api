// Firebase Configuration
const FIREBASE_DB_URL = "https://chromux-news-default-rtdb.firebaseio.com/";

function mixVideosIntoFeed(articles, videos) {
    if (!videos || videos.length === 0) return articles;
    const mixed = [];
    let vidIdx = 0;
    for (let i = 0; i < articles.length; i++) {
        mixed.push(articles[i]);
        if ((i + 1) % 5 === 0 && vidIdx < videos.length) {
            mixed.push(videos[vidIdx]);
            vidIdx++;
        }
    }
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
 *   psrc  = comma-separated preferred sources (learned from user behavior)
 */
module.exports = async function handler(req, res) {
    const category = (req.query.cat || 'all').toLowerCase();
    const page = Math.max(1, parseInt(req.query.p || '1', 10));
    const lang = (req.query.lang || 'all').toLowerCase();
    const boostRaw = req.query.boost || '';
    const psrcRaw = req.query.psrc || '';
    const preferredSources = psrcRaw ? psrcRaw.split(',').map(s => s.trim()) : [];
    const perPage = 30;

    // 1. FAST READ FROM FIREBASE
    let fbData = null;
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000); // 4s max wait
        const response = await fetch(`${FIREBASE_DB_URL}news.json`, {
            signal: controller.signal
        });
        clearTimeout(timer);
        if (response.ok) {
            fbData = await response.json();
        }
    } catch (e) {
        console.error("Firebase Read Error", e);
    }

    if (!fbData || !fbData.categories) {
        // Fallback: If DB is empty or fails, return empty gracefully. 
        // Real app will retry.
        return res.status(200).json({ v: 4, ts: Date.now(), page: 1, totalPages: 1, total: 0, articles: [] });
    }

    // 2. GET BASE ARTICLES
    let baseArticles = [];
    if (lang === 'hi' || lang === 'en') {
        // User strictly wants a language
        baseArticles = fbData.languages[lang] || [];
        if (category !== 'all' && category !== 'trending') {
            baseArticles = baseArticles.filter(a => a.c === category);
        } else if (category === 'trending') {
            baseArticles = baseArticles.filter(a => a.tr > 0);
        }
    } else {
        // Language 'all' -> select by category
        if (category === 'trending') {
            baseArticles = (fbData.categories['all'] || []).filter(a => a.tr > 0);
        } else {
            baseArticles = fbData.categories[category] || fbData.categories['all'] || [];
        }
    }

    let videoArticles = fbData.videos || [];
    if (lang !== 'all') videoArticles = videoArticles.filter(v => v.l === lang);
    if (category !== 'all' && category !== 'trending') videoArticles = videoArticles.filter(v => v.c === category);

    // 3. APPLY USER PERSONALIZATION ON THE FLY
    // Because data is already fetched, personalization is instant (< 10ms)
    
    // User Preference Bonus: Give bump to articles from preferred sources
    if (preferredSources.length > 0) {
        baseArticles.forEach(a => {
            if (preferredSources.includes(a.s)) {
                // To avoid breaking the existing sort entirely, we just move preferred items up slightly
                a._boost = 1;
            } else {
                a._boost = 0;
            }
        });
        // Stable sort: keep relative order, but boost preferred
        baseArticles.sort((a, b) => {
            if (a._boost === b._boost) return 0;
            return b._boost - a._boost;
        });
    }

    // Category Boost Bonus
    if (boostRaw && category === 'all') {
        const boostCats = boostRaw.split(',').map(c => c.trim().toLowerCase());
        const boosted = baseArticles.filter(a => boostCats.includes(a.c));
        const rest = baseArticles.filter(a => !boostCats.includes(a.c));
        baseArticles = [];
        let bIdx = 0, rIdx = 0;
        // Interleave: 2 boosted, 1 normal
        while (bIdx < boosted.length || rIdx < rest.length) {
            if (bIdx < boosted.length) baseArticles.push(boosted[bIdx++]);
            if (bIdx < boosted.length) baseArticles.push(boosted[bIdx++]);
            if (rIdx < rest.length) baseArticles.push(rest[rIdx++]);
        }
    }

    // 4. MIX VIDEOS
    const mixedFeed = mixVideosIntoFeed(baseArticles, videoArticles.slice(0, 15));

    // 5. PAGINATION
    const totalPages = Math.ceil(mixedFeed.length / perPage);
    const paginated = mixedFeed.slice((page - 1) * perPage, page * perPage);

    // 6. VERCEL EDGE CACHE
    // This is the shield! 300s (5 mins) CDN cache, 120s stale revalidate.
    // If 1 million users request the same page, Vercel hits Firebase exactly ONCE.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=120');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Total-Cached-Articles', fbData.meta ? fbData.meta.totalArticles : 0);
    res.setHeader('X-Articles-Sent', paginated.length);

    res.status(200).json({
        v: 4,
        ts: fbData.meta ? fbData.meta.lastUpdate : Date.now(),
        page: page,
        totalPages: totalPages,
        total: mixedFeed.length,
        articles: paginated
    });
};
