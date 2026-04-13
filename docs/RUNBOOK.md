# [PROJECT NAME] — Operational Runbook

> 知识节点入口：[[MOC_WebDev]]

---

## 1. QA Suite

```bash
node scripts/qa.js
# Expected: all passed, 0 failed
# Screenshots: /tmp/qa-screenshots/
```

---

## 2. Deploy

```bash
git push origin main
# GitHub Actions 自动部署，约 60 秒
```

---

## 3. Bug Catalog

> 通用 Bug 规律见 [[web_i18n-lang-block]]（BUG-013）

### [BUG-001] — [标题]
**Symptom:**
**Root cause:**
**Fix:**
**File:**

---

## 4. Stack Reference

| Item | Value |
|------|-------|
| Main URL | https://[PROJECT].vercel.app |
| Admin URL | https://[PROJECT]-admin.vercel.app |
| Supabase | https://[PROJECT-ID].supabase.co |
| Groq model | llama-3.1-8b-instant |

---

## 5. Known Deferred Work

- [ ] 每篇文章专属 OG 图（1200×630px），现在用 og-default.jpg 占位
