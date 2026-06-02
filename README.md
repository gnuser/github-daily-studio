# GitHub Daily

按日历浏览 GitHub 热榜日报的静态站点。默认首页就是日报档案：左侧是日历，点击有标记的日期查看当天日报；右侧是纸质报纸样式的最终展示版，日报里的仓库名都可点击进入对应 GitHub repo。

## 当前内容

- 已归档：`2026-06-02`
- 数据源：GitHub Trending、GitHub Search API、AI / Trading / Algorithmic Trading Topics
- 去重字段：`full_name`
- 静态日报数据：`data/github-briefing-data.json`
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

普通静态服务器即可打开。若要测试 Cloudflare Pages Function：

```bash
npm install
npm run pages:dev
```

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

## 手动发布到 Cloudflare Pages

1. 在 Cloudflare Pages 新建项目。
2. 连接 GitHub 仓库 `gnuser/github-daily-studio`。
3. Framework preset 选 `None`。
4. Build command 留空。
5. Build output directory 填 `/`。
6. 部署后绑定自定义域名，例如：

```text
github-daily.xiajuan.app
```

仓库里已包含 `_headers`、`functions/api/github-briefing.js` 和 `wrangler.toml.example`。不配置任何 secret 也能作为静态日报站点运行；Cloudflare Function 只是预留给未来实时抓取。

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
