/**
 * Utility to proxy and optimize images via wsrv.nl (weserv) CDN
 * It takes any valid source image URL and returns a WebP optimized URL
 * 
 * Enhanced v3: Exhaustive logo/icon/channel-image filtering
 * Covers 200+ news sources including Indian Hindi & English channels
 */

// ============================================================
//  COMPREHENSIVE BLOCKLIST — Patterns found ANYWHERE in URL
// ============================================================
const IMAGE_BLOCKLIST = [
    // ── Tracking pixels & beacons ──
    '1x1', 'pixel', 'tracker', 'beacon', 'stats', 'spacer', 'count.gif',
    'analytics', 'clk-overlay', 'impression', 'counter',
    // ── Avatars & profile images ──
    'gravatar', 'avatar', 'profile-pic', 'author-image', 'byline',
    'author-avatar', 'reporter-', 'journalist-',
    // ── Icons & favicons ──
    '/icon/', 'favicon', '/icons/', 'site-icon', 'app-icon',
    'apple-touch-icon', 'shortcut-icon', 'touch-icon',
    // ── Generic logo patterns ──
    'logo.svg', 'logo.png', 'logo.jpg', 'logo.webp', 'logo.gif',
    'logo-', '-logo.', '_logo.', '-logo-', '_logo_',
    '/logo/', '/logos/', 'site-logo', 'channel-logo', 'brand-logo',
    'header-logo', 'footer-logo', 'nav-logo', 'masthead',
    'publisher-logo', 'network-logo', 'og-logo', 'company-logo',
    'logo_light', 'logo_dark', 'logo_white', 'logo_black',
    'logowhite', 'logoblack', 'logodark', 'logolight',
    'logo-white', 'logo-dark', 'logo-header', 'logo-footer',
    'site_logo', 'header_logo', 'footer_logo',
    // ── News channel specific ──
    'channel-image', 'channel_image', 'station-logo',
    'news-logo', 'source-logo', 'brand-image',
    'newspaper-logo', 'outlet-logo', 'media-logo',
    'source-icon', 'channel-icon', 'network-icon',
    // ── CMS/Platform generated logo paths ──
    '/wp-content/themes/', // WordPress theme assets (usually logos/icons)
    '/sites/default/files/logo', // Drupal logo path
    // ── Tiny / useless image dimensions ──
    '50x50', '100x100', '48x48', '32x32', '16x16', '24x24', '64x64', '36x36',
    '75x75', '80x80', '90x90', '120x120', '40x40', '20x20',
    // ── WordPress / CMS junk ──
    'wp-smiley', 'emoji', 'smilies', 'wp-includes/images',
    // ── Social & widget ──
    'badge', 'widget', 'button', 'share-icon', 'social-icon',
    'fb-share', 'tw-share', 'whatsapp-share',
    // ── Ad networks & syndication ──
    'doubleclick', 'googlesyndication', 'amazon-adsystem',
    'adservice', 'adsense', 'outbrain', 'taboola', 'mgid',
    'criteo', 'pubmatic', 'openx', 'moat',
    // ── RSS/Feed junk ──
    'rss-image', 'feed-image', 'feedburner', 'feed-icon',
    // ── Watermarks & overlays ──
    'watermark', 'overlay', 'stamp',
    // ── Play store / app badges ──
    'play-badge', 'app-badge', 'download-badge', 'playstore',
    'apple-badge', 'appstore-badge',
    // ── Default/Placeholder images (CMS defaults, not real article images) ──
    'default-featured-image', 'default-thumbnail', 'no-image',
    'placeholder-image', 'default_image', 'noimage', 'no-photo',
    'bl-default-featured', // BollywoodLife default
];

