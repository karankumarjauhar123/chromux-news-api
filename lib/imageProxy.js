/**
 * Utility to proxy and optimize images via wsrv.nl (weserv) CDN
 * It takes any valid source image URL and returns a WebP optimized URL
 */

function getOptimizedImageUrl(url, width = 480, height = 270) {
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('//')) url = 'https:' + url;
    if (url.startsWith('http://')) url = url.replace('http://', 'https://');
    
    // Ignore if already a wsrv url
    if (url.includes('wsrv.nl')) return url;
    
    // Basic blocklist for trackers and low quality images
    const blocklist = ['1x1', 'pixel', 'tracker', 'beacon', 'spacer', 'wp-smiley',
        'gravatar', 'avatar', '/icon/', 'favicon', 'logo.svg', '50x50', '100x100',
        'badge', 'widget', 'button'];
    for (let ignore of blocklist) {
        if (url.toLowerCase().includes(ignore)) return null;
    }
    
    // Create wsrv URL
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&h=${height}&output=webp&q=80&fit=cover`;
}

module.exports = {
    getOptimizedImageUrl
};
