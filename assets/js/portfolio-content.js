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
  const navKey = pageKey === 'research-item' ? 'research' : pageKey;
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
            ${navigation.map(item => `<a href="${esc(item.href || '#')}"${item.key === navKey ? ' aria-current="page"' : ''}>${esc(item.label)}</a>`).join('')}
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
    return `<header class="page-heading"><h1>${esc(page?.heading || '')}</h1>${page?.intro ? `<p>${esc(page.intro)}</p>` : ''}</header>`;
  }

  function renderHome(page, profile) {
    const root = $('#main');
    if (!root) return;
    root.className = 'page-shell';
    const intro = page?.intro || {};
    const paragraphs = Array.isArray(intro.paragraphs) ? intro.paragraphs : [];
    const interests = Array.isArray(intro.interests) ? intro.interests : [];
    const portrait = safeURL(profile?.portrait || '');

    root.innerHTML = `
      <section class="home-hero" aria-labelledby="intro-title">
        <div class="home-copy">
          ${intro.affiliation ? `<p class="intro-affiliation">${esc(intro.affiliation)}</p>` : ''}
          <h1 id="intro-title">${esc(intro.name || profile?.name || '')}</h1>
          ${intro.role ? `<p class="intro-role">${esc(intro.role)}</p>` : ''}
          ${paragraphs.map(text => `<p class="intro-copy">${esc(text)}</p>`).join('')}
          ${interests.length ? `<p class="intro-interests"><strong>${esc(intro.interestsLabel || 'Research interests')}:</strong> ${interests.map(esc).join(', ')}.</p>` : ''}
        </div>
        ${portrait ? `<figure class="home-portrait"><img src="${esc(portrait)}" alt="${esc(profile?.portraitAlt || profile?.name || '')}" fetchpriority="high"></figure>` : ''}
      </section>`;
  }

  function renderPublications(page, data) {
    const root = $('#main');
    if (!root) return;
    root.className = 'page-shell page-main';
    const items = Array.isArray(data?.items) ? data.items : [];
    root.innerHTML = `${renderPageHeading(page)}<div class="publication-list">${items.map(item => {
      const href = safeURL(item?.links?.doi || item?.links?.url || '');
      const details = [item.type, item.venue, item.date, item.location, item.publisher, item.pages].filter(Boolean);
      return `<article class="publication-item"><div class="publication-index">${esc(item.year || '')}</div><div><h2 class="publication-title">${esc(item.title || '')}</h2><p class="publication-meta">${esc(item.authors || '')}</p></div><div class="publication-side">${details.length ? `<span class="publication-venue">${details.map(esc).join('<br>')}</span>` : ''}${item.award ? `<span class="publication-award">${esc(item.award)}</span>` : ''}${href ? `<a class="publication-link" href="${esc(href)}" target="_blank" rel="noopener">${item?.links?.doi ? 'DOI' : 'View'} ↗</a>` : ''}</div></article>`;
    }).join('')}</div>`;
  }

  function renderResearch(page, data) {
    const root = $('#main');
    if (!root) return;
    root.className = 'page-shell page-main';
    const items = Array.isArray(data?.items) ? data.items : [];
    const categories = [...new Set(items.map(item => item.category || 'Research'))];

    root.innerHTML = `${renderPageHeading(page)}<div class="research-groups">${categories.map(category => {
      const grouped = items.filter(item => (item.category || 'Research') === category);
      return `<section class="research-group"><h2 class="research-group-title">${esc(category)}</h2><div class="research-grid">${grouped.map(item => {
        const visual = safeURL(item.visual || '');
        return `<a class="research-card" href="research-item.html?id=${encodeURIComponent(item.id || '')}">${visual ? `<img src="${esc(visual)}" alt="${esc(item.visualAlt || `${item.title || 'Research'} project output`)}" loading="lazy">` : ''}<div class="research-card-body"><div class="research-card-meta"><span>${esc(item.year || '')}</span><span>${esc(item.subtitle || '')}</span></div><h3>${esc(item.title || '')}</h3><p>${esc(item.summary || '')}</p><span class="research-card-link">View research →</span></div></a>`;
      }).join('')}</div></section>`;
    }).join('')}</div>`;
  }

  function researchLinks(item) {
    const labels = { code: 'Repository', external: 'Project profile', publication: 'Publications' };
    return Object.entries(item?.links || {}).map(([key, value]) => {
      const href = safeURL(value);
      if (!href) return '';
      const external = href.startsWith('http') && !href.startsWith(location.origin);
      return `<a href="${esc(href)}" ${external ? 'target="_blank" rel="noopener"' : ''}>${esc(labels[key] || key)}${external ? ' ↗' : ' →'}</a>`;
    }).join('');
  }

  function renderResearchItem(page, data, publications) {
    const root = $('#main');
    if (!root) return;
    root.className = 'page-shell page-main research-detail-page';
    const id = new URLSearchParams(location.search).get('id');
    const item = (data?.items || []).find(entry => entry.id === id);
    if (!item) {
      root.innerHTML = '<p class="back-link"><a href="research.html">← Research</a></p><header class="page-heading"><h1>Research item not found</h1><p>The requested research entry does not exist.</p></header>';
      return;
    }

    document.title = `${item.title} — Devon Bontrager`;
    const canonical = $('#canonical-url');
    if (canonical) canonical.setAttribute('href', `${location.origin}${location.pathname}?id=${encodeURIComponent(item.id)}`);
    const description = $('#meta-description');
    if (description) description.setAttribute('content', item.summary || page?.description || 'Research by Devon Bontrager.');

    const visual = safeURL(item.visual || '');
    const relatedIds = Array.isArray(item.relatedPublications) ? item.relatedPublications : [];
    const related = (publications?.items || []).filter(pub => relatedIds.includes(pub.id));
    const sections = Array.isArray(item.sections) ? item.sections : [];
    const overview = Array.isArray(item.overview) ? item.overview : [];

    root.innerHTML = `
      <p class="back-link"><a href="research.html">← Research</a></p>
      <header class="research-detail-header">
        <p class="research-detail-meta">${esc(item.category || 'Research')} · ${esc(item.year || '')}</p>
        <h1>${esc(item.title || '')}</h1>
        ${item.subtitle ? `<p class="research-detail-subtitle">${esc(item.subtitle)}</p>` : ''}
      </header>
      ${visual ? `<figure class="research-detail-visual"><img src="${esc(visual)}" alt="${esc(item.visualAlt || `${item.title || 'Research'} project output`)}">${item.visualCaption ? `<figcaption>${esc(item.visualCaption)}</figcaption>` : ''}</figure>` : ''}
      <div class="research-detail-layout">
        <article class="research-detail-body">
          ${overview.map(text => `<p class="research-lede">${esc(text)}</p>`).join('')}
          ${sections.map(section => `<section><h2>${esc(section.heading || '')}</h2>${(section.paragraphs || []).map(text => `<p>${esc(text)}</p>`).join('')}${Array.isArray(section.items) ? `<ul>${section.items.map(point => `<li>${esc(point)}</li>`).join('')}</ul>` : ''}</section>`).join('')}
          ${related.length ? `<section><h2>Related publications</h2><div class="related-publications">${related.map(pub => { const href = safeURL(pub?.links?.doi || pub?.links?.url || 'publications.html'); return `<a href="${esc(href || 'publications.html')}" ${href && href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}><span>${esc(pub.year || '')}</span><strong>${esc(pub.title || '')}</strong></a>`; }).join('')}</div></section>` : ''}
        </article>
        <aside class="research-detail-aside"><div><span class="aside-label">Topics</span><p>${(item.tags || []).map(esc).join(' · ')}</p></div>${Object.keys(item.links || {}).length ? `<div><span class="aside-label">Links</span><div class="detail-links">${researchLinks(item)}</div></div>` : ''}</aside>
      </div>`;
  }

  function renderProfileLinks(links) {
    return (links?.items || []).map(item => {
      const href = safeURL(item.url || '');
      if (!href) return '';
      const external = !href.startsWith('mailto:');
      return `<a href="${esc(href)}" ${external ? 'target="_blank" rel="noopener"' : ''}><span>${esc(item.label || item.key || 'Link')}</span>${item.detail ? `<small>${esc(item.detail)}</small>` : ''}</a>`;
    }).join('');
  }

  function renderAbout(page, profile, links) {
    const root = $('#main');
    if (!root) return;
    root.className = 'page-shell page-main';
    const focus = Array.isArray(profile?.focus) ? profile.focus : [];
    const education = Array.isArray(profile?.education) ? profile.education : [];
    const experience = Array.isArray(profile?.experience) ? profile.experience : [];
    const groups = profile?.skills || {};
    const skillValues = [...new Set([...(groups.Languages || []), ...(groups.Tools || []), ...(groups.Domains || [])])];
    const sections = page?.sections || {};
    const portrait = safeURL(profile?.portrait || '');

    root.innerHTML = `${renderPageHeading(page)}
      <div class="about-layout">
        <aside class="about-person">${portrait ? `<img src="${esc(portrait)}" alt="${esc(profile?.portraitAlt || profile?.name || '')}">` : ''}<p>${esc(profile?.title || '')}</p></aside>
        <div class="about-content">
          <section class="about-section-block"><h2>${esc(sections.background || 'Background')}</h2><p class="about-bio">${esc(profile?.bio || '')}</p></section>
          ${education.length ? `<section class="about-section-block"><h2>${esc(sections.education || 'Education')}</h2>${education.map(item => `<div class="about-record"><strong>${esc(item.institution || '')}</strong><span>${esc(item.program || '')}${item.detail ? ` · ${esc(item.detail)}` : ''}</span>${item.status ? `<small>${esc(item.status)}</small>` : ''}</div>`).join('')}</section>` : ''}
          ${experience.length ? `<section class="about-section-block"><h2>${esc(sections.experience || 'Research experience')}</h2>${experience.map(item => { const href = safeURL(item.url || ''); return `<div class="about-record"><div class="about-record-heading">${href ? `<a href="${esc(href)}" target="_blank" rel="noopener"><strong>${esc(item.organization || '')}</strong></a>` : `<strong>${esc(item.organization || '')}</strong>`}<small>${esc(item.period || '')}</small></div><span>${esc(item.role || '')}</span><p>${esc(item.summary || '')}</p></div>`; }).join('')}</section>` : ''}
          <section class="about-section-block"><h2>${esc(sections.focus || 'Current interests')}</h2><ul class="about-focus-list">${focus.map(item => `<li>${esc(item)}</li>`).join('')}</ul></section>
          <section class="about-section-block"><h2>${esc(sections.skills || 'Methods & tools')}</h2><p class="skills-line">${skillValues.map(esc).join(' · ')}</p></section>
          <section class="about-section-block"><h2>${esc(sections.profiles || 'Elsewhere')}</h2><div class="profile-link-list">${renderProfileLinks(links)}</div></section>
        </div>
      </div>`;
  }

  function renderContact(page, profile, links) {
    const root = $('#main');
    if (!root) return;
    root.className = 'page-shell page-main contact-page';
    const items = Array.isArray(links?.items) ? links.items : [];
    const email = items.find(item => item.key === 'email');
    const profiles = items.filter(item => item.key !== 'email');
    const emailHref = safeURL(email?.url || '');
    const sections = page?.sections || {};

    root.innerHTML = `${renderPageHeading(page)}
      <div class="contact-layout">
        <section class="contact-primary"><h2>${esc(sections.primary || 'Get in touch')}</h2>${page?.lead ? `<p>${esc(page.lead)}</p>` : ''}${emailHref ? `<a class="contact-email" href="${esc(emailHref)}">${esc(email?.detail || email?.url || '')}</a>` : ''}</section>
        <aside class="contact-aside">
          <section><h2>${esc(sections.profiles || 'Profiles')}</h2><div class="contact-profile-list">${profiles.map(item => { const href = safeURL(item.url || ''); return href ? `<a href="${esc(href)}" target="_blank" rel="noopener"><span>${esc(item.label)}</span><small>${esc(item.detail || '')}</small></a>` : ''; }).join('')}</div></section>
          <section><h2>${esc(sections.location || 'Based in')}</h2><p>${esc(page?.location || '')}</p><p>${esc(profile?.title || '')}</p></section>
        </aside>
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
        getJSON(DATA.site), getJSON(DATA.profile), getJSON(DATA.projects), getJSON(DATA.publications), getJSON(DATA.links)
      ]);
      const site = siteData?.site || {};
      const page = siteData?.pages?.[pageKey] || {};
      setDocumentMeta(site, page);
      renderHeader(site);
      renderFooter(site);

      switch (pageKey) {
        case 'publications': renderPublications(page, publications); break;
        case 'research': renderResearch(page, projects); break;
        case 'research-item': renderResearchItem(page, projects, publications); break;
        case 'about': renderAbout(page, profile, links); break;
        case 'contact': renderContact(page, profile, links); break;
        case 'home':
        default: renderHome(page, profile); break;
      }
    } catch (error) {
      console.error('Unable to load site JSON.', error);
      renderError();
    }
  }

  load();
})();
