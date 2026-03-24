/**
 * Chromux News — 200+ News Sources + YouTube Video Channels
 * World's largest free RSS aggregation for a mobile browser
 */

const sources = [
    // ============================================
    //  🇮🇳 HINDI NEWS — India National (30+ sources)
    // ============================================
    { name: "Aaj Tak", url: "https://www.aajtak.in/rss/top-stories", category: "india", language: "hi" },
    { name: "NDTV India", url: "https://feeds.feedburner.com/ndtvindia-latest", category: "india", language: "hi" },
    { name: "Dainik Jagran", url: "https://www.jagran.com/rss/news-national.xml", category: "india", language: "hi" },
    { name: "Navbharat Times", url: "https://navbharattimes.indiatimes.com/rssfeedstopstories.cms", category: "india", language: "hi" },
    { name: "Zee News Hindi", url: "https://zeenews.india.com/hindi/rss/india-national-news.xml", category: "india", language: "hi" },
    { name: "Patrika", url: "https://www.patrika.com/rss/india-news.xml", category: "india", language: "hi" },
    { name: "ABP News", url: "https://news.abplive.com/rss/india-news.xml", category: "india", language: "hi" },
    { name: "Amar Ujala", url: "https://www.amarujala.com/rss/india-news.xml", category: "india", language: "hi" },
    { name: "Live Hindustan", url: "https://www.livehindustan.com/rss/national.xml", category: "india", language: "hi" },
    { name: "India TV Hindi", url: "https://www.indiatv.in/rssfeeds/home.xml", category: "india", language: "hi" },
    { name: "News18 Hindi", url: "https://hindi.news18.com/rss/india.xml", category: "india", language: "hi" },
    { name: "Dainik Bhaskar", url: "https://www.bhaskar.com/rss-feed/1086/", category: "india", language: "hi" },
    { name: "BBC Hindi", url: "https://www.bbc.com/hindi/index.xml", category: "india", language: "hi" },
    { name: "DW Hindi", url: "https://rss.dw.com/rdf/rss-hi-all", category: "india", language: "hi" },
    { name: "TV9 Bharatvarsh", url: "https://www.tv9hindi.com/rss/india-news.xml", category: "india", language: "hi" },
    { name: "Punjab Kesari", url: "https://www.punjabkesari.in/rss/national", category: "india", language: "hi" },
    { name: "OneIndia Hindi", url: "https://hindi.oneindia.com/rss/hindi-news-fb.xml", category: "india", language: "hi" },
    { name: "Jansatta", url: "https://www.jansatta.com/feed/", category: "india", language: "hi" },
    { name: "Prabhat Khabar", url: "https://www.prabhatkhabar.com/rss", category: "india", language: "hi" },
    { name: "Haribhoomi", url: "https://www.haribhoomi.com/rss", category: "india", language: "hi" },
    { name: "News24 Hindi", url: "https://news24online.com/feed/", category: "india", language: "hi" },
    { name: "News Nation", url: "https://www.newsnationtv.com/rss/india-news.xml", category: "india", language: "hi" },
    { name: "Sudarshan News", url: "https://sudarshannews.in/feed/", category: "india", language: "hi" },
    { name: "Hindustan", url: "https://www.livehindustan.com/rss/3155", category: "india", language: "hi" },
    { name: "Nai Dunia", url: "https://www.naidunia.com/rss/national.xml", category: "india", language: "hi" },
    { name: "Rajasthan Patrika", url: "https://www.patrika.com/rss/rajasthan-news.xml", category: "india", language: "hi" },
    { name: "Jan Sanchay", url: "https://jansanchay.com/feed/", category: "india", language: "hi" },
    { name: "Samachar Plus", url: "https://samacharplus.com/feed/", category: "india", language: "hi" },

    // ============================================
    //  🇮🇳 ENGLISH NEWS — India (25+ sources)
    // ============================================
    { name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", category: "india", language: "en" },
    { name: "Hindustan Times", url: "https://www.hindustantimes.com/feeds/rss/news/rssfeed.xml", category: "india", language: "en" },
    { name: "Indian Express", url: "https://indianexpress.com/feed/", category: "india", language: "en" },
    { name: "NDTV", url: "https://feeds.feedburner.com/ndtvnews-top-stories", category: "india", language: "en" },
    { name: "The Hindu", url: "https://www.thehindu.com/feeder/default.rss", category: "india", language: "en" },
    { name: "India Today", url: "https://www.indiatoday.in/rss/home", category: "india", language: "en" },
    { name: "Deccan Herald", url: "http://www.deccanherald.com/rss/news.rss", category: "india", language: "en" },
    { name: "The Tribune", url: "https://www.tribuneindia.com/rss/feed", category: "india", language: "en" },
    { name: "Scroll.in", url: "https://scroll.in/feed", category: "india", language: "en" },
    { name: "The Wire", url: "https://thewire.in/feed", category: "india", language: "en" },
    { name: "Firstpost", url: "https://www.firstpost.com/rss/india.xml", category: "india", language: "en" },
    { name: "News18 English", url: "https://www.news18.com/rss/india.xml", category: "india", language: "en" },
    { name: "Mint", url: "https://www.livemint.com/rss/news", category: "india", language: "en" },
    { name: "The Print", url: "https://theprint.in/feed/", category: "india", language: "en" },
    { name: "DNA India", url: "https://www.dnaindia.com/feeds/india.xml", category: "india", language: "en" },
    { name: "Free Press Journal", url: "https://www.freepressjournal.in/feed", category: "india", language: "en" },
    { name: "Outlook India", url: "https://www.outlookindia.com/rss", category: "india", language: "en" },
    { name: "Deccan Chronicle", url: "https://www.deccanchronicle.com/rss_feed/", category: "india", language: "en" },
    { name: "New Indian Express", url: "https://www.newindianexpress.com/rss", category: "india", language: "en" },
    { name: "Republic World", url: "https://www.republicworld.com/rss", category: "india", language: "en" },

    // ============================================
    //  🌍 WORLD NEWS (20+ sources)
    // ============================================
    { name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", category: "world", language: "en" },
    { name: "Reuters", url: "https://feeds.reuters.com/reuters/topNews", category: "world", language: "en" },
    { name: "The Guardian", url: "https://www.theguardian.com/world/rss", category: "world", language: "en" },
    { name: "CNN", url: "http://rss.cnn.com/rss/edition.rss", category: "world", language: "en" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", category: "world", language: "en" },
    { name: "France 24", url: "https://www.france24.com/en/rss", category: "world", language: "en" },
    { name: "CBS News", url: "https://www.cbsnews.com/latest/rss/main", category: "world", language: "en" },
    { name: "ABC News", url: "https://abcnews.go.com/abcnews/topstories", category: "world", language: "en" },
    { name: "NPR World", url: "https://feeds.npr.org/1004/rss.xml", category: "world", language: "en" },
    { name: "Washington Post", url: "https://feeds.washingtonpost.com/rss/world", category: "world", language: "en" },
    { name: "FOX News", url: "http://feeds.foxnews.com/foxnews/world", category: "world", language: "en" },
    { name: "Sky News", url: "https://feeds.skynews.com/feeds/rss/world.xml", category: "world", language: "en" },
    { name: "DW English", url: "https://rss.dw.com/rdf/rss-en-all", category: "world", language: "en" },
    { name: "Euronews", url: "http://feeds.feedburner.com/euronews/en/home", category: "world", language: "en" },
    { name: "Associated Press", url: "https://apnews.com/index.rss", category: "world", language: "en" },
    { name: "NY Times World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", category: "world", language: "en" },
    { name: "TIME", url: "https://time.com/feed/", category: "world", language: "en" },
    { name: "The Independent", url: "https://www.independent.co.uk/news/world/rss", category: "world", language: "en" },

    // ============================================
    //  💻 TECHNOLOGY (20+ sources)
    // ============================================
    { name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "technology", language: "en" },
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "technology", language: "en" },
    { name: "Gadgets 360 Hindi", url: "https://gadgets.ndtv.com/rss/feeds", category: "technology", language: "hi" },
    { name: "Digit", url: "https://www.digit.in/rss.xml", category: "technology", language: "en" },
    { name: "Techradar", url: "https://www.techradar.com/rss", category: "technology", language: "en" },
    { name: "91Mobiles Hindi", url: "https://www.91mobiles.com/hub/hindi/feed/", category: "technology", language: "hi" },
    { name: "Android Authority", url: "http://feed.androidauthority.com/", category: "technology", language: "en" },
    { name: "9to5Google", url: "https://9to5google.com/feed/", category: "technology", language: "en" },
    { name: "Engadget", url: "https://www.engadget.com/rss.xml", category: "technology", language: "en" },
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
    { name: "VentureBeat", url: "https://venturebeat.com/feed/", category: "technology", language: "en" },
    { name: "TechnoHindi", url: "https://www.technohindi.in/feed/", category: "technology", language: "hi" },

    // ============================================
    //  💰 BUSINESS & FINANCE (15+ sources)
    // ============================================
    { name: "Economic Times", url: "https://economictimes.indiatimes.com/rssfeedstopstories.cms", category: "business", language: "en" },
    { name: "Business Standard", url: "https://www.business-standard.com/rss/home_page_top_stories.rss", category: "business", language: "en" },
    { name: "LiveMint", url: "https://www.livemint.com/rss/news", category: "business", language: "en" },
    { name: "Moneycontrol", url: "https://www.moneycontrol.com/rss/latestnews.xml", category: "business", language: "en" },
    { name: "CNBC", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", category: "business", language: "en" },
    { name: "Business Insider", url: "https://markets.businessinsider.com/rss/news", category: "business", language: "en" },
    { name: "Financial Express", url: "https://www.financialexpress.com/rss", category: "business", language: "en" },
    { name: "Forbes", url: "https://www.forbes.com/business/feed/", category: "business", language: "en" },
    { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex", category: "business", language: "en" },
    { name: "Bloomberg", url: "https://feeds.bloomberg.com/markets/news.rss", category: "business", language: "en" },
    { name: "MarketWatch", url: "https://feeds.marketwatch.com/marketwatch/topstories/", category: "business", language: "en" },
    { name: "Business Kaksha", url: "https://businesskaksha.com/feed/", category: "business", language: "hi" },
    { name: "Uncut Hindi Business", url: "https://hindi.theuncut.in/feed/", category: "business", language: "hi" },
    { name: "Inc42", url: "https://inc42.com/feed/", category: "business", language: "en" },

    // ============================================
    //  ⚽ SPORTS (20+ sources)
    // ============================================
    { name: "ESPN Cricket", url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml", category: "sports", language: "en" },
    { name: "Sportskeeda Hindi", url: "https://www.sportskeeda.com/go/feed/cricket", category: "sports", language: "hi" },
    { name: "NDTV Sports", url: "https://sports.ndtv.com/rss/all", category: "sports", language: "en" },
    { name: "Indian Express Sports", url: "https://indianexpress.com/section/sports/feed/", category: "sports", language: "en" },
    { name: "Cricbuzz Hindi", url: "https://m.hindi.cricbuzz.com/rss/news", category: "sports", language: "hi" },
    { name: "Sports Tak", url: "https://www.sportstak.in/rss/india.xml", category: "sports", language: "hi" },
    { name: "Sky Sports", url: "https://www.skysports.com/rss/11095", category: "sports", language: "en" },
    { name: "CBS Sports", url: "https://www.cbssports.com/rss/headlines/", category: "sports", language: "en" },
    { name: "Yahoo Sports", url: "https://sports.yahoo.com/rss/", category: "sports", language: "en" },
    { name: "Sportskeeda English", url: "https://www.sportskeeda.com/feed", category: "sports", language: "en" },
    { name: "The Sports Rush", url: "https://thesportsrush.com/feed/", category: "sports", language: "en" },
    { name: "Khel Now", url: "https://khelnow.com/feed", category: "sports", language: "en" },
    { name: "CricTracker", url: "https://www.crictracker.com/feed/", category: "sports", language: "en" },
    { name: "Sportstar", url: "https://sportstar.thehindu.com/rss/default.rss", category: "sports", language: "en" },
    { name: "ESPN FC", url: "https://www.espn.com/espn/rss/soccer/news", category: "sports", language: "en" },

    // ============================================
    //  🎬 ENTERTAINMENT (15+ sources)
    // ============================================
    { name: "Filmfare Hindi", url: "https://www.filmfare.com/rss/latest-news.xml", category: "entertainment", language: "hi" },
    { name: "Bollywood Hungama", url: "https://www.bollywoodhungama.com/rss/news.xml", category: "entertainment", language: "hi" },
    { name: "Pinkvilla", url: "https://www.pinkvilla.com/hi/feed", category: "entertainment", language: "hi" },
    { name: "Zoom TV", url: "https://www.zoomtventertainment.com/rssfeedstopstories.cms", category: "entertainment", language: "hi" },
    { name: "ABP Showbiz", url: "https://news.abplive.com/entertainment/bollywood/feed", category: "entertainment", language: "hi" },
    { name: "Variety", url: "https://variety.com/feed/", category: "entertainment", language: "en" },
    { name: "Hollywood Reporter", url: "https://www.hollywoodreporter.com/feed/", category: "entertainment", language: "en" },
    { name: "TMZ", url: "https://www.tmz.com/rss.xml", category: "entertainment", language: "en" },
    { name: "E! Online", url: "https://www.eonline.com/syndication/rss/top_stories", category: "entertainment", language: "en" },
    { name: "Entertainment Weekly", url: "https://ew.com/feed/", category: "entertainment", language: "en" },
    { name: "Deadline", url: "https://deadline.com/feed/", category: "entertainment", language: "en" },
    { name: "Screen Rant", url: "https://screenrant.com/feed/", category: "entertainment", language: "en" },
    { name: "Koimoi", url: "https://www.koimoi.com/feed/", category: "entertainment", language: "en" },
    { name: "BollywoodLife", url: "https://www.bollywoodlife.com/feed/", category: "entertainment", language: "en" },

    // ============================================
    //  🚗 AUTO (8 sources)
    // ============================================
    { name: "Autocar India", url: "http://www.autocarindia.com/RSS/RSS.ashx", category: "auto", language: "en" },
    { name: "Team-BHP", url: "https://www.team-bhp.com/rss-feed", category: "auto", language: "en" },
    { name: "TOI Auto", url: "https://timesofindia.indiatimes.com/auto/news/rssfeed.cms", category: "auto", language: "en" },
    { name: "CarDekho", url: "https://www.cardekho.com/rss/autoindia-news.xml", category: "auto", language: "en" },
    { name: "MotorBeam", url: "https://www.motorbeam.com/feed/", category: "auto", language: "en" },
    { name: "Overdrive", url: "https://www.overdrive.in/feed/", category: "auto", language: "en" },
    { name: "RushLane", url: "https://www.rushlane.com/feed", category: "auto", language: "en" },
    { name: "Top Gear", url: "https://www.topgear.com/car-news/rss", category: "auto", language: "en" },

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
    { name: "WebMD", url: "http://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=rss_public_health_news", category: "health", language: "en" },
    { name: "ScienceDaily Health", url: "https://www.sciencedaily.com/rss/top/health.xml", category: "health", language: "en" },
    { name: "Healthline", url: "https://www.healthline.com/feeds/rss", category: "health", language: "en" },
    { name: "Medical News Today", url: "https://www.medicalnewstoday.com/newsfeeds/rss", category: "health", language: "en" },
    { name: "WHO", url: "https://www.who.int/rss-feeds/news-english.xml", category: "health", language: "en" },
    { name: "Health.com", url: "https://www.health.com/feeds/all", category: "health", language: "en" },
    { name: "Everyday Health", url: "https://www.everydayhealth.com/rss/everything/", category: "health", language: "en" },
    { name: "NIH News", url: "https://www.nih.gov/news-events/news-releases/feed", category: "health", language: "en" },

    // ============================================
    //  🔬 SCIENCE (8 sources)
    // ============================================
    { name: "ScienceDaily", url: "https://www.sciencedaily.com/rss/top/science.xml", category: "science", language: "en" },
    { name: "NASA", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", category: "science", language: "en" },
    { name: "Space.com", url: "https://www.space.com/feeds/all", category: "science", language: "en" },
    { name: "Scientific American", url: "https://rss.sciam.com/ScientificAmerican-Global", category: "science", language: "en" },
    { name: "New Scientist", url: "https://www.newscientist.com/section/news/feed/", category: "science", language: "en" },
    { name: "Phys.org", url: "https://phys.org/rss-feed/", category: "science", language: "en" },
    { name: "Nature", url: "https://www.nature.com/nature.rss", category: "science", language: "en" },
    { name: "Live Science", url: "https://www.livescience.com/feeds/all", category: "science", language: "en" },

    // ============================================
    //  🗳️ POLITICS (8 sources)
    // ============================================
    { name: "Livemint Politics", url: "https://www.livemint.com/rss/politics", category: "politics", language: "en" },
    { name: "NDTV Politics", url: "https://feeds.feedburner.com/ndtvnews-politics-news", category: "politics", language: "en" },
    { name: "India Today Politics", url: "https://www.indiatoday.in/rss/1206514", category: "politics", language: "en" },
    { name: "HT Politics", url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml", category: "politics", language: "en" },
    { name: "IE Politics", url: "https://indianexpress.com/section/political-pulse/feed/", category: "politics", language: "en" },
    { name: "The Quint Politics", url: "https://www.thequint.com/quintlab/rss/politics", category: "politics", language: "en" },
    { name: "Politico", url: "https://www.politico.com/rss/politicopicks.xml", category: "politics", language: "en" },
    { name: "The Hill", url: "https://thehill.com/feed/", category: "politics", language: "en" },

    // ============================================
    //  👗 LIFESTYLE (6 sources)
    // ============================================
    { name: "Vogue India", url: "https://www.vogue.in/feed/rss", category: "lifestyle", language: "en" },
    { name: "MensXP", url: "https://www.mensxp.com/rss/latest.xml", category: "lifestyle", language: "en" },
    { name: "Femina", url: "https://www.femina.in/feeds/feeds-rss-latest.xml", category: "lifestyle", language: "en" },
    { name: "GQ India", url: "https://www.gqindia.com/feed/rss", category: "lifestyle", language: "en" },
    { name: "Elle India", url: "https://www.elle.in/feed/rss", category: "lifestyle", language: "en" },
    { name: "Cosmopolitan", url: "https://www.cosmopolitan.com/feed/", category: "lifestyle", language: "en" },

    // ============================================
    //  ✈️ TRAVEL (5 sources)
    // ============================================
    { name: "Conde Nast Traveller", url: "https://www.cntraveller.in/feed/", category: "travel", language: "en" },
    { name: "Lonely Planet", url: "https://www.lonelyplanet.com/news/rss", category: "travel", language: "en" },
    { name: "Travel + Leisure", url: "https://www.travelandleisure.com/feeds/all", category: "travel", language: "en" },
    { name: "National Geographic Travel", url: "https://www.nationalgeographic.com/travel/feeds/rss/all", category: "travel", language: "en" },
    { name: "Skyscanner", url: "https://www.skyscanner.net/news/feed/", category: "travel", language: "en" },

    // ============================================
    //  📹 YOUTUBE VIDEO NEWS CHANNELS (30+ channels)
    //  YouTube RSS: https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
    // ============================================
    // Hindi Video News
    { name: "Aaj Tak", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCt4t-jeY85JegMlZ-E5UXtA", category: "india", language: "hi", type: "video" },
    { name: "ABP NEWS", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCRWFSbif-RFENbBrSiez1DA", category: "india", language: "hi", type: "video" },
    { name: "NDTV India", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCkXFCFbCbMsnlFGQ56OVG0A", category: "india", language: "hi", type: "video" },
    { name: "Zee News", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCIvaYmXn910QMdemBG3v1pQ", category: "india", language: "hi", type: "video" },
    { name: "India TV", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCttspZesZIDEwwpVIgoZtWQ", category: "india", language: "hi", type: "video" },
    { name: "TV9 Bharatvarsh", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCgk0it4AMWQN4g8QjT45_JQ", category: "india", language: "hi", type: "video" },
    { name: "News18 India", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCaq267EL4GmtBqut-fIq5CQ", category: "india", language: "hi", type: "video" },
    { name: "Republic Bharat", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCBGbSAKLREE-BRlCMbnz3Mg", category: "india", language: "hi", type: "video" },
    { name: "Tez News", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCgCDmBsp3USYdHxSPP-UQGA", category: "india", language: "hi", type: "video" },
    { name: "News Nation", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC5JkjKspYF1JS_aKirXd32g", category: "india", language: "hi", type: "video" },
    { name: "Good News Today", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC7LopmhAjqBfCBlpgGCH7AA", category: "india", language: "hi", type: "video" },
    { name: "Lallantop", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCx8Z14PpntdaxCaKEIBjX4A", category: "india", language: "hi", type: "video" },
    { name: "Dhruv Rathee", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC-CSyyi47VX1lD9zyeABW3w", category: "india", language: "hi", type: "video" },

    // English Video News
    { name: "NDTV", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCHMm3_5Dbo4fEBKVWAFMh4A", category: "india", language: "en", type: "video" },
    { name: "BBC News", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC16niRr50-MSBwiO3YDb3RA", category: "world", language: "en", type: "video" },
    { name: "CNN", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCupvZG-5ko_eiXAupbDfxWw", category: "world", language: "en", type: "video" },
    { name: "Al Jazeera", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCNye-wNBqNL5ZzHSJj3l8Bg", category: "world", language: "en", type: "video" },
    { name: "Sky News", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCoMdktPbSTixAyNGwb-UYkQ", category: "world", language: "en", type: "video" },
    { name: "DW News", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCknLrEdhRCp1aegoMqRaCZg", category: "world", language: "en", type: "video" },
    { name: "WION", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC_gUM8rL-Lrg6O3adPW9K1g", category: "world", language: "en", type: "video" },
    { name: "Firstpost", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCmU3fjE30p5rR2rxmTrXDgg", category: "india", language: "en", type: "video" },

    // Tech Videos
    { name: "MKBHD", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ", category: "technology", language: "en", type: "video" },
    { name: "Linus Tech Tips", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCXuqSBlHAE6Xw-yeJA0Tunw", category: "technology", language: "en", type: "video" },
    { name: "Technical Guruji", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCOhHO2ICt0ti9KAh-QHvSsA", category: "technology", language: "hi", type: "video" },
    { name: "Trakin Tech", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCYFiEFmmYiZnuB6xDnMOUqw", category: "technology", language: "hi", type: "video" },
    { name: "Unbox Therapy", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCsTcErHg8oDvUnTzoqsYeNw", category: "technology", language: "en", type: "video" },

    // Sports Videos
    { name: "ICC Cricket", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCm1DqxBjVhEmJylllQPpJFg", category: "sports", language: "en", type: "video" },
    { name: "Star Sports", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCFz8gBQi1GjuF_0t2H8VVQg", category: "sports", language: "en", type: "video" },
    { name: "Sports Tak", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCr5PL61RjYv_UB3GXfMGFfQ", category: "sports", language: "hi", type: "video" },

    // Entertainment Videos
    { name: "T-Series", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCq-Fj5jknLsUf-MWSy4_brA", category: "entertainment", language: "hi", type: "video" },
    { name: "Bollywood Hungama", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCmEp9Vy_p4VhMCgIudUGp7Q", category: "entertainment", language: "hi", type: "video" },
    { name: "Film Companion", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCfWiIJHOgfFBR84o0PoKzNA", category: "entertainment", language: "en", type: "video" },
];

module.exports = { sources };
