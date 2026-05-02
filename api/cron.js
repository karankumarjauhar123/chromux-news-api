const { sources } = require('../lib/sources');
const { parseFeed } = require('../lib/parser');

// Firebase Configuration
const FIREBASE_DB_URL = "https://chromux-news-default-rtdb.firebaseio.com/";

// ============================================================
//  🏆 SOURCE CREDIBILITY TIERS
// ============================================================
const SOURCE_TIERS = {
    'BBC News': 3, 'Reuters': 3, 'The Guardian': 3, 'CNN': 3,
    'Al Jazeera': 3, 'Associated Press': 3, 'NY Times World': 3,
    'Washington Post': 3, 'Bloomberg': 3, 'TIME': 3, 'NPR World': 3,
    'Nature': 3, 'NASA': 3, 'BBC Hindi': 3, 'DW English': 3,
    'Times of India': 3, 'Hindustan Times': 3, 'Indian Express': 3,
    'NDTV': 3, 'NDTV India': 3, 'The Hindu': 3, 'India Today': 3,
    'Economic Times': 3, 'Aaj Tak': 3, 'Dainik Jagran': 3,
    'Navbharat Times': 3, 'Dainik Bhaskar': 3,
    'TechCrunch': 3, 'The Verge': 3, 'Ars Technica': 3, 'Wired': 3,
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

function getSourceTier(sourceName) { return SOURCE_TIERS[sourceName] || 1; }

function computeQualityScore(article) {
    let score = 0;
    if (article.i && article.i.length > 10) score += 3;
    const descLen = (article.d || '').length;
    if (descLen > 150) score += 3; else if (descLen > 80) score += 2; else if (descLen > 20) score += 1;
    const titleLen = (article.t || '').length;
    if (titleLen > 40 && titleLen < 140) score += 2; else if (titleLen > 20) score += 1;
    const tier = getSourceTier(article.s);
    if (tier === 3) score += 2; else if (tier === 2) score += 1;
    return score;
}

function computeFreshnessScore(publishTimestamp, now) {
    const ageHours = (now - publishTimestamp) / (1000 * 60 * 60);
    if (ageHours < 1) return 10;
    if (ageHours < 3) return 9;
    if (ageHours < 6) return 8;
    if (ageHours < 12) return 7;
    if (ageHours < 24) return 5;
    if (ageHours < 48) return 3;
    return 1;
}

function computeTrendingScore(article) {
    if (article.tr === 2) return 10;
    if (article.tr === 1) return 7;
    const altCount = (article.as || []).length;
    if (altCount >= 2) return 4;
    return 0;
}

function computeRankScore(article, now) {
    const freshness = computeFreshnessScore(article.p, now);
    const quality = computeQualityScore(article);
    const trending = computeTrendingScore(article);
    return (freshness * 0.35) + (quality * 0.25) + (trending * 0.30); // Removed userpref from global rank
}

// ============================================================
//  🤖 TF-IDF ENGINE
// ============================================================
const STOPWORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'and', 'or', 'but', 'not', 'has', 'had', 'have', 'this', 'that', 'from', 'by', 'it', 'its', 'be', 'as', 'do', 'does', 'will', 'would', 'can', 'could', 'may', 'should', 'just', 'also', 'been', 'being', 'than', 'into', 'over', 'after', 'before', 'about', 'more', 'most', 'very', 'here', 'there', 'when', 'where', 'what', 'how', 'all', 'each', 'every', 'both', 'few', 'some', 'any', 'other', 'ka', 'ke', 'ki', 'se', 'me', 'hai', 'hain', 'ne', 'ko', 'par', 'ye', 'wo', 'yeh', 'woh', 'aur', 'ya', 'bhi', 'ek', 'kya', 'ho', 'tha', 'the', 'thi', 'mein', 'koi', 'kuch', 'bahut', 'jab', 'tab', 'agar', 'lekin', 'phir', 'abhi', 'yaha', 'waha', 'jaise', 'hota', 'kare', 'karna', 'kiya', 'gaya', 'gayi', 'hoga', 'hogi', 'raha', 'says', 'said', 'new', 'news', 'update', 'latest', 'breaking', 'report', 'reports', 'today', 'now', 'get', 'gets', 'got',
]);

