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
| AI chat endpoint | `/api/chat` (Vercel Edge Function) |
| Languages | EN / FR / ZH |

---

## [FACT] index.html Section Map

| Lines | Section |
|-------|---------|
| 1–9 | `<head>` — meta, title |
| 10–597 | `<style>` — all CSS |
| 600–640 | `<nav>` — logo + links + lang + globe + Ask ARCEN + Contact |
| 641–668 | `<!-- HERO -->` |
| 670–928 | `<!-- MODULES -->` — m1 CLARITY / m2 ENTRY / m3 GROWTH |
| 930–951 | `<!-- ADDONS -->` |
| 953–964 | `<!-- MAP -->` — D3 world map anchor |
| 966–1018 | `<!-- CASES -->` — carousel (3 cases/slide) |
| 1020–1097 | `<!-- INSIGHTS -->` — carousel 2×2 (4 articles/slide) |
| 1099–1169 | `<!-- CONTACT -->` — form → /api/contact |
| 1171–1177 | `<!-- FOOTER -->` |
| 1181–1203 | `<!-- AI DRAWER -->` — Ask ARCEN chat panel |
| 1205–1207 | D3 scripts (cdn.jsdelivr.net) |
| 1208–end | `<script>` — lang switcher, carousel, AI chat, contact form, D3 map |

---

## [FACT] File Map

| File | Purpose |
|------|---------|
| `index.html` | 主站，所有 CSS + JS 内联 |
| `index-preview.html` | 沙盒：大改前先在这里测试 |
| `vercel.json` | 安全 headers (CSP 已含 cdn.jsdelivr.net) |
| `sitemap.xml` | 页面 URL（新文章手动更新，16 URLs as of 2026-04-14） |
| `llms.txt` | AI 爬虫识别文件（含全部14篇文章 URL） |
| `robots.txt` | 爬虫规则（含 13 个 AI crawler 显式许可） |
| `co-image.png` | og:image 社交分享图（1200×630） |
| `scripts/add-article.js` | 新文章脚手架（更新 sitemap + llms.txt） |
| `.github/workflows/deploy.yml` | CI/CD — 需要设置 GitHub Secrets |
| `insights/shared/blog.css` | 文章页共用样式（ARCEN 设计系统，含 nav/hero/body/cta/faq/related） |
| `insights/shared/blog.js` | 共用 lang switcher（依赖页面内联 DICT） |
| `insights/_template.html` | 新文章起点 — 复制 → 填内容 → 用 EN-first 工作流构建 |
| `insights/SLUG.html` | 每篇文章页 — head + @graph schema + DICT + lang-block 内容 |
| `insights/index.html` | 文章列表页（14篇，分类筛选，三语言） |

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

## [RULE] localStorage 双 key 同步

homepage (`index.html`) 的 `switchLang()` 必须同时写两个 key：
```javascript
localStorage.setItem('ag_lang', lang);    // homepage 自用
localStorage.setItem('arcen_lang', lang); // 文章页 blog.js 读取
```
`blog.js` 只读 `arcen_lang`。两个 key 不同步 → 文章页显示上次访问的语言，与 homepage 当前语言不符。**不要只改其中一个。**

---

## [RULE] Carousel translateX 用 px 不用 %

```javascript
// ✅ 正确 — px based on container width
var slideW = track.parentElement.offsetWidth;
track.style.transform = 'translateX(-' + (page * slideW) + 'px)';

// ❌ 错误 — % 是相对 track 自身宽度，多 slide 时会 overshoort
track.style.transform = 'translateX(-' + (page * 100) + '%)';
```
track 宽度 = N slides × container width，所以 `-100%` = 移动了 N 个容器宽度。

---

## [RULE] 新文章发布 — 必须同步更新的 5 个文件

每次新增文章，**必须**更新：

1. `insights/index.html` — 加 article card（`data-cat`），更新文章计数
2. `index.html` — 在 `#blog-track` 找当前最后一个 slide，如果 < 4 张就加入；如果满了加新 slide
3. `sitemap.xml` — 加 `<url>` 条目（含 3 个 hreflang xhtml:link），`lastmod` 用当天日期
4. `llms.txt` — 在 Published Insights 区块加标题 + URL
5. `og:image` — 新文章 head 加 `<meta property="og:image" content="https://arcen-advisory.vercel.app/co-image.png">`

---

## [FACT] 文章分类（data-cat 值）