// ============================================================
//  KNOWN LOGO URLS — Domain-specific logo image patterns
//  These are actual URLs used as channel images in RSS feeds
//  that DON'T contain "logo" in the path but ARE logos
// ============================================================
const KNOWN_LOGO_PATTERNS = [
    // Times of India / Indiatimes network channel image
    'photo/47529300.cms', 'photo/47529',
    'photo/msid-47529', 'msid-47529',
    // Navbharat Times channel logo
    'photo/52678640.cms', 'navbharattimes.indiatimes.com/photo/',
    // Economic Times channel image
    'etimg.com/photo/msid-', 'economictimes.indiatimes.com/photo/',
    // Zoom TV
    'zoomtventertainment.com/photo/',
    // TOI Auto
    'toiimg.com/photo/47529',
    // NDTV network
    'drop.ndtv.com/homepage/images/',
    'cdn.ndtv.com/common/images/',
    'gadgets360.com/logo', 'gadgets360cdn.akamaized.net/logo',
    // Aaj Tak / India Today group
    'akm-img-a-in.tosshub.com/sites/resources/',
    'akm-img-a-in.tosshub.com/indiatoday/images/logo',
    'aajtak.in/assets/',
    // ABP Network
    'abplive.com/assets/', 'abplive.com/images/logo',
    'abplive.com/wp-content/uploads/.*logo',
    // Zee News
    'zeenews.india.com/hindi/sites/',
    'zeenews.india.com/sites/default/files/logo',
    // Dainik Bhaskar
    'bhaskar.com/db-assets/',
    'bhaskar.com/assets/images/logo', 'bhaskar.com/images/logo',
    // Dainik Jagran
    'jagran.com/assets/images/logo', 'jagran.com/images/logo',
    // Amar Ujala
    'amarujala.com/assets/images/logo', 'amarujala.com/images/logo',
    // Live Hindustan
    'livehindustan.com/assets/images/logo', 'livehindustan.com/images/logo',
    // India TV
    'indiatv.in/assets/images/logo', 'indiatv.in/images/logo',
    // News18
    'news18.com/assets/images/logo', 'images.news18.com/static_news18/',
    // TV9
    'tv9hindi.com/assets/images/logo', 'tv9hindi.com/wp-content/uploads/.*logo',
    // OneIndia
    'oneindia.com/img/logo', 'oneindia.com/images/logo',
    // Patrika
    'patrika.com/assets/', 'patrika.com/images/logo',
    // Jansatta
    'jansatta.com/wp-content/themes/',
    // Hindustan Times
    'hindustantimes.com/res/images/', 'hindustantimes.com/static/',
    // Indian Express
    'indianexpress.com/wp-content/themes/', 'images.indianexpress.com/.*logo',
    // The Hindu
    'thehindu.com/theme/',
    // BBC
    'bbc.co.uk/news/special/.*logo', 'bbci.co.uk/ace/standard/',
    // CNN
    'cnn.com/media/sites/',
    // Reuters
    'reuters.com/pf/resources/',
    // Al Jazeera
    'aljazeera.com/mf/assets/',
    // Google News
    'lh3.googleusercontent.com/proxy/',
    'encrypted-tbn', // Google image proxy (often tiny)
];

/**
 * Check if a URL looks like a channel/site logo rather than article content
 */
function isLikelyLogo(url) {
    if (!url) return true;
    const lower = url.toLowerCase();
    
    // Check primary blocklist
    for (const pattern of IMAGE_BLOCKLIST) {
        if (lower.includes(pattern)) return true;
    }
    
    // Check known logo URL patterns (domain-specific)
    for (const pattern of KNOWN_LOGO_PATTERNS) {
        if (lower.includes(pattern)) return true;
    }
    
    // Check if URL path is too short (usually logos like /img/logo.png)
    try {
        const urlObj = new URL(url.startsWith('//') ? 'https:' + url : url);
        const pathname = urlObj.pathname;
        const segments = pathname.split('/').filter(Boolean);
        
        // Root-level images are often site logos
        if (segments.length === 1) {
            const filename = segments[0].toLowerCase();
            if (filename.includes('logo') || filename.includes('brand') ||
                filename.includes('masthead') || filename.includes('banner-site') ||
                filename.includes('header') || filename.includes('channel')) {
                return true;
            }
        }
        
        // Check filename for logo keywords
        const lastSegment = (segments[segments.length - 1] || '').toLowerCase();
        if (lastSegment.match(/^(logo|brand|icon|header|channel|source|publisher|masthead)/i)) {
            return true;
        }
        
        // SVG files are almost always logos/icons in news feeds
        if (lastSegment.endsWith('.svg')) {
            return true;
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