function stem(word) {
    if (word.length < 4) return word;
    if (/[\u0900-\u097F]/.test(word)) return word;
    return word.replace(/ies$/, 'y').replace(/sses$/, 'ss').replace(/ness$/, '').replace(/ment$/, '').replace(/ing$/, '').replace(/tion$/, '').replace(/sion$/, '').replace(/ated$/, '').replace(/ised$/, '').replace(/ized$/, '').replace(/ally$/, '').replace(/ful$/, '').replace(/ous$/, '').replace(/ive$/, '').replace(/able$/, '').replace(/ible$/, '').replace(/ical$/, '').replace(/edly$/, '').replace(/ed$/, '').replace(/ly$/, '').replace(/er$/, '').replace(/es$/, '').replace(/s$/, '');
}

const SYNONYMS = {
    'president': 'leader', 'pm': 'leader', 'prime': 'leader', 'minister': 'leader', 'chief': 'leader', 'chairman': 'leader', 'ceo': 'leader',
    'meet': 'meet', 'host': 'meet', 'visit': 'meet', 'summit': 'meet', 'talk': 'meet', 'discuss': 'meet', 'bilateral': 'meet',
    'surg': 'rise', 'jump': 'rise', 'soar': 'rise', 'rally': 'rise', 'gain': 'rise', 'climb': 'rise', 'rise': 'rise', 'increas': 'rise',
    'crash': 'fall', 'drop': 'fall', 'plunge': 'fall', 'sink': 'fall', 'fall': 'fall', 'declin': 'fall', 'tumbl': 'fall',
    'stock': 'share', 'share': 'share', 'equity': 'share',
    'earn': 'profit', 'profit': 'profit', 'revenue': 'profit', 'quarter': 'profit',
    'kill': 'kill', 'die': 'kill', 'dead': 'kill', 'death': 'kill', 'slay': 'kill',
    'injure': 'hurt', 'wound': 'hurt', 'hurt': 'hurt',
    'earthquake': 'quake', 'quake': 'quake', 'tremor': 'quake', 'seismic': 'quake',
    'flood': 'flood', 'waterlog': 'flood', 'deluge': 'flood',
    'beat': 'win', 'defeat': 'win', 'win': 'win', 'victory': 'win', 'triumph': 'win',
    'wicket': 'cricket', 'cricket': 'cricket', 'test': 'cricket', 'odi': 'cricket',
    'launch': 'release', 'unveil': 'release', 'announc': 'release', 'release': 'release', 'reveal': 'release', 'introduc': 'release',
    'white': 'whitehouse', 'house': 'whitehouse',
};

function applySynonym(stemmedWord) { return SYNONYMS[stemmedWord] || stemmedWord; }

function tokenize(text) {
    if (!text) return [];
    return text.toLowerCase().replace(/[^\w\s\u0900-\u097F]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w)).map(w => applySynonym(stem(w)));
}

