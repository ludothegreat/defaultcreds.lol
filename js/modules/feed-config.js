// feed-config.js - Feed configuration and definitions

export const feeds = [
  { url: 'https://krebsonsecurity.com/feed/', name: 'Krebs on Security', category: 'Newsrooms' },
  { url: 'https://www.bleepingcomputer.com/feed/', name: 'BleepingComputer', category: 'Newsrooms' },
  { url: 'https://www.theregister.com/security/headlines.atom', name: 'The Register Security', category: 'Industry Press' },
  { url: 'https://hnrss.org/newest?points=50&q=security', name: 'Hacker News', category: 'Communities' },
  { url: 'https://threatpost.com/feed/', name: 'ThreatPost', category: 'Newsrooms' },
  { url: 'https://www.darkreading.com/rss.xml', name: 'Dark Reading', category: 'Analysis & Research' },
  { url: 'https://feeds.feedburner.com/Securityweek', name: 'SecurityWeek', category: 'Newsrooms' }
];

export const feedMap = new Map(feeds.map(feed => [feed.url, feed]));
export const DEFAULT_FEED_ORDER = feeds.map(feed => feed.url);

export function feedKey(feed) {
  return btoa(feed.url).replace(/=/g, '');
}
