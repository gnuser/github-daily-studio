const GITHUB = "https://github.com";
const API = "https://api.github.com";

function decodeHtml(value = "") {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value = "") {
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getText(url, userAgent) {
  const response = await fetch(url, {
    headers: {
      "Accept": "text/html",
      "User-Agent": userAgent,
    },
  });
  if (!response.ok) throw new Error(`GitHub HTML ${response.status}`);
  return response.text();
}

async function getJson(url, userAgent) {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/vnd.github+json",
      "User-Agent": userAgent,
    },
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  return response.json();
}

function parseTrending(html) {
  const articles = [...html.matchAll(/<article class="Box-row">([\s\S]*?)<\/article>/g)].map((m) => m[1]);
  return articles.map((block, index) => {
    const repoMatch = block.match(/href="\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)" data-view-component="true" class="Link"/);
    if (!repoMatch) return null;
    const fullName = repoMatch[1];
    const [owner, name] = fullName.split("/");
    const safeName = escapeRegExp(fullName);
    return {
      rank: index + 1,
      owner,
      name,
      full_name: fullName,
      html_url: `${GITHUB}/${fullName}`,
      description: decodeHtml(block.match(/<p class="col-9 color-fg-muted my-1 [^"]*">\s*([\s\S]*?)<\/p>/)?.[1] || ""),
      language: decodeHtml(block.match(/itemprop="programmingLanguage">([^<]+)<\/span>/)?.[1] || ""),
      stargazers_count: parseNumber(block.match(new RegExp(`href="/${safeName}/stargazers"[\\s\\S]*?<\\/svg>\\s*([\\d,]+)<\\/a>`))?.[1] || ""),
      forks_count: parseNumber(block.match(new RegExp(`href="/${safeName}/forks"[\\s\\S]*?<\\/svg>\\s*([\\d,]+)<\\/a>`))?.[1] || ""),
      stars_today: parseNumber(block.match(/([0-9,]+)\s+stars today/)?.[1] || ""),
      source_lists: ["trending-today"],
    };
  }).filter(Boolean);
}

function fromSearchItem(item, sourceList) {
  return {
    owner: item.owner?.login || item.full_name.split("/")[0],
    name: item.name,
    full_name: item.full_name,
    html_url: item.html_url,
    description: item.description || "",
    language: item.language || "",
    stargazers_count: item.stargazers_count || 0,
    forks_count: item.forks_count || 0,
    open_issues_count: item.open_issues_count || 0,
    pushed_at: item.pushed_at,
    updated_at: item.updated_at,
    topics: item.topics || [],
    source_lists: [sourceList],
  };
}

async function searchRepos(query, sourceList, perPage, userAgent) {
  const url = `${API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`;
  const data = await getJson(url, userAgent);
  return data.items.map((item) => fromSearchItem(item, sourceList));
}

function mergeRepo(target, incoming) {
  const lists = new Set([...(target.source_lists || []), ...(incoming.source_lists || [])]);
  return Object.assign(target, incoming, {
    description: target.description || incoming.description,
    language: target.language || incoming.language,
    stargazers_count: Math.max(target.stargazers_count || 0, incoming.stargazers_count || 0),
    forks_count: Math.max(target.forks_count || 0, incoming.forks_count || 0),
    stars_today: Math.max(target.stars_today || 0, incoming.stars_today || 0),
    source_lists: [...lists],
  });
}

export async function onRequestGet({ env }) {
  const userAgent = env.GITHUB_USER_AGENT || "github-daily-studio";
  try {
    const [trendingHtml, overall, ai, trading, algorithmic] = await Promise.all([
      getText(`${GITHUB}/trending?since=daily`, userAgent),
      searchRepos("stars:>50000 archived:false", "overall-stars", 8, userAgent),
      searchRepos("topic:artificial-intelligence stars:>1000 archived:false", "ai-topic", 8, userAgent),
      searchRepos("topic:trading stars:>1000 archived:false", "trading-topic", 8, userAgent),
      searchRepos("topic:algorithmic-trading stars:>1000 archived:false", "algorithmic-trading-topic", 8, userAgent),
    ]);

    const trending = parseTrending(trendingHtml).slice(0, 16);
    const repoMap = new Map();
    for (const item of [...trending, ...overall, ...ai, ...trading, ...algorithmic]) {
      const key = item.full_name.toLowerCase();
      repoMap.set(key, repoMap.has(key) ? mergeRepo(repoMap.get(key), item) : item);
    }

    const deduped = [...repoMap.values()].sort((a, b) => {
      const bHot = (b.stars_today || 0) * 1000000 + (b.stargazers_count || 0);
      const aHot = (a.stars_today || 0) * 1000000 + (a.stargazers_count || 0);
      return bHot - aHot;
    });

    return Response.json({
      generated_at: new Date().toISOString(),
      sources: {
        trending_today: `${GITHUB}/trending?since=daily`,
        overall_stars: `${API}/search/repositories?q=${encodeURIComponent("stars:>50000 archived:false")}&sort=stars&order=desc`,
        ai_topic: `${GITHUB}/topics/artificial-intelligence?o=desc&s=stars`,
        trading_topic: `${GITHUB}/topics/trading?o=desc&s=stars`,
        algorithmic_trading_topic: `${GITHUB}/topics/algorithmic-trading?o=desc&s=stars`,
      },
      counts: {
        trending: trending.length,
        overall: overall.length,
        ai: ai.length,
        trading: trading.length,
        algorithmic: algorithmic.length,
        deduped: deduped.length,
      },
      trending,
      overall,
      ai,
      trading,
      algorithmic,
      deduped,
    }, {
      headers: {
        "Cache-Control": "public, max-age=180",
      },
    });
  } catch (error) {
    return Response.json({
      error: "github_fetch_failed",
      message: error.message,
    }, { status: 502 });
  }
}