function buildTfIdf(documents) {
    const N = documents.length;
    if (N === 0) return { vectors: [] };
    const tokenized = documents.map(doc => tokenize(doc));
    const df = {};
    for (const tokens of tokenized) {
        const uniqueTerms = new Set(tokens);
        for (const term of uniqueTerms) df[term] = (df[term] || 0) + 1;
    }
    const idf = {};
    for (const term in df) idf[term] = Math.log((N + 1) / (df[term] + 1)) + 1;
    const vectors = tokenized.map(tokens => {
        if (tokens.length === 0) return {};
        const tf = {};
        for (const term of tokens) tf[term] = (tf[term] || 0) + 1;
        const totalTerms = tokens.length;
        const vector = {};
        for (const term in tf) vector[term] = (tf[term] / totalTerms) * (idf[term] || 0);
        return vector;
    });
    return { vectors };
}

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0, magnitudeA = 0, magnitudeB = 0;
    const [smaller, larger] = Object.keys(vecA).length <= Object.keys(vecB).length ? [vecA, vecB] : [vecB, vecA];
    for (const term in smaller) {
        if (term in larger) dotProduct += smaller[term] * larger[term];
        magnitudeA += smaller[term] * smaller[term];
    }
    for (const term in larger) magnitudeB += larger[term] * larger[term];
    magnitudeA = 0; magnitudeB = 0;
    for (const term in vecA) magnitudeA += vecA[term] * vecA[term];
    for (const term in vecB) magnitudeB += vecB[term] * vecB[term];
    magnitudeA = Math.sqrt(magnitudeA); magnitudeB = Math.sqrt(magnitudeB);
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
}

function findTrendingAndDedup(allArticles) {
    if (!allArticles || allArticles.length === 0) return [];
    const validArticles = allArticles.filter(a => a && a.t);
    if (validArticles.length === 0) return [];

    const urlMap = new Map();
    const urlDeduped = [];
    for (const art of validArticles) {
        const normalizedUrl = (art.u || '').toLowerCase().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '');
        if (normalizedUrl && urlMap.has(normalizedUrl)) {
            const existing = urlMap.get(normalizedUrl);
            if (!existing._altSrcs) existing._altSrcs = [];
            existing._altSrcs.push(art.s);
        } else {
            if (normalizedUrl) urlMap.set(normalizedUrl, art);
            urlDeduped.push(art);
        }
    }

    const titles = urlDeduped.map(a => a.t);
    const { vectors } = buildTfIdf(titles);
    const used = new Set();
    const groups = [];

    for (let i = 0; i < urlDeduped.length; i++) {
        if (used.has(i)) continue;
        const group = [urlDeduped[i]];
        used.add(i);
        if (Object.keys(vectors[i]).length === 0) {
            groups.push(group);
            continue;
        }
        for (let j = i + 1; j < urlDeduped.length; j++) {
            if (used.has(j)) continue;
            if (Object.keys(vectors[j]).length === 0) continue;
            const similarity = cosineSimilarity(vectors[i], vectors[j]);
            if (similarity > 0.35) {
                group.push(urlDeduped[j]);
                used.add(j);
            }
        }
        groups.push(group);
    }

    const now = Date.now();
    const dedupedLineup = [];

    for (const group of groups) {
        group.sort((a, b) => {
            const scoreA = computeQualityScore(a) + computeFreshnessScore(a.p, now);
            const scoreB = computeQualityScore(b) + computeFreshnessScore(b.p, now);
            return scoreB - scoreA;
        });

        const mainArt = { ...group[0] };
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
            const totalSources = altSources.size + 1;
            if (totalSources >= 5) mainArt.tr = 2;
            else if (totalSources >= 3) mainArt.tr = 1;
        }
        dedupedLineup.push(mainArt);
    }

    return dedupedLineup;
}

