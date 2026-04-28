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
    'Nature': 3, 'NASA': 3, 'BBC Hindi': 3, 'DW English': 3,
    // Tier 3 — Premium India
    'Times of India': 3, 'Hindustan Times': 3, 'Indian Express': 3,
    'NDTV': 3, 'NDTV India': 3, 'The Hindu': 3, 'India Today': 3,
    'Economic Times': 3, 'Aaj Tak': 3, 'Dainik Jagran': 3,
    'Navbharat Times': 3, 'Dainik Bhaskar': 3,
    // Tier 3 — Premium Tech
    'TechCrunch': 3, 'The Verge': 3, 'Ars Technica': 3, 'Wired': 3,
    // Tier 2 — Established
    'Zee News': 2, 'ABP News': 2, 'Amar Ujala': 2,
    'Live Hindustan': 2, 'India TV Hindi': 2, 'News18 Hindi': 2,
    'TV9 Bharatvarsh': 2, 'News18 English': 2,
    'Business Standard': 2, 'Moneycontrol': 2, 'LiveMint': 2,
    'CNBC': 2, 'Forbes': 2, 'ESPN Cricket': 2, 'Sky Sports': 2,
    'France 24': 2, 'Variety': 2, 'Hollywood Reporter': 2, 'IGN': 2,
    'Android Authority': 2, 'CNET': 2,
    'NDTV Sports': 2, 'Scroll.in': 2, 'The Wire': 2, 'Firstpost': 2,
    'The Tribune': 2, 'Mint': 2, 'The Print': 2,
    'Scientific American': 2, 'Space.com': 2,
    'Sportskeeda Hindi': 2, 'VentureBeat': 2, 'Gadgets 360': 2,
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
//  Final = Freshness×0.35 + Quality×0.25 + Trending×0.25 + UserPref×0.15
// ============================================================
function computeRankScore(article, now, preferredSources) {
    const freshness = computeFreshnessScore(article.p, now);
    const quality = computeQualityScore(article);
    const trending = computeTrendingScore(article);

    // User preference bonus: +10 if source is user's preferred
    let userPref = 0;
    if (preferredSources && preferredSources.length > 0) {
        if (preferredSources.includes(article.s)) userPref = 10;
    }

    return (freshness * 0.35) + (quality * 0.25) + (trending * 0.25) + (userPref * 0.15);
}

// ============================================================
//  🤖 TF-IDF ENGINE — Information Retrieval-grade similarity
//  Pure math, zero libraries. Used by Google's early search.
//  
//  TF  = Term Frequency (how often a word appears in a title)
//  IDF = Inverse Document Frequency (how rare a word is globally)
//  TF-IDF = TF × IDF (rare important words score highest)
// ============================================================

// Stopwords to ignore (Hindi + English)
const STOPWORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to',
    'for', 'of', 'with', 'and', 'or', 'but', 'not', 'has', 'had', 'have',
    'this', 'that', 'from', 'by', 'it', 'its', 'be', 'as', 'do', 'does',
    'will', 'would', 'can', 'could', 'may', 'should', 'just', 'also',
    'been', 'being', 'than', 'into', 'over', 'after', 'before', 'about',
    'more', 'most', 'very', 'here', 'there', 'when', 'where', 'what',
    'how', 'all', 'each', 'every', 'both', 'few', 'some', 'any', 'other',
    'ka', 'ke', 'ki', 'se', 'me', 'hai', 'hain', 'ne', 'ko', 'par',
    'ye', 'wo', 'yeh', 'woh', 'aur', 'ya', 'bhi', 'ek', 'kya', 'ho',
    'tha', 'the', 'thi', 'mein', 'koi', 'kuch', 'bahut', 'jab', 'tab',
    'agar', 'lekin', 'phir', 'abhi', 'yaha', 'waha', 'jaise', 'hota',
    'kare', 'karna', 'kiya', 'gaya', 'gayi', 'hoga', 'hogi', 'raha',
    'says', 'said', 'new', 'news', 'update', 'latest', 'breaking',
    'report', 'reports', 'today', 'now', 'get', 'gets', 'got',
]);

