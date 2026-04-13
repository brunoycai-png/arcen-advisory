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

- [x] GitHub Secrets 设置：`VERCEL_TOKEN` + `VERCEL_ORG_ID`
- [x] 创建 `.github/workflows/deploy.yml`
- [x] Google Search Console 验证 ✅ + sitemap 已提交
- [x] Bing Webmaster Tools 验证 ✅ + IndexNow key `4a9bd857b68d418e8d86799b7b897fc8` ✅
- [x] `add-article.js` BASE_URL 已设置

---

## [CMD] 标准工作流

```bash
git add -A && git commit -m "..." && git push origin main
# 约 60 秒后验证线上
```

---

## [RULE] 安全原则

| 类型 | 规则 |
|------|------|
| Supabase anon key | ✅ 可以放前端，靠 RLS 保护 |
| Groq API key | ❌ 绝不放前端，必须放 Vercel 环境变量 + `/api/chat.js` serverless |
| 其他第三方 secret | ❌ 同上，环境变量 |

**RLS 验证：** 每次新建 Supabase 表后，必须确认 `rowsecurity=true` + 只开 anon INSERT，无 SELECT。

**速率限制（待做）：** 联系表单 + AI 对话目前无防刷保护。上线流量增大后，在 Supabase 侧加 `pg_net` 或在 Vercel Edge Middleware 加限流。

---

## [CHECKLIST] 上线前必查（每次改动后过一遍）

### 功能
- [ ] 三语言切换正常（EN/FR/ZH）
- [ ] AI 抽屉开关动画正确
- [ ] 轮播按钮状态正确（单页时 ← → 均 disabled）
- [ ] 联系表单提交后显示成功状态
- [ ] D3 地图在 4s 内加载（fetch world-atlas CDN）

### 手机端（375px）
- [ ] 所有 nav 交互按钮可见可点（Ask ARCEN、Contact）
- [ ] 语言切换按钮可见
- [ ] 表单字段可填写
- [ ] 无横向滚动条

### 代码质量
- [ ] 所有 `fetch()` 调用有 `.catch()`
- [ ] 新 API 调用：secret key → 环境变量，不进前端
- [ ] 无 `console.log` 遗留
- [ ] 删除死代码 CSS（如旧 ID 选择器）

### 安全
- [ ] `curl -I https://arcen-advisory.vercel.app` 确认 CSP、HSTS、X-Frame-Options 存在
- [ ] Supabase RLS：新表只开 anon INSERT，无 SELECT
- [ ] 无 secret key 硬编码在 index.html

### QA 浏览器验证
- [ ] 桌面 1280px：控制台 0 错误
- [ ] 手机 375px：控制台 0 错误，交互元素全可用
- [ ] 三语言分别测一遍 AI 对话

---

## [FACT] 安全现状

| 项目 | 状态 |
|------|------|
| Supabase anon key 前端暴露 | ✅ 安全（RLS 保护，anon 只能 INSERT） |
| RLS 开启 | ✅ inquiries + chat_logs 均已开启 |
| Groq API key | ✅ 当前不存在（AI 对话用本地关键词匹配） |
| 速率限制 | ⚠️ 待做（当前无防刷） |
| CSP unsafe-inline | ⚠️ 单文件架构不可避免，已知风险 |
