/* global React, ReactDOM */
const { useState, useEffect, useMemo, useRef, useCallback } = React;

const CATS = window.CMB_CATEGORIES;
const SOURCES = window.CMB_SOURCES;

// ---------- utils ----------
const fmtAgo = (ts) => {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return s + "s";
  const m = Math.floor(s/60); if (m < 60) return m + "m";
  const h = Math.floor(m/60); if (h < 24) return h + "h";
  const d = Math.floor(h/24); return d + "d";
};
const fmtClock = (d=new Date()) => {
  const p = (n)=>String(n).padStart(2,"0");
  return p(d.getUTCHours())+":"+p(d.getUTCMinutes())+":"+p(d.getUTCSeconds())+" UTC";
};
const fmtDateHeader = (d=new Date()) => {
  const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const mons = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${days[d.getUTCDay()]} ${d.getUTCDate()} ${mons[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
const greeting = (d=new Date()) => {
  const h = d.getHours();
  if (h < 5)  return "GOOD EVENING";
  if (h < 12) return "GOOD MORNING";
  if (h < 18) return "GOOD AFTERNOON";
  return "GOOD EVENING";
};
const severityFrom = (item) => {
  const t = (item.title + " " + item.snippet).toLowerCase();
  if (/cvss\s*9|\b(critical|0-day|zero-day|actively exploited|emergency)\b/.test(t)) return "crit";
  if (/\b(ransomware|wiper|breach|exploit|rce|auth bypass|leak)\b/.test(t))         return "high";
  if (/\b(advisory|patch|update|cve|vuln)\b/.test(t))                               return "med";
  return "low";
};
const SEV_COLOR = { crit:"#ff4d6d", high:"#ff9f1c", med:"#ffd166", low:"#5d7972" };

// ---------- hooks ----------
function useLocalState(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}

// ---------- tweaks ----------
const DEFAULTS = {
  "accent": "#00e07a",
  "density": "comfortable",
  "layout": "grid",
  "showSeverity": true,
  "showSnippets": true,
  "scanlines": true
};

function useTweaks() {
  const [t, setT] = useState(DEFAULTS);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onMsg(e){
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") setOpen(true);
      if (d.type === "__deactivate_edit_mode") setOpen(false);
    }
    window.addEventListener("message", onMsg);
    window.parent.postMessage({type:"__edit_mode_available"},"*");
    return () => window.removeEventListener("message", onMsg);
  }, []);
  const set = (patch) => {
    setT(prev => {
      const next = { ...prev, ...patch };
      window.parent.postMessage({type:"__edit_mode_set_keys", edits: patch}, "*");
      return next;
    });
  };
  return { tweaks: t, setTweak: set, open };
}

// ---------- app ----------
function App() {
  const { tweaks, setTweak, open: tweaksOpen } = useTweaks();

  const [feeds, setFeeds] = useState({});
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const [query, setQuery]       = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [activeSrc, setActiveSrc] = useState("all");
  const [readIds, setReadIds]   = useLocalState("cmb.read", {});
  const [starIds, setStarIds]   = useLocalState("cmb.star", {});
  const [lastRefresh, setLastRefresh] = useState(null);

  // clock
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // initial + refresh
  const load = useCallback(async () => {
    setLoading(true);
    const primed = {};
    for (const s of SOURCES) {
      primed[s.id] = { items: window.CMB_FALLBACK.forSource(s), live: false, loading: true };
    }
    setFeeds(primed);

    window.CMB_FETCH.fetchAll(SOURCES, {
      onSource: (s, { items, live }) => {
        setFeeds(prev => ({ ...prev, [s.id]: { items, live, loading: false } }));
      }
    }).then(() => {
      setLoading(false);
      setLastRefresh(Date.now());
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const allItems = useMemo(() => {
    const out = [];
    for (const s of SOURCES) {
      const f = feeds[s.id];
      if (!f) continue;
      for (const it of f.items) out.push({ ...it, _live: f.live });
    }
    out.sort((a,b)=> b.publishedAt - a.publishedAt);
    return out;
  }, [feeds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter(it => {
      if (activeCat !== "all" && it.category !== activeCat) return false;
      if (activeSrc !== "all" && it.sourceId !== activeSrc) return false;
      if (q && !(it.title.toLowerCase().includes(q) || it.snippet.toLowerCase().includes(q) || it.source.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [allItems, query, activeCat, activeSrc]);

  const stats = useMemo(() => {
    const byCat = {}; Object.keys(CATS).forEach(k => byCat[k]=0);
    let crit=0, live=0, total=0, last1h=0;
    for (const it of allItems) {
      byCat[it.category] = (byCat[it.category]||0)+1;
      if (severityFrom(it)==="crit") crit++;
      if (it._live) live++;
      if (Date.now() - it.publishedAt < 60*60*1000) last1h++;
      total++;
    }
    return { byCat, crit, live, total, last1h };
  }, [allItems, now]);

  const markRead = (id) => setReadIds(p => ({ ...p, [id]: true }));
  const toggleStar = (id) => setStarIds(p => { const n = { ...p }; if (n[id]) delete n[id]; else n[id]=true; return n; });

  return (
    <div className={"app density-" + tweaks.density + (tweaks.scanlines ? " scan" : "")}
         style={{ "--accent": tweaks.accent }}>
      <TopBar now={now} stats={stats} loading={loading} onRefresh={load} lastRefresh={lastRefresh} />
      <Toolbar
        query={query} setQuery={setQuery}
        activeCat={activeCat} setActiveCat={setActiveCat}
        stats={stats}
        layout={tweaks.layout} setLayout={(v)=>setTweak({layout:v})}
        density={tweaks.density} setDensity={(v)=>setTweak({density:v})}
      />
      <main className="main">
        <Sidebar
          sources={SOURCES}
          feeds={feeds}
          activeSrc={activeSrc} setActiveSrc={setActiveSrc}
        />
        <Feed
          items={filtered}
          layout={tweaks.layout}
          showSeverity={tweaks.showSeverity}
          showSnippets={tweaks.showSnippets}
          readIds={readIds} onRead={markRead}
          starIds={starIds} onStar={toggleStar}
        />
        <Aside items={allItems} starIds={starIds} />
      </main>
      <TweaksPanel tweaks={tweaks} setTweak={setTweak} forceOpen={tweaksOpen} />
    </div>
  );
}

// ---------- topbar ----------
function TopBar({ now, stats, loading, onRefresh, lastRefresh }) {
  const d = new Date(now);
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo static">
          <span className="logo-dot" />
          <span className="logo-dot logo-dot-b" />
          <span className="logo-dot logo-dot-c" />
        </div>
        <div className="brand-text">
          <div className="brand-name">{greeting(d)} JORDAN</div>
          <div className="brand-sub">// cyber news updates</div>
        </div>
      </div>

      <div className="datestack">
        <div className="dateline">{fmtDateHeader(d)}</div>
        <div className="clock">{fmtClock(d)}</div>
      </div>

      <div className="stats">
        <Stat label="FEEDS"   value={SOURCES.length} tone="muted" />
        <Stat label="LIVE"    value={stats.live}    tone={stats.live ? "good" : "muted"} />
        <Stat label="ITEMS"   value={stats.total}   tone="muted" />
        <Stat label="LAST 1H" value={stats.last1h}  tone="accent" />
        <Stat label="CRIT"    value={stats.crit}    tone="bad" pulse={stats.crit>0} />
      </div>

      <div className="topright">
        <div className="refresh-meta">
          {lastRefresh ? <>synced&nbsp;{fmtAgo(lastRefresh)}&nbsp;ago</> : "syncing…"}
        </div>
        <button className={"refresh-btn" + (loading ? " loading" : "")} onClick={onRefresh}>
          <span className="rbtn-icon" />
          <span>{loading ? "SYNCING" : "REFRESH"}</span>
        </button>
      </div>
    </header>
  );
}

function Stat({ label, value, tone, pulse }) {
  return (
    <div className={"stat tone-" + (tone||"muted") + (pulse ? " pulse":"")}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

// ---------- toolbar ----------
function Toolbar({ query, setQuery, activeCat, setActiveCat, stats, layout, setLayout, density, setDensity }) {
  return (
    <div className="toolbar">
      <div className="search">
        <span className="search-prompt">{">"}</span>
        <input
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder="grep across all feeds…"
          spellCheck={false}
        />
        {query && <button className="search-clear" onClick={()=>setQuery("")}>ESC</button>}
      </div>

      <div className="cats">
        <button className={"cat" + (activeCat==="all"?" active":"")} onClick={()=>setActiveCat("all")}>
          <span className="cat-dot" style={{background:"#d8dcd6"}} />
          <span>ALL</span>
          <span className="cat-n">{stats.total}</span>
        </button>
        {Object.entries(CATS).map(([k,v]) => (
          <button key={k} className={"cat" + (activeCat===k?" active":"")} onClick={()=>setActiveCat(k)}>
            <span className="cat-dot" style={{background:v.color}} />
            <span>{v.label}</span>
            <span className="cat-n">{stats.byCat[k]||0}</span>
          </button>
        ))}
      </div>

      <div className="tools">
        <div className="seg">
          <button className={layout==="grid"?"on":""} onClick={()=>setLayout("grid")} title="Grid">▦</button>
          <button className={layout==="list"?"on":""} onClick={()=>setLayout("list")} title="List">≡</button>
          <button className={layout==="ticker"?"on":""} onClick={()=>setLayout("ticker")} title="Ticker">⸗</button>
        </div>
        <div className="seg">
          <button className={density==="compact"?"on":""} onClick={()=>setDensity("compact")}>COMPACT</button>
          <button className={density==="comfortable"?"on":""} onClick={()=>setDensity("comfortable")}>COMFY</button>
        </div>
      </div>
    </div>
  );
}

// ---------- sidebar ----------
function Sidebar({ sources, feeds, activeSrc, setActiveSrc }) {
  const grouped = useMemo(() => {
    const g = {};
    for (const s of sources) { (g[s.category] ||= []).push(s); }
    return g;
  }, [sources]);

  return (
    <aside className="sidebar">
      <div className="side-head">
        <span>SOURCES</span>
        <span className="side-count">{sources.length}</span>
      </div>
      <button className={"src-row all" + (activeSrc==="all"?" active":"")} onClick={()=>setActiveSrc("all")}>
        <span className="src-marker" />
        <span className="src-name">ALL SOURCES</span>
      </button>

      {Object.entries(grouped).map(([cat, list]) => (
        <div className="src-group" key={cat}>
          <div className="src-group-head">
            <span className="gdot" style={{background:CATS[cat].color}} />
            <span>{CATS[cat].label}</span>
          </div>
          {list.map(s => {
            const f = feeds[s.id];
            const count = f ? f.items.length : 0;
            const live = f && f.live;
            const loading = f && f.loading;
            return (
              <button
                key={s.id}
                className={"src-row" + (activeSrc===s.id?" active":"") + (loading?" loading":"")}
                onClick={()=>setActiveSrc(s.id)}
              >
                <span className={"src-marker" + (live?" live":"")} />
                <span className="src-name">{s.name}</span>
                <span className="src-count">{count}</span>
              </button>
            );
          })}
        </div>
      ))}

      <div className="side-foot">
        <div>TLS 1.3 · HTTPS ONLY</div>
        <div>parse: rss2json · fallback: seeded</div>
      </div>
    </aside>
  );
}

// ---------- feed ----------
function Feed({ items, layout, showSeverity, showSnippets, readIds, onRead, starIds, onStar }) {
  if (!items.length) {
    return <section className="feed empty"><div className="empty-card">NO MATCHES.<br/><span>try clearing filters or search</span></div></section>;
  }
  if (layout === "ticker") {
    return (
      <section className="feed ticker">
        {items.map((it, i) => <TickerRow key={it.id} i={i} it={it} readIds={readIds} onRead={onRead} starIds={starIds} onStar={onStar} />)}
      </section>
    );
  }
  if (layout === "list") {
    return (
      <section className="feed list">
        {items.map(it => <ListRow key={it.id} it={it} showSev={showSeverity} showSnip={showSnippets} readIds={readIds} onRead={onRead} starIds={starIds} onStar={onStar} />)}
      </section>
    );
  }
  return (
    <section className="feed grid">
      {items.map(it => <Card key={it.id} it={it} showSev={showSeverity} showSnip={showSnippets} readIds={readIds} onRead={onRead} starIds={starIds} onStar={onStar} />)}
    </section>
  );
}

function Card({ it, showSev, showSnip, readIds, onRead, starIds, onStar }) {
  const read = !!readIds[it.id];
  const starred = !!starIds[it.id];
  const sev = severityFrom(it);
  return (
    <article className={"card" + (read?" read":"") + " sev-"+sev}>
      <div className="card-head">
        <span className="card-cat" style={{color: it.accent, borderColor: it.accent+"40"}}>
          <span className="card-cat-dot" style={{background:it.accent}} />
          {CATS[it.category].label}
        </span>
        {showSev && <span className="card-sev" style={{color: SEV_COLOR[sev]}}>■ {sev.toUpperCase()}</span>}
        <span className="card-ago">{fmtAgo(it.publishedAt)}</span>
      </div>
      <a className="card-title" href={it.link} target="_blank" rel="noreferrer" onClick={()=>onRead(it.id)}>
        {it.title}
      </a>
      {showSnip && it.snippet && <div className="card-snippet">{it.snippet}</div>}
      <div className="card-foot">
        <span className="card-src">{it.source}{it._live ? "" : " · cache"}</span>
        <div className="card-actions">
          <button className={"icon-btn" + (starred?" on":"")} onClick={()=>onStar(it.id)} title="Star">★</button>
          <button className="icon-btn" onClick={()=>onRead(it.id)} title="Mark read">◉</button>
        </div>
      </div>
    </article>
  );
}

function ListRow({ it, showSev, showSnip, readIds, onRead, starIds, onStar }) {
  const read = !!readIds[it.id];
  const starred = !!starIds[it.id];
  const sev = severityFrom(it);
  return (
    <div className={"lrow" + (read?" read":"") + " sev-"+sev}>
      <span className="lrow-ago">{fmtAgo(it.publishedAt).padStart(4," ")}</span>
      <span className="lrow-sev" style={{color: SEV_COLOR[sev]}}>■</span>
      <span className="lrow-src" style={{color: it.accent}}>{it.source.toUpperCase().slice(0,14).padEnd(14," ")}</span>
      <a className="lrow-title" href={it.link} target="_blank" rel="noreferrer" onClick={()=>onRead(it.id)}>
        {it.title}
      </a>
      <button className={"icon-btn s" + (starred?" on":"")} onClick={()=>onStar(it.id)}>★</button>
    </div>
  );
}

function TickerRow({ i, it, readIds, onRead, starIds, onStar }) {
  const read = !!readIds[it.id];
  const starred = !!starIds[it.id];
  const sev = severityFrom(it);
  return (
    <div className={"trow" + (read?" read":"")}>
      <span className="trow-n">{String(i+1).padStart(4,"0")}</span>
      <span className="trow-time">T-{fmtAgo(it.publishedAt).padStart(4," ")}</span>
      <span className="trow-sev" style={{background:SEV_COLOR[sev]}} />
      <span className="trow-src" style={{color: it.accent}}>[{it.source}]</span>
      <a className="trow-title" href={it.link} target="_blank" rel="noreferrer" onClick={()=>onRead(it.id)}>{it.title}</a>
      <button className={"icon-btn s" + (starred?" on":"")} onClick={()=>onStar(it.id)}>★</button>
    </div>
  );
}

// ---------- aside (right rail) ----------
function Aside({ items, starIds }) {
  const top = items.filter(i=>severityFrom(i)==="crit").slice(0,5);
  const starred = items.filter(i => starIds[i.id]).slice(0,6);
  const byCat = useMemo(() => {
    const counts = {};
    for (const i of items) counts[i.category] = (counts[i.category]||0)+1;
    return counts;
  }, [items]);
  const max = Math.max(1, ...Object.values(byCat));

  return (
    <aside className="aside">
      <section className="panel">
        <div className="panel-head">
          <span>CRITICAL WATCH</span>
          <span className="panel-sub">auto-flagged</span>
        </div>
        {top.length === 0 && <div className="panel-empty">no critical items</div>}
        {top.map(it => (
          <a key={it.id} className="crit" href={it.link} target="_blank" rel="noreferrer">
            <span className="crit-bar" />
            <div className="crit-body">
              <div className="crit-title">{it.title}</div>
              <div className="crit-meta">{it.source} · {fmtAgo(it.publishedAt)} ago</div>
            </div>
          </a>
        ))}
      </section>

      <section className="panel">
        <div className="panel-head">
          <span>CATEGORY LOAD</span>
          <span className="panel-sub">live</span>
        </div>
        <div className="bars">
          {Object.entries(CATS).map(([k,v]) => {
            const n = byCat[k]||0;
            const pct = Math.round((n/max)*100);
            return (
              <div className="bar-row" key={k}>
                <div className="bar-label">
                  <span className="gdot" style={{background:v.color}} />
                  <span>{v.label}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: pct+"%", background: v.color }} />
                </div>
                <div className="bar-val">{n}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><span>STARRED</span><span className="panel-sub">{starred.length}</span></div>
        {starred.length === 0 && <div className="panel-empty">click ★ on an item to pin here</div>}
        {starred.map(it => (
          <a key={it.id} className="star-row" href={it.link} target="_blank" rel="noreferrer">
            <span style={{color:"var(--accent)"}}>★</span>
            <span className="star-title">{it.title}</span>
          </a>
        ))}
      </section>

      <section className="panel ascii">
        <pre>{`          /\\
   ______/  \\______
  /   watchlist    \\
  |  ATT&CK  ∙ KEV  |
  |  IOCs    ∙ CISA |
  \\________________/
           ||
           ||
     hash · hash · hash`}</pre>
      </section>
    </aside>
  );
}

// ---------- tweaks ----------
function TweaksPanel({ tweaks, setTweak, forceOpen }) {
  const accents = ["#00e07a","#64d2ff","#ff9f1c","#ff4d6d","#c792ea","#ffd166"];
  const [manualOpen, setManualOpen] = useLocalState("cmb.tweaksOpen", false);
  const open = forceOpen || manualOpen;
  if (!open) {
    return (
      <button className="tweaks-fab" onClick={()=>setManualOpen(true)} title="Open tweaks">
        <span className="fab-dot" />
        <span>TWEAKS</span>
      </button>
    );
  }
  return (
    <div className="tweaks">
      <div className="tweaks-head">
        <span>TWEAKS</span>
        <span className="tweaks-sub">session-scoped</span>
        <button className="tweaks-collapse" onClick={()=>setManualOpen(false)} title="Collapse">—</button>
      </div>
      <div className="tw-row">
        <div className="tw-label">ACCENT</div>
        <div className="tw-swatches">
          {accents.map(c => (
            <button key={c} className={"swatch" + (tweaks.accent===c?" on":"")} style={{background:c}} onClick={()=>setTweak({accent:c})} />
          ))}
        </div>
      </div>
      <div className="tw-row">
        <div className="tw-label">LAYOUT</div>
        <div className="seg in-tweaks">
          {["grid","list","ticker"].map(l => (
            <button key={l} className={tweaks.layout===l?"on":""} onClick={()=>setTweak({layout:l})}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>
      <div className="tw-row">
        <div className="tw-label">DENSITY</div>
        <div className="seg in-tweaks">
          {["compact","comfortable"].map(l => (
            <button key={l} className={tweaks.density===l?"on":""} onClick={()=>setTweak({density:l})}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>
      <div className="tw-toggles">
        <Toggle label="SEVERITY TAG" on={tweaks.showSeverity} onChange={(v)=>setTweak({showSeverity:v})} />
        <Toggle label="SNIPPETS"     on={tweaks.showSnippets} onChange={(v)=>setTweak({showSnippets:v})} />
        <Toggle label="SCANLINES"    on={tweaks.scanlines}    onChange={(v)=>setTweak({scanlines:v})} />
      </div>
    </div>
  );
}
function Toggle({ label, on, onChange }) {
  return (
    <button className={"toggle" + (on?" on":"")} onClick={()=>onChange(!on)}>
      <span className="toggle-pip" />
      <span>{label}</span>
    </button>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