/**
 * Tokenize a title into meaningful words
 * Keeps: Hindi (Devanagari), English, numbers
 * Removes: punctuation, stopwords, short words
 * Applies: lightweight stemming + synonym expansion
 */

// Lightweight English stemmer (Porter-style suffix stripping)
// Not a full Porter stemmer but handles 90% of news headline variations
function stem(word) {
    if (word.length < 4) return word;
    // Only stem English words (skip Devanagari)
    if (/[\u0900-\u097F]/.test(word)) return word;

    return word
        .replace(/ies$/, 'y')       // countries → country
        .replace(/sses$/, 'ss')     // addresses → address
        .replace(/ness$/, '')       // darkness → dark
        .replace(/ment$/, '')       // government → govern
        .replace(/ing$/, '')        // meeting → meet, hosting → host
        .replace(/tion$/, '')       // election → elec
        .replace(/sion$/, '')       // explosion → explo
        .replace(/ated$/, '')       // celebrated → celebr
        .replace(/ised$/, '')       // surprised → surpr
        .replace(/ized$/, '')       // realized → real
        .replace(/ally$/, '')       // finally → fin
        .replace(/ful$/, '')        // powerful → power
        .replace(/ous$/, '')        // dangerous → danger
        .replace(/ive$/, '')        // massive → mass
        .replace(/able$/, '')       // remarkable → remark
        .replace(/ible$/, '')       // possible → poss
        .replace(/ical$/, '')       // political → polit
        .replace(/edly$/, '')       // reportedly → report
        .replace(/ed$/, '')         // killed → kill, surged → surg
        .replace(/ly$/, '')         // recently → recent
        .replace(/er$/, '')         // bigger → bigg
        .replace(/es$/, '')         // shares → shar
        .replace(/s$/, '');         // stocks → stock
}

// Synonym groups — map different words to same canonical form
const SYNONYMS = {
    // Leadership
    'president': 'leader', 'pm': 'leader', 'prime': 'leader', 'minister': 'leader',
    'chief': 'leader', 'chairman': 'leader', 'ceo': 'leader',
    // Actions
    'meet': 'meet', 'host': 'meet', 'visit': 'meet', 'summit': 'meet',
    'talk': 'meet', 'discuss': 'meet', 'bilateral': 'meet',
    // Financial
    'surg': 'rise', 'jump': 'rise', 'soar': 'rise', 'rally': 'rise', 'gain': 'rise',
    'climb': 'rise', 'rise': 'rise', 'increas': 'rise',
    'crash': 'fall', 'drop': 'fall', 'plunge': 'fall', 'sink': 'fall',
    'fall': 'fall', 'declin': 'fall', 'tumbl': 'fall',
    'stock': 'share', 'share': 'share', 'equity': 'share',
    'earn': 'profit', 'profit': 'profit', 'revenue': 'profit', 'quarter': 'profit',
    // Violence/Disaster
    'kill': 'kill', 'die': 'kill', 'dead': 'kill', 'death': 'kill', 'slay': 'kill',
    'injure': 'hurt', 'wound': 'hurt', 'hurt': 'hurt',
    'earthquake': 'quake', 'quake': 'quake', 'tremor': 'quake', 'seismic': 'quake',
    'flood': 'flood', 'waterlog': 'flood', 'deluge': 'flood',
    // Sports
    'beat': 'win', 'defeat': 'win', 'win': 'win', 'victory': 'win', 'triumph': 'win',
    'wicket': 'cricket', 'cricket': 'cricket', 'test': 'cricket', 'odi': 'cricket',
    // Tech
    'launch': 'release', 'unveil': 'release', 'announc': 'release', 'release': 'release',
    'reveal': 'release', 'introduc': 'release',
    // Places
    'white': 'whitehouse', 'house': 'whitehouse',
};

function applySynonym(stemmedWord) {
    return SYNONYMS[stemmedWord] || stemmedWord;
}

function tokenize(text) {
    if (!text) return [];
    return text.toLowerCase()
        .replace(/[^\w\s\u0900-\u097F]/g, ' ')  // Keep Devanagari + alphanumeric
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOPWORDS.has(w))
        .map(w => applySynonym(stem(w)));  // Stem + Synonym expansion
}

