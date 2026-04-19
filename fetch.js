// Fetch layer. Tries rss2json public API; falls back to seeded items.
// Each item: { id, title, link, source, sourceId, category, accent, publishedAt, snippet, author }

(function(){
  const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";

  async function fetchOne(src, { timeoutMs = 7000 } = {}) {
    const ctrl = new AbortController();
    const to = setTimeout(()=>ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(RSS2JSON + encodeURIComponent(src.rss), { signal: ctrl.signal });
      clearTimeout(to);
      if (!r.ok) throw new Error("http " + r.status);
      const j = await r.json();
      if (j.status !== "ok" || !Array.isArray(j.items)) throw new Error("bad payload");
      return j.items.slice(0, 12).map((it, i) => ({
        id: src.id + "::" + (it.guid || it.link || i),
        title: clean(it.title || "(untitled)"),
        link: it.link,
        source: src.name,
        sourceId: src.id,
        category: src.category,
        accent: src.accent,
        publishedAt: parseDate(it.pubDate) || Date.now(),
        snippet: stripHtml(it.description || it.content || "").slice(0, 240),
        author: clean(it.author || ""),
      }));
    } catch (e) {
      clearTimeout(to);
      return null;
    }
  }

  function clean(s){ return (s||"").replace(/\s+/g," ").trim(); }
  function stripHtml(s){ return clean((s||"").replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">")); }
  function parseDate(s){ const t = Date.parse(s||""); return isNaN(t) ? null : t; }

  async function fetchAll(sources, { onSource } = {}) {
    const results = await Promise.all(sources.map(async (s) => {
      const items = await fetchOne(s);
      const final = items && items.length ? items : window.CMB_FALLBACK.forSource(s);
      const live = !!(items && items.length);
      if (onSource) onSource(s, { items: final, live });
      return { source: s, items: final, live };
    }));
    return results;
  }

  window.CMB_FETCH = { fetchOne, fetchAll };
})();
