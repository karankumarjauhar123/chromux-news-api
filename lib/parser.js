const { XMLParser } = require('fast-xml-parser');
const { getOptimizedImageUrl, isLikelyLogo } = require('./imageProxy');

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "__cdata",
    processEntities: false, 
    htmlEntities: true,
    stopNodes: [
        "*.content:encoded",
        "*.description",
        "*.summary"
    ]
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

    // Combined filter: reject trackers + logos + tiny images
    const isBadImage = (url) => isLikelyLogo(url);

    // Step 1: Try images with explicit width > 200 (best quality indicator)
    const sizedRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*width\s*=\s*["']?(\d+)/gi;
    let sizedMatch;
    let bestSized = null;
    let bestWidth = 0;
    while ((sizedMatch = sizedRegex.exec(html)) !== null) {
        const url = sizedMatch[1];
        const width = parseInt(sizedMatch[2], 10) || 0;
        if (width > 200 && !isBadImage(url) && width > bestWidth) {
            bestSized = url;
            bestWidth = width;
        }
    }
    if (bestSized) return bestSized;

    // Step 2: All img src, skip bad images, prefer real image extensions
    const allImgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
    let match;
    const candidates = [];
    while ((match = allImgRegex.exec(html)) !== null) {
        const url = match[1];
        if (!isBadImage(url)) candidates.push(url);
    }

    // Prefer URLs with real image extensions or CDN patterns
    const realImage = candidates.find(url => {
        const lower = url.toLowerCase();
        return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') ||
               lower.endsWith('.webp') || lower.includes('/image') || lower.includes('/photo') ||
               lower.includes('/media') || lower.includes('cdn') || lower.includes('img') ||
               lower.includes('upload') || lower.includes('thumb');
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

        // ===== STEP 1: Extract CHANNEL-LEVEL logo URL =====
        // RSS feeds define the channel's logo at <channel><image><url>
        // This is the ROOT CAUSE of logos appearing as article images
        let channelLogoUrl = null;
        
        if (result.rss && result.rss.channel) {
            const ch = result.rss.channel;
            items = Array.isArray(ch.item) ? ch.item : (ch.item ? [ch.item] : []);
            
            // Extract channel logo from multiple possible locations
            if (ch.image) {
                if (typeof ch.image === 'string') channelLogoUrl = ch.image;
                else if (ch.image.url) channelLogoUrl = ch.image.url;
                else if (ch.image['@_url']) channelLogoUrl = ch.image['@_url'];
            }
            // Some feeds use <channel><logo> or <channel><icon>
            if (!channelLogoUrl && ch.logo) channelLogoUrl = typeof ch.logo === 'string' ? ch.logo : ch.logo.url;
            if (!channelLogoUrl && ch.icon) channelLogoUrl = typeof ch.icon === 'string' ? ch.icon : null;
            
        } else if (result.feed && result.feed.entry) {
            items = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
            
            // Atom feeds: <feed><icon> or <feed><logo>
            if (result.feed.icon) channelLogoUrl = typeof result.feed.icon === 'string' ? result.feed.icon : null;
            if (!channelLogoUrl && result.feed.logo) channelLogoUrl = typeof result.feed.logo === 'string' ? result.feed.logo : null;
        } else {
            return [];
        }
        
        // Normalize channel logo for comparison
        if (channelLogoUrl) {
            channelLogoUrl = channelLogoUrl.trim().toLowerCase();
            if (channelLogoUrl.startsWith('//')) channelLogoUrl = 'https:' + channelLogoUrl;
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
            // IMPORTANT: Each URL is validated against BOTH blocklist AND channel logo
            let imgUrl = null;
            
            // Helper to accept image only if it's not a logo/tracker AND not the channel logo
            const acceptImage = (url) => {
                if (!url || typeof url !== 'string') return null;
                if (isLikelyLogo(url)) return null;
                // Compare against channel-level logo (the SMART fix)
                if (channelLogoUrl) {
                    let normalizedUrl = url.trim().toLowerCase();
                    if (normalizedUrl.startsWith('//')) normalizedUrl = 'https:' + normalizedUrl;
                    if (normalizedUrl === channelLogoUrl) return null;
                    // Also check if the URL is contained in the channel logo or vice versa
                    // (some feeds use size variants like logo.png vs logo-200x200.png)
                    if (channelLogoUrl.includes(normalizedUrl) || normalizedUrl.includes(channelLogoUrl)) return null;
                }
                return url;
            };
            
            // 1. Enclosure (most reliable — explicitly attached to article)
            if (item.enclosure) {
                const enc = Array.isArray(item.enclosure) ? item.enclosure[0] : item.enclosure;
                if (enc['@_url'] && (enc['@_type'] || '').startsWith('image')) {
                    imgUrl = acceptImage(enc['@_url']);
                }
            }
            // 2. media:content (article-specific media)
            if (!imgUrl && item['media:content']) {
                const mc = Array.isArray(item['media:content']) ? item['media:content'][0] : item['media:content'];
                if (mc['@_url']) imgUrl = acceptImage(mc['@_url']);
            }
            // 3. media:thumbnail (article thumbnail)
            if (!imgUrl && item['media:thumbnail']) {
                const mt = Array.isArray(item['media:thumbnail']) ? item['media:thumbnail'][0] : item['media:thumbnail'];
                if (mt['@_url']) imgUrl = acceptImage(mt['@_url']);
            }
            // 4. REMOVED: item.image — This is usually the CHANNEL logo, NOT the article image!
            //    In RSS 2.0 spec, <image> inside <item> is rare; it's usually at <channel> level.
            //    This was the main cause of channel logos showing instead of article images.
            
            // 5. Extract from HTML content (description / content:encoded)
            if (!imgUrl) {
                const rawHtml = item['content:encoded'] || item.description || '';
                const htmlStr = typeof rawHtml === 'object' && rawHtml.__cdata ? rawHtml.__cdata : String(rawHtml);
                const extractedImg = extractImageFromHtml(htmlStr);
                imgUrl = acceptImage(extractedImg);
            }
            // 6. Try summary/content field (some Atom feeds)
            if (!imgUrl && item.summary) {
                const summaryStr = typeof item.summary === 'object' && item.summary.__cdata ? item.summary.__cdata : String(item.summary || '');
                const extractedSummaryImg = extractImageFromHtml(summaryStr);
                imgUrl = acceptImage(extractedSummaryImg);
            }
            // 7. media:group > media:content (non-YouTube feeds like Google News)
            if (!imgUrl && item['media:group']) {
                const mg = item['media:group'];
                if (mg['media:content']) {
                    const mc = Array.isArray(mg['media:content']) ? mg['media:content'][0] : mg['media:content'];
                    if (mc && mc['@_url']) imgUrl = acceptImage(mc['@_url']);
                }
                if (!imgUrl && mg['media:thumbnail']) {
                    const mt = Array.isArray(mg['media:thumbnail']) ? mg['media:thumbnail'][0] : mg['media:thumbnail'];
                    if (mt && mt['@_url']) imgUrl = acceptImage(mt['@_url']);
                }
            }
            // 8. Atom link rel=enclosure (image type)
            if (!imgUrl && Array.isArray(item.link)) {
                const encLink = item.link.find(l => l['@_rel'] === 'enclosure' && (l['@_type'] || '').startsWith('image'));
                if (encLink && encLink['@_href']) imgUrl = acceptImage(encLink['@_href']);
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
