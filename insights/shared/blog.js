// blog.js — ARCEN Advisory shared lang switcher for all blog articles
// IMPORTANT: DICT must be defined in the page's inline <script> BEFORE this file loads.
// Correct order in HTML:
//   <script>const DICT = {...}</script>
//   <script src="shared/blog.js"></script>

function switchLang(lang) {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
  localStorage.setItem('arcen_lang', lang);

  // Update data-i text nodes from DICT
  document.querySelectorAll('[data-i]').forEach(function(el) {
    var k = el.dataset.i;
    if (DICT[lang] && DICT[lang][k] !== undefined) el.textContent = DICT[lang][k];
  });

  // Update active lang button
  document.querySelectorAll('.lang-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.lang === lang);
  });

  // Show correct lang-blocks (querySelectorAll — not querySelector, see BUG-013)
  document.querySelectorAll('.lang-block').forEach(function(b) {
    b.classList.remove('active');
  });
  document.querySelectorAll('.lang-block.lang-' + lang).forEach(function(b) {
    b.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', function() {
  switchLang(localStorage.getItem('arcen_lang') || 'en');
});