/**
 * Build TF-IDF vectors for a corpus of documents.
 * Returns an array of sparse vectors (objects with term:weight).
 *
 * @param {string[]} documents - Array of title strings
 * @returns {{ vectors: Object[], idf: Object }}
 */
function buildTfIdf(documents) {
    const N = documents.length;
    if (N === 0) return { vectors: [], idf: {} };

    // Step 1: Tokenize all documents
    const tokenized = documents.map(doc => tokenize(doc));

    // Step 2: Compute Document Frequency (DF)
    // DF[term] = number of documents containing that term
    const df = {};
    for (const tokens of tokenized) {
        const uniqueTerms = new Set(tokens);
        for (const term of uniqueTerms) {
            df[term] = (df[term] || 0) + 1;
        }
    }

    // Step 3: Compute IDF = log(N / DF)
    // Rare words get high IDF, common words get low IDF
    const idf = {};
    for (const term in df) {
        idf[term] = Math.log((N + 1) / (df[term] + 1)) + 1; // Smoothed IDF
    }

    // Step 4: Compute TF-IDF vector for each document
    const vectors = tokenized.map(tokens => {
        if (tokens.length === 0) return {};

        // TF = count of term / total terms in document
        const tf = {};
        for (const term of tokens) {
            tf[term] = (tf[term] || 0) + 1;
        }
        const totalTerms = tokens.length;

        // TF-IDF = TF × IDF
        const vector = {};
        for (const term in tf) {
            vector[term] = (tf[term] / totalTerms) * (idf[term] || 0);
        }
        return vector;
    });

    return { vectors, idf };
}

/**
 * Cosine Similarity between two TF-IDF vectors.
 * Measures the angle between vectors — 1.0 = identical, 0.0 = unrelated.
 *
 * This is mathematically equivalent to what search engines use.
 */
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    // Iterate over the smaller vector for efficiency
    const [smaller, larger] = Object.keys(vecA).length <= Object.keys(vecB).length
        ? [vecA, vecB] : [vecB, vecA];

    for (const term in smaller) {
        if (term in larger) {
            dotProduct += smaller[term] * larger[term];
        }
        magnitudeA += smaller[term] * smaller[term];
    }
    for (const term in larger) {
        magnitudeB += larger[term] * larger[term];
    }
    // Add remaining terms from smaller to magnitudeA (if iterated over smaller first)
    // Actually we need full magnitudes
    magnitudeA = 0;
    magnitudeB = 0;
    for (const term in vecA) magnitudeA += vecA[term] * vecA[term];
    for (const term in vecB) magnitudeB += vecB[term] * vecB[term];

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
}

// ============================================================
//  🔄 SMART DEDUPLICATION — TF-IDF + Cosine + URL Dedup
// ============================================================

