// feed-config.js - Feed configuration and definitions

export const feeds = [
  { url: 'https://news.ycombinator.com/rss', name: 'Hacker News (YC)', category: 'Communities' },
  { url: 'https://feeds.feedburner.com/TheHackersNews', name: 'The Hacker News', category: 'Newsrooms' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', name: 'Ars Technica', category: 'Newsrooms' },
  { url: 'https://krebsonsecurity.com/feed/', name: 'Krebs on Security', category: 'Newsrooms' },
  { url: 'https://rss.slashdot.org/Slashdot/slashdotMain', name: 'Slashdot', category: 'Communities' },
  { url: 'https://www.exploit-db.com/rss.xml', name: 'Exploit-DB', category: 'Analysis & Research' },
  { url: 'https://www.reddit.com/r/netsec/.rss', name: 'Reddit – r/netsec', category: 'Communities' },
  { url: 'https://www.bleepingcomputer.com/feed/', name: 'BleepingComputer', category: 'Newsrooms' },
  { url: 'https://www.securityweek.com/feed', name: 'SecurityWeek', category: 'Newsrooms' }
];

export const feedMap = new Map(feeds.map(feed => [feed.url, feed]));
export const DEFAULT_FEED_ORDER = feeds.map(feed => feed.url);

export function feedKey(feed) {
  return btoa(feed.url).replace(/=/g, '');
}
