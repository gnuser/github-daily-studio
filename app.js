const reports = [
  {
    date: "2026-06-02",
    issue: "001",
    title: "GitHub Daily",
    dataUrl: "./data/github-briefing-data.json",
    imageUrl: "./assets/github-tech-daily.png",
  },
];

const cnBriefs = {
  "microsoft/markitdown": "微软的文件转 Markdown 工具。适合把 PDF、Office、图片和网页内容清洗成 RAG、Agent、知识库可直接吃的文本入口。",
  "harry0703/moneyprinterturbo": "用 AI 大模型一键生成高清短视频，从脚本、配音到素材拼接全流程自动化，单日增星在今日榜单里格外醒目。",
  "nesquena/hermes-webui": "Hermes Agent 的 Web 和手机入口，说明开源 Agent 正从命令行走向更易触达的多端操作界面。",
  "supermemoryai/supermemory": "面向 AI 时代的高速记忆引擎和 Memory API，主打可扩展、低延迟和跨应用上下文沉淀。",
  "d4vinci/scrapling": "自适应网页抓取框架，从单请求到大规模爬取都能覆盖，适合数据采集和自动化任务。",
  "pbakaus/impeccable": "面向 AI 设计执行的设计语言，把视觉约束转译成 AI 工具更容易遵守的规则。",
  "tauricresearch/tradingagents": "多智能体 LLM 金融交易框架，把分析师、研究员和交易决策拆成可协作的 Agent 角色。",
  "significant-gravitas/autogpt": "自治 Agent 早期标杆项目，AI topic 星标榜首，定位是让更多人使用和构建可执行任务的 AI 工具。",
  "f/prompts.chat": "开源提示词收集与自托管平台，体现提示工程仍是团队沉淀 AI 使用经验的入口。",
  "rasbt/llms-from-scratch": "用 PyTorch 从零实现类 ChatGPT 的学习仓库，适合理解 Transformer 和训练管线。",
  "hacksider/deep-live-cam": "实时换脸与一键视频生成项目，在 AI 多媒体工具链中保持很高关注。",
  "codecrafters-io/build-your-own-x": "长期星标榜第一梯队，通过复刻数据库、Docker、Git 等经典技术帮助开发者反向学习系统设计。",
  "freqtrade/freqtrade": "开源加密货币交易机器人，覆盖策略回测、部署和自动交易。",
  "microsoft/qlib": "微软 AI 量化研究平台，把监督学习、市场动态建模和强化学习引入投资研究流程。",
  "ccxt/ccxt": "覆盖 100 多家交易所的加密交易 API，横跨多语言生态，是交易工具链里的基础设施。",
  "vnpy/vnpy": "Python 开源量化交易平台开发框架，在中文量化社区有长期积累。",
  "nautechsystems/nautilus_trader": "Rust 原生交易引擎，强调确定性事件驱动架构和生产级稳定性。",
  "mementum/backtrader": "Python 交易策略回测库，老牌策略验证工具。",
  "quantconnect/lean": "QuantConnect 的算法交易引擎，支持 Python 与 C# 策略开发。",
};

const reportData = new Map();
let visibleMonth = parseDate(reports[0].date);
let activeDate = reports[0].date;

const $ = (selector) => document.querySelector(selector);

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(typeof value === "string" ? parseDate(value) : value);
}

function formatWeekday(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    weekday: "long",
  }).format(typeof value === "string" ? parseDate(value) : value);
}

function formatTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

function fmtNum(value) {
  if (!value) return "0";
  if (value >= 100000) return `${(value / 10000).toFixed(1)}万`;
  if (value >= 10000) return `${(value / 10000).toFixed(2)}万`;
  return Number(value).toLocaleString("en-US");
}

function byFullName(data, fullName) {
  return data.deduped.find((repo) => repo.full_name.toLowerCase() === fullName.toLowerCase());
}

