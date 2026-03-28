const { XMLParser } = require('fast-xml-parser');
const { getOptimizedImageUrl } = require('./imageProxy');

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "__cdata"
});

function cleanHtml(html) {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<[^>]*>?/gm, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function extractImageFromHtml(html) {
    if (!html || typeof html !== 'string') return null;

    // Known tracker/pixel patterns to skip
    const blocklist = ['1x1', 'pixel', 'tracker', 'beacon', 'stats', 'spacer',
        'feedburner', 'doubleclick', 'count.gif', 'wp-smiley', 'gravatar'];

    const isTracker = (url) => blocklist.some(p => url.toLowerCase().includes(p));

    // Step 1: Try images with explicit width > 200 (best quality indicator)
    const sizedRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*width\s*=\s*["']?(\d+)/gi;
    let sizedMatch;
    let bestSized = null;
    let bestWidth = 0;
    while ((sizedMatch = sizedRegex.exec(html)) !== null) {
        const url = sizedMatch[1];
        const width = parseInt(sizedMatch[2], 10) || 0;
        if (width > 200 && !isTracker(url) && width > bestWidth) {
            bestSized = url;
            bestWidth = width;
        }
    }
    if (bestSized) return bestSized;

    // Step 2: All img src, skip trackers, prefer real image extensions
    const allImgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
    let match;
    const candidates = [];
    while ((match = allImgRegex.exec(html)) !== null) {
        const url = match[1];
        if (!isTracker(url)) candidates.push(url);
    }

    // Prefer URLs with real image extensions or CDN patterns
    const realImage = candidates.find(url => {
        const lower = url.toLowerCase();
        return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') ||
               lower.endsWith('.webp') || lower.includes('/image') || lower.includes('/photo') ||
               lower.includes('/media') || lower.includes('cdn') || lower.includes('img');
    });
    if (realImage) return realImage;

    // Step 3: Return first non-tracker candidate
    return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Parse YouTube Atom Feed
 * YouTube RSS feeds have a specific Atom format with media:group
 */
function parseYouTubeFeed(xmlString, sourceMeta) {
    const articles = [];
    try {
        const result = parser.parse(xmlString);
        if (!result.feed || !result.feed.entry) return [];

        const entries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];

        for (const entry of entries) {
            let title = entry.title || '';
            if (typeof title === 'object' && title.__cdata) title = title.__cdata;
            title = cleanHtml(String(title)).substring(0, 150);

            // YouTube video ID
            const videoId = entry['yt:videoId'] || '';
            const link = `https://www.youtube.com/watch?v=${videoId}`;

            // Thumbnail
            const thumbnail = entry['media:group'] && entry['media:group']['media:thumbnail']
                ? entry['media:group']['media:thumbnail']['@_url']
                : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

            // Description
            let desc = '';
            if (entry['media:group'] && entry['media:group']['media:description']) {
                desc = String(entry['media:group']['media:description'] || '');
            }
            desc = cleanHtml(desc).substring(0, 200);

            // Publish date
            let pubDate = entry.published || entry.updated;
            let pDateTs = pubDate ? new Date(pubDate).getTime() : Date.now();
            if (isNaN(pDateTs)) pDateTs = Date.now();

            if (title && videoId) {
                articles.push({
                    t: title,
                    d: desc,
                    u: link,
                    i: getOptimizedImageUrl(thumbnail, 640, 360),
                    s: sourceMeta.name,
                    c: sourceMeta.category,
                    p: pDateTs,
                    l: sourceMeta.language,
                    tr: 0,
                    as: [],
                    vid: videoId  // VIDEO ID — app detects this to show play button
                });
            }
        }
    } catch (err) {
        console.error("YT parse error for " + sourceMeta.name, err.message);
    }
    return articles;
}

/**
 * Parse standard RSS 2.0 / Atom feeds
 */
function parseStandardFeed(xmlString, sourceMeta) {
    const articles = [];
    try {
        const result = parser.parse(xmlString);
        let items = [];

        if (result.rss && result.rss.channel && result.rss.channel.item) {
            items = Array.isArray(result.rss.channel.item) ? result.rss.channel.item : [result.rss.channel.item];
        } else if (result.feed && result.feed.entry) {
            items = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
        } else {
            return [];
        }

        for (const item of items) {
            let title = item.title || '';
            let description = item.description || item.summary || item['content:encoded'] || '';

            if (typeof title === 'object' && title.__cdata) title = title.__cdata;
            if (typeof description === 'object' && description.__cdata) description = description.__cdata;

            let link = '';
            if (item.link) {
                if (typeof item.link === 'string') link = item.link;
                else if (item.link['@_href']) link = item.link['@_href'];
                else if (Array.isArray(item.link)) {
                    const altLink = item.link.find(l => !l['@_rel'] || l['@_rel'] === 'alternate');
                    if (altLink && altLink['@_href']) link = altLink['@_href'];
                }
            }

            let pubDate = item.pubDate || item.published || item.updated;
            let pDateTs = pubDate ? new Date(pubDate).getTime() : Date.now();
            if (isNaN(pDateTs)) pDateTs = Date.now();

            // Extract Image (multiple strategies)
            let imgUrl = null;
            // 1. Enclosure
            if (item.enclosure) {
                const enc = Array.isArray(item.enclosure) ? item.enclosure[0] : item.enclosure;
                if (enc['@_url'] && (enc['@_type'] || '').startsWith('image')) {
                    imgUrl = enc['@_url'];
                }
            }
            // 2. media:content
            if (!imgUrl && item['media:content']) {
                const mc = Array.isArray(item['media:content']) ? item['media:content'][0] : item['media:content'];
                if (mc['@_url']) imgUrl = mc['@_url'];
            }
            // 3. media:thumbnail
            if (!imgUrl && item['media:thumbnail']) {
                const mt = Array.isArray(item['media:thumbnail']) ? item['media:thumbnail'][0] : item['media:thumbnail'];
                if (mt['@_url']) imgUrl = mt['@_url'];
            }
            // 4. image tag
            if (!imgUrl && item.image) {
                if (typeof item.image === 'string') imgUrl = item.image;
                else if (item.image.url) imgUrl = item.image.url;
            }
            // 5. Extract from HTML content (description)
            if (!imgUrl) {
                const rawHtml = item['content:encoded'] || item.description || '';
                const htmlStr = typeof rawHtml === 'object' && rawHtml.__cdata ? rawHtml.__cdata : String(rawHtml);
                imgUrl = extractImageFromHtml(htmlStr);
            }
            // 6. Try summary/content field (some Atom feeds)
            if (!imgUrl && item.summary) {
                const summaryStr = typeof item.summary === 'object' && item.summary.__cdata ? item.summary.__cdata : String(item.summary || '');
                imgUrl = extractImageFromHtml(summaryStr);
            }
            // 7. media:group > media:content (non-YouTube feeds like Google News)
            if (!imgUrl && item['media:group']) {
                const mg = item['media:group'];
                if (mg['media:content']) {
                    const mc = Array.isArray(mg['media:content']) ? mg['media:content'][0] : mg['media:content'];
                    if (mc && mc['@_url']) imgUrl = mc['@_url'];
                }
                if (!imgUrl && mg['media:thumbnail']) {
                    const mt = Array.isArray(mg['media:thumbnail']) ? mg['media:thumbnail'][0] : mg['media:thumbnail'];
                    if (mt && mt['@_url']) imgUrl = mt['@_url'];
                }
            }
            // 8. Atom link rel=enclosure (image type)
            if (!imgUrl && Array.isArray(item.link)) {
                const encLink = item.link.find(l => l['@_rel'] === 'enclosure' && (l['@_type'] || '').startsWith('image'));
                if (encLink && encLink['@_href']) imgUrl = encLink['@_href'];
            }

            title = cleanHtml(String(title)).substring(0, 150);
            description = cleanHtml(String(description)).substring(0, 300);

            if (title && link) {
                articles.push({
                    t: title,
                    d: description,
                    u: link,
                    i: getOptimizedImageUrl(imgUrl),
                    s: sourceMeta.name,
                    c: sourceMeta.category,
                    p: pDateTs,
                    l: sourceMeta.language,
                    tr: 0,
                    as: []
                });
            }
        }
    } catch (err) {
        console.error("Parse error for " + sourceMeta.name, err.message);
    }
    return articles;
}

/**
 * Main entry — auto-detects YouTube vs standard feed
 */
function parseFeed(xmlString, sourceMeta) {
    if (sourceMeta.type === 'video' || (sourceMeta.url && sourceMeta.url.includes('youtube.com/feeds'))) {
        return parseYouTubeFeed(xmlString, sourceMeta);
    }
    return parseStandardFeed(xmlString, sourceMeta);
}

module.exports = { parseFeed };
