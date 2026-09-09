(() => {
  'use strict';

  const DATA = {
    profile: 'data/profile.json',
    projects: 'data/projects.json',
    publications: 'data/publications.json',
    links: 'data/links.json'
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const safeURL = (value = '') => {
    const raw = String(value).trim();
    if (!raw) return '';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return `mailto:${raw}`;
    try {
      const url = new URL(raw, location.href);
      return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  };

  async function getJSON(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return response.json();
  }

  function renderPublications(data) {
    const root = $('#publications-list');
    if (!root) return;
    const items = Array.isArray(data?.items) ? data.items : [];

    root.innerHTML = items.map((item, index) => {
      const href = safeURL(item?.links?.doi || item?.links?.url || '');
      return `
        <article class="publication-item">
          <div class="publication-index">${esc(item.year || String(index + 1).padStart(2, '0'))}</div>
          <div>
            <h3 class="publication-title">${esc(item.title || '')}</h3>
            <p class="publication-meta">${esc(item.authors || '')}</p>
            ${item.summary ? `<p class="publication-summary">${esc(item.summary)}</p>` : ''}
          </div>
          <div class="publication-side">
            <span class="publication-venue">${esc(item.venue || '')}</span>
            ${href ? `<a class="publication-link" href="${esc(href)}" target="_blank" rel="noopener">Published record ↗</a>` : ''}
          </div>
        </article>`;
    }).join('');
  }

  function renderProjects(data) {
    const root = $('#projects-list');
    if (!root) return;
    const items = Array.isArray(data?.items) ? data.items : [];

    root.innerHTML = items.map((item) => {
      const href = safeURL(item?.links?.code || item?.links?.project || '');
      const tags = (item.tags || []).slice(0, 5)
        .map(tag => `<span>${esc(tag)}</span>`)
        .join('');

      return `
        <article class="research-entry">
          <div class="entry-year">${esc(item.year || '')}</div>
          <div>
            <h3 class="entry-title">${esc(item.title || '')}</h3>
            ${item.subtitle ? `<p class="entry-subtitle">${esc(item.subtitle)}</p>` : ''}
            ${item.summary ? `<p class="entry-summary">${esc(item.summary)}</p>` : ''}
          </div>
          <div class="entry-side">
            ${tags ? `<div class="entry-tags">${tags}</div>` : ''}
            ${href ? `<a class="entry-link" href="${esc(href)}" target="_blank" rel="noopener">Repository ↗</a>` : ''}
          </div>
        </article>`;
    }).join('');
  }

  function renderProfile(profile, links) {
    const bio = $('#profile-bio');
    const focus = $('#focus-list');
    const skills = $('#skills-list');
    const linkRoot = $('#links-list');

    if (bio) {
      const clean = String(profile?.bio || '')
        .replace(/\s*\/n\s*/gi, ' ')
        .replace(/Hi, I['’]m\s+/i, '')
        .trim();
      bio.textContent = clean || 'Electrical engineering researcher focused on computational systems, numerical methods, and scientific software.';
    }

    if (focus) {
      focus.innerHTML = (profile?.focus || []).map(item => `<li>${esc(item)}</li>`).join('');
    }

    if (skills) {
      const groups = profile?.skills || {};
      const values = [...new Set([...(groups.Languages || []), ...(groups.Tools || [])])];
      skills.textContent = values.join(' · ');
    }

    if (linkRoot) {
      const items = Array.isArray(links?.items) ? links.items : [];
      linkRoot.innerHTML = items.map(item => {
        const href = safeURL(item.url || '');
        if (!href) return '';
        const external = !href.startsWith('mailto:');
        return `<a href="${esc(href)}" ${external ? 'target="_blank" rel="noopener"' : ''}>${esc(item.label || item.key || 'Link')}</a>`;
      }).join('');
    }
  }

  async function load() {
    const results = await Promise.allSettled([
      getJSON(DATA.profile),
      getJSON(DATA.projects),
      getJSON(DATA.publications),
      getJSON(DATA.links)
    ]);

    if (results[1].status === 'fulfilled') renderProjects(results[1].value);
    if (results[2].status === 'fulfilled') renderPublications(results[2].value);
    renderProfile(
      results[0].status === 'fulfilled' ? results[0].value : {},
      results[3].status === 'fulfilled' ? results[3].value : {}
    );

    if (results.some(result => result.status === 'rejected')) {
      console.warn('Some portfolio metadata could not be loaded.');
    }
  }

  const year = $('#footer-year');
  if (year) year.textContent = new Date().getFullYear();
  load();
})();