function brief(repo) {
  return cnBriefs[repo.full_name.toLowerCase()] || repo.description || "热门开源项目，正在 GitHub 榜单中获得开发者集中关注。";
}

function statLine(repo, showToday = true) {
  const pieces = [];
  if (showToday && repo.stars_today) pieces.push(`▲ ${repo.stars_today.toLocaleString("en-US")} today`);
  if (repo.stargazers_count) pieces.push(`★ ${fmtNum(repo.stargazers_count)}`);
  if (repo.language) pieces.push(repo.language);
  return pieces.join(" · ");
}

function repoLink(repo) {
  const [owner, name] = repo.full_name.split("/");
  return `<a class="repo-link" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer"><span class="repo-owner">${escapeHtml(owner)}</span> / <span>${escapeHtml(name)}</span></a>`;
}

function renderCalendar() {
  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const monthEnd = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  const firstCell = new Date(monthStart);
  firstCell.setDate(monthStart.getDate() - mondayOffset);
  const available = new Set(reports.map((report) => report.date));

  $("#monthLabel").textContent = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
  }).format(monthStart);

  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const day = new Date(firstCell);
    day.setDate(firstCell.getDate() + index);
    const key = dateKey(day);
    const isOutside = day.getMonth() !== monthStart.getMonth();
    const isAvailable = available.has(key);
    const isActive = key === activeDate;
    cells.push(`
      <button
        class="day-button ${isOutside ? "outside" : ""} ${isAvailable ? "available" : ""} ${isActive ? "active" : ""}"
        type="button"
        ${isAvailable ? `data-date="${key}" aria-label="查看 ${formatDate(key)} 日报"` : "disabled"}
      >${day.getDate()}</button>
    `);
  }
  $("#calendarGrid").innerHTML = cells.join("");
  $("#calendarGrid").querySelectorAll("[data-date]").forEach((button) => {
    button.addEventListener("click", () => selectReport(button.dataset.date));
  });
}

function reportForDate(date) {
  return reports.find((report) => report.date === date) || reports[0];
}

async function loadReport(date) {
  const report = reportForDate(date);
  if (!reportData.has(report.date)) {
    const response = await fetch(report.dataUrl, { cache: "no-store" });
    reportData.set(report.date, await response.json());
  }
  return { report, data: reportData.get(report.date) };
}

async function selectReport(date) {
  activeDate = date;
  renderCalendar();
  const { report, data } = await loadReport(date);
  renderIssueCard(report, data);
  renderNewspaper(report, data);
}

function renderIssueCard(report, data) {
  const cross = data.deduped.filter((repo) => repo.source_lists?.length > 1).length;
  $("#issueLabel").textContent = `第 ${report.issue} 期`;
  $("#issueTitle").textContent = report.title;
  $("#issueSummary").textContent = `${formatDate(report.date)} · 合并 ${data.counts.trending} 个 Trending 项目，去重后 ${data.counts.deduped} 个唯一仓库。`;
  $("#statTrending").textContent = data.counts.trending;
  $("#statDeduped").textContent = data.counts.deduped;
  $("#statCross").textContent = cross;
}

