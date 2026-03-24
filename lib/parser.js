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
    const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["']/i;
    const match = html.match(imgRegex);
    return match ? match[1] : null;
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
            // 5. Extract from HTML content
            if (!imgUrl) {
                const rawHtml = item['content:encoded'] || item.description || '';
                const htmlStr = typeof rawHtml === 'object' && rawHtml.__cdata ? rawHtml.__cdata : String(rawHtml);
                imgUrl = extractImageFromHtml(htmlStr);
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
