const { sources } = require('../lib/sources');
const { parseFeed } = require('../lib/parser');

// ============================================================
//  🏆 SOURCE CREDIBILITY TIERS
//  Tier 3 = Premium (international/national flagships)
//  Tier 2 = Established (well-known, reliable)
//  Tier 1 = Standard (smaller/niche but legitimate)
// ============================================================
const SOURCE_TIERS = {
    // Tier 3 — Premium International
    'BBC News': 3, 'Reuters': 3, 'The Guardian': 3, 'CNN': 3,
    'Al Jazeera': 3, 'Associated Press': 3, 'NY Times World': 3,
    'Washington Post': 3, 'Bloomberg': 3, 'TIME': 3, 'NPR World': 3,
    'Nature': 3, 'NASA': 3, 'BBC Hindi': 3,
    // Tier 3 — Premium India
    'Times of India': 3, 'Hindustan Times': 3, 'Indian Express': 3,
    'NDTV': 3, 'NDTV India': 3, 'The Hindu': 3, 'India Today': 3,
    'Economic Times': 3, 'Aaj Tak': 3, 'Dainik Jagran': 3,
    'Navbharat Times': 3, 'Dainik Bhaskar': 3,
    // Tier 3 — Premium Tech
    'TechCrunch': 3, 'The Verge': 3, 'Ars Technica': 3, 'Wired': 3,
    // Tier 2 — Established
    'Zee News Hindi': 2, 'ABP News': 2, 'Amar Ujala': 2,
    'Live Hindustan': 2, 'India TV Hindi': 2, 'News18 Hindi': 2,
    'Deccan Herald': 2, 'The Tribune': 2, 'Business Standard': 2,
    'CNBC': 2, 'Forbes': 2, 'ESPN Cricket': 2, 'Sky Sports': 2,
    'France 24': 2, 'DW English': 2, 'DW Hindi': 2,
    'Variety': 2, 'Hollywood Reporter': 2, 'IGN': 2,
    'Android Authority': 2, 'Engadget': 2, 'CNET': 2,
    'Moneycontrol': 2, 'LiveMint': 2, 'Financial Express': 2,
    'NDTV Sports': 2, 'Scroll.in': 2, 'The Wire': 2, 'Firstpost': 2,
    'Patrika': 2, 'TV9 Bharatvarsh': 2, 'News18 English': 2,
    'Scientific American': 2, 'Space.com': 2,
};

function getSourceTier(sourceName) {
    return SOURCE_TIERS[sourceName] || 1;
}

// ============================================================
//  📊 QUALITY SCORING
//  Rates each article 0-10 based on content completeness
// ============================================================
function computeQualityScore(article) {
    let score = 0;

    // Has image? (+3) — Articles with images get much more engagement
    if (article.i && article.i.length > 10) score += 3;

    // Description richness (+0 to +3)
    const descLen = (article.d || '').length;
    if (descLen > 150) score += 3;
    else if (descLen > 80) score += 2;
    else if (descLen > 20) score += 1;

    // Title quality (+0 to +2)
    const titleLen = (article.t || '').length;
    if (titleLen > 40 && titleLen < 140) score += 2;  // Good headline length
    else if (titleLen > 20) score += 1;

    // Source credibility (+0 to +2)
    const tier = getSourceTier(article.s);
    if (tier === 3) score += 2;
    else if (tier === 2) score += 1;

    return score; // Max = 10
}

// ============================================================
//  ⏱️ FRESHNESS SCORING
//  Exponential decay — newer articles score higher
// ============================================================
function computeFreshnessScore(publishTimestamp, now) {
    const ageMs = now - publishTimestamp;
    const ageHours = ageMs / (1000 * 60 * 60);

    if (ageHours < 1) return 10;      // < 1 hour = perfect
    if (ageHours < 3) return 9;       // 1-3 hours
    if (ageHours < 6) return 8;       // 3-6 hours
    if (ageHours < 12) return 7;      // 6-12 hours
    if (ageHours < 24) return 5;      // 12-24 hours
    if (ageHours < 48) return 3;      // 1-2 days
    return 1;                          // older
}

// ============================================================
//  🔥 TRENDING BONUS
// ============================================================
function computeTrendingScore(article) {
    if (article.tr === 2) return 10;   // Breaking
    if (article.tr === 1) return 7;    // Trending
    const altCount = (article.as || []).length;
    if (altCount >= 2) return 4;       // Multi-source
    return 0;
}

// ============================================================
//  🧠 SMART RANKING — Combined Score
//  Final = Freshness×0.40 + Quality×0.30 + Trending×0.30
// ============================================================
function computeRankScore(article, now) {
    const freshness = computeFreshnessScore(article.p, now);
    const quality = computeQualityScore(article);
    const trending = computeTrendingScore(article);

    return (freshness * 0.40) + (quality * 0.30) + (trending * 0.30);
}

// ============================================================
//  🔄 SMART DEDUPLICATION — Word-based Jaccard Similarity
//  Much better than the old "first 30 chars" approach
// ============================================================