| 分类 | 用途 |
|------|------|
| `MARKET ENTRY` | 市场准入、实体结构、合规 |
| `PLATFORM GUIDE` | 平台操作指南（抖音/小红书/天猫/微信） |
| `AI VISIBILITY` | GEO、llms.txt、Schema.org |
| `FINANCE` | WFOE 成本、财务结构 |
| `STRATEGY` | 宏观进入策略、多阶段规划 |

---

## [FACT] 当前文章列表（14篇，截至 2026-04-14）

| Slug | 分类 | 读时 |
|------|------|------|
| china-social-media-registration-structures | MARKET ENTRY | 14m |
| china-account-ownership-transfer-risk | MARKET ENTRY | 9m |
| china-wfoe-subsidiary-cost-breakdown | FINANCE | 8m |
| tmall-global-vs-wechat-mini-program | PLATFORM GUIDE | 9m |
| three-phase-china-market-entry-strategy | STRATEGY | 9m |
| xiaohongshu-european-brands-guide | PLATFORM GUIDE | 10m |
| douyin-ecommerce-foreign-brands | PLATFORM GUIDE | 9m |
| china-platform-ecosystem-2026 | PLATFORM GUIDE | 9m |
| china-social-media-single-platform-mistake | MARKET ENTRY | 7m |
| why-chatgpt-doesnt-know-your-brand | AI VISIBILITY | 12m |
| five-structural-mistakes-european-brands-china | MARKET ENTRY | 9m |
| from-72-to-91-geo-seo-implementation | AI VISIBILITY | 12m |
| geo-vs-seo-professional-services | AI VISIBILITY | 10m |
| llms-txt-what-it-is-how-to-create | AI VISIBILITY | 9m |

---

## [FLOW] 新文章 / 案例 — EN-first 工作流

> 用户只提供英文内容，Claude 完成翻译 + 构建 + 更新。

### 最小输入格式（用户每次提供）

```
TYPE: insight | case          ← insight = 行业洞察文章；case = 客户案例摘要（首页卡片）
SLUG: your-article-slug       ← URL slug，小写连字符，如 china-entry-mistakes
CATEGORY: Market Entry        ← 显示在 tag 上，英文即可，Claude 负责翻译
TITLE: Full English title
SUB: 1-2 sentence subtitle/deck
DATE: April 2026
READTIME: 8 min read

BODY_EN:
[完整英文正文，支持 ## 标题、段落、- 列表、> callout]

FAQ_EN:
Q: Question 1
A: Answer 1
Q: Question 2
A: Answer 2
Q: Question 3
A: Answer 3

CTA_TITLE_EN: Ready to make your move?
CTA_DESC_EN: Whether you are entering China or going global, ARCEN builds the path.

RELATED: slug1.html | slug2.html | slug3.html   ← 可选，没有就留空
```

### Claude 执行步骤（每次新文章自动完成）

1. **翻译** — 将标题、副标题、正文、FAQ、CTA 翻译成 FR + ZH，保持原意不意译
2. **构建文章页** — 从 `blog/_template.html` 复制 → 填入所有三语内容 → 保存为 `blog/SLUG.html`
3. **更新首页** — 在 `index.html` INSIGHTS section（`<!-- INSIGHTS -->`）的轮播中加文章卡片（EN/FR/ZH 三组 `.blog-cat` / `.blog-t` / `.blog-d` / `.blog-m`）
4. **更新 sitemap.xml** — 加 `<url>` 条目，`<lastmod>` 用当天日期
5. **更新 llms.txt** — 在 Blog/Insights 区块加文章 URL + 一行英文摘要
6. **Git push** — `git add -A && git commit -m "feat: add insight SLUG" && git push origin main`

### 格式原则

- 首页摘要（`.blog-d`）：1 句话，≤20 词，直接点出核心洞察
- 首页状态（`.blog-m`）：文章上线前用 `Coming soon · X min read`，上线后去掉 "Coming soon"
- FAQ：每篇 3 条，与 JSON-LD FAQPage schema 保持完全一致
- 样式：严格遵循 `blog/shared/blog.css`，不内联自定义样式

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
| Groq API key | ✅ 存在 Vercel 加密环境变量，前端不可见 |
| 速率限制 | ⚠️ 待做（当前无防刷） |
| CSP unsafe-inline | ⚠️ 单文件架构不可避免，已知风险 |