function renderNewspaper(report, data) {
  const cross = data.deduped.filter((repo) => repo.source_lists?.length > 1).length;
  const lead = byFullName(data, "microsoft/markitdown") || data.trending[0];
  const second = byFullName(data, "harry0703/MoneyPrinterTurbo") || data.trending[1];
  const tradingAgents = byFullName(data, "TauricResearch/TradingAgents") || data.trading[0];
  const topAi = byFullName(data, "Significant-Gravitas/AutoGPT") || data.ai[0];
  const topOverall = byFullName(data, "codecrafters-io/build-your-own-x") || data.overall[0];
  const topAlgo = byFullName(data, "freqtrade/freqtrade") || data.algorithmic[0];

  $("#captureTime").textContent = `数据抓取：${formatTime(data.generated_at)} CST`;
  $("#mastIssue").textContent = `第 ${report.issue} 期`;
  $("#mastDate").textContent = formatDate(report.date);
  $("#mastWeekday").textContent = formatWeekday(report.date);
  $("#trendingLabel").textContent = `${formatDate(report.date)} top picks`;

  $("#leadHeadline").innerHTML = `${escapeHtml(lead.name)} 今日领跑：<br>文档入库，成为 AI 工作流入口`;
  $("#leadCopy").innerHTML = `${repoLink(lead)} 位列 GitHub Trending 日榜第 ${lead.rank || 1}，今日新增 ${lead.stars_today?.toLocaleString("en-US") || 0} 星，累计 ${fmtNum(lead.stargazers_count)} 星。${escapeHtml(brief(lead))}`;
  $("#leadMeta").textContent = statLine(lead);

  $("#secondaryHeadline").textContent = `${second.name} 单日增星更猛，AI 短视频继续升温`;
  $("#secondaryCopy").innerHTML = `${repoLink(second)} 今日新增 ${second.stars_today?.toLocaleString("en-US") || 0} 星。${escapeHtml(brief(second))}`;

  $("#sideRail").innerHTML = [
    ["AI Topic 榜首", topAi, `AI topic · ★ ${fmtNum(topAi.stargazers_count)}`],
    ["交易赛道跨榜项目", tradingAgents, `Trending #${tradingAgents.rank || "-"} · Trading topic #1`],
    ["长期星标冠军", topOverall, `Overall stars · ★ ${fmtNum(topOverall.stargazers_count)}`],
    ["量化/交易核心库", topAlgo, `Algorithmic trading · ★ ${fmtNum(topAlgo.stargazers_count)}`],
  ].map(([title, repo, meta]) => `
    <article class="rail-item">
      <h4>${escapeHtml(title)}</h4>
      <b>${repoLink(repo)}</b>
      <p>${escapeHtml(brief(repo))}</p>
      <span class="repo-meta">${escapeHtml(meta)}</span>
    </article>
  `).join("");

  $("#featuredRepo").innerHTML = `
    <div class="rank-box">1</div>
    <div><h4>${repoLink(lead)}</h4></div>
    <span class="repo-meta">▲ ${lead.stars_today?.toLocaleString("en-US") || 0}</span>
    <p>${escapeHtml(brief(lead))}</p>
  `;

  $("#trendingList").innerHTML = data.trending.slice(1, 6).map((repo, index) => `
    <article class="rank-item">
      <span class="rank-num">${index + 2}</span>
      <div>
        <h4>${repoLink(repo)}</h4>
        <p>${escapeHtml(brief(repo))}</p>
        <span class="repo-meta">${escapeHtml(statLine(repo))}</span>
      </div>
    </article>
  `).join("");

  $("#darkTrending").textContent = data.counts.trending;
  $("#darkDeduped").textContent = data.counts.deduped;
  $("#darkCross").textContent = cross;

  $("#aiStories").innerHTML = data.ai.slice(0, 4).map((repo) => `
    <article class="paper-story">
      <h4>${repoLink(repo)}</h4>
      <p>${escapeHtml(brief(repo))}</p>
      <span class="repo-meta">${escapeHtml(statLine(repo, false))}</span>
    </article>
  `).join("");

  const trading = [
    ...data.trading,
    ...data.algorithmic,
  ].filter((repo, index, arr) => arr.findIndex((item) => item.full_name === repo.full_name) === index);
  $("#tradingWatch").innerHTML = trading.slice(0, 8).map((repo, index) => `
    <article class="watch-item">
      <span class="rank-num">${index + 1}</span>
      <div>
        <h4>${repoLink(repo)}</h4>
        <span class="repo-meta">${escapeHtml(statLine(repo, false))}</span>
      </div>
    </article>
  `).join("");
}

$("#prevMonth").addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  renderCalendar();
});

$("#nextMonth").addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  renderCalendar();
});

renderCalendar();
selectReport(activeDate);
