// Source registry. Each entry = { id, name, url (site), rss, category, accent }
// Categories: threat-intel, vuln, vendor, news, research, gov, community
window.CMB_SOURCES = [
  { id: "bleeping",       name: "Bleeping Computer",        site: "https://www.bleepingcomputer.com",       rss: "https://www.bleepingcomputer.com/feed/",                               category: "news",         accent: "#ff9f1c" },
  { id: "therecord",      name: "The Record",               site: "https://therecord.media",                rss: "https://therecord.media/feed/",                                        category: "news",         accent: "#ff9f1c" },
  { id: "krebs",          name: "Krebs on Security",        site: "https://krebsonsecurity.com",            rss: "https://krebsonsecurity.com/feed/",                                    category: "research",     accent: "#c792ea" },
  { id: "cyberscoop",     name: "CyberScoop",               site: "https://cyberscoop.com",                 rss: "https://cyberscoop.com/feed/",                                         category: "news",         accent: "#ff9f1c" },
  { id: "helpnet",        name: "Help Net Security",        site: "https://www.helpnetsecurity.com",        rss: "https://www.helpnetsecurity.com/feed/",                                category: "news",         accent: "#ff9f1c" },
  { id: "cisa",           name: "CISA Advisories",          site: "https://www.cisa.gov",                   rss: "https://www.cisa.gov/cybersecurity-advisories/all.xml",                category: "gov",          accent: "#ff4d6d" },
  { id: "msrc",           name: "Microsoft MSRC",           site: "https://msrc.microsoft.com",             rss: "https://msrc.microsoft.com/blog/feed",                                 category: "vendor",       accent: "#64d2ff" },
  { id: "projectzero",    name: "Google Project Zero",      site: "https://googleprojectzero.blogspot.com", rss: "https://googleprojectzero.blogspot.com/feeds/posts/default",           category: "research",     accent: "#c792ea" },
  { id: "otx",            name: "AlienVault OTX",           site: "https://otx.alienvault.com",             rss: "https://otx.alienvault.com/api/v1/pulses/subscribed_feed",             category: "threat-intel", accent: "#00e07a" },
  { id: "sans",           name: "SANS ISC",                 site: "https://isc.sans.edu",                   rss: "https://isc.sans.edu/rssfeed.xml",                                     category: "threat-intel", accent: "#00e07a" },
  { id: "unit42",         name: "Palo Alto Unit 42",        site: "https://unit42.paloaltonetworks.com",    rss: "https://unit42.paloaltonetworks.com/feed/",                            category: "threat-intel", accent: "#00e07a" },
  { id: "talos",          name: "Cisco Talos",              site: "https://blog.talosintelligence.com",     rss: "https://blog.talosintelligence.com/feeds/posts/default",               category: "threat-intel", accent: "#00e07a" },
  { id: "secureworks",    name: "Secureworks",              site: "https://www.secureworks.com",            rss: "https://www.secureworks.com/rss?feed=research",                        category: "vendor",       accent: "#64d2ff" },
  { id: "doublepulsar",   name: "Kevin Beaumont",           site: "https://doublepulsar.com",               rss: "https://doublepulsar.com/feed",                                        category: "community",    accent: "#ffd166" },
  { id: "vxunderground",  name: "vx-underground",           site: "https://vx-underground.org",             rss: "https://vx-underground.org/rss.xml",                                   category: "community",    accent: "#ffd166" },
  { id: "securityweek",   name: "SecurityWeek",             site: "https://www.securityweek.com",           rss: "https://www.securityweek.com/feed/",                                   category: "news",         accent: "#ff9f1c" },
  { id: "infosecmag",     name: "Infosecurity Magazine",    site: "https://www.infosecurity-magazine.com",  rss: "https://www.infosecurity-magazine.com/rss/news/",                      category: "news",         accent: "#ff9f1c" },
  { id: "rfcomm",         name: "Recorded Future",          site: "https://www.recordedfuture.com",         rss: "https://www.recordedfuture.com/feed",                                  category: "threat-intel", accent: "#00e07a" },
  { id: "mandiant",       name: "Mandiant",                 site: "https://cloud.google.com/blog/topics/threat-intelligence", rss: "https://cloud.google.com/blog/topics/threat-intelligence/rss", category: "threat-intel", accent: "#00e07a" },
  { id: "register",       name: "The Register",             site: "https://www.theregister.com/security/",  rss: "https://www.theregister.com/security/headlines.atom",                  category: "news",         accent: "#ff9f1c" },
];

window.CMB_CATEGORIES = {
  "threat-intel": { label: "THREAT INTEL",  color: "#00e07a" },
  "vuln":         { label: "VULN",          color: "#ff4d6d" },
  "vendor":       { label: "VENDOR",        color: "#64d2ff" },
  "news":         { label: "NEWS",          color: "#ff9f1c" },
  "research":     { label: "RESEARCH",      color: "#c792ea" },
  "gov":          { label: "GOV / ADVISORY",color: "#ff4d6d" },
  "community":    { label: "COMMUNITY",     color: "#ffd166" },
};
