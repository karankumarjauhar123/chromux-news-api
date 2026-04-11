/**
 * Utility to proxy and optimize images via wsrv.nl (weserv) CDN
 * It takes any valid source image URL and returns a WebP optimized URL
 * 
 * Enhanced: Better logo/icon/channel-image filtering
 */

// Comprehensive blocklist to reject logos, icons, trackers, tiny images
const IMAGE_BLOCKLIST = [
    // Tracking pixels & beacons
    '1x1', 'pixel', 'tracker', 'beacon', 'stats', 'spacer', 'count.gif',
    // Avatars & profile images
    'gravatar', 'avatar', 'profile-pic', 'author-image', 'byline',
    // Icons & favicons
    '/icon/', 'favicon', '/icons/', 'site-icon', 'app-icon',
    // Logos (the main fix!)
    'logo.svg', 'logo.png', 'logo.jpg', 'logo.webp', 'logo.gif',
    '/logo/', '/logos/', 'site-logo', 'channel-logo', 'brand-logo',
    'header-logo', 'footer-logo', 'nav-logo', 'masthead',
    'publisher-logo', 'network-logo', 'og-logo',
    // News channel specific logos
    'channel-image', 'channel_image', 'station-logo',
    'news-logo', 'source-logo', 'brand-image',
    // Tiny / useless images
    '50x50', '100x100', '48x48', '32x32', '16x16', '24x24', '64x64', '36x36',
    // WordPress / CMS junk
    'wp-smiley', 'emoji', 'smilies',
    // Social & widget
    'badge', 'widget', 'button', 'share-icon', 'social-icon',
    // Common RSS channel image patterns
    'rss-image', 'feed-image', 'feedburner',
    'doubleclick', 'googlesyndication', 'amazon-adsystem'
];

/**
 * Check if a URL looks like a channel/site logo rather than article content
 */
function isLikelyLogo(url) {
    if (!url) return true;
    const lower = url.toLowerCase();
    
    // Check blocklist
    for (const pattern of IMAGE_BLOCKLIST) {
        if (lower.includes(pattern)) return true;
    }
    
    // Check if URL path is too short (usually logos like /img/logo.png)
    try {
        const pathname = new URL(url).pathname;
        // Root-level images are often site logos (e.g., /logo.png, /brand.jpg)
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length === 1) {
            const filename = segments[0].toLowerCase();
            // Single file at root with "logo" or very generic name
            if (filename.includes('logo') || filename.includes('brand') ||
                filename.includes('masthead') || filename.includes('banner-site')) {
                return true;
            }
        }
    } catch (e) {
        // URL parsing failed, continue anyway
    }
    
    return false;
}

function getOptimizedImageUrl(url, width = 480, height = 270) {
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('//')) url = 'https:' + url;
    if (url.startsWith('http://')) url = url.replace('http://', 'https://');
    
    // Ignore if already a wsrv url
    if (url.includes('wsrv.nl')) return url;
    
    // Reject logos, icons, trackers
    if (isLikelyLogo(url)) return null;
    
    // Create wsrv URL
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&h=${height}&output=webp&q=80&fit=cover`;
}

module.exports = {
    getOptimizedImageUrl,
    isLikelyLogo
};
