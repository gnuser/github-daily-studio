const state = {
  data: null,
  source: "sample",
};

const briefs = {
  "microsoft/markitdown": "文件转 Markdown 工具，适合把 PDF、Office、图片与网页材料清洗成 RAG、Agent、知识库可直接消费的文本入口。",
  "harry0703/moneyprinterturbo": "AI 短视频自动化项目，把脚本生成、素材组织和视频合成压成一条内容生产链路。",
  "tauricresearch/tradingagents": "多智能体 LLM 金融交易框架，把分析师、研究员和交易决策拆成可协作的 Agent 角色。",
  "significant-gravitas/autogpt": "自治 Agent 早期标杆项目，定位是让更多人使用和构建可执行任务的 AI 工具。",
  "codecrafters-io/build-your-own-x": "长期星标榜第一梯队，通过复刻经典技术帮助开发者反向学习系统设计。",
  "freqtrade/freqtrade": "开源加密货币交易机器人，覆盖策略回测、部署和自动交易。",
};

const $ = (selector) => document.querySelector(selector);

function fmtNum(value) {
  if (!value) return "0";
  if (value >= 100000) return `${(value / 10000).toFixed(1)}万`;
  if (value >= 10000) return `${(value / 10000).toFixed(2)}万`;
  return Number(value).toLocaleString("en-US");
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function repoLabel(item) {
  const [owner, name] = item.full_name.split("/");
  return `<span class="owner">${escapeHtml(owner)}</span> / <span>${escapeHtml(name)}</span>`;
}

function brief(item) {
  return briefs[item.full_name.toLowerCase()] || item.description || "热门开源项目，正在 GitHub 榜单中获得开发者集中关注。";
}

function statLine(item, showToday = true) {
  const parts = [];
  if (showToday && item.stars_today) parts.push(`▲ ${item.stars_today.toLocaleString("en-US")} today`);
  if (item.stargazers_count) parts.push(`★ ${fmtNum(item.stargazers_count)}`);
  if (item.language) parts.push(item.language);
  return parts.join(" · ");
}

function selectedSections() {
  return [...document.querySelectorAll('input[name="section"]:checked')].map((input) => input.value);
}

function filteredRepos(data) {
  const sections = selectedSections();
  const sourceMap = {
    trending: "trending-today",
    ai: "ai-topic",
    trading: "trading-topic",
    overall: "overall-stars",
  };
  return data.deduped.filter((item) => {
    if (!item.source_lists?.length) return true;
    return sections.some((section) => item.source_lists.includes(sourceMap[section]));
  });
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function renderMetrics(data) {
  const cross = data.deduped.filter((item) => item.source_lists?.length > 1).length;
  $("#metricTrending").textContent = data.counts.trending ?? data.trending.length;
  $("#metricDeduped").textContent = data.counts.deduped ?? data.deduped.length;
  $("#metricCross").textContent = cross;
  $("#generatedAt").textContent = `${formatDate(data.generated_at)} · ${state.source === "live" ? "线上数据" : "样例数据"}`;
  $("#sourceStatus").textContent = state.source === "live" ? "线上数据" : "样例数据";
}

function renderPaper(data) {
  const repos = filteredRepos(data);
  const trending = data.trending.filter((item) => repos.some((repo) => repo.full_name === item.full_name));
  const lead = trending[0] || repos[0] || data.deduped[0];
  const title = $("#briefTitle").value.trim() || "GitHub Daily";
  const issue = $("#issueNo").value.trim() || "001";

  $("#previewName").textContent = title;
  $(".paper-mast h2").textContent = title;
  $("#paperIssue").textContent = `第 ${issue} 期`;
  $("#paperDate").textContent = formatDate(data.generated_at);
  $("#leadTitle").innerHTML = `${escapeHtml(lead.name)} 今日领跑：<br>开源热度继续上行`;
  $("#leadCopy").innerHTML = `${repoLabel(lead)} 位列当前筛选榜单前列。${escapeHtml(brief(lead))}`;
  $("#leadMeta").textContent = statLine(lead);

  const railItems = [
    data.ai?.[0],
    data.trading?.[0],
    data.overall?.[0],
  ].filter(Boolean);

  $("#paperRail").innerHTML = railItems.map((item, index) => `
    <article class="rail-card">
      <h4>${["AI Topic 榜首", "交易赛道焦点", "长期星标冠军"][index]}</h4>
      <b>${repoLabel(item)}</b>
      <p>${escapeHtml(brief(item))}</p>
      <span class="repo-meta">${escapeHtml(statLine(item, false))}</span>
    </article>
  `).join("");

  $("#trendingList").innerHTML = trending.slice(0, 6).map((item, index) => `
    <article class="paper-row">
      <span class="rank">${index + 1}</span>
      <div>
        <strong>${repoLabel(item)}</strong>
        <p>${escapeHtml(brief(item))}</p>
        <span class="repo-meta">${escapeHtml(statLine(item))}</span>
      </div>
    </article>
  `).join("");

  const watch = [...(data.ai || []), ...(data.trading || []), ...(data.algorithmic || [])]
    .filter((item, index, arr) => arr.findIndex((candidate) => candidate.full_name === item.full_name) === index)
    .slice(0, 8);
  $("#watchList").innerHTML = watch.map((item, index) => `
    <article class="watch-row">
      <span class="rank">${index + 1}</span>
      <div>
        <strong>${repoLabel(item)}</strong>
        <span class="repo-meta">${escapeHtml(statLine(item, false))}</span>
      </div>
    </article>
  `).join("");
}

function renderRepoList(data) {
  const repos = filteredRepos(data);
  $("#repoList").innerHTML = repos.slice(0, 32).map((item, index) => `
    <article class="repo-row">
      <span class="rank">${index + 1}</span>
      <div>
        <strong>${repoLabel(item)}</strong>
        <p>${escapeHtml(brief(item))}</p>
        <span class="repo-meta">${escapeHtml(statLine(item))}</span>
      </div>
    </article>
  `).join("");
  $("#sourceLine").textContent = `${repos.length} 个唯一仓库 · full_name 去重`;
}

function renderAll() {
  if (!state.data) return;
  renderMetrics(state.data);
  renderPaper(state.data);
  renderRepoList(state.data);
}

async function loadSample() {
  const response = await fetch("./data/github-briefing-data.json", { cache: "no-store" });
  state.data = await response.json();
  state.source = "sample";
  renderAll();
}

async function refreshLive() {
  $("#sourceStatus").textContent = "刷新中";
  try {
    const response = await fetch("/api/github-briefing", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    state.source = "live";
  } catch (error) {
    await loadSample();
    $("#sourceStatus").textContent = "样例数据";
  }
  renderAll();
}

function downloadJson() {
  if (!state.data) return;
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "github-briefing-data.json";
  link.click();
  URL.revokeObjectURL(url);
}

$("#refreshBtn").addEventListener("click", refreshLive);
$("#sampleBtn").addEventListener("click", loadSample);
$("#renderBtn").addEventListener("click", renderAll);
$("#downloadDataBtn").addEventListener("click", downloadJson);
$("#briefTitle").addEventListener("input", renderAll);
$("#issueNo").addEventListener("input", renderAll);
document.querySelectorAll('input[name="section"]').forEach((input) => {
  input.addEventListener("change", renderAll);
});

loadSample();
