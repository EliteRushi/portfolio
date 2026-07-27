/* ===========================================================
   Portfolio logic — vanilla JS, no frameworks.
   Loads projects.json, renders masonry cards, handles search,
   category filters, and the modal preview.
   =========================================================== */
const state = {
  projects: [],
  filtered: [],
  category: 'All',
  query: '',
};
const $ = (sel) => document.querySelector(sel);
const gallery = $('#gallery');
const filtersEl = $('#filters');
const searchEl = $('#search');
const emptyEl = $('#empty');
const modal = $('#modal');
const modalContent = $('#modal-content');
// Footer year
$('#year').textContent = new Date().getFullYear();
/* ---------- Load projects ---------- */
async function loadProjects() {
  try {
    const res = await fetch('projects.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to fetch projects.json');
    state.projects = await res.json();
  } catch (err) {
    console.error(err);
    gallery.innerHTML = `<p class="empty">Could not load projects.json.</p>`;
    return;
  }
  buildFilters();
  applyFilters();
}
/* ---------- Build category filter buttons ---------- */
function buildFilters() {
  const cats = ['All', ...new Set(state.projects.map((p) => p.category).filter(Boolean))];
  filtersEl.innerHTML = cats
    .map(
      (c) =>
        `<button class="filter-btn${c === state.category ? ' active' : ''}" data-cat="${escapeAttr(c)}">${escapeHtml(c)}</button>`
    )
    .join('');
  filtersEl.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.category = btn.dataset.cat;
      filtersEl.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('active', b === btn));
      applyFilters();
    });
  });
}
/* ---------- Filter + search ---------- */
function applyFilters() {
  const q = state.query.trim().toLowerCase();
  state.filtered = state.projects.filter((p) => {
    const catOk = state.category === 'All' || p.category === state.category;
    if (!catOk) return false;
    if (!q) return true;
    const haystack = [
      p.title,
      p.description,
      p.category,
      ...(p.technologies || []),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
  render();
}
/* ---------- Render cards ---------- */
function render() {
  if (!state.filtered.length) {
    gallery.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  gallery.innerHTML = state.filtered
    .map((p, i) => cardHTML(p, i))
    .join('');
  gallery.querySelectorAll('.card').forEach((el) => {
    el.addEventListener('click', () => openModal(state.filtered[el.dataset.idx]));
  });
}
function cardHTML(p, i) {
  const tags = (p.technologies || [])
    .slice(0, 4)
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join('');
  const thumb = p.thumbnail
    ? `<div class="card-thumb"><img src="${escapeAttr(p.thumbnail)}" alt="${escapeAttr(p.title)}" loading="lazy" /></div>`
    : '';
  return `
    <article class="card" data-idx="${i}" style="animation-delay:${Math.min(i * 40, 400)}ms">
      ${thumb}
      <div class="card-body">
        ${p.category ? `<span class="card-cat">${escapeHtml(p.category)}</span>` : ''}
        <h3 class="card-title">${escapeHtml(p.title || 'Untitled')}</h3>
        ${p.description ? `<p class="card-desc">${escapeHtml(p.description)}</p>` : ''}
        <div class="tags">${tags}</div>
      </div>
    </article>
  `;
}
/* ---------- Modal ---------- */
function openModal(p) {
  const tags = (p.technologies || [])
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join('');
  const actions = [
    p.github ? `<a class="btn btn-ghost" href="${escapeAttr(p.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : '',
    p.demo ? `<a class="btn btn-primary" href="${escapeAttr(p.demo)}" target="_blank" rel="noopener">Live Demo ↗</a>` : '',
  ].join('');
  const files = (p.files || []).map(renderFile).join('');
  modalContent.innerHTML = `
    ${p.category ? `<div class="modal-cat">${escapeHtml(p.category)}</div>` : ''}
    <h2 id="modal-title">${escapeHtml(p.title || '')}</h2>
    ${p.description ? `<p class="modal-desc">${escapeHtml(p.description)}</p>` : ''}
    <div class="tags">${tags}</div>
    ${actions ? `<div class="modal-actions">${actions}</div>` : ''}
    ${files}
  `;
  // Group images together into a gallery block if any exist
  regroupImages();
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function renderFile(f) {
  if (!f || !f.src) return '';
  switch (f.type) {
    case 'image':
      return `<img data-image class="file-image" src="${escapeAttr(f.src)}" alt="" loading="lazy" />`;
    case 'pdf':
      return `<iframe class="file-pdf" src="${escapeAttr(f.src)}" title="PDF"></iframe>`;
    case 'video':
      return `<video class="file-video" src="${escapeAttr(f.src)}" controls preload="metadata"></video>`;
    default:
      return '';
  }
}
function regroupImages() {
  const imgs = modalContent.querySelectorAll('img[data-image]');
  if (!imgs.length) return;
  const wrap = document.createElement('div');
  wrap.className = 'file-gallery';
  imgs.forEach((img) => wrap.appendChild(img));
  modalContent.appendChild(wrap);
}
function closeModal() {
  modal.classList.add('hidden');
  modalContent.innerHTML = '';
  document.body.style.overflow = '';
}
modal.addEventListener('click', (e) => {
  if (e.target.matches('[data-close]')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
});
/* ---------- Search ---------- */
searchEl.addEventListener('input', (e) => {
  state.query = e.target.value;
  applyFilters();
});
/* ---------- Helpers ---------- */
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escapeAttr(str = '') { return escapeHtml(str); }
loadProjects();
