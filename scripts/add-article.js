#!/usr/bin/env node
/**
 * add-article.js
 * Scaffolds a new blog article and updates all 4 required locations.
 *
 * Usage:
 *   node scripts/add-article.js <slug>
 *
 * Example:
 *   node scripts/add-article.js your-article-slug
 *
 * What it does:
 *   1. Copies blog/_template.html → blog/<slug>.html
 *   2. Adds URL to sitemap.xml
 *   3. Adds URL to deploy.yml (IndexNow urlList)
 *   4. Adds URL to llms.txt
 *   5. Prints reminder to add card to index.html Insights section (manual)
 *
 * Before first use: update BASE_URL below to match your project.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

// ── CONFIG — update for each project ────────────────────────────────────────
const BASE_URL = 'https://arcen-advisory.vercel.app';
// ─────────────────────────────────────────────────────────────────────────────

const ROOT     = path.join(__dirname, '..');
const slug     = process.argv[2];

if (!slug) {
  console.error('Usage: node scripts/add-article.js <slug>');
  console.error('Example: node scripts/add-article.js your-article-slug');
  process.exit(1);
}

const articleUrl = `${BASE_URL}/blog/${slug}.html`;
const today      = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// ── 1. Copy template ────────────────────────────────────────────────────────
const templatePath = path.join(ROOT, 'blog', '_template.html');
const targetPath   = path.join(ROOT, 'blog', `${slug}.html`);

if (!fs.existsSync(templatePath)) {
  console.error('❌ blog/_template.html not found — create it first');
  process.exit(1);
}
if (fs.existsSync(targetPath)) {
  console.error(`❌ blog/${slug}.html already exists`);
  process.exit(1);
}

let html = fs.readFileSync(templatePath, 'utf8');
html = html.replace(/SLUG/g, slug);
fs.writeFileSync(targetPath, html, 'utf8');
console.log(`✅ blog/${slug}.html created`);

// ── 2. Update sitemap.xml ───────────────────────────────────────────────────
const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const newEntry = `  <url>
    <loc>${articleUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  sitemap = sitemap.replace('</urlset>', newEntry + '</urlset>');
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  console.log(`✅ sitemap.xml updated`);
} else {
  console.warn(`⚠️  sitemap.xml not found — skipped`);
}

// ── 3. Update deploy.yml (IndexNow urlList) ─────────────────────────────────
const deployPath = path.join(ROOT, '.github', 'workflows', 'deploy.yml');
if (fs.existsSync(deployPath)) {
  let deploy = fs.readFileSync(deployPath, 'utf8');
  const lastUrlPattern = /([ \t]+"https:\/\/[^"]+\.html")\s*\n(\s*\])/;
  if (lastUrlPattern.test(deploy)) {
    deploy = deploy.replace(lastUrlPattern, `$1,\n                "${articleUrl}"\n$2`);
    fs.writeFileSync(deployPath, deploy, 'utf8');
    console.log(`✅ deploy.yml IndexNow urlList updated`);
  } else {
    console.warn(`⚠️  deploy.yml: could not auto-update urlList — add manually:\n   "${articleUrl}"`);
  }
} else {
  console.warn(`⚠️  deploy.yml not found — skipped`);
}

// ── 4. Update llms.txt ──────────────────────────────────────────────────────
const llmsPath = path.join(ROOT, 'llms.txt');
if (fs.existsSync(llmsPath)) {
  let llms = fs.readFileSync(llmsPath, 'utf8');
  const langSection = '## Languages';
  if (llms.includes(langSection)) {
    llms = llms.replace(langSection, `- ${articleUrl}\n\n${langSection}`);
  } else {
    llms = llms.trimEnd() + `\n- ${articleUrl}\n`;
  }
  fs.writeFileSync(llmsPath, llms, 'utf8');
  console.log(`✅ llms.txt updated`);
} else {
  console.warn(`⚠️  llms.txt not found — skipped`);
}

// ── 5. Manual reminder ──────────────────────────────────────────────────────
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Done. 4/5 locations updated automatically.

⚠️  Still needed (manual):
   index.html → Insights section
   Add a new article card pointing to:
   /blog/${slug}.html

Then fill in blog/${slug}.html:
  - ARTICLE TITLE, SLUG, META DESCRIPTION
  - datePublished / dateModified (YYYY-MM-DDT00:00:00Z)
  - DICT (EN/FR/ZH): tag, title, sub, date, readtime, cta, related
  - lang-block content (EN / FR / ZH)
  - FAQ trilingual
  - Related articles links
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
