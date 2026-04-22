const { sources } = require('../lib/sources');
const { parseFeed } = require('../lib/parser');
const fs = require('fs');
const path = require('path');
// Node 18+ has built-in global fetch — no require needed

// Deduplicate logic
function findTrendingAndDedup(allArticles) {
    // Basic title similarity check logic for demo purposes
    // Group articles by normalized lowercase title
    const groups = {};
    for (const a of allArticles) {
        const key = a.t.toLowerCase().substring(0, 30); // 30 char match
        if (!groups[key]) groups[key] = [];
        groups[key].push(a);
    }
    
    const dedupedLineup = [];
    for (const key in groups) {
        const group = groups[key];
        group.sort((x, y) => y.p - x.p); // newest first
        const mainArt = { ...group[0] };
        if (group.length > 1) {
            mainArt.as = group.slice(1).map(x => x.s); // alt sources
            if (group.length >= 5) mainArt.tr = 2; // Breaking
            else if (group.length >= 3) mainArt.tr = 1; // Trending
        }
        dedupedLineup.push(mainArt);
    }
    
    return dedupedLineup;
}

// Ensure dir exists
function saveFile(filename, data) {
    const pubDir = path.join(process.cwd(), 'public', 'feed');
    if (!fs.existsSync(pubDir)) {
        fs.mkdirSync(pubDir, { recursive: true });
    }
    fs.writeFileSync(path.join(pubDir, filename), JSON.stringify(data));
}

module.exports = async function handler(req, res) {
    console.log("Starting cron job fetching feeds...");
    
    const TS = Date.now();
    let globalArticles = [];

    // Fetch in parallel
    const promises = sources.map(async (source) => {
        try {
            const response = await fetch(source.url, { timeout: 10000 });
            if (response.ok) {
                const xml = await response.text();
                return parseFeed(xml, source);
            }
        } catch (error) {
            console.error(`Failed: ${source.name}`);
        }
        return [];
    });

    const results = await Promise.allSettled(promises);
    
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            globalArticles.push(...result.value);
        }
    });

    // Clean and split
    const dedupedArticles = findTrendingAndDedup(globalArticles);
    
    // Sort by publish date
    dedupedArticles.sort((a, b) => b.p - a.p);
    
    // Categories
    const catMap = { all: dedupedArticles };
    dedupedArticles.forEach(a => {
        if (!catMap[a.c]) catMap[a.c] = [];
        catMap[a.c].push(a);
    });

    // Write paginated files
    for (const cat in catMap) {
        const arr = catMap[cat];
        // Split into pages of 30
        const perPage = 30;
        const totalPages = Math.ceil(arr.length / perPage);
        for (let p = 0; p < totalPages; p++) {
            if (p >= 5) break; // Max 5 pages = 150 items per category
            
            const chunk = arr.slice(p * perPage, (p + 1) * perPage);
            const pageData = {
                v: 2,
                ts: TS,
                page: p + 1,
                totalPages: Math.min(5, totalPages),
                articles: chunk
            };
            
            saveFile(`${cat}_p${p + 1}.json`, pageData);
            if (p === 0) {
                // Compatibility for old code -> save page 1 as just cat.json
                saveFile(`${cat}.json`, pageData);
            }
        }
    }

    res.status(200).json({ success: true, count: dedupedArticles.length });
}
