// Seeded fallback items. Plausible, current-flavored headlines for each source
// so the page renders densely when the proxy/CORS path fails. All synthetic.
(function(){
  const now = Date.now();
  const M = 60*1000, H = 60*M, D = 24*H;

  const SEED = {
    bleeping: [
      ["Ransomware gang leaks 1.2TB from breached MSP platform",            2*H, "DragonForce affiliate claims responsibility for intrusion at unnamed European managed-service provider; leaked trove includes client backup manifests."],
      ["New Chrome zero-day under active exploitation, patch now",          5*H, "Google releases emergency update for CVE-2026-1142, a type-confusion bug in V8. Exploit chain observed against journalists in South Asia."],
      ["Phishing kit abuses Cloudflare Pages to bypass mail filters",       9*H, "Researchers track 'PaperTrail' kit to at least 480 active lures targeting Microsoft 365 credentials with real-time 2FA relay."],
      ["QNAP pushes fixes for 3 critical NAS bugs",                        14*H, "Vulnerabilities include an auth-bypass and two stack overflows in the QTS photo service; CVSS 9.8."],
      ["SIM-swap crew indicted after $42M crypto theft spree",             22*H, "DoJ unseals charges against seven defendants, two of whom were insider employees at a US MVNO."],
    ],
    therecord: [
      ["UK National Cyber Force publishes doctrine on 'cognitive effects'", 3*H, "First public framing of offensive-influence operations as a standing capability; officials say it codifies five years of practice."],
      ["Senate Intel marks up cyber-incident reporting rewrite",            7*H, "Bill would shorten CIRCIA reporting window for critical infrastructure and expand covered-entity definitions to include major SaaS providers."],
      ["Russia-linked group targets Balkan election infrastructure",      11*H, "Mandiant and national CERTs attribute spearphishing against election workers in two countries to UNC2589."],
      ["EU Council greenlights CSAM client-side scanning carve-out",       20*H, "Compromise text exempts 'end-to-end encrypted personal correspondence' but requires platform risk assessments."],
    ],
    krebs: [
      ["Who is running the 'LockSmith' access-broker market?",              4*H, "An OSINT trail through ICQ handles, a Tashkent shell company, and a leaked support ticket points to a 29-year-old operator."],
      ["How one open S3 bucket exposed 14 years of payroll files",         18*H, "A small HRIS vendor's misconfiguration spilled W-2s for 220 US school districts; the vendor disputes the timeline."],
      ["Voice-clone fraud targets the parents of US service members",       2*D, "Scammers pair DoD open-source enlistment data with 6-second voice samples pulled from TikTok."],
    ],
    cyberscoop: [
      ["CISA's new Secure-by-Design pledge adds 40 vendors",                6*H, "Latest signatories include three large EHR platforms; OMB is weighing whether to make pledge participation a factor in federal procurement."],
      ["DoD expands bug bounty to weapons-system software",                10*H, "HackerOne-run program will cover selected non-classified components under a narrowly scoped SAFE HARBOR."],
      ["House hearing: CrowdStrike, SentinelOne, Microsoft spar on kernel access", 16*H, "Post-July-2024 rule proposals remain contested; vendors divided over a user-mode-only future."],
    ],
    helpnet: [
      ["CISO survey: 61% expect budget cuts in 2026",                       8*H, "IANS/Artico data shows first YoY decline since 2017; GRC and awareness programs hit hardest."],
      ["Open-source tool release: 'Driftwatch' tracks IaC drift via OPA",  13*H, "New CNCF-sandbox project reconciles live cloud state against Terraform plans and flags policy regressions."],
      ["Report: 43% of SaaS apps have at least one dormant admin",         26*H, "Analysis of 2.4M identities shows widespread stale privilege across Salesforce, Okta, and Google Workspace."],
    ],
    cisa: [
      ["ICSA-26-108-01: Siemens SIMATIC WinCC — auth bypass (CVSS 9.1)",    1*H, "Affected: WinCC Unified V17–V19. Exploitation allows unauthenticated command execution on HMI; patch and workaround available."],
      ["AA26-108A: Joint advisory on 'Volt Typhoon' resurgence",            6*H, "FBI, NSA, CISA and partners publish indicators; actor continues to prepare for disruption of US OT."],
      ["ICSA-26-107-02: Rockwell ControlLogix — out-of-bounds write",      19*H, "Pre-auth RCE in EtherNet/IP stack; CVSS 9.8. Rockwell urges immediate upgrade to firmware v35.013."],
      ["Known Exploited Vulnerabilities catalog: 3 additions",             25*H, "Adds Fortinet FortiOS, Ivanti Connect Secure, and Apache ActiveMQ — federal agencies have 14 days to remediate."],
    ],
    msrc: [
      ["April 2026 Security Update Guide: 114 CVEs, 9 critical",            7*H, "Includes 2 zero-days (CVE-2026-21745 in SmartScreen, CVE-2026-21760 in Print Spooler) under limited exploitation."],
      ["Entra ID: token-theft mitigations now GA",                         15*H, "Continuous Access Evaluation + replay-binding rolls out to all workforce tenants by end of May."],
      ["Post-mortem: April 3 Azure Front Door regional outage",            36*H, "Root cause traced to config push that invalidated 100% of edge cert chains in WEU for 47 minutes."],
    ],
    projectzero: [
      ["In the wild series: chaining three iOS bugs into a pointer leak",  30*H, "Analysis of an exploit captured by TAG; walks through WebKit JIT primitive, ITP cache confusion, and a kernel infoleak."],
      ["Exploiting a decade-old race in the Linux io_uring fastpath",     55*H, "0-click LPE; writeup covers fuzzing harness and the ~4-line patch that would have prevented it."],
    ],
    otx: [
      ["Pulse: AsyncRAT delivered via CHM lures targeting LATAM banks",    30*M, "14 new IoCs, 6 C2 domains, 2 YARA rules. First submitted by @obsidian_watch."],
      ["Pulse: Cobalt Strike beacons on Vultr ASN — week 16",               3*H, "Rolling aggregate of 62 live beacons observed this week; MD5/SHA256 lists attached."],
      ["Pulse: 'Sandworm' adjacent infra pivot via new registrar",          9*H, "34 domains registered through the same reseller within a 72-hour window; five already used in spearphish."],
      ["Pulse: ScreenConnect abuse — updated hunting queries",             20*H, "Added Kusto and Splunk queries for the post-CVE-2024-1709 cluster still active in the wild."],
    ],
    sans: [
      ["ISC Diary: DShield honeypot sees 8x spike in port 445 probes",     45*M, "Source geography skews toward a handful of residential ISPs in Brazil and Vietnam; pcap samples available."],
      ["ISC Diary: Parsing the new 'FakeCAPTCHA' clipboard chain",          5*H, "Lure convinces users to paste a PowerShell one-liner under the guise of a Cloudflare check — detection tips inside."],
      ["ISC Podcast Ep. 8941: Weekly threat wrap",                        12*H, "Johannes and Jesse cover the Chrome 0-day, Siemens advisory, and a curious uptick in SSH honeypot logins from Starlink space."],
    ],
    unit42: [
      ["Muddled Libra evolves — new loader, same social-engineering core", 13*H, "Tracks actor's move from Okta phish kits to a custom voice-based help-desk playbook; 9 victims YTD in aviation and insurance."],
      ["ThreatVector: 'GhostCache' exfil over DNS-over-HTTPS",             28*H, "Technical deep-dive on a low-and-slow exfil technique; includes Cortex XDR detection content."],
    ],
    talos: [
      ["Talos IR trends Q1 2026: ransomware share climbs back to 41%",     10*H, "BEC falls, ransomware rebounds. LockBit spinoffs + Akira + DragonForce account for two-thirds of confirmed cases."],
      ["New wiper 'PAINTBOX' hits Eastern European logistics firms",       21*H, "Destructive module drops after ~48h of living-off-the-land. Likely linked to Sandworm adjacent cluster UAC-0133."],
    ],
    secureworks: [
      ["GOLD MELODY returns with Kubernetes-aware post-ex tooling",        17*H, "Counter Threat Unit documents new lateral movement toolkit specifically enumerating RBAC bindings and etcd secrets."],
      ["State of the Threat 2026: mid-year snapshot",                      40*H, "Sector-by-sector breakdown with fresh intrusion-set attribution charts; healthcare stays most-targeted."],
    ],
    doublepulsar: [
      ["The Fortinet situation is worse than you think (part 3)",           4*H, "Months after the first writeups, unpatched appliances keep getting burned. A tour of the four clusters still exploiting this."],
      ["'Smart' building door controllers are a 2026 Shodan gift",         29*H, "Walking through three vendors whose default creds + public-internet deployments open actual physical doors."],
    ],
    vxunderground: [
      ["Paper of the day: 'Stealing KASLR on ARM via TLB side-channels'",   2*H, "Preprint + sample code mirrored. Interesting because the primitive generalizes to several recent Cortex-A designs."],
      ["Collection update: Conti leaks, deduplicated and tagged",          27*H, "Re-uploaded with consistent naming, per-chat JSON indexing, and a README of what's actually useful for IR training."],
    ],
    securityweek: [
      ["Trellix to acquire small XDR startup in all-stock deal",           11*H, "Terms undisclosed; filing expected this quarter. Startup's graph-based detection engine will slot under the Helix platform."],
      ["Critical infrastructure bill clears Australian Senate",            23*H, "SOCI amendments add mandatory 6-hour reporting and formal SOC-to-ASD connectivity requirements."],
    ],
    infosecmag: [
      ["NCSC: boards still treat cyber as 'IT problem', despite rhetoric", 12*H, "Annual review points to persistent gap between stated governance priorities and actual committee time spent."],
      ["Survey: only 22% of SMBs have tested their incident-response plan",32*H, "Tested plans correlate strongly with lower median downtime; untested plans offer near-zero benefit versus none at all."],
    ],
    rfcomm: [
      ["Insikt: pro-Russia info-op network expands to Portuguese",          8*H, "Cluster now spans 9 languages across 140+ domains; narrative set tracks Ukraine funding debates in each market."],
      ["Ransomware victim tracker: Q1 closes at 1,312 posts",              22*H, "Down 6% QoQ. Cl0p and Akira each crossed 100 victims; fragmented middle of the market remains noisy."],
    ],
    mandiant: [
      ["UNC5221 targets Ivanti EPMM for the second time this year",         6*H, "Same actor, new bug. Mandiant tracks post-exploitation to the same webshell family observed in 2024."],
      ["APT41 side-quest: ad-hoc cryptocurrency theft between ops",        34*H, "Evidence that parts of the group moonlight on wallet-drainer campaigns during lulls between state-aligned taskings."],
    ],
    register: [
      ["Cloudflare kicks 'residential proxy' reseller off the platform",   10*H, "Reseller accused of selling access to compromised home routers; Cloudflare says TOS violation, reseller says routine DDoS trigger."],
      ["'Your password is on this leak site' — a field guide to the dark-web name-and-shame economy", 24*H, "A rambling, funny, slightly weary tour through how extortion kabuki actually works in 2026."],
    ],
  };

  function forSource(src){
    const seed = SEED[src.id] || [];
    return seed.map(([title, ago, snippet], i) => ({
      id: src.id + "::fb::" + i,
      title,
      link: src.site,
      source: src.name,
      sourceId: src.id,
      category: src.category,
      accent: src.accent,
      publishedAt: now - ago,
      snippet,
      author: "",
      _fallback: true,
    }));
  }

  window.CMB_FALLBACK = { forSource };
})();
