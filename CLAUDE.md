# ARCEN Advisory — Claude Session Guide

> 知识节点入口：[[MOC_WebDev]]

## Skill routing
- Bugs / errors → invoke investigate
- QA, test site → invoke qa
- Ship / deploy → invoke ship
- Code review → invoke review

---

## [RULE] 何时用 Sandbox

**直接改 `index.html`：** 文案、单行 CSS、meta 标签、DICT 翻译更新  
**先改 `index-preview.html`：** 新增 section、布局重构、多函数 JS 修改

---

## [FACT] 项目信息

| Key | Value |
|-----|-------|
| Main site URL | https://arcen-advisory.vercel.app |
| GitHub repo | https://github.com/brunoycai-png/arcen-advisory |
| Supabase URL | https://lgcxehxrpnzvyjojukod.supabase.co |
| Supabase KEY | sb_publishable_xqjvFfsbHlT8A7CsdaEsMw_Q2asL6i8 |
| Supabase project ID | lgcxehxrpnzvyjojukod |
| Groq model | llama-3.1-8b-instant |
| Languages | EN / FR / ZH |

---

## [FACT] index.html Section Map

| Lines | Section |
|-------|---------|
| 1–9 | `<head>` — meta, title |
| 10–600 | `<style>` — all CSS |
| 601–620 | `<nav>` — logo + links + lang + Ask ARCEN + Contact |
| 621–700 | `<!-- HERO -->` |
| 701–900 | `<!-- MODULES -->` — m1 CLARITY / m2 ENTRY / m3 GROWTH |
| 901–960 | `<!-- ADDONS -->` |
| 961–990 | `<!-- MAP -->` — D3 world map |
| 991–1060 | `<!-- CASES -->` — carousel |
| 1061–1160 | `<!-- INSIGHTS -->` — carousel 2×2 |
| 1161–1210 | `<!-- CONTACT -->` — form → Supabase inquiries |
| 1211–1230 | `<!-- FOOTER -->` |
| 1231–1250 | `<!-- AI DRAWER -->` — Ask ARCEN chat panel |
| 1251–1270 | D3 scripts (cdn.jsdelivr.net) |
| 1271–1380 | `<script>` — lang switcher, carousel, AI chat, contact form, D3 map |

---

## [FACT] File Map

| File | Purpose |
|------|---------|
| `index.html` | 主站，所有 CSS + JS 内联 |
| `index-preview.html` | 沙盒：大改前先在这里测试 |
| `vercel.json` | 安全 headers (CSP 已含 cdn.jsdelivr.net) |
| `sitemap.xml` | 页面 URL（新文章用 add-article.js 更新） |
| `llms.txt` | AI 爬虫识别文件 |
| `robots.txt` | 爬虫规则 |
| `scripts/add-article.js` | 新文章脚手架（更新 sitemap + llms.txt） |
| `scripts/migrate-imgs.js` | base64 → Supabase Storage |
| `.github/workflows/deploy.yml` | CI/CD — 需要设置 GitHub Secrets |

---

## [FACT] Supabase 表结构

| 表 | 用途 |
|----|------|
| `inquiries` | 联系表单提交（anon INSERT） |
| `chat_logs` | AI 对话记录（anon INSERT） |

---

## [FACT] 待办（部署前）

- [ ] GitHub Secrets 设置：`VERCEL_TOKEN` + `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID`
- [ ] 创建 `.github/workflows/deploy.yml`
- [ ] Google Search Console 注册验证
- [ ] Bing Webmaster Tools + IndexNow key
- [ ] `add-article.js` 里改 BASE_URL 为 arcen-advisory.vercel.app

---

## [CMD] 标准工作流

```bash
git add -A && git commit -m "..." && git push origin main
# 约 60 秒后验证线上
```
