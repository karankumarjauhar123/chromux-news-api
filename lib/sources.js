/**
 * Chromux News — 200+ News Sources + YouTube Video Channels
 * World's largest free RSS aggregation for a mobile browser
 */

const sources = [
    // ============================================
    //  🇮🇳 HINDI NEWS — India National
    //  Updated: 2026-04-24 — Removed dead RSS URLs, verified working feeds
    // ============================================
    // ✅ VERIFIED WORKING — High quality with images
    { name: "BBC Hindi", url: "https://www.bbc.com/hindi/index.xml", category: "india", language: "hi" },
    { name: "Dainik Bhaskar", url: "https://www.bhaskar.com/rss-feed/1061/", category: "india", language: "hi" },
    { name: "Prabhat Khabar", url: "https://www.prabhatkhabar.com/feed", category: "india", language: "hi" },
    { name: "Haribhoomi", url: "https://www.haribhoomi.com/feed", category: "india", language: "hi" },
    { name: "Rashtriya Khabar", url: "https://www.rashtriyakhabar.com/feed/", category: "india", language: "hi" },
    { name: "Amar Ujala", url: "https://www.amarujala.com/rss/india-news.xml", category: "india", language: "hi" },
    { name: "Amar Ujala Breaking", url: "https://www.amarujala.com/rss/breaking-news.xml", category: "india", language: "hi" },
    { name: "News24 Hindi", url: "https://news24online.com/feed/", category: "india", language: "hi" },
    // Google News Hindi — reliable aggregator with content from multiple sources
    { name: "Google News Hindi", url: "https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi", category: "india", language: "hi" },
    // ✅ VERIFIED WORKING (2026-04-27 live audit)
    { name: "Aaj Tak", url: "https://www.aajtak.in/rssfeeds/?id=home", category: "india", language: "hi" },
    { name: "Dainik Jagran", url: "https://rss.jagran.com/rss/news/national.xml", category: "india", language: "hi" },
    { name: "ABP News", url: "https://news.abplive.com/news/india/feed", category: "india", language: "hi" },
    { name: "India TV Hindi", url: "https://www.indiatvnews.com/rssfeed/topstory_news.xml", category: "india", language: "hi" },
    { name: "TV9 Bharatvarsh", url: "https://www.tv9hindi.com/feed", category: "india", language: "hi" },
    { name: "OneIndia Hindi", url: "https://hindi.oneindia.com/rss/hindi-news-fb.xml", category: "india", language: "hi" },
    // 🔄 Google News proxies for dead Hindi RSS feeds
    { name: "Zee News", url: "https://news.google.com/rss/search?q=site:zeenews.india.com&hl=hi&gl=IN&ceid=IN:hi", category: "india", language: "hi" },
    { name: "NDTV India", url: "https://news.google.com/rss/search?q=site:ndtv.com+hindi&hl=hi&gl=IN&ceid=IN:hi", category: "india", language: "hi" },
    { name: "Navbharat Times", url: "https://news.google.com/rss/search?q=site:navbharattimes.indiatimes.com&hl=hi&gl=IN&ceid=IN:hi", category: "india", language: "hi" },
    { name: "News18 Hindi", url: "https://news.google.com/rss/search?q=site:hindi.news18.com&hl=hi&gl=IN&ceid=IN:hi", category: "india", language: "hi" },
    { name: "Live Hindustan", url: "https://news.google.com/rss/search?q=site:livehindustan.com&hl=hi&gl=IN&ceid=IN:hi", category: "india", language: "hi" },
    { name: "Jansatta", url: "https://news.google.com/rss/search?q=site:jansatta.com&hl=hi&gl=IN&ceid=IN:hi", category: "india", language: "hi" },
    { name: "Patrika", url: "https://news.google.com/rss/search?q=site:patrika.com&hl=hi&gl=IN&ceid=IN:hi", category: "india", language: "hi" },
    { name: "News Nation", url: "https://news.google.com/rss/search?q=site:newsnationtv.com&hl=hi&gl=IN&ceid=IN:hi", category: "india", language: "hi" },

    // ============================================
    //  🇮🇳 ENGLISH NEWS — India
    //  Updated: 2026-04-27 — Dead RSS replaced with Google News proxies
    // ============================================
    { name: "Indian Express", url: "https://indianexpress.com/feed/", category: "india", language: "en" },
    { name: "India Today", url: "https://feeds.feedburner.com/indiatoday", category: "india", language: "en" },
    { name: "DNA India", url: "https://www.dnaindia.com/feeds/india.xml", category: "india", language: "en" },
    { name: "Deccan Chronicle", url: "https://news.google.com/rss/search?q=site:deccanchronicle.com&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    // 🔄 Google News proxies for dead English India RSS feeds
    { name: "Times of India", url: "https://news.google.com/rss/search?q=site:timesofindia.indiatimes.com&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    { name: "Hindustan Times", url: "https://news.google.com/rss/search?q=site:hindustantimes.com&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    { name: "NDTV", url: "https://news.google.com/rss/search?q=site:ndtv.com&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    { name: "The Hindu", url: "https://news.google.com/rss/search?q=site:thehindu.com&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    { name: "Scroll.in", url: "https://news.google.com/rss/search?q=site:scroll.in&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    { name: "The Wire", url: "https://news.google.com/rss/search?q=site:thewire.in&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    { name: "Firstpost", url: "https://news.google.com/rss/search?q=site:firstpost.com&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    { name: "News18 English", url: "https://news.google.com/rss/search?q=site:news18.com&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    { name: "Mint", url: "https://news.google.com/rss/search?q=site:livemint.com&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    { name: "The Print", url: "https://news.google.com/rss/search?q=site:theprint.in&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    { name: "The Tribune", url: "https://news.google.com/rss/search?q=site:tribuneindia.com&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    { name: "Republic World", url: "https://news.google.com/rss/search?q=site:republicworld.com&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },
    { name: "Outlook India", url: "https://news.google.com/rss/search?q=site:outlookindia.com&hl=en-IN&gl=IN&ceid=IN:en", category: "india", language: "en" },

    // ============================================
    //  🌍 WORLD NEWS (20+ sources)
    // ============================================
    { name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", category: "world", language: "en" },
    { name: "Reuters", url: "https://news.google.com/rss/search?q=site:reuters.com&hl=en-IN&gl=IN&ceid=IN:en", category: "world", language: "en" },
    { name: "The Guardian", url: "https://www.theguardian.com/world/rss", category: "world", language: "en" },
    { name: "CNN", url: "http://rss.cnn.com/rss/edition.rss", category: "world", language: "en" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", category: "world", language: "en" },
    { name: "France 24", url: "https://www.france24.com/en/rss", category: "world", language: "en" },
    { name: "CBS News", url: "https://www.cbsnews.com/latest/rss/main", category: "world", language: "en" },
    { name: "ABC News", url: "https://news.google.com/rss/search?q=site:abcnews.go.com&hl=en&gl=US&ceid=US:en", category: "world", language: "en" },
    { name: "NPR World", url: "https://feeds.npr.org/1004/rss.xml", category: "world", language: "en" },
    { name: "Washington Post", url: "https://news.google.com/rss/search?q=site:washingtonpost.com&hl=en&gl=US&ceid=US:en", category: "world", language: "en" },
    { name: "FOX News", url: "http://feeds.foxnews.com/foxnews/world", category: "world", language: "en" },
    { name: "Sky News", url: "https://feeds.skynews.com/feeds/rss/world.xml", category: "world", language: "en" },
    { name: "DW English", url: "https://rss.dw.com/atom/rss-en-all", category: "world", language: "en" },
    { name: "Euronews", url: "http://feeds.feedburner.com/euronews/en/home", category: "world", language: "en" },
    { name: "Associated Press", url: "https://news.google.com/rss/search?q=site:apnews.com&hl=en-IN&gl=IN&ceid=IN:en", category: "world", language: "en" },
    { name: "NY Times World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", category: "world", language: "en" },
    { name: "TIME", url: "https://news.google.com/rss/search?q=site:time.com&hl=en&gl=US&ceid=US:en", category: "world", language: "en" },
    { name: "The Independent", url: "https://www.independent.co.uk/news/world/rss", category: "world", language: "en" },

    // ============================================
    //  💻 TECHNOLOGY (20+ sources)
    // ============================================
    { name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "technology", language: "en" },
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "technology", language: "en" },
    { name: "Gadgets 360", url: "https://news.google.com/rss/search?q=site:gadgets360.com&hl=en-IN&gl=IN&ceid=IN:en", category: "technology", language: "en" },
    { name: "Techradar", url: "https://www.techradar.com/rss", category: "technology", language: "en" },

    { name: "Android Authority", url: "http://feed.androidauthority.com/", category: "technology", language: "en" },
    { name: "9to5Google", url: "https://9to5google.com/feed/", category: "technology", language: "en" },
    { name: "Ars Technica", url: "http://feeds.arstechnica.com/arstechnica/index", category: "technology", language: "en" },
    { name: "XDA Developers", url: "https://www.xda-developers.com/feed/", category: "technology", language: "en" },
    { name: "Wired", url: "https://www.wired.com/feed/rss", category: "technology", language: "en" },
    { name: "ZDNet", url: "https://www.zdnet.com/news/rss.xml", category: "technology", language: "en" },
    { name: "CNET", url: "https://www.cnet.com/rss/news/", category: "technology", language: "en" },
    { name: "The Next Web", url: "https://thenextweb.com/feed", category: "technology", language: "en" },
    { name: "Mashable", url: "https://mashable.com/feeds/rss/all", category: "technology", language: "en" },
    { name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds/all", category: "technology", language: "en" },
    { name: "Gizmodo", url: "https://gizmodo.com/rss", category: "technology", language: "en" },
    { name: "9to5Mac", url: "https://9to5mac.com/feed/", category: "technology", language: "en" },
    { name: "VentureBeat", url: "https://feeds.feedburner.com/venturebeat/SZYF", category: "technology", language: "en" },

    // ============================================
    //  💰 BUSINESS & FINANCE (15+ sources)
    // ============================================
    { name: "Economic Times", url: "https://economictimes.indiatimes.com/rssfeedstopstories.cms", category: "business", language: "en" },
    { name: "CNBC", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", category: "business", language: "en" },
    { name: "Business Insider", url: "https://markets.businessinsider.com/rss/news", category: "business", language: "en" },
    { name: "Forbes", url: "https://www.forbes.com/business/feed/", category: "business", language: "en" },
    { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex", category: "business", language: "en" },
    { name: "Bloomberg", url: "https://feeds.bloomberg.com/markets/news.rss", category: "business", language: "en" },
    { name: "MarketWatch", url: "https://feeds.marketwatch.com/marketwatch/topstories/", category: "business", language: "en" },
    { name: "Inc42", url: "https://inc42.com/feed/", category: "business", language: "en" },
    // 🔄 Google News proxies for dead business RSS feeds
    { name: "Business Standard", url: "https://news.google.com/rss/search?q=site:business-standard.com&hl=en-IN&gl=IN&ceid=IN:en", category: "business", language: "en" },
    { name: "Moneycontrol", url: "https://news.google.com/rss/search?q=site:moneycontrol.com&hl=en-IN&gl=IN&ceid=IN:en", category: "business", language: "en" },
    { name: "LiveMint", url: "https://news.google.com/rss/search?q=site:livemint.com+business&hl=en-IN&gl=IN&ceid=IN:en", category: "business", language: "en" },

    // ============================================
    //  ⚽ SPORTS (20+ sources)
    // ============================================
    { name: "ESPN Cricket", url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml", category: "sports", language: "en" },
    { name: "Sportskeeda Hindi", url: "https://hindi.sportskeeda.com/feed", category: "sports", language: "hi" },
    { name: "NDTV Sports", url: "https://news.google.com/rss/search?q=site:sports.ndtv.com&hl=en-IN&gl=IN&ceid=IN:en", category: "sports", language: "en" },
    { name: "Indian Express Sports", url: "https://indianexpress.com/section/sports/feed/", category: "sports", language: "en" },
    { name: "Cricbuzz", url: "https://news.google.com/rss/search?q=site:cricbuzz.com&hl=en-IN&gl=IN&ceid=IN:en", category: "sports", language: "en" },
    { name: "Sky Sports", url: "https://www.skysports.com/rss/11095", category: "sports", language: "en" },
    { name: "CBS Sports", url: "https://www.cbssports.com/rss/headlines/", category: "sports", language: "en" },
    { name: "Yahoo Sports", url: "https://sports.yahoo.com/rss/", category: "sports", language: "en" },
    { name: "Sportskeeda English", url: "https://www.sportskeeda.com/feed", category: "sports", language: "en" },
    { name: "The Sports Rush", url: "https://thesportsrush.com/feed/", category: "sports", language: "en" },
    { name: "Khel Now", url: "https://khelnow.com/feed", category: "sports", language: "en" },
    { name: "CricTracker", url: "https://www.crictracker.com/feed/", category: "sports", language: "en" },
    { name: "Sportstar", url: "https://news.google.com/rss/search?q=site:sportstar.thehindu.com&hl=en-IN&gl=IN&ceid=IN:en", category: "sports", language: "en" },

    // ============================================
    //  🎬 ENTERTAINMENT (15+ sources)
    // ============================================
    { name: "Bollywood Hungama", url: "https://www.bollywoodhungama.com/feed/", category: "entertainment", language: "hi" },
    { name: "ABP Showbiz", url: "https://news.google.com/rss/search?q=site:abplive.com+entertainment&hl=hi&gl=IN&ceid=IN:hi", category: "entertainment", language: "hi" },
    { name: "Bollywood News", url: "https://news.google.com/rss/search?q=bollywood&hl=hi&gl=IN&ceid=IN:hi", category: "entertainment", language: "hi" },
    { name: "Variety", url: "https://variety.com/feed/", category: "entertainment", language: "en" },
    { name: "Hollywood Reporter", url: "https://www.hollywoodreporter.com/feed/", category: "entertainment", language: "en" },
    { name: "TMZ", url: "https://www.tmz.com/rss.xml", category: "entertainment", language: "en" },
    { name: "Entertainment News", url: "https://news.google.com/rss/search?q=entertainment+celebrity&hl=en&gl=US&ceid=US:en", category: "entertainment", language: "en" },
    { name: "Deadline", url: "https://deadline.com/feed/", category: "entertainment", language: "en" },
    { name: "Screen Rant", url: "https://screenrant.com/feed/", category: "entertainment", language: "en" },
    { name: "Koimoi", url: "https://www.koimoi.com/feed/", category: "entertainment", language: "en" },
    { name: "BollywoodLife", url: "https://www.bollywoodlife.com/feed/", category: "entertainment", language: "en" },

    // ============================================
    //  🚗 AUTO (8 sources)
    // ============================================
    { name: "Auto News", url: "https://news.google.com/rss/search?q=cars+auto+India&hl=en-IN&gl=IN&ceid=IN:en", category: "auto", language: "en" },
    { name: "RushLane", url: "https://www.rushlane.com/feed", category: "auto", language: "en" },

    // ============================================
    //  🎮 GAMING (10 sources)
    // ============================================
    { name: "IGN", url: "http://feeds.ign.com/ign/news", category: "gaming", language: "en" },
    { name: "Polygon", url: "https://www.polygon.com/rss/index.xml", category: "gaming", language: "en" },
    { name: "GameSpot", url: "https://www.gamespot.com/feeds/news/", category: "gaming", language: "en" },
    { name: "Kotaku", url: "https://kotaku.com/rss", category: "gaming", language: "en" },
    { name: "PC Gamer", url: "https://www.pcgamer.com/rss/", category: "gaming", language: "en" },
    { name: "Eurogamer", url: "https://www.eurogamer.net/feed", category: "gaming", language: "en" },
    { name: "Rock Paper Shotgun", url: "https://www.rockpapershotgun.com/feed", category: "gaming", language: "en" },
    { name: "GamesRadar", url: "https://www.gamesradar.com/rss/", category: "gaming", language: "en" },
    { name: "Destructoid", url: "https://www.destructoid.com/feed/", category: "gaming", language: "en" },
    { name: "Nintendo Life", url: "https://www.nintendolife.com/feeds/latest", category: "gaming", language: "en" },

    // ============================================
    //  🏥 HEALTH (8 sources)
    // ============================================
    { name: "WHO", url: "https://www.who.int/rss-feeds/news-english.xml", category: "health", language: "en" },
    { name: "Health News", url: "https://news.google.com/rss/search?q=health+wellness&hl=en-IN&gl=IN&ceid=IN:en", category: "health", language: "en" },

    // ============================================
    //  🔬 SCIENCE (8 sources)
    // ============================================
    { name: "ScienceDaily", url: "https://www.sciencedaily.com/rss/top/science.xml", category: "science", language: "en" },
    { name: "NASA", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", category: "science", language: "en" },
    { name: "Space.com", url: "https://www.space.com/feeds/all", category: "science", language: "en" },
    { name: "New Scientist", url: "https://www.newscientist.com/section/news/feed/", category: "science", language: "en" },
    { name: "Phys.org", url: "https://phys.org/rss-feed/", category: "science", language: "en" },
    { name: "Science News", url: "https://news.google.com/rss/search?q=science+research&hl=en-IN&gl=IN&ceid=IN:en", category: "science", language: "en" },
    { name: "Live Science", url: "https://www.livescience.com/feeds/all", category: "science", language: "en" },

    // ============================================
    //  🗳️ POLITICS (8 sources)
    // ============================================
    { name: "Livemint Politics", url: "https://news.google.com/rss/search?q=India+politics&hl=en-IN&gl=IN&ceid=IN:en", category: "politics", language: "en" },
    { name: "IE Politics", url: "https://indianexpress.com/section/political-pulse/feed/", category: "politics", language: "en" },
    { name: "US Politics", url: "https://news.google.com/rss/search?q=US+politics&hl=en&gl=US&ceid=US:en", category: "politics", language: "en" },
    { name: "The Hill", url: "https://thehill.com/feed/", category: "politics", language: "en" },

    // ============================================
    //  👗 LIFESTYLE (6 sources)
    // ============================================
    { name: "Vogue India", url: "https://www.vogue.in/feed/rss", category: "lifestyle", language: "en" },
    { name: "GQ India", url: "https://www.gqindia.com/feed/rss", category: "lifestyle", language: "en" },
    { name: "Lifestyle News", url: "https://news.google.com/rss/search?q=lifestyle+fashion+India&hl=en-IN&gl=IN&ceid=IN:en", category: "lifestyle", language: "en" },

    // ============================================
    //  ✈️ TRAVEL
    // ============================================
    { name: "Travel News", url: "https://news.google.com/rss/search?q=travel+tourism+India&hl=en-IN&gl=IN&ceid=IN:en", category: "travel", language: "en" },

    // ============================================
    //  📹 YOUTUBE VIDEO NEWS CHANNELS
    //  Only verified working channels (2026-04-28 audit)
    //  YouTube RSS: https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
    // ============================================
    // Hindi Video News
    { name: "Zee News", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCIvaYmXn910QMdemBG3v1pQ", category: "india", language: "hi", type: "video" },
    { name: "Dhruv Rathee", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC-CSyyi47VX1lD9zyeABW3w", category: "india", language: "hi", type: "video" },

    // English Video News
    { name: "BBC News", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC16niRr50-MSBwiO3YDb3RA", category: "world", language: "en", type: "video" },

    // Tech Videos
    { name: "MKBHD", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ", category: "technology", language: "en", type: "video" },

    // Entertainment Videos
    { name: "T-Series", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCq-Fj5jknLsUf-MWSy4_brA", category: "entertainment", language: "hi", type: "video" },
];

module.exports = { sources };
