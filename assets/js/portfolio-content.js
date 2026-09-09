(() => {
  'use strict';

  const DATA = {
    site: 'data/site.json',
    profile: 'data/profile.json',
    projects: 'data/projects.json',
    publications: 'data/publications.json',
    links: 'data/links.json'
  };

  const pageKey = document.body.dataset.page || 'home';
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

  function setDocumentMeta(site, page) {
    document.title = page?.browserTitle || site?.name || 'Devon Bontrager';

    const description = $('#meta-description');
    if (description && page?.description) description.setAttribute('content', page.description);

    const canonical = $('#canonical-url');
    if (canonical && page?.canonical) canonical.setAttribute('href', page.canonical);
  }

  function renderHeader(site) {
    const root = $('#site-header');
    if (!root) return;

    const navigation = Array.isArray(site?.navigation) ? site.navigation : [];
    root.innerHTML = `
      <header class="site-header">
        <div class="page-shell header-inner">
          <a class="identity" href="index.html">${esc(site?.name || 'Devon Bontrager')}</a>
          <nav class="site-nav" aria-label="Primary navigation">
            ${navigation.map(item => {
              const href = safeURL(item.href || '');
              if (!href) return '';
              const current = item.key === pageKey ? ' aria-current="page"' : '';
              return `<a href="${esc(item.href)}"${current}>${esc(item.label)}</a>`;
            }).join('')}
          </nav>
        </div>
      </header>`;
  }

  function renderFooter(site) {
    const root = $('#site-footer');
    if (!root) return;

    const footer = site?.footer || {};
    const link = footer.link || {};
    root.innerHTML = `
      <footer class="site-footer">
        <div class="page-shell footer-inner">
          <span>© ${new Date().getFullYear()} ${esc(footer.copyright || site?.name || 'Devon Bontrager')}</span>
          ${link.href ? `<a href="${esc(link.href)}">${esc(link.label || 'Contact')}</a>` : ''}
        </div>
      </footer>`;
  }

  function renderPageHeading(page) {
    return `
      <header class="page-heading">
        <h1>${esc(page?.heading || '')}</h1>
        ${page?.intro ? `<p>${esc(page.intro)}</p>` : ''}
      </header>`;
  }

  function renderHome(page) {
    const root = $('#main');
    if (!root) return;
    root.className = 'page-shell';

    const intro = page?.intro || {};
    const paragraphs = Array.isArray(intro.paragraphs) ? intro.paragraphs : [];
    const interests = Array.isArray(intro.interests) ? intro.interests : [];
    const directory = page?.directory || {};
    const items = Array.isArray(directory.items) ? directory.items : [];

    root.innerHTML = `
      <section class="intro home-intro" aria-labelledby="intro-title">
        ${intro.affiliation ? `<p class="intro-affiliation">${esc(intro.affiliation)}</p>` : ''}
        <h1 id="intro-title">${esc(intro.name || '')}</h1>
        ${intro.role ? `<p class="intro-role">${esc(intro.role)}</p>` : ''}
        ${paragraphs.map(text => `<p class="intro-copy">${esc(text)}</p>`).join('')}
        ${interests.length ? `<p class="intro-interests"><strong>${esc(intro.interestsLabel || 'Research interests')}:</strong> ${interests.map(esc).join(', ')}.</p>` : ''}
      </section>
      <section class="home-directory" aria-labelledby="directory-title">
        <h2 id="directory-title">${esc(directory.title || 'Explore')}</h2>
        <div class="directory-list">
          ${items.map(item => `<a href="${esc(item.href || '#')}"><span>${esc(item.label)}</span><span>${esc(item.description || '')}</span></a>`).join('')}
        </div>
      </section>`;
  }

  function renderPublications(page, data) {
    const root = $('#main');
    if (!root) return;
    root.className = 'page-shell page-main';
    const items = Array.isArray(data?.items) ? data.items : [];

    root.innerHTML = `
      ${renderPageHeading(page)}
      <div class="publication-list" id="publications-list">
        ${items.map(item => {
          const href = safeURL(item?.links?.doi || item?.links?.url || '');
          const details = [item.type, item.venue, item.date, item.location].filter(Boolean);
          return `
            <article class="publication-item">
              <div class="publication-index">${esc(item.year || '')}</div>
              <div>
                <h2 class="publication-title">${esc(item.title || '')}</h2>
                <p class="publication-meta">${esc(item.authors || '')}</p>
              </div>
              <div class="publication-side">
                ${details.length ? `<span class="publication-venue">${details.map(esc).join('<br>')}</span>` : ''}
                ${item.award ? `<span class="publication-award">${esc(item.award)}</span>` : ''}
                ${href ? `<a class="publication-link" href="${esc(href)}" target="_blank" rel="noopener">${item?.links?.doi ? 'DOI' : 'View'} ↗</a>` : ''}
              </div>
            </article>`;
        }).join('')}
      </div>`;
  }

  function renderResearch(page, data) {
    const root = $('#main');
    if (!root) return;
    root.className = 'page-shell page-main';
    const items = Array.isArray(data?.items) ? data.items : [];

    root.innerHTML = `
      ${renderPageHeading(page)}
      <div class="research-list" id="projects-list">
        ${items.map(item => {
          const href = safeURL(item?.links?.code || item?.links?.project || '');
          const tags = Array.isArray(item.tags) ? item.tags : [];
          return `
            <article class="research-entry">
              <div class="entry-year">${esc(item.year || '')}</div>
              <div>
                <h2 class="entry-title">${esc(item.title || '')}</h2>
                ${item.subtitle ? `<p class="entry-subtitle">${esc(item.subtitle)}</p>` : ''}
                ${item.summary ? `<p class="entry-summary">${esc(item.summary)}</p>` : ''}
              </div>
              <div class="entry-side">
                ${tags.length ? `<div class="entry-tags">${tags.slice(0, 5).map(tag => `<span>${esc(tag)}</span>`).join('')}</div>` : ''}
                ${href ? `<a class="entry-link" href="${esc(href)}" target="_blank" rel="noopener">Repository ↗</a>` : ''}
              </div>
            </article>`;
        }).join('')}
      </div>`;
  }

  function renderProfileLinks(links) {
    const items = Array.isArray(links?.items) ? links.items : [];
    return items.map(item => {
      const href = safeURL(item.url || '');
      if (!href) return '';
      const external = !href.startsWith('mailto:');
      return `<a href="${esc(href)}" ${external ? 'target="_blank" rel="noopener"' : ''}>${esc(item.label || item.key || 'Link')}</a>`;
    }).join('');
  }

  function renderAbout(page, profile, links) {
    const root = $('#main');
    if (!root) return;
    root.className = 'page-shell page-main';

    const focus = Array.isArray(profile?.focus) ? profile.focus : [];
    const groups = profile?.skills || {};
    const skillValues = [...new Set([...(groups.Languages || []), ...(groups.Tools || [])])];
    const sections = page?.sections || {};

    root.innerHTML = `
      ${renderPageHeading(page)}
      <div class="about-grid standalone-about">
        <div>
          <p class="about-bio">${esc(profile?.bio || '')}</p>
        </div>
        <div class="about-details">
          <div class="detail-group">
            <h2>${esc(sections.focus || 'Research focus')}</h2>
            <ul class="plain-list">${focus.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
          </div>
          <div class="detail-group">
            <h2>${esc(sections.skills || 'Methods & tools')}</h2>
            <p>${skillValues.map(esc).join(' · ')}</p>
          </div>
          <div class="detail-group">
            <h2>${esc(sections.profiles || 'Profiles')}</h2>
            <div class="text-links">${renderProfileLinks(links)}</div>
          </div>
        </div>
      </div>`;
  }

  function renderContact(page, links) {
    const root = $('#main');
    if (!root) return;
    root.className = 'page-shell page-main';
    const items = Array.isArray(links?.items) ? links.items : [];

    root.innerHTML = `
      ${renderPageHeading(page)}
      <div class="contact-list" aria-label="Contact and profile links">
        ${items.map(item => {
          const href = safeURL(item.url || '');
          if (!href) return '';
          const external = !href.startsWith('mailto:');
          return `<a href="${esc(href)}" ${external ? 'target="_blank" rel="noopener"' : ''}>${esc(item.label || item.key || 'Link')}</a>`;
        }).join('')}
      </div>`;
  }

  function renderError() {
    const root = $('#main');
    if (!root) return;
    root.className = 'page-shell page-main';
    root.innerHTML = '<header class="page-heading"><h1>Content unavailable</h1><p>The site data could not be loaded. Please refresh the page.</p></header>';
  }

  async function load() {
    try {
      const [siteData, profile, projects, publications, links] = await Promise.all([
        getJSON(DATA.site),
        getJSON(DATA.profile),
        getJSON(DATA.projects),
        getJSON(DATA.publications),
        getJSON(DATA.links)
      ]);

      const site = siteData?.site || {};
      const page = siteData?.pages?.[pageKey] || {};
      setDocumentMeta(site, page);
      renderHeader(site);
      renderFooter(site);

      switch (pageKey) {
        case 'publications': renderPublications(page, publications); break;
        case 'research': renderResearch(page, projects); break;
        case 'about': renderAbout(page, profile, links); break;
        case 'contact': renderContact(page, links); break;
        case 'home':
        default: renderHome(page); break;
      }
    } catch (error) {
      console.error('Unable to load site JSON.', error);
      renderError();
    }
  }

  load();
})();