// ============================================================
//  🚀 MAIN CRON HANDLER
// ============================================================
module.exports = async function handler(req, res) {
    console.log("Starting full news fetch and Firebase sync...");
    const TS = Date.now();
    
    // Simple secret check (if provided in env or query)
    if (req.query.secret && process.env.CRON_SECRET && req.query.secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    let textArticles = [];
    let videoArticles = [];

    // Fetch in chunks of 20 to prevent DNS/TCP exhaustion
    const CHUNK_SIZE = 20;
    for (let i = 0; i < sources.length; i += CHUNK_SIZE) {
        const chunk = sources.slice(i, i + CHUNK_SIZE);
        const promises = chunk.map(async (source) => {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 12000);
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
                console.error(`Fetch error for ${source.name}:`, error.message);
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
    }

    console.log(`Fetched ${textArticles.length} text articles and ${videoArticles.length} video articles.`);

    // PRE-FILTER: Keep only the top 2000 newest/best articles before heavy O(N^2) TF-IDF dedup
    const nowForFilter = Date.now();
    textArticles.forEach(a => a._preRank = computeFreshnessScore(a.p, nowForFilter) + computeQualityScore(a));
    textArticles.sort((a, b) => b._preRank - a._preRank);
    textArticles = textArticles.slice(0, 2000);
    textArticles.forEach(a => delete a._preRank);

    // Smart Dedup
    let finalArticles = findTrendingAndDedup(textArticles);
    console.log(`After dedup: ${finalArticles.length} articles.`);

    // Cross-Source Image Dedup (Remove repeated logos)
    if (finalArticles.length > 5) {
        const imgCount = {};
        for (const art of finalArticles) {
            if (art.i && typeof art.i === 'string' && art.i.length > 10) {
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
        const logoImgKeys = new Set();
        for (const [key, count] of Object.entries(imgCount)) {
            if (count >= 3) logoImgKeys.add(key);
        }
        if (logoImgKeys.size > 0) {
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
                    if (logoImgKeys.has(key)) art.i = null;
                }
            }
        }
    }

    // Global Ranking
    const now = Date.now();
    finalArticles.forEach(a => {
        a._rank = computeRankScore(a, now);
    });
    finalArticles.sort((a, b) => b._rank - a._rank);
    finalArticles.forEach(a => { delete a._rank; });

    // Diversity
    if (finalArticles.length > 5) {
        const diversified = [];
        const lastSources = [];
        const deferred = [];
        for (const art of finalArticles) {
            const recentSame = lastSources.filter(s => s === art.s).length;
            if (recentSame >= 2) deferred.push(art);
            else {
                diversified.push(art);
                lastSources.push(art.s);
                if (lastSources.length > 4) lastSources.shift();
            }
        }
        if (deferred.length > 0) {
            let insertIdx = 3;
            for (const d of deferred) {
                if (insertIdx >= diversified.length) diversified.push(d);
                else diversified.splice(insertIdx, 0, d);
                insertIdx += 3;
            }
        }
        finalArticles = diversified;
    }

    videoArticles.sort((a, b) => b.p - a.p);

    // Group Data for Firebase
    const firebaseData = {
        meta: {
            lastUpdate: TS,
            totalArticles: finalArticles.length,
            totalVideos: videoArticles.length
        },
        videos: videoArticles.slice(0, 100), // Top 100 videos
        categories: {
            all: finalArticles.slice(0, 300) // Keep top 300 globally
        }
    };

    // Group by Category
    const categories = ['india', 'world', 'technology', 'sports', 'business', 'entertainment', 'auto', 'gaming', 'health', 'science', 'politics', 'lifestyle', 'travel'];
    for (const cat of categories) {
        const catArticles = finalArticles.filter(a => a.c === cat).slice(0, 100); // Top 100 per category
        if (catArticles.length > 0) {
            firebaseData.categories[cat] = catArticles;
        }
    }

    // Group by Language
    firebaseData.languages = {
        hi: finalArticles.filter(a => a.l === 'hi').slice(0, 200),
        en: finalArticles.filter(a => a.l === 'en').slice(0, 200)
    };

    // WRITE TO FIREBASE (OVERWRITE)
    console.log("Writing to Firebase RTDB...");
    try {
        const fbRes = await fetch(`${FIREBASE_DB_URL}news.json`, {
            method: 'PUT', // PUT replaces the entire 'news' node
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(firebaseData)
        });
        
        if (!fbRes.ok) {
            console.error("Firebase write failed", await fbRes.text());
            return res.status(500).json({ error: "Firebase Write Failed" });
        }
    } catch (e) {
        console.error("Firebase Exception", e);
        return res.status(500).json({ error: "Firebase Exception" });
    }

    res.status(200).json({ 
        success: true, 
        message: "News synchronized to Firebase successfully",
        totalArticles: finalArticles.length
    });
};
