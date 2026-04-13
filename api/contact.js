const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, org, type, message, lang } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // ── 1. Write to Supabase ──────────────────────────────────────────────────
  await fetch(process.env.SUPABASE_URL + '/rest/v1/inquiries', {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_KEY,
      'Authorization': 'Bearer ' + process.env.SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ name, email, org, type, message, lang })
  }).catch(() => {});

  // ── 2. Send Gmail notification ────────────────────────────────────────────
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS
    }
  });

  const typeLabels = {
    'entering-china': 'Entering China',
    'going-global': 'Going global from China',
    'advisory': 'Strategic advisory',
    'ai-visibility': 'AI visibility',
    'other': 'Something else'
  };

  const html = `
<div style="font-family:sans-serif;max-width:560px;color:#111">
  <h2 style="margin:0 0 20px;font-size:18px">New inquiry — ARCEN Advisory</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:8px 0;color:#666;width:100px">Name</td><td style="padding:8px 0"><strong>${name}</strong></td></tr>
    <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
    <tr><td style="padding:8px 0;color:#666">Company</td><td style="padding:8px 0">${org || '—'}</td></tr>
    <tr><td style="padding:8px 0;color:#666">Type</td><td style="padding:8px 0">${typeLabels[type] || type || '—'}</td></tr>
    <tr><td style="padding:8px 0;color:#666">Language</td><td style="padding:8px 0">${(lang || 'en').toUpperCase()}</td></tr>
  </table>
  ${message ? `<div style="margin-top:16px;padding:14px;background:#f5f5f5;border-radius:6px;font-size:14px;line-height:1.6">${message}</div>` : ''}
  <p style="margin-top:24px;font-size:12px;color:#999">Submitted via arcen-advisory.vercel.app</p>
</div>`;

  await transporter.sendMail({
    from: `"ARCEN Advisory" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `New inquiry from ${name}${org ? ' · ' + org : ''}`,
    html
  }).catch(() => {});

  return res.status(200).json({ ok: true });
};
