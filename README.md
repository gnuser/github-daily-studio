# Daily Report

个人日报：GitHub 热榜与 AI 日报，保留米色报纸和分类日历。

## 预览与发布

```sh
npm run pages:prepare
npm run worker:dev
npm run deploy
```

正式站：https://daily-studio.xiajuan.app/ 。纯静态预览可用 `npm run dev`，API 不可用时显示 GitHub 历史存档。构建仅打包页面和日报 JSON，不包含旧职位数据、私密配置或 Remotion 素材。仓库中的旧素材保留。

## AI 日报

`?type=ai&date=2026-10-07` 可直接阅读指定日期，选择日历后刷新保留分类与日期。每日北京时间 11:00 由既有 Codex 自动任务核验来源、更新文件并发布，站点本身不调付费模型。

- `data/ai-index.json`：按日期倒序的日历索引。
- `data/ai-briefing-YYYY-MM-DD.json`：schema_version、北京时间归档日期、采集时间、检索窗口、摘要、范围说明和 items。
- 每条含稳定 id、分类、标题、独立摘要、事件日期、日期精度、采集时间和原始来源链接。
- 同日替换同名文件与索引条目，不重复追加；历史日期不删除。无可靠新增保存空 items 并说明检索结果。
- 只使用原始公告、论文或产品博客。日期精度不足时明确披露，不能伪造精确时间或声称严格落入 24 小时窗口。
- 2026-10-06 是旧版 AIHOT 外链存档，不冒充本站原创；从 2026-10-07 起正文站内阅读。

## GitHub 热榜

保留 `/api/github-briefing` 最新官方日榜及已有静态历史；历史索引为 `data/github-index.json`，app.js 中保留相同的 GitHub 历史日期。AI 类别不依赖 GitHub API 成功。构建为 JS/CSS 添加内容哈希避免旧缓存。

检查：`node --check app.js`、`npm run pages:prepare`。发布使用现有 Worker 配置，不改 DNS、账号权限或其他项目。
