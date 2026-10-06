const GITHUB = "https://github.com";

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
    signal: AbortSignal.timeout(10000),
    headers: {
      "Accept": "text/html",
      "User-Agent": userAgent,
    },
  });
  if (!response.ok) throw new Error(`GitHub HTML ${response.status}`);
  return response.text();
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

export async function onRequestGet({ env = {} }) {
 try {
  const html = await getText(`${GITHUB}/trending?since=daily`, env.GITHUB_USER_AGENT || "github-daily-studio");
  const trending = parseTrending(html);
  if (!trending.length) throw new Error("Trending parsing returned no projects");
  return Response.json({ generated_at: new Date().toISOString(), sources: {trending_today: `${GITHUB}/trending?since=daily`}, counts: {trending: trending.length}, trending }, {headers:{"Cache-Control":"public, max-age=180"}});
 } catch (error) {
  return Response.json({error:"github_fetch_failed", message:error.message}, {status:502});
 }
}
