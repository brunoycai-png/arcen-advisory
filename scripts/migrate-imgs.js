#!/usr/bin/env node
/**
 * migrate-imgs.js
 * 把 index.html 里的 base64 图片提取 → 上传 Supabase Storage → 替换为公开 URL
 * 用法: node scripts/migrate-imgs.js
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const SUPABASE_URL   = process.env.SUPABASE_URL   || 'https://[PROJECT-ID].supabase.co';
const SUPABASE_KEY   = process.env.SUPABASE_KEY   || 'sb_publishable_...';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || '[admin@email.com]';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '[password]';
const BUCKET         = 'product-images';

async function authenticate() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Auth failed: ' + JSON.stringify(data));
  console.log('✅ Authenticated');
  return data.access_token;
}

async function uploadImage(token, key, b64, mimeType) {
  const ext      = mimeType.includes('png') ? 'png' : 'jpg';
  const filename = `site-${key}.${ext}`;
  const buffer   = Buffer.from(b64, 'base64');

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_KEY, 'Content-Type': mimeType, 'x-upsert': 'true' },
    body: buffer
  });

  if (!res.ok) throw new Error(`Upload failed for ${key}: ${await res.text()}`);
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
  console.log(`  ✅ ${key} → ${filename} (${(buffer.length/1024).toFixed(0)} KB)`);
  return publicUrl;
}

async function main() {
  const indexPath   = path.join(__dirname, '..', 'index.html');
  const previewPath = path.join(__dirname, '..', 'index-preview.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const regex = /(\w+):\s*'(data:image\/(jpeg|jpg|png|webp);base64,([^']+))'/g;
  const found = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    found.push({ key: m[1], full: m[2], mimeType: `image/${m[3]==='jpg'?'jpeg':m[3]}`, b64: m[4] });
  }

  if (!found.length) { console.log('No base64 images found.'); return; }
  console.log(`Found ${found.length} base64 images: ${found.map(f=>f.key).join(', ')}`);

  const token = await authenticate();
  const urlMap = {};
  for (const img of found) urlMap[img.key] = await uploadImage(token, img.key, img.b64, img.mimeType);

  for (const img of found) html = html.replace(`'${img.full}'`, `'${urlMap[img.key]}'`);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✅ index.html updated');

  if (fs.existsSync(previewPath)) {
    let p = fs.readFileSync(previewPath, 'utf8');
    for (const img of found) p = p.replace(`'${img.full}'`, `'${urlMap[img.key]}'`);
    fs.writeFileSync(previewPath, p, 'utf8');
    console.log('✅ index-preview.html updated');
  }
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
