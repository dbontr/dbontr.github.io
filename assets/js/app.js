/* dbontr one-page terminal portfolio (terminal-only view)
   - single HTML file
   - content loaded from JSON
*/

(() => {
  const $ = (sel, el=document) => el.querySelector(sel);

  const screen = $('#screen');
  const historyEl = $('#history');
  const logEl = $('#log');
  const input = $('#cmd');
  const status = $('#status');
  const year = $('#year');
  const themeName = $('#themeName');
  const ghostEl = $('#ghost');
  const ghostTypedEl = $('#ghostTyped');
  const ghostRestEl = $('#ghostRest');
  const promptEl = $('.prompt');

  if (year) year.textContent = new Date().getFullYear();

  const STATE = {
    history: [],
    historyIdx: -1,
    cache: new Map(),
    theme: 'studio',
    prompt: 'dbontr$',
    autocomplete: {
      base: '',
      matches: [],
      index: -1,
      token: 0
    },
    rgb: {
      frame: null,
      start: 0
    }
  };

  const DATA_PATHS = {
    profile: 'data/profile.json',
    projects: 'data/projects.json',
    publications: 'data/publications.json',
    tutorials: 'data/tutorials.json',
    links: 'data/links.json'
  };

  if (!screen || !historyEl || !input) return;

  function setStatus(text, kind=''){
    if (!status) return;
    status.textContent = text;
    status.className = 'status' + (kind ? ' ' + kind : '');
  }

  function line(text, cls=''){
    const div = document.createElement('div');
    div.className = 'line' + (cls ? ' ' + cls : '');
    div.textContent = text;
    const target = logEl || historyEl;
    target.appendChild(div);
    goBottom();
  }

  function promptLine(text){
    const div = document.createElement('div');
    div.className = 'line promptLine';
    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = STATE.prompt;
    const cmd = document.createElement('span');
    cmd.className = 'cmdText';
    cmd.textContent = text;
    div.appendChild(prompt);
    div.appendChild(cmd);
    const target = logEl || historyEl;
    target.appendChild(div);
    goBottom();
  }

  function printLines(text, cls=''){
    const raw = String(text || '');
    const lines = raw.split(/\r?\n|\/n/);
    lines.forEach((l) => line(l, cls));
  }

  function lineParts(parts, cls=''){
    const div = document.createElement('div');
    div.className = 'line' + (cls ? ' ' + cls : '');
    parts.forEach((part) => {
      if (typeof part === 'string'){
        div.appendChild(document.createTextNode(part));
        return;
      }
      if (part && typeof part === 'object'){
        if (part.href){
          const a = document.createElement('a');
          a.className = part.className || 'termLink';
          a.href = part.href;
          a.target = part.target || '_blank';
          if (Object.prototype.hasOwnProperty.call(part, 'rel')){
            if (part.rel) a.rel = part.rel;
          } else {
            a.rel = 'noopener';
          }
          if (part.lesson){
            a.addEventListener('click', (event) => {
              event.preventDefault();
              const win = window.open(part.href, 'lesson');
              if (win){
                win.focus();
              } else {
                window.location.href = part.href;
              }
            });
          }
          a.textContent = part.text || part.href;
          div.appendChild(a);
          return;
        }
        if (part.text){
          const span = document.createElement('span');
          if (part.className) span.className = part.className;
          span.textContent = part.text;
          div.appendChild(span);
        }
      }
    });
    const target = logEl || historyEl;
    target.appendChild(div);
    goBottom();
  }

  function goBottom(){
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  function setTheme(name){
    const t = (name || '').toLowerCase();
    const themes = ['studio','lab','ember','ocean','sand','rgb'];
    const next = themes.includes(t) ? t : 'studio';
    document.body.classList.remove(...themes.map((x) => `theme-${x}`));
    document.body.classList.add('theme-' + next);
    STATE.theme = next;
    if (themeName) themeName.textContent = next;
    if (next === 'rgb'){
      startRgbTheme();
    } else {
      stopRgbTheme();
    }
  }

  function startRgbTheme(){
    if (STATE.rgb.frame) return;
    STATE.rgb.start = 0;
    const tick = (ts) => {
      if (!STATE.rgb.start) STATE.rgb.start = ts;
      const hue = ((ts - STATE.rgb.start) / 40) % 360;
      document.body.style.setProperty('--hue', hue.toFixed(1));
      STATE.rgb.frame = requestAnimationFrame(tick);
    };
    STATE.rgb.frame = requestAnimationFrame(tick);
  }

  function stopRgbTheme(){
    if (STATE.rgb.frame){
      cancelAnimationFrame(STATE.rgb.frame);
      STATE.rgb.frame = null;
    }
    document.body.style.removeProperty('--hue');
  }

  function sleep(ms){
    return new Promise(r => setTimeout(r, ms));
  }

  async function fetchJSON(path){
    if (STATE.cache.has(path)) return STATE.cache.get(path);
    setStatus('loading.');
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
    const data = await res.json();
    STATE.cache.set(path, data);
    setStatus('ready');
    return data;
  }

  function normalizeLinks(data){
    if (!data || typeof data !== 'object') return {};
    if (data.links && typeof data.links === 'object') return data.links;
    if (Array.isArray(data.items)){
      const map = {};
      data.items.forEach((it) => {
        if (!it) return;
        const key = it.key || it.name || it.label;
        const url = it.url || it.href || it.link;
        if (key && url) map[String(key)] = String(url);
      });
      return map;
    }
    return {};
  }

  function normalizeHref(value){
    const raw = String(value || '').trim();
    if (!raw) return { text: '', href: '' };
    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw);
    if (!hasScheme && raw.includes('@')){
      return { text: raw, href: `mailto:${raw}` };
    }
    return { text: raw, href: raw };
  }

  function linkEntries(links){
    if (!links || typeof links !== 'object') return [];
    return Object.entries(links)
      .filter(([, value]) => value)
      .map(([key, value]) => {
        const normalized = normalizeHref(value);
        return { key, text: normalized.text, href: normalized.href };
      });
  }

  function lessonUrl(slug){
    if (!slug) return 'lesson.html';
    return `lesson.html?lesson=${encodeURIComponent(slug)}`;
  }

  function lineLinkUrls(links){
    const entries = linkEntries(links);
    if (!entries.length) return;
    const parts = ['   '];
    entries.forEach((entry, idx) => {
      if (idx > 0) parts.push(' | ');
      parts.push({ text: entry.text, href: entry.href });
    });
    lineParts(parts);
  }

  async function showProfile(){
    const data = await fetchJSON(DATA_PATHS.profile);
    const name = data.name || data.displayName || data.handle || 'dbontr';
    const title = data.title || data.subtitle || '';
    line(`${name}${title ? ' - ' + title : ''}`);

    if (data.bio) printLines(data.bio, 'muted');

    if (Array.isArray(data.focus) && data.focus.length){
      line(`Focus: ${data.focus.join(', ')}`);
    }

    if (Array.isArray(data.highlights) && data.highlights.length){
      line('Highlights:');
      data.highlights.forEach((h) => {
        lineParts(['  - ', { text: h, className: 'muted' }]);
      });
    }

    if (data.skills && typeof data.skills === 'object'){
      line('Skills:');
      Object.entries(data.skills).forEach(([key, values]) => {
        const list = Array.isArray(values) ? values.join(', ') : String(values);
        lineParts([`  ${key}: `, { text: list, className: 'muted' }]);
      });
    }

    if (Array.isArray(data.now) && data.now.length){
      line('Now:');
      data.now.forEach((n) => line(`  - ${n}`));
    }
  }

  async function showLinks(){
    const data = await fetchJSON(DATA_PATHS.links);
    const links = normalizeLinks(data);
    const entries = linkEntries(links);

    if (!entries.length){
      line('(empty)');
      return;
    }

    entries.forEach((entry) => {
      lineParts([`  ${entry.key} -> `, { text: entry.text, href: entry.href }]);
    });
  }

  async function showList(type){
    const map = {
      projects: { path: DATA_PATHS.projects, title: 'projects' },
      publications: { path: DATA_PATHS.publications, title: 'publications' },
      tutorials: { path: DATA_PATHS.tutorials, title: 'academy', kind: 'tutorial' }
    };

    const spec = map[type];
    if (!spec) throw new Error('Unknown list type');

    const data = await fetchJSON(spec.path);
    const items = data.items || data[type] || data.projects || data.publications || data.tutorials || [];

    if (!items.length){
      line('(empty)');
      return;
    }
    items.forEach((it, idx) => {
      const title = it.title || it.name || it.key || it.slug || it.entry || 'Untitled';
      const summary = it.summary || it.description || it.subtitle || '';
      const parts = [`${idx + 1}. ${title}`];
      if (summary){
        parts.push(' - ');
        parts.push({ text: summary, className: 'muted' });
      }
      lineParts(parts);

      if (spec.kind === 'tutorial'){
        const lessons = Array.isArray(it.lessons) ? it.lessons : [];
        if (lessons.length){
          lessons.forEach((lesson, lidx) => {
            const entry = lesson.entry || lesson.slug || lesson.key || lesson;
            if (!entry) return;
            const label = lesson.label || `lesson ${lidx + 1}`;
            lineParts(['   ', { text: label, href: lessonUrl(entry), rel: '', lesson: true }]);
          });
        } else {
          const entry = it.entry || it.slug || it.key;
          if (entry){
            lineParts(['   ', { text: 'lesson 1', href: lessonUrl(entry), rel: '', lesson: true }]);
          }
        }
      } else {
        lineLinkUrls(it.links);
      }

      if (idx < items.length - 1) line('');
    });
  }

  async function help(topic=''){
    const t = String(topic || '').trim().toLowerCase();
    line('commands:');
    lineParts(['  whoami - ', { text: 'about me', className: 'muted' }]);
    lineParts(['  projects - ', { text: 'my work', className: 'muted' }]);
    lineParts(['  publications - ', { text: 'publications and posters', className: 'muted' }]);
    lineParts(['  lessons - ', { text: 'quick lessons and decks', className: 'muted' }]);
    lineParts(['  links - ', { text: 'link keys', className: 'muted' }]);
    lineParts(['  theme <studio|lab|ember|ocean|sand|rgb> - ', { text: 'switch colors', className: 'muted' }]);
    lineParts(['  time - ', { text: 'local time', className: 'muted' }]);
    lineParts(['  clear - ', { text: 'clear terminal', className: 'muted' }]);
  }

  function clearScreen(){
    const boot = $('.boot');
    if (logEl){
      logEl.innerHTML = '';
      if (boot) logEl.appendChild(boot);
    } else {
      historyEl.innerHTML = '';
      if (boot) historyEl.appendChild(boot);
    }
    resetAutocomplete();
    goBottom();
  }

  function now(){
    line(new Date().toString(), 'muted');
  }

  async function execute(raw){
    const cmdline = String(raw || '').trim();
    if (!cmdline) return;

    promptLine(cmdline);

    if (STATE.history[STATE.history.length - 1] !== cmdline){
      STATE.history.push(cmdline);
    }
    STATE.historyIdx = STATE.history.length;
    resetAutocomplete();

    const [head, ...rest] = cmdline.split(/\s+/);
    const cmd = head.toLowerCase();
    const arg = rest.join(' ');

    try{
      switch(cmd){
        case 'help':
          await help(arg);
          break;
        case 'whoami':
        case 'about':
          await showProfile();
          break;
        case 'projects':
          await showList('projects');
          break;
        case 'publications':
          await showList('publications');
          break;
        case 'academy':
        case 'tutorials':
        case 'lessons':
          await showList('tutorials');
          break;
        case 'links':
        case 'contact':
          await showLinks();
          break;
        case 'theme':
          setTheme(arg);
          line(`Theme set to ${STATE.theme}`, 'ok');
          break;
        case 'time':
          now();
          break;
        case 'clear':
          clearScreen();
          break;
        default:
          line(`Unknown command: ${cmd}`, 'warn');
          line('Try: help');
      }
    } catch (e){
      setStatus('error', 'err');
      line(`error: ${e.message || e}`, 'err');
      setStatus('ready');
    }
  }

  const COMMANDS = [
    'help','whoami','about','projects','publications','academy','tutorials','lessons','links','contact',
    'theme','time','clear'
  ];

  function setGhost(text){
    if (!ghostEl || !ghostTypedEl || !ghostRestEl) return;
    if (!text){
      ghostEl.style.display = 'none';
      ghostTypedEl.textContent = '';
      ghostRestEl.textContent = '';
      return;
    }
    const current = input.value;
    const lowerCurrent = current.toLowerCase();
    const lowerText = text.toLowerCase();
    if (!lowerText.startsWith(lowerCurrent)){
      ghostEl.style.display = 'none';
      ghostTypedEl.textContent = '';
      ghostRestEl.textContent = '';
      return;
    }
    const rest = text.slice(current.length);
    if (!rest){
      ghostEl.style.display = 'none';
      ghostTypedEl.textContent = '';
      ghostRestEl.textContent = '';
      return;
    }
    ghostEl.style.display = 'flex';
    ghostTypedEl.textContent = current;
    ghostRestEl.textContent = rest;
  }

  function resetAutocomplete(){
    const ac = STATE.autocomplete;
    ac.base = '';
    ac.matches = [];
    ac.index = -1;
    ac.token += 1;
    setGhost('');
  }

  function parseCompletionInput(value){
    const raw = String(value || '');
    const trimmed = raw.trim();
    const hasTrailingSpace = /\s$/.test(raw);

    if (!trimmed){
      return { mode: 'command', cmd: '', prefix: '' };
    }

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    if (parts.length === 1 && !hasTrailingSpace){
      return { mode: 'command', cmd, prefix: cmd };
    }

    const argPrefix = parts.length >= 2 ? parts[1] : '';
    return { mode: 'arg', cmd, prefix: argPrefix };
  }

  async function getCompletions(value){
    const parsed = parseCompletionInput(value);

    if (parsed.mode === 'command'){
      const prefix = parsed.prefix.toLowerCase();
      return COMMANDS.filter((c) => c.startsWith(prefix));
    }

    const prefix = (parsed.prefix || '').toLowerCase();
    if (parsed.cmd === 'help'){
      return [];
    }

    if (parsed.cmd === 'theme'){
      const themes = ['studio','lab','ember','ocean','sand','rgb'];
      return themes
        .filter((t) => t.startsWith(prefix))
        .map((t) => `theme ${t}`);
    }

    return [];
  }

  async function complete(){
    const value = input.value;
    const ac = STATE.autocomplete;

    if (value !== ac.base){
      const token = ++ac.token;
      const matches = await getCompletions(value).catch(() => []);
      if (token !== ac.token) return;
      ac.base = value;
      ac.matches = matches;
      ac.index = -1;
    }

    if (!ac.matches.length){
      setGhost('');
      return;
    }

    ac.index = (ac.index + 1) % ac.matches.length;
    setGhost(ac.matches[ac.index]);
  }

  function acceptCompletion(){
    const ac = STATE.autocomplete;
    if (!ac.matches.length || ac.index < 0) return;
    input.value = ac.matches[ac.index];
    input.setSelectionRange(input.value.length, input.value.length);
    resetAutocomplete();
  }

  async function updateAutocomplete(){
    const value = input.value;
    const ac = STATE.autocomplete;
    const token = ++ac.token;
    const matches = await getCompletions(value).catch(() => []);
    if (token !== ac.token) return;
    ac.base = value;
    ac.matches = matches;
    if (!matches.length){
      ac.index = -1;
      setGhost('');
      return;
    }
    ac.index = 0;
    setGhost(matches[0]);
  }

  async function boot(){
    setTheme('studio');
    if (promptEl) promptEl.textContent = STATE.prompt;
    await sleep(60);
    input.focus();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      e.preventDefault();
      const v = input.value;
      input.value = '';
      execute(v);
      return;
    }

    if (e.key === 'Tab'){
      e.preventDefault();
      complete();
      return;
    }

    if (e.key === 'ArrowRight' && STATE.autocomplete.matches.length){
      e.preventDefault();
      acceptCompletion();
      return;
    }

    if (e.key === 'ArrowUp'){
      e.preventDefault();
      if (STATE.history.length === 0) return;
      STATE.historyIdx = Math.max(0, STATE.historyIdx - 1);
      input.value = STATE.history[STATE.historyIdx] || '';
      input.setSelectionRange(input.value.length, input.value.length);
      resetAutocomplete();
      return;
    }

    if (e.key === 'ArrowDown'){
      e.preventDefault();
      if (STATE.history.length === 0) return;
      STATE.historyIdx = Math.min(STATE.history.length, STATE.historyIdx + 1);
      input.value = STATE.history[STATE.historyIdx] || '';
      input.setSelectionRange(input.value.length, input.value.length);
      resetAutocomplete();
      return;
    }

    if (e.key === 'Escape'){
      e.preventDefault();
      input.value = '';
      resetAutocomplete();
    }
  });

  input.addEventListener('input', updateAutocomplete);

  document.addEventListener('click', () => input.focus());

  boot();
})();