// Stopwords to ignore during comparison (Hindi + English)
const STOPWORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to',
    'for', 'of', 'with', 'and', 'or', 'but', 'not', 'has', 'had', 'have',
    'this', 'that', 'from', 'by', 'it', 'its', 'be', 'as', 'do', 'does',
    'will', 'would', 'can', 'could', 'may', 'should', 'just', 'also',
    'ka', 'ke', 'ki', 'se', 'me', 'hai', 'hain', 'ne', 'ko', 'par',
    'ka', 'ki', 'ke', 'ye', 'wo', 'yeh', 'woh', 'aur', 'ya', 'bhi',
    'ek', 'is', 'us', 'un', 'in', 'kya', 'ho', 'tha', 'the', 'thi',
    'nach', 'über', 'und', 'bei', 'wie', 'nach', 'says', 'said', 'new',
    'nach', 'news', 'update', 'latest', 'breaking', 'report', 'reports',
]);

function extractKeywords(title) {
    if (!title) return new Set();
    return new Set(
        title.toLowerCase()
            .replace(/[^\w\s\u0900-\u097F]/g, ' ')  // Keep Devanagari + alphanumeric
            .split(/\s+/)
            .filter(w => w.length > 2 && !STOPWORDS.has(w))
    );
}

function jaccardSimilarity(setA, setB) {
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    for (const word of setA) {
        if (setB.has(word)) intersection++;
    }
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
}

function findTrendingAndDedup(allArticles) {
    if (!allArticles || allArticles.length === 0) return [];

    // Pre-compute keywords for each article
    const articlesWithKeywords = allArticles
        .filter(a => a && a.t)
        .map(a => ({ article: a, keywords: extractKeywords(a.t) }));

    // Group similar articles using Jaccard similarity
    const used = new Set();
    const groups = [];

    for (let i = 0; i < articlesWithKeywords.length; i++) {
        if (used.has(i)) continue;

        const group = [articlesWithKeywords[i].article];
        used.add(i);

        for (let j = i + 1; j < articlesWithKeywords.length; j++) {
            if (used.has(j)) continue;

            const sim = jaccardSimilarity(
                articlesWithKeywords[i].keywords,
                articlesWithKeywords[j].keywords
            );

            // Similarity > 0.30 = same story from different source
            // (English titles rephrase heavily, so we need a lower threshold)
            if (sim > 0.30) {
                group.push(articlesWithKeywords[j].article);
                used.add(j);
            }
        }
        groups.push(group);
    }

    // Pick best article from each group, mark trending
    const now = Date.now();
    const dedupedLineup = [];

    for (const group of groups) {
        // Sort group by quality + freshness to pick the BEST version
        group.sort((a, b) => {
            const scoreA = computeQualityScore(a) + computeFreshnessScore(a.p, now);
            const scoreB = computeQualityScore(b) + computeFreshnessScore(b.p, now);
            return scoreB - scoreA;
        });

        const mainArt = { ...group[0] };

        if (group.length > 1) {
            const altSet = new Set(group.slice(1).map(x => x.s));
            mainArt.as = [...altSet];
            if (group.length >= 5) mainArt.tr = 2;       // 🔴 BREAKING
            else if (group.length >= 3) mainArt.tr = 1;   // 🔥 TRENDING
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

    // Safety fallback
    if (targetSources.length === 0) targetSources = sources;

    // Limit concurrent fetches
    if (targetSources.length > 60) {
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

    // 🧠 SMART DEDUP — Word-based Jaccard similarity
    let finalArticles = findTrendingAndDedup(textArticles);

    // 🏆 SMART RANKING — Combined score instead of just date
    const now = Date.now();
    finalArticles.forEach(a => {
        a._rank = computeRankScore(a, now);
    });
    finalArticles.sort((a, b) => b._rank - a._rank);
    // Clean up internal field before sending
    finalArticles.forEach(a => { delete a._rank; });

    // Sort videos by date
    videoArticles.sort((a, b) => b.p - a.p);

    // Trending filter
    if (category === 'trending') {
        finalArticles = finalArticles.filter(a => a.tr > 0);
    }

    // 🎯 PERSONALIZATION: Boost favorite categories
    if (boostRaw) {
        const boostCats = boostRaw.split(',').map(c => c.trim().toLowerCase());
        const boosted = finalArticles.filter(a => boostCats.includes(a.c));
        const rest = finalArticles.filter(a => !boostCats.includes(a.c));
        finalArticles = [];
        let bIdx = 0, rIdx = 0;
        while (bIdx < boosted.length || rIdx < rest.length) {
            if (bIdx < boosted.length) finalArticles.push(boosted[bIdx++]);
            if (bIdx < boosted.length) finalArticles.push(boosted[bIdx++]);
            if (rIdx < rest.length) finalArticles.push(rest[rIdx++]);
        }
    }

    // Mix videos into feed
    const mixedFeed = mixVideosIntoFeed(finalArticles, videoArticles.slice(0, 15));

    // Pagination
    const totalPages = Math.ceil(mixedFeed.length / perPage);
    const paginated = mixedFeed.slice((page - 1) * perPage, page * perPage);

    // VERCEL EDGE CACHE
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=120');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Total-Sources', targetSources.length);
    res.setHeader('X-Articles-Found', mixedFeed.length);

    res.status(200).json({
        v: 3,
        ts: TS,
        page: page,
        totalPages: totalPages,
        total: mixedFeed.length,
        articles: paginated
    });
};
