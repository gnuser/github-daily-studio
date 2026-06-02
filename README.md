# GitHub Daily

按日历浏览 GitHub 热榜日报的静态站点。默认首页就是日报档案：左侧是日历，点击有标记的日期查看当天日报；右侧是纸质报纸样式的最终展示版，日报里的仓库名都可点击进入对应 GitHub repo。

## 当前内容

- 已归档：`2026-06-02`
- 数据源：GitHub Trending、GitHub Search API、AI / Trading / Algorithmic Trading Topics
- 去重字段：`full_name`
- 静态日报数据：`data/github-briefing-data.json`
- 远程兼职职位日报：`data/remote-jobs-briefing-2026-06-02.json`
- 静态导出图：`assets/github-tech-daily.png`
- Remotion 竖屏介绍视频：`assets/github-daily-intro.mp4`
- Remotion 视频封面：`assets/github-daily-intro-poster.png`
- Remotion 转场音效与播音风格中文旁白：`public/audio/`

## 本地预览

```bash
npm run dev
```

访问：

```text
http://127.0.0.1:8787
```

普通静态服务器即可打开。若要测试 Cloudflare Worker + Static Assets：

```bash
npm install
npm run worker:dev
```

首页支持日报类型切换：

```text
http://127.0.0.1:8787/
http://127.0.0.1:8787/?type=jobs
```

`?type=jobs` 会直接打开远程兼职职位日报。当前筛选条件为 Go / Golang 后端 / 后端工程师、兼职或项目制、全国/全球远程、接受居家办公。职位源覆盖 RemoteJobsCN、RemoteCN、V2EX 和 BOSS 直聘；多数招聘来源未公开截止时间，BOSS 详情页还可能触发登录/安全校验，页面会标注为“需投递前确认”或“需登录核验”，不伪造截止日期。

## Remotion 每日热榜介绍

项目包含一个 1080 × 1920、18 秒的 Remotion 竖屏短片，用来介绍每日 GitHub 热榜、Top 3 项目、AI / Trading 观察和最终日报页。视频已移除背景音乐，保留轻量转场音效，并使用播音风格中文旁白作为主声道。

```bash
npm run remotion:preview
npm run remotion:still
npm run remotion:render
```

渲染结果默认写入：

```text
out/github-daily-intro.png
out/github-daily-intro.mp4
```

当前可发布版本已复制到：

```text
assets/github-daily-intro-poster.png
assets/github-daily-intro.mp4
```

## 发布到 Cloudflare Worker

项目使用和 `dandantang-duel` 类似的 Wrangler Worker 配置：`wrangler.jsonc` 里设置 `assets.directory`、`run_worker_first` 和 `custom_domain` route。目标域名是：

```text
daily-studio.xiajuan.app
```

先生成干净的静态资源目录，只包含线上需要的静态文件、`_headers`、`assets/`、`data/` 和 `public/`：

```bash
npm run pages:prepare
```

发布目录会生成在：

```text
.deploy/cloudflare-pages
```

如果要用 Wrangler 上传：

```bash
npm run deploy
```

`npm run deploy` 会执行 `wrangler deploy --config wrangler.jsonc`，创建/更新名为 `daily-studio` 的 Worker，并通过 `routes` 绑定到 `daily-studio.xiajuan.app`。若 Wrangler 未登录，可先运行 `npx wrangler login`，或设置 `CLOUDFLARE_API_TOKEN` 后再执行发布脚本。API token 需要 Workers Scripts Edit、Workers Routes Edit、Zone Read、User Details Read 等部署和路由权限。

## 新增一期日报

把新的日报 JSON 放到 `data/`，然后在 `app.js` 顶部的 `reports` 数组追加：

```js
{
  date: "2026-06-03",
  issue: "002",
  title: "GitHub Daily",
  dataUrl: "./data/github-briefing-2026-06-03.json",
  imageUrl: "./assets/github-tech-daily-2026-06-03.png"
}
```

日历会自动出现可点击日期。
