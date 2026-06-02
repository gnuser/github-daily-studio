# GitHub Daily Studio

GitHub Daily Studio 是一个静态优先的 GitHub 热榜简报生成器。前台可直接使用样例数据渲染报纸式预览，并下载当前 PNG；部署到 Cloudflare Pages 后，`/api/github-briefing` 会实时抓取 GitHub Trending、整体 Stars、AI、Trading、Algorithmic Trading 数据并按 `full_name` 去重。

## 本地预览

```bash
npm run dev
```

访问：

```text
http://127.0.0.1:8787
```

普通静态服务器会使用 `data/github-briefing-data.json` 样例数据。若要测试 Cloudflare Pages Functions：

```bash
npm install
npm run pages:dev
```

## 部署到 Cloudflare Pages

```bash
npm install
cp wrangler.toml.example wrangler.toml
npm run deploy
```

建议绑定子域名：

```text
github-daily.xiajuan.app
```

当前机器上的 Wrangler 未登录 Cloudflare，无法直接创建 Pages 项目或绑定 `xiajuan.app` 子域名。登录后可继续执行部署：

```bash
npx wrangler login
npm run deploy
```

然后在 Cloudflare Pages 项目的 Custom domains 里添加 `github-daily.xiajuan.app`。
