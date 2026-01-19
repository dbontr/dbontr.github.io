/* dbontr lesson page */

(() => {
  const $ = (sel, el=document) => el.querySelector(sel);

  const bodyEl = $('#lessonBody');
  const titleEl = $('#lessonTitle');
  const subtitleEl = $('#lessonSubtitle');
  const metaEl = $('#lessonMeta');
  const navEl = $('#lessonNav');
  const backLink = $('.backLink');

  if (!bodyEl) return;

  if (backLink){
    backLink.addEventListener('click', (event) => {
      if (window.opener && !window.opener.closed){
        event.preventDefault();
        window.opener.focus();
        window.close();
        setTimeout(() => {
          if (!window.closed) window.location.href = backLink.href;
        }, 120);
      }
    });
  }

  const DATA_PATHS = {
    tutorials: 'data/tutorials.json',
    lessons: 'data/lessons/'
  };

  const STATE = {
    cache: new Map()
  };

  async function fetchJSON(path){
    if (STATE.cache.has(path)) return STATE.cache.get(path);
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
    const data = await res.json();
    STATE.cache.set(path, data);
    return data;
  }

  function getParam(name){
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function tutorialItems(data){
    if (!data || typeof data !== 'object') return [];
    return data.tutorials || data.items || [];
  }

  async function resolveLessonEntry(slug){
    const s = String(slug || '').trim().toLowerCase();
    if (!s) return null;

    if (s === 'quantum' || s === 'quantum-101') return 'qubit-foundations';
    if (s === 'linear-algebra-primer') return 'linear-algebra-essentials';
    if (s === 'quantum-circuits') return 'quantum-circuits-and-entanglement';

    const data = await fetchJSON(DATA_PATHS.tutorials);
    const items = tutorialItems(data);

    for (const it of items){
      const candidates = [];
      if (it.entry) candidates.push(it.entry);
      if (it.slug) candidates.push(it.slug);
      if (it.key) candidates.push(it.key);

      const lessons = Array.isArray(it.lessons) ? it.lessons : [];
      lessons.forEach((lesson) => {
        if (!lesson) return;
        if (typeof lesson === 'string'){
          candidates.push(lesson);
          return;
        }
        const entry = lesson.entry || lesson.slug || lesson.key;
        if (entry) candidates.push(entry);
      });

      const hit = candidates.find((entry) => String(entry).toLowerCase() === s);
      if (hit) return hit;
    }

    return null;
  }

  function setHeader(title, subtitle, metaText){
    if (titleEl) titleEl.textContent = title || 'Lesson';
    if (subtitleEl) subtitleEl.textContent = subtitle || '';
    if (metaEl) metaEl.textContent = metaText || '';
    if (title) document.title = `dbontr - ${title}`;
  }

  const pendingTypesets = new Set();
  let mathjaxWatcher = false;

  function getMathJaxReady(){
    if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise){
      return window.MathJax.startup.promise;
    }
    if (window.MathJax && window.MathJax.typesetPromise){
      return Promise.resolve();
    }
    return null;
  }

  function flushTypesets(){
    const nodes = pendingTypesets.size ? Array.from(pendingTypesets) : undefined;
    pendingTypesets.clear();
    if (!window.MathJax || !window.MathJax.typesetPromise) return;
    window.MathJax.typesetClear?.(nodes);
    window.MathJax.typesetPromise(nodes).catch(() => {});
  }

  function typesetMath(root){
    const target = root || document.body;
    if (target) pendingTypesets.add(target);

    const ready = getMathJaxReady();
    if (ready){
      ready.then(flushTypesets);
      return;
    }

    if (mathjaxWatcher) return;
    mathjaxWatcher = true;
    const poll = () => {
      const readyNow = getMathJaxReady();
      if (readyNow){
        readyNow.then(() => {
          mathjaxWatcher = false;
          flushTypesets();
        });
        return;
      }
      setTimeout(poll, 120);
    };
    poll();
  }

  function stripTags(input){
    return String(input || '').replace(/<[^>]*>/g, '');
  }

  function normalizeAnswer(input){
    return String(input || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function normalizeLessons(item){
    const lessons = Array.isArray(item.lessons) ? item.lessons : [];
    const normalized = [];
    lessons.forEach((lesson, idx) => {
      if (!lesson) return;
      if (typeof lesson === 'string'){
        normalized.push({ label: `lesson ${idx + 1}`, entry: lesson });
        return;
      }
      const entry = lesson.entry || lesson.slug || lesson.key || lesson;
      if (!entry) return;
      const label = lesson.label || `lesson ${idx + 1}`;
      normalized.push({ label, entry });
    });
    return normalized;
  }

  function renderLessonList(items){
    bodyEl.innerHTML = '';
    setHeader('Lessons', 'Select a lesson to open', '');

    const holder = document.createElement('section');
    holder.className = 'slide';

    const title = document.createElement('div');
    title.className = 'slideTitle';
    title.textContent = 'Available lessons';

    const body = document.createElement('div');
    body.className = 'slideBody';

    items.forEach((it) => {
      const seriesTitle = document.createElement('div');
      seriesTitle.className = 'slideTitle';
      seriesTitle.textContent = it.title || 'Lesson series';
      body.appendChild(seriesTitle);

      if (it.subtitle){
        const sub = document.createElement('div');
        sub.className = 'monoSmall';
        sub.textContent = it.subtitle;
        body.appendChild(sub);
      }

      const list = document.createElement('ul');
      const lessons = normalizeLessons(it);
      lessons.forEach((lesson) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `lesson.html?lesson=${encodeURIComponent(lesson.entry)}`;
        link.textContent = lesson.label;
        li.appendChild(link);
        list.appendChild(li);
      });
      body.appendChild(list);
    });

    holder.appendChild(title);
    holder.appendChild(body);
    bodyEl.appendChild(holder);
  }

  function renderSlide(slide, idx){
    const section = document.createElement('section');
    section.className = 'slide';

    const heading = document.createElement('div');
    heading.className = 'slideTitle';
    heading.textContent = `${idx + 1}. ${slide.title || 'Untitled'}`;

    const body = document.createElement('div');
    body.className = 'slideBody';

    const bodyLines = slide.body || slide.content || [];
    if (Array.isArray(bodyLines)){
      bodyLines.forEach((line) => {
        const p = document.createElement('p');
        p.innerHTML = line;
        body.appendChild(p);
      });
    } else if (bodyLines){
      const p = document.createElement('p');
      p.innerHTML = bodyLines;
      body.appendChild(p);
    }

    if (Array.isArray(slide.bullets) && slide.bullets.length){
      const ul = document.createElement('ul');
      slide.bullets.forEach((b) => {
        const li = document.createElement('li');
        li.innerHTML = b;
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    if (slide.math){
      const mathBlock = document.createElement('div');
      mathBlock.innerHTML = slide.math;
      body.appendChild(mathBlock);
    }

    section.appendChild(heading);
    section.appendChild(body);

    if (slide.quiz){
      section.appendChild(makeQuiz(slide.quiz));
    }

    if (slide.check){
      section.appendChild(makeCheck(slide.check));
    }

    if (slide.widget === 'state_explorer' || slide.interactive === 'state_explorer'){
      section.appendChild(makeStateExplorer());
    }

    if (slide.widget === 'qubit_lab' || slide.interactive === 'qubit_lab'){
      section.appendChild(makeQubitLab());
    }

    return section;
  }

  function makeQuiz(quiz){
    const config = quiz && typeof quiz === 'object' ? quiz : {};
    const wrap = document.createElement('div');
    wrap.className = 'interactive quiz';

    const question = document.createElement('div');
    question.className = 'quizQuestion';
    question.innerHTML = config.question || 'Quick check';
    wrap.appendChild(question);

    const options = Array.isArray(config.options) ? config.options : [];
    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'quizOptions';
    wrap.appendChild(optionsWrap);

    const feedback = document.createElement('div');
    feedback.className = 'quizFeedback';
    wrap.appendChild(feedback);

    const buttons = [];
    let locked = false;
    let correctIndex = -1;

    if (typeof config.answer === 'number'){
      correctIndex = config.answer;
    } else if (config.answer){
      const target = normalizeAnswer(stripTags(config.answer));
      correctIndex = options.findIndex((opt) => normalizeAnswer(stripTags(opt)) === target);
    }

    options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quizOption';
      btn.innerHTML = opt;
      btn.addEventListener('click', () => {
        if (locked) return;
        locked = true;

        const isCorrect = idx === correctIndex;
        btn.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect && correctIndex >= 0 && buttons[correctIndex]){
          buttons[correctIndex].classList.add('correct');
        }

        wrap.classList.add(isCorrect ? 'isCorrect' : 'isWrong');
        if (isCorrect){
          feedback.innerHTML = config.explain || 'Correct.';
        } else {
          feedback.innerHTML = config.explain_wrong || config.explain || 'Not quite. Try again.';
        }
        typesetMath(wrap);
      });

      buttons.push(btn);
      optionsWrap.appendChild(btn);
    });

    typesetMath(wrap);
    return wrap;
  }

  function makeCheck(check){
    const config = check && typeof check === 'object' ? check : {};
    const wrap = document.createElement('div');
    wrap.className = 'interactive check';

    const prompt = document.createElement('div');
    prompt.className = 'checkPrompt';
    prompt.innerHTML = config.prompt || 'Try it';
    wrap.appendChild(prompt);

    const form = document.createElement('div');
    form.className = 'checkForm';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'checkInput';
    input.placeholder = config.placeholder || 'Type your answer';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'checkBtn';
    btn.textContent = 'Check';

    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.className = 'checkBtn ghost';
    reveal.textContent = 'Reveal';

    form.appendChild(input);
    form.appendChild(btn);
    form.appendChild(reveal);
    wrap.appendChild(form);

    const feedback = document.createElement('div');
    feedback.className = 'checkFeedback';
    wrap.appendChild(feedback);

    const answersRaw = Array.isArray(config.answers)
      ? config.answers
      : Array.isArray(config.answer)
        ? config.answer
        : config.answer
          ? [config.answer]
          : [];
    const answersNormalized = answersRaw.map(normalizeAnswer).filter(Boolean);

    function setFeedback(isCorrect, message){
      wrap.classList.toggle('isCorrect', isCorrect);
      wrap.classList.toggle('isWrong', !isCorrect);
      feedback.innerHTML = message || '';
      typesetMath(wrap);
    }

    btn.addEventListener('click', () => {
      const value = normalizeAnswer(input.value);
      if (!value){
        setFeedback(false, 'Type an answer first.');
        return;
      }
      const isCorrect = answersNormalized.includes(value);
      if (isCorrect){
        setFeedback(true, config.explain || 'Correct.');
      } else if (config.hint){
        setFeedback(false, config.hint);
      } else {
        setFeedback(false, 'Not quite. Try again.');
      }
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter'){
        event.preventDefault();
        btn.click();
      }
    });

    reveal.addEventListener('click', () => {
      const answerHtml = config.answer_html || (answersRaw.length ? answersRaw.join(' or ') : 'No answer provided.');
      setFeedback(false, `Answer: ${answerHtml}`);
    });

    typesetMath(wrap);
    return wrap;
  }

  function complex(re, im){ return {re, im}; }
  function cAdd(a,b){ return complex(a.re + b.re, a.im + b.im); }
  function cSub(a,b){ return complex(a.re - b.re, a.im - b.im); }
  function cMul(a,b){ return complex(a.re*b.re - a.im*b.im, a.re*b.im + a.im*b.re); }
  function cScale(a,s){ return complex(a.re*s, a.im*s); }
  function cAbs2(a){ return a.re*a.re + a.im*a.im; }

  function matMul2(M, v){
    return [
      cAdd(cMul(M[0][0], v[0]), cMul(M[0][1], v[1])),
      cAdd(cMul(M[1][0], v[0]), cMul(M[1][1], v[1]))
    ];
  }

  function gateMatrix(name, theta=0){
    const I = [[complex(1,0), complex(0,0)],[complex(0,0), complex(1,0)]];
    const X = [[complex(0,0), complex(1,0)],[complex(1,0), complex(0,0)]];
    const Z = [[complex(1,0), complex(0,0)],[complex(0,0), complex(-1,0)]];
    const H = [[complex(1/Math.sqrt(2),0), complex(1/Math.sqrt(2),0)],
               [complex(1/Math.sqrt(2),0), complex(-1/Math.sqrt(2),0)]];
    const c = Math.cos(theta/2);
    const s = Math.sin(theta/2);
    const Ry = [[complex(c,0), complex(-s,0)],[complex(s,0), complex(c,0)]];

    switch((name || '').toUpperCase()){
      case 'I': return I;
      case 'X': return X;
      case 'Z': return Z;
      case 'H': return H;
      case 'RY': return Ry;
      default: return I;
    }
  }

  function formatComplex(a){
    const re = Math.abs(a.re) < 1e-12 ? 0 : a.re;
    const im = Math.abs(a.im) < 1e-12 ? 0 : a.im;
    const r = re.toFixed(4);
    const i = Math.abs(im).toFixed(4);
    if (im === 0) return `${r}`;
    if (re === 0) return `${im.toFixed(4)}i`;
    return `${r} ${im >= 0 ? '+' : '-'} ${i}i`;
  }

  function makeQubitLab(){
    const lab = document.createElement('div');
    lab.className = 'lab';

    let state = [complex(1,0), complex(0,0)];

    const left = document.createElement('div');
    const right = document.createElement('div');

    const title = document.createElement('div');
    title.className = 'labTitle';
    title.textContent = 'Qubit Lab (1-qubit simulator)';

    const controls = document.createElement('div');
    controls.className = 'labControls';

    ['H','X','Z'].forEach((g) => {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = g;
      b.addEventListener('click', () => {
        state = matMul2(gateMatrix(g), state);
        update();
      });
      controls.appendChild(b);
    });

    const ryWrap = document.createElement('div');
    ryWrap.className = 'ryWrap';

    const ryLbl = document.createElement('div');
    ryLbl.className = 'monoSmall';
    ryLbl.innerHTML = '\\(R_y(\\theta)\\)';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '-3.1416';
    slider.max = '3.1416';
    slider.step = '0.01';
    slider.value = '0';
    slider.className = 'slider';

    const sliderVal = document.createElement('div');
    sliderVal.className = 'monoSmall';
    sliderVal.textContent = 'theta = 0.00';

    const applyRy = document.createElement('button');
    applyRy.className = 'btn';
    applyRy.textContent = 'Apply';
    applyRy.addEventListener('click', () => {
      const th = parseFloat(slider.value);
      state = matMul2(gateMatrix('RY', th), state);
      update();
    });

    slider.addEventListener('input', () => {
      sliderVal.textContent = `theta = ${Number(slider.value).toFixed(2)}`;
    });

    ryWrap.appendChild(ryLbl);
    ryWrap.appendChild(slider);
    ryWrap.appendChild(sliderVal);
    ryWrap.appendChild(applyRy);

    const measure = document.createElement('button');
    measure.className = 'btn warn';
    measure.textContent = 'Measure';
    measure.addEventListener('click', () => {
      const p0 = cAbs2(state[0]);
      const r = Math.random();
      if (r < p0){
        state = [complex(1,0), complex(0,0)];
        toast('Measured |0>');
      } else {
        state = [complex(0,0), complex(1,0)];
        toast('Measured |1>');
      }
      update();
    });

    const reset = document.createElement('button');
    reset.className = 'btn danger';
    reset.textContent = 'Reset';
    reset.addEventListener('click', () => {
      state = [complex(1,0), complex(0,0)];
      slider.value = '0';
      sliderVal.textContent = 'theta = 0.00';
      update();
    });

    controls.appendChild(ryWrap);
    controls.appendChild(measure);
    controls.appendChild(reset);

    const readout = document.createElement('div');
    readout.className = 'labReadout';

    const bars = document.createElement('div');
    bars.className = 'bars';

    const b0 = document.createElement('div');
    b0.className = 'bar';
    b0.innerHTML = '<div class="barLabel">\\(P(|0\\rangle)\\)</div><div class="barFill" id="bar0"></div><div class="barNum" id="num0"></div>';

    const b1 = document.createElement('div');
    b1.className = 'bar';
    b1.innerHTML = '<div class="barLabel">\\(P(|1\\rangle)\\)</div><div class="barFill" id="bar1"></div><div class="barNum" id="num1"></div>';

    bars.appendChild(b0);
    bars.appendChild(b1);

    const amps = document.createElement('div');
    amps.className = 'amps';

    const amp0 = document.createElement('div');
    amp0.className = 'monoSmall';
    amp0.id = 'amp0';
    amp0.innerHTML = '<span class="ampLabel">\\(|0\\rangle\\)</span> amplitude = <span class="ampVal"></span>';

    const amp1 = document.createElement('div');
    amp1.className = 'monoSmall';
    amp1.id = 'amp1';
    amp1.innerHTML = '<span class="ampLabel">\\(|1\\rangle\\)</span> amplitude = <span class="ampVal"></span>';

    amps.appendChild(amp0);
    amps.appendChild(amp1);

    readout.appendChild(bars);
    readout.appendChild(amps);

    left.appendChild(title);
    left.appendChild(controls);

    right.appendChild(readout);

    lab.appendChild(left);
    lab.appendChild(right);

    function update(){
      const norm = Math.sqrt(cAbs2(state[0]) + cAbs2(state[1])) || 1;
      state = [cScale(state[0], 1/norm), cScale(state[1], 1/norm)];

      const p0 = cAbs2(state[0]);
      const p1 = cAbs2(state[1]);

      const fill0 = $('#bar0', lab);
      const fill1 = $('#bar1', lab);
      const num0 = $('#num0', lab);
      const num1 = $('#num1', lab);

      fill0.style.width = `${Math.round(p0 * 100)}%`;
      fill1.style.width = `${Math.round(p1 * 100)}%`;
      num0.textContent = (p0 * 100).toFixed(1) + '%';
      num1.textContent = (p1 * 100).toFixed(1) + '%';

      const amp0Val = $('#amp0 .ampVal', lab);
      const amp1Val = $('#amp1 .ampVal', lab);
      if (amp0Val) amp0Val.textContent = formatComplex(state[0]);
      if (amp1Val) amp1Val.textContent = formatComplex(state[1]);
    }

    update();
    typesetMath(lab);
    return lab;
  }

  function makeStateExplorer(){
    const lab = document.createElement('div');
    lab.className = 'lab stateExplorer';

    const left = document.createElement('div');
    const right = document.createElement('div');

    const title = document.createElement('div');
    title.className = 'labTitle';
    title.textContent = 'State explorer';

    const formula = document.createElement('div');
    formula.className = 'monoSmall';
    formula.innerHTML = '\\(|\\psi\\rangle = \\cos(\\theta/2)|0\\rangle + e^{i\\phi}\\sin(\\theta/2)|1\\rangle\\)';

    const controls = document.createElement('div');
    controls.className = 'stateControls';

    const thetaRow = document.createElement('div');
    thetaRow.className = 'stateRow';
    const thetaLabel = document.createElement('div');
    thetaLabel.className = 'stateLabel';
    thetaLabel.innerHTML = '\\(\\theta\\) (0 to \\(\\pi\\))';
    const thetaInput = document.createElement('input');
    thetaInput.type = 'range';
    thetaInput.min = '0';
    thetaInput.max = '3.1416';
    thetaInput.step = '0.01';
    thetaInput.value = '1.5708';
    thetaInput.className = 'slider';
    const thetaVal = document.createElement('div');
    thetaVal.className = 'monoSmall';
    thetaVal.textContent = 'theta = 1.57';
    thetaRow.appendChild(thetaLabel);
    thetaRow.appendChild(thetaInput);
    thetaRow.appendChild(thetaVal);

    const phiRow = document.createElement('div');
    phiRow.className = 'stateRow';
    const phiLabel = document.createElement('div');
    phiLabel.className = 'stateLabel';
    phiLabel.innerHTML = '\\(\\phi\\) (0 to 2\\(\\pi\\))';
    const phiInput = document.createElement('input');
    phiInput.type = 'range';
    phiInput.min = '0';
    phiInput.max = '6.2832';
    phiInput.step = '0.01';
    phiInput.value = '0';
    phiInput.className = 'slider';
    const phiVal = document.createElement('div');
    phiVal.className = 'monoSmall';
    phiVal.textContent = 'phi = 0.00';
    phiRow.appendChild(phiLabel);
    phiRow.appendChild(phiInput);
    phiRow.appendChild(phiVal);

    controls.appendChild(thetaRow);
    controls.appendChild(phiRow);

    const readout = document.createElement('div');
    readout.className = 'labReadout';

    const bars = document.createElement('div');
    bars.className = 'bars';

    const b0 = document.createElement('div');
    b0.className = 'bar';
    b0.innerHTML = '<div class="barLabel">\\(P(|0\\rangle)\\)</div><div class="barFill" data-role="p0"></div><div class="barNum" data-role="p0num"></div>';

    const b1 = document.createElement('div');
    b1.className = 'bar';
    b1.innerHTML = '<div class="barLabel">\\(P(|1\\rangle)\\)</div><div class="barFill" data-role="p1"></div><div class="barNum" data-role="p1num"></div>';

    bars.appendChild(b0);
    bars.appendChild(b1);

    const amps = document.createElement('div');
    amps.className = 'amps';

    const amp0 = document.createElement('div');
    amp0.className = 'monoSmall';
    amp0.innerHTML = '<span class="ampLabel">\\(|0\\rangle\\)</span> amplitude = <span class="ampVal" data-role="alpha"></span>';

    const amp1 = document.createElement('div');
    amp1.className = 'monoSmall';
    amp1.innerHTML = '<span class="ampLabel">\\(|1\\rangle\\)</span> amplitude = <span class="ampVal" data-role="beta"></span>';

    amps.appendChild(amp0);
    amps.appendChild(amp1);

    readout.appendChild(bars);
    readout.appendChild(amps);

    left.appendChild(title);
    left.appendChild(formula);
    left.appendChild(controls);

    right.appendChild(readout);

    lab.appendChild(left);
    lab.appendChild(right);

    function update(){
      const theta = parseFloat(thetaInput.value);
      const phi = parseFloat(phiInput.value);
      thetaVal.textContent = `theta = ${theta.toFixed(2)}`;
      phiVal.textContent = `phi = ${phi.toFixed(2)}`;

      const alpha = complex(Math.cos(theta / 2), 0);
      const beta = complex(Math.cos(phi) * Math.sin(theta / 2), Math.sin(phi) * Math.sin(theta / 2));
      const p0 = cAbs2(alpha);
      const p1 = cAbs2(beta);

      const fill0 = lab.querySelector('[data-role="p0"]');
      const fill1 = lab.querySelector('[data-role="p1"]');
      const num0 = lab.querySelector('[data-role="p0num"]');
      const num1 = lab.querySelector('[data-role="p1num"]');
      const alphaVal = lab.querySelector('[data-role="alpha"]');
      const betaVal = lab.querySelector('[data-role="beta"]');

      if (fill0) fill0.style.width = `${Math.round(p0 * 100)}%`;
      if (fill1) fill1.style.width = `${Math.round(p1 * 100)}%`;
      if (num0) num0.textContent = (p0 * 100).toFixed(1) + '%';
      if (num1) num1.textContent = (p1 * 100).toFixed(1) + '%';
      if (alphaVal) alphaVal.textContent = formatComplex(alpha);
      if (betaVal) betaVal.textContent = formatComplex(beta);
    }

    thetaInput.addEventListener('input', update);
    phiInput.addEventListener('input', update);
    update();

    typesetMath(lab);
    return lab;
  }

  function toast(msg){
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 250);
    }, 900);
  }

  function findSeries(items, entry){
    for (const item of items){
      const lessons = normalizeLessons(item);
      if (!lessons.length) continue;
      if (lessons.some((lesson) => lesson.entry === entry)){
        return { item, lessons };
      }
    }
    return null;
  }

  function renderSeriesNav(series, currentEntry){
    if (!navEl || !series) return;
    navEl.innerHTML = '';

    const linksWrap = document.createElement('div');
    linksWrap.className = 'lessonNavLinks';

    series.lessons.forEach((lesson) => {
      const link = document.createElement('a');
      link.className = 'lessonNavLink';
      link.href = `lesson.html?lesson=${encodeURIComponent(lesson.entry)}`;
      link.textContent = lesson.label;
      if (lesson.entry === currentEntry){
        link.classList.add('active');
      }
      linksWrap.appendChild(link);
    });

    const controls = document.createElement('div');
    controls.className = 'lessonNavControls';

    const currentIndex = series.lessons.findIndex((lesson) => lesson.entry === currentEntry);
    const prev = series.lessons[currentIndex - 1];
    const next = series.lessons[currentIndex + 1];

    const prevLink = document.createElement('a');
    prevLink.className = 'navBtn';
    prevLink.textContent = 'Prev';
    if (prev){
      prevLink.href = `lesson.html?lesson=${encodeURIComponent(prev.entry)}`;
    } else {
      prevLink.setAttribute('aria-disabled', 'true');
      prevLink.href = '#';
    }

    const nextLink = document.createElement('a');
    nextLink.className = 'navBtn';
    nextLink.textContent = 'Next';
    if (next){
      nextLink.href = `lesson.html?lesson=${encodeURIComponent(next.entry)}`;
    } else {
      nextLink.setAttribute('aria-disabled', 'true');
      nextLink.href = '#';
    }

    controls.appendChild(prevLink);
    controls.appendChild(nextLink);

    navEl.appendChild(linksWrap);
    navEl.appendChild(controls);
  }

  async function loadLesson(){
    const slug = getParam('lesson');
    const data = await fetchJSON(DATA_PATHS.tutorials).catch(() => null);
    const items = data ? tutorialItems(data) : [];

    if (!slug){
      renderLessonList(items);
      return;
    }

    const entry = await resolveLessonEntry(slug);
    if (!entry){
      renderLessonList(items);
      return;
    }

    const series = findSeries(items, entry);
    renderSeriesNav(series, entry);

    const deck = await fetchJSON(`${DATA_PATHS.lessons}${entry}.json`);
    const meta = deck.meta || {};

    const title = meta.title || deck.title || entry;
    const subtitle = meta.subtitle || deck.subtitle || '';
    const minutes = meta.estimated_minutes ? `Estimated time: ${meta.estimated_minutes} min` : '';

    setHeader(title, subtitle, minutes);

    bodyEl.innerHTML = '';
    const slides = deck.slides || [];
    slides.forEach((slide, idx) => {
      bodyEl.appendChild(renderSlide(slide, idx));
    });

    typesetMath(bodyEl);
  }

  loadLesson().catch((err) => {
    bodyEl.innerHTML = '';
    const section = document.createElement('section');
    section.className = 'slide';
    const title = document.createElement('div');
    title.className = 'slideTitle';
    title.textContent = 'Lesson failed to load';
    const body = document.createElement('div');
    body.className = 'slideBody';
    const p = document.createElement('p');
    p.textContent = err && err.message ? err.message : 'Unknown error.';
    body.appendChild(p);
    section.appendChild(title);
    section.appendChild(body);
    bodyEl.appendChild(section);
  });
})();