function findTrendingAndDedup(allArticles) {
    if (!allArticles || allArticles.length === 0) return [];

    const validArticles = allArticles.filter(a => a && a.t);
    if (validArticles.length === 0) return [];

    // ── PHASE 1: URL-based dedup (exact same article from different aggregators)
    const urlMap = new Map();
    const urlDeduped = [];
    for (const art of validArticles) {
        const normalizedUrl = (art.l || '').toLowerCase().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '');
        if (normalizedUrl && urlMap.has(normalizedUrl)) {
            // Merge as alt source of existing article
            const existing = urlMap.get(normalizedUrl);
            if (!existing._altSrcs) existing._altSrcs = [];
            existing._altSrcs.push(art.s);
        } else {
            if (normalizedUrl) urlMap.set(normalizedUrl, art);
            urlDeduped.push(art);
        }
    }

    // ── PHASE 2: TF-IDF Cosine Similarity (semantic dedup)
    const titles = urlDeduped.map(a => a.t);
    const { vectors } = buildTfIdf(titles);

    const used = new Set();
    const groups = [];

    for (let i = 0; i < urlDeduped.length; i++) {
        if (used.has(i)) continue;

        const group = [urlDeduped[i]];
        used.add(i);

        // Skip if vector is empty (title was all stopwords)
        if (Object.keys(vectors[i]).length === 0) {
            groups.push(group);
            continue;
        }

        for (let j = i + 1; j < urlDeduped.length; j++) {
            if (used.has(j)) continue;
            if (Object.keys(vectors[j]).length === 0) continue;

            const similarity = cosineSimilarity(vectors[i], vectors[j]);

            // Cosine > 0.35 = same story (TF-IDF is much more accurate than Jaccard)
            if (similarity > 0.35) {
                group.push(urlDeduped[j]);
                used.add(j);
            }
        }
        groups.push(group);
    }

    // ── PHASE 3: Pick best article from each group, mark trending
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

        // Collect alt sources from both URL dedup and title dedup
        const altSources = new Set();
        if (mainArt._altSrcs) {
            mainArt._altSrcs.forEach(s => altSources.add(s));
            delete mainArt._altSrcs;
        }
        if (group.length > 1) {
            group.slice(1).forEach(x => altSources.add(x.s));
        }

        if (altSources.size > 0) {
            mainArt.as = [...altSources];
            const totalSources = altSources.size + 1; // +1 for main article
            if (totalSources >= 5) mainArt.tr = 2;       // 🔴 BREAKING
            else if (totalSources >= 3) mainArt.tr = 1;   // 🔥 TRENDING
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

    // 🖼️ CROSS-SOURCE IMAGE DEDUP — Detect repeated logos that slipped through blocklist
    // If the same image URL appears in 3+ articles, it's a channel logo, not article content
    if (finalArticles.length > 5) {
        const imgCount = {};
        for (const art of finalArticles) {
            if (art.i && typeof art.i === 'string' && art.i.length > 10) {
                // Normalize: strip wsrv wrapper to compare raw source URLs
                let rawImg = art.i;
                if (rawImg.includes('wsrv.nl')) {
                    try {
                        const match = rawImg.match(/[?&]url=([^&]+)/);
                        if (match) rawImg = decodeURIComponent(match[1]);
                    } catch (_) {}
                }
                const key = rawImg.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
                imgCount[key] = (imgCount[key] || 0) + 1;
            }
        }
        // Collect keys appearing 3+ times
        const logoImgKeys = new Set();
        for (const [key, count] of Object.entries(imgCount)) {
            if (count >= 3) logoImgKeys.add(key);
        }
        if (logoImgKeys.size > 0) {
            console.log(`[ImageDedup] Nulling ${logoImgKeys.size} repeated logo image(s) found in 3+ articles`);
            for (const art of finalArticles) {
                if (art.i) {
                    let rawImg = art.i;
                    if (rawImg.includes('wsrv.nl')) {
                        try {
                            const match = rawImg.match(/[?&]url=([^&]+)/);
                            if (match) rawImg = decodeURIComponent(match[1]);
                        } catch (_) {}
                    }
                    const key = rawImg.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
                    if (logoImgKeys.has(key)) {
                        art.i = null; // Clear logo — client will show branded fallback
                    }
                }
            }
        }
    }

    // 🏆 SMART RANKING — Combined score with user preferences
    const now = Date.now();
    finalArticles.forEach(a => {
        a._rank = computeRankScore(a, now, preferredSources);
    });
    finalArticles.sort((a, b) => b._rank - a._rank);
    // Clean up internal field before sending
    finalArticles.forEach(a => { delete a._rank; });

    // 🔀 SOURCE DIVERSITY — Prevent same source appearing 3+ times in a row
    if (finalArticles.length > 5) {
        const diversified = [];
        const lastSources = [];
        const deferred = [];

        for (const art of finalArticles) {
            const recentSame = lastSources.filter(s => s === art.s).length;
            if (recentSame >= 2) {
                deferred.push(art); // Push down, will interleave later
            } else {
                diversified.push(art);
                lastSources.push(art.s);
                if (lastSources.length > 4) lastSources.shift();
            }
        }
        // Interleave deferred articles back into the feed (not dump at end)
        if (deferred.length > 0) {
            let insertIdx = 3; // Start inserting after position 3
            for (const d of deferred) {
                if (insertIdx >= diversified.length) {
                    diversified.push(d);
                } else {
                    diversified.splice(insertIdx, 0, d);
                }
                insertIdx += 3; // Space them out every 3 positions
            }
        }
        finalArticles = diversified;
    }
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
