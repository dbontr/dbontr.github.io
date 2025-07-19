// Vanilla SPA for GitHub Pages
// - Tailwind via Play CDN
// - Lucide icons via web CDN
// - Loads Projects/Papers/Products from /data/*.json
// - Right-side cart drawer (no new page)

(() => {
  const state = {
    activePage: 'home',
    cart: [],
    selectedCategory: 'all',
    data: { projects: [], papers: [], products: [] },
    loading: true,
    error: null,
    params: {},
    ui: { cartOpen: false }
  };

  const pages = ['home','shop','projects','papers','about','contact','product'];

  // Utils ---------------------------------------------------------------
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const app = $('#app');

  const formatMoney = v => '$' + Number(v || 0).toFixed(2);
  const cartTotal   = () => state.cart.reduce((s, item) => s + Number(item.price || 0), 0);
  const refreshIcons = () => { if (window.lucide?.createIcons) window.lucide.createIcons(); };

  function saveCart(){ localStorage.setItem('dbontr_cart', JSON.stringify(state.cart)); }
  function loadCart(){
    try { state.cart = JSON.parse(localStorage.getItem('dbontr_cart') || '[]'); } catch { state.cart = []; }
  }

  function updateNavActive(id) {
    // support both [data-nav] buttons and <a href="#page"> links
    $$('.nav-btn,[href^="#"]').forEach(el => {
      const target = el.getAttribute('data-nav') || (el.getAttribute('href') || '').replace('#','');
      if (!target) return;
      el.classList.toggle('active', target === id);
    });
  }

  function setActivePage(id, params = {}) {
    state.activePage = id;
    state.params = params;
    location.hash = id + (params.id != null ? '/' + params.id : '');
    render();
    updateNavActive(id);
    $('#mobileMenu')?.classList.add('hidden');
  }

  function openProduct(id) { setActivePage('product', { id: String(id) }); }

  function parseHash() {
    const raw = (location.hash || '#home').slice(1);
    const [page, id] = raw.split('/');
    if (pages.includes(page)) {
      state.activePage = page;
      state.params = id ? { id } : {};
    } else {
      state.activePage = 'home';
      state.params = {};
    }
    updateNavActive(state.activePage);
  }

  // Data ---------------------------------------------------------------
  async function loadData() {
    try {
      const [projRes, papRes, prodRes] = await Promise.all([
        fetch('./data/projects.json', {cache:'no-cache'}),
        fetch('./data/papers.json',   {cache:'no-cache'}),
        fetch('./data/products.json', {cache:'no-cache'}),
      ]);
      if (!projRes.ok || !papRes.ok || !prodRes.ok) throw new Error('Failed to load one or more data files.');
      const [projects, papers, products] = await Promise.all([projRes.json(), papRes.json(), prodRes.json()]);
      state.data.projects = projects || [];
      state.data.papers   = papers   || [];
      state.data.products = products || [];
      state.loading = false;
      render();
    } catch (err) {
      state.error = err?.message || String(err);
      state.loading = false;
      render();
    }
  }

  // Cart Drawer --------------------------------------------------------
  function ensureCartDrawer() {
    if (!document.getElementById('cartDrawer')) {
      const el = document.createElement('div');
      el.id = 'cartDrawer';
      document.body.appendChild(el);
    }
  }

  function renderCartDrawer() {
    let el = document.getElementById('cartDrawer');
    if (!el) { el = document.createElement('div'); el.id = 'cartDrawer'; document.body.appendChild(el); }

    const open = !!state.ui.cartOpen;
    const items = state.cart;

    // When closed: remove the DOM entirely so nothing can block clicks
    if (!open) { el.innerHTML = ''; return; }

    el.innerHTML = `
      <div class="fixed inset-0 z-[9999]">
        <div data-cart-overlay class="absolute inset-0 bg-black/50"></div>

        <aside class="absolute right-0 top-0 h-full w-full sm:w-[28rem]
                      bg-gray-900 border-l border-gray-800 shadow-2xl
                      transform translate-x-0 flex flex-col">
          <div class="flex items-center justify-between p-5 border-b border-gray-800">
            <div class="flex items-center gap-2 text-white font-semibold">
              <i data-lucide="shopping-cart" class="w-5 h-5"></i>
              <span>Your Cart</span>
              <span class="text-gray-400 text-sm">(${items.length})</span>
            </div>
            <button data-cart-close class="text-gray-400 hover:text-white" aria-label="Close cart">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-4">
            ${
              items.length
                ? items.map((item, idx) => `
                    <div class="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div class="flex items-center gap-4">
                        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded">
                        <div>
                          <p class="text-white font-medium">${item.name}</p>
                          <p class="text-blue-400">${'$' + Number(item.price||0).toFixed(2)}</p>
                        </div>
                      </div>
                      <button data-remove-index="${idx}" class="text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  `).join('')
                : `<p class="text-gray-400">Your cart is empty.</p>`
            }
          </div>

          <div class="border-t border-gray-800 bg-gray-900 p-5 sticky bottom-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div class="flex items-center justify-between mb-4">
              <span class="text-gray-400">Total</span>
              <span class="text-white font-bold text-xl">${'$' + Number(cartTotal()).toFixed(2)}</span>
            </div>
            <button data-checkout class="w-full px-6 py-3 grad-bpo text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              Proceed to Checkout
            </button>
          </div>
        </aside>
      </div>
    `;
    refreshIcons();
  }

  // Views --------------------------------------------------------------
  const Loading = () => `
    <section class="min-h-[60vh] grid place-items-center p-12">
      <div class="text-gray-400">Loading…</div>
    </section>`;

  const ErrorView = () => `
    <section class="min-h-[60vh] grid place-items-center p-12">
      <div class="text-red-400">Error: ${state.error}</div>
    </section>`;

  function HomePage() {
    return `
    <section class="relative min-h-[90vh] overflow-hidden">
      <!-- Background video (z-0) -->
      <div class="absolute inset-0 z-0">
        <video
          id="homeHeroVideo"
          class="w-full h-full object-cover pointer-events-none"
          autoplay
          muted
          playsinline
          loop
          preload="auto"
          poster="./assets/home-hero-poster.jpg"
        >
          <source src="./assets/home-hero.mp4" type="video/mp4" />
          <!-- Optional HEVC for Safari if you have it:
          <source src="./assets/home-hero.hevc.mp4" type="video/mp4; codecs=hvc1" /> -->
        </video>

        <!-- Soft overlays (readability + subtle dots) -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-black/70"></div>
        <div class="absolute inset-0 bg-dot opacity-30"></div>
      </div>

      <!-- Foreground content (z-10) -->
      <div class="relative z-10 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <!-- sparkle removed; keep same vertical spacing -->
            <div class="mb-8 h-16"></div>

            <h1 class="text-5xl md:text-7xl font-bold mb-6">
              <span class="text-white font-display tracking-widest">
                dbontr
              </span>
            </h1>

            <p class="text-xl md:text-2xl text-gray-200/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Pushing the boundaries of technology, AI, and digital innovation.
              Creating the future, one line of code at a time.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#shop" class="px-8 py-4 bg-gray-900/80 text-white font-semibold rounded-lg hover:bg-gray-800/80 border border-white/10 transform hover:scale-105 transition-all duration-200 text-center">Visit Shop</a>
              <a href="#projects" class="px-8 py-4 grad-bpo text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-center">Explore Projects</a>
            </div>
          </div>

          <div class="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            ${
              [
                { title:"Modern iOS apps",  subtitle:"Crafting from Swift to AppStore.", icon:"🎯", colors:{ from:"#F59E0B", to:"#FDE68A" } },
                { title:"No-code websites", subtitle:"Vibrant designs with Webflow.",    icon:"🌐", colors:{ from:"#8B5CF6", to:"#EC4899" } },
                { title:"Delish UI",        subtitle:"Crafting products with Figma.",    icon:"🎨", colors:{ from:"#22D3EE", to:"#3B82F6" } }
              ].map(c => {
                const g1 = (c.colors && c.colors.from) || "#2563EB";
                const g2 = (c.colors && c.colors.to)   || "#7C3AED";
                return `
                  <div class="relative group cursor-pointer">
                    <!-- Card root -->
                    <div class="relative w-full aspect-square rounded-lg btn-frost-lite overflow-hidden no-outline no-tap-highlight">
                      <!-- TINT: sits UNDER content -->
                      <div
                        class="absolute inset-0 z-0 grad-overlay opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-sm pointer-events-none"
                        style="--g1:${g1}; --g2:${g2};">
                      </div>

                      <!-- CONTENT: sits ABOVE tint -->
                      <div class="relative z-10 h-full w-full flex flex-col items-center justify-center p-6">
                        <div class="text-4xl mb-4">${c.icon}</div>
                        <h3 class="text-lg font-semibold mb-2 text-white">${c.title}</h3>
                        <p class="text-sm text-gray-300">${c.subtitle}</p>
                      </div>
                    </div>

                    <!-- Optional outer glow: keep subtle and non-blocking -->
                    <div class="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                      <div class="absolute inset-0 rounded-lg grad-overlay blur-lg" style="--g1:${g1}; --g2:${g2};"></div>
                    </div>
                  </div>
                `;
              }).join('')
            }
          </div>
        </div>
      </div>
    </section>`;
  }

  function ProjectsPage() {
    const cards = state.data.projects;
    return `
    <section class="min-h-screen bg-black bg-dot from-gray-900 via-gray-800 to-black pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-4xl md:text-6xl font-bold mb-6"><span class="text-white">Projects</span></h1>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">A showcase of innovative solutions, cutting-edge research, and creative explorations at the intersection of technology and human potential.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${cards.map(p => `
            <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300 group">
              <a href="${p.link || '#'}" target="_blank" rel="noopener" class="block">
                <div class="relative overflow-hidden">
                  <img src="${p.image}" alt="${p.title}" class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"/>
                  <div class="absolute top-4 right-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                      p.status==='Active' ? 'bg-green-500/20 text-green-400' :
                      p.status==='Beta' ? 'bg-blue-500/20 text-blue-400' :
                      p.status==='Production' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }">${p.status || ''}</span>
                  </div>
                </div>
                <div class="p-6">
                  <h3 class="text-xl font-semibold mb-3 text-white group-hover:text-blue-400 transition-colors">${p.qtitle || p.title}</h3>
                  <p class="text-gray-300 mb-4 text-sm leading-relaxed">${p.desc || ''}</p>
                  <div class="flex flex-wrap gap-2 mb-2">
                    ${(p.tech || []).map(t => `<span class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md">${t}</span>`).join('')}
                  </div>
                  <span class="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-semibold">Open <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i></span>
                </div>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
  }

  function PapersPage() {
    const papers = state.data.papers;
    return `
    <section class="min-h-screen bg-black bg-dot from-gray-900 via-gray-800 to-black pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-4xl md:text-6xl font-bold mb-6"><span class="text-white">Research</span></h1>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">Academic publications and technical papers exploring the frontiers of AI, machine learning, and computational innovation.</p>
        </div>
        <div class="space-y-8">
          ${papers.map(p => `
            <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div class="flex-1">
                  ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" class="text-2xl font-bold mb-3 text-white hover:text-blue-400 block">${p.title}</a>` : `<h3 class="text-2xl font-bold mb-3 text-white">${p.title}</h3>`}
                  <p class="text-gray-300 mb-2 italic">${p.authors || ''}</p>
                  <p class="text-blue-400 font-mono text-sm">${p.venue || ''}</p>
                </div>
                <div class="mt-4 md:mt-0 md:ml-8 text-right">
                  ${p.status ? `<span class="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">${p.status}</span>` : ''}
                  <p class="text-gray-400 text-sm mt-1">${p.year || ''}</p>
                </div>
              </div>
              ${p.abstract ? `<div class="mb-6"><h4 class="text-lg font-semibold text-blue-400 mb-2">Abstract</h4><p class="text-gray-300 leading-relaxed">${p.abstract}</p></div>` : ''}
              ${(p.keywords||[]).length ? `<div><h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Keywords</h4><div class="flex flex-wrap gap-2">${p.keywords.map(k => `<span class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md">${k}</span>`).join('')}</div></div>` : '' }
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
  }

  function ShopPage() {
    const all = state.data.products;
    const filtered = state.selectedCategory === 'all'
      ? all
      : (all || []).filter(p => p.category === state.selectedCategory);

    return `
    <section class="min-h-screen bg-black bg-dot from-gray-900 via-gray-800 to-black pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-4xl md:text-6xl font-bold mb-6"><span class="text-white">Shop</span></h1>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">Premium merchandise for the tech enthusiast, AI researcher, and digital creator.</p>
        </div>

        <div class="flex flex-wrap justify-center gap-4 mb-12">
          ${[
            { id:'all', label:'All Products' },
            { id:'apparel', label:'Apparel' },
            { id:'electronics', label:'Electronics' },
            { id:'accessories', label:'Accessories' }
          ].map(cat => `
            <button data-category-id="${cat.id}" class="px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${state.selectedCategory===cat.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}">
              ${cat.label}
            </button>
          `).join('')}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${(filtered || []).map(p => `
            <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300 group cursor-pointer"
                 role="button" tabindex="0" aria-label="View ${p.name}" data-product-id="${p.id}">
              <div class="relative">
                <img src="${p.image}" alt="${p.name}" class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"/>
                ${p.featured ? `<div class="absolute top-4 left-4"><span class="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold rounded-full">Featured</span></div>` : ''}
              </div>
              <div class="p-6">
                <h3 class="text-xl font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors">${p.name}</h3>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold text-blue-400">${formatMoney(p.price)}</span>
                  <button data-add-to-cart="${p.id}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">Add to Cart</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
  }

  function ProductPage() {
    const pid = Number(state.params?.id);
    const p = (state.data.products || []).find(x => Number(x.id) === pid);

    if (!p) {
      return `
      <section class="min-h-screen bg-black bg-dot from-gray-900 via-gray-800 to-black pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-3xl md:text-5xl font-bold text-white mb-6">Product not found</h1>
          <a href="#shop" class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700">Back to Shop</a>
        </div>
      </section>`;
    }

    return `
    <section class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div class="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
            <img src="${p.image}" alt="${p.name}" class="w-full h-auto object-cover"/>
          </div>
          <div>
            <h1 class="text-3xl md:text-5xl font-bold text-white mb-4">${p.name}</h1>
            <div class="flex items-center gap-3 mb-6">
              ${p.featured ? `<span class="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold rounded-full">Featured</span>` : ''}
              ${p.category ? `<span class="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">${p.category}</span>` : ''}
            </div>
            <div class="text-3xl font-bold text-blue-400 mb-6">${formatMoney(Number(p.price || 0))}</div>
            ${p.description ? `
              <div class="mb-8">
                <h2 class="text-lg font-semibold text-blue-400 mb-2">Description</h2>
                <p class="text-gray-300 leading-relaxed">${p.description}</p>
              </div>` : ''}
            <div class="flex gap-3">
              <button data-add-to-cart="${p.id}" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">Add to Cart</button>
              <a href="#shop" class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700">Back to Shop</a>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  // About/Contact (rich versions from your snippet) ---------------------
  function AboutPage() {
    const journey = [
      { year:"2018", title:"Beginnings in AI", description:"Started exploring neural networks and machine learning algorithms, building first generative models." },
      { year:"2019", title:"Creative Applications", description:"Applied AI to creative domains like music generation and visual art, bridging technology and creativity." },
      { year:"2020", title:"Research Publications", description:"Published first academic papers on neural architecture search and adaptive generative models." },
      { year:"2021", title:"Industry Impact", description:"Developed AI systems adopted by tech companies for creative applications and user experience optimization." },
      { year:"2022", title:"Global Recognition", description:"Keynote speaker at major AI and creative technology conferences, recognized for innovative approaches." },
      { year:"2023", title:"Future Horizons", description:"Exploring quantum-inspired computing and bio-digital interfaces to push the boundaries of human-machine symbiosis." }
    ];
    return `
    <section class="min-h-screen bg-black bg-dot from-gray-900 via-gray-800 to-black pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 class="text-4xl md:text-6xl font-bold mb-6"><span class="text-white">About</span></h1>
            <p class="text-xl text-gray-300 mb-6 leading-relaxed">
              I'm <span class="font-semibold">dbontr</span>, a digital innovator at the intersection of artificial intelligence,
              creative technology, and human potential.
            </p>
            <p class="text-lg text-gray-400 mb-8 leading-relaxed">
              My work focuses on pushing the boundaries of what's possible with AI and machine learning, creating systems that
              don't just process information but understand context, emotion, and human intention.
            </p>
            <div class="flex flex-wrap gap-2">
              ${["Artificial Intelligence","Machine Learning","Creative Coding","High Energy Physics","Data Science","Generative Art"]
                .map(s => `<span class="px-4 py-2 bg-gray-800 text-blue-400 rounded-full text-sm font-medium border border-gray-700">${s}</span>`).join('')}
            </div>
          </div>
          <div class="relative">
            <div class="w-80 h-80 mx-auto rounded-full overflow-hidden border-4 border-blue-500/30 shadow-2xl">
              <img src="https://placehold.co/320x320/1a1a2e/ffffff?text=dbontr" alt="dbontr" class="w-full h-full object-cover"/>
            </div>
            <div class="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <i data-lucide="sparkles" class="w-8 h-8 text-white"></i>
            </div>
          </div>
        </div>

        <div class="mb-16">
          <h2 class="text-3xl font-bold mb-12 text-center text-white">Journey</h2>
          <div class="relative">
            <div class="absolute left-1/2 transform -translate-x-0.5 w-0.5 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
            ${journey.map((ev, i) => `
              <div class="mb-12 flex ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}">
                <div class="w-1/2 ${i % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}">
                  <div class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-semibold mb-2 text-white">${ev.title}</h3>
                    <p class="text-gray-300">${ev.description}</p>
                  </div>
                </div>
                <div class="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-gray-900 z-10"></div>
                <div class="w-1/2 ${i % 2 === 0 ? 'pl-8' : 'pr-8'}">
                  <div class="text-blue-400 font-bold text-lg">${ev.year}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <h2 class="text-3xl font-bold mb-12 text-center text-white">Recognition</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${[
              { quote:"dbontr's work represents the future of AI — creatively intelligent systems that understand human expression.", author:"Dr. Elena Rodriguez", role:"Professor of AI, MIT" },
              { quote:"The quantum-inspired UI framework is revolutionary. It adapts to user behavior in ways that feel almost psychic.", author:"Marcus Chen", role:"CTO, TechVision" },
              { quote:"Neural Synthesis opened new possibilities for music creation. It's not replacing composers, but collaborating with them.", author:"Sophie Laurent", role:"Composer & Producer" }
            ].map(t => `
              <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div class="text-blue-400 mb-4 opacity-70"><i data-lucide="quote" class="w-8 h-8"></i></div>
                <p class="text-gray-300 mb-4 italic">"${t.quote}"</p>
                <div><p class="text-white font-semibold">${t.author}</p><p class="text-gray-400 text-sm">${t.role}</p></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>`;
  }

  function ContactPage() {
    return `
    <section class="min-h-screen bg-black bg-dot from-gray-900 via-gray-800 to-black pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-4xl md:text-6xl font-bold mb-6"><span class="text-white">Contact</span></h1>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Let's collaborate on the future. Whether you have a project in mind,
            want to discuss research, or just want to connect, I'd love to hear from you.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <h2 class="text-2xl font-bold mb-6 text-white">Send a Message</h2>
            <form class="space-y-6" id="contactForm">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input type="text" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400" placeholder="Your name" required/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input type="email" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400" placeholder="your.email@example.com" required/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <input type="text" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400" placeholder="What's this regarding?" required/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea rows="5" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none" placeholder="Tell me about your project or idea..." required></textarea>
              </div>
              <button type="submit" class="w-full px-8 py-3 grad-bpo text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200">
                Send Message
              </button>
            </form>
          </div>

          <div class="space-y-8">
            <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
              <h2 class="text-2xl font-bold mb-6 text-white">Get in Touch</h2>
              <div class="space-y-6">
                <div class="flex items-start space-x-4">
                  <div class="p-3 bg-blue-500/20 rounded-lg"><i data-lucide="mail" class="w-5 h-5 text-blue-400"></i></div>
                  <div><h3 class="text-white font-semibold">Email</h3><p class="text-gray-300">devonlbontrager@ku.edu</p></div>
                </div>
                <div class="flex items-start space-x-4">
                  <div class="p-3 bg-blue-500/20 rounded-lg"><i data-lucide="github" class="w-5 h-5 text-blue-400"></i></div>
                  <div><h3 class="text-white font-semibold">GitHub</h3><p class="text-gray-300">github.com/dbontr</p></div>
                </div>
                <div class="flex items-start space-x-4">
                  <div class="p-3 bg-blue-500/20 rounded-lg"><i data-lucide="twitter" class="w-5 h-5 text-blue-400"></i></div>
                  <div><h3 class="text-white font-semibold">Twitter</h3><p class="text-gray-300">@dbontr_ai</p></div>
                </div>
                <div class="flex items-start space-x-4">
                  <div class="p-3 bg-blue-500/20 rounded-lg"><i data-lucide="linkedin" class="w-5 h-5 text-blue-400"></i></div>
                  <div><h3 class="text-white font-semibold">LinkedIn</h3><p class="text-gray-300">linkedin.com/in/dbontr</p></div>
                </div>
              </div>
            </div>

            <div class="relative rounded-xl overflow-hidden border border-white/10">
              <!-- soft gradient overlay -->
              <div class="absolute inset-0 grad-bpo-full opacity-25 pointer-events-none"></div>

              <!-- content -->
              <div class="relative p-6 sm:p-8 backdrop-blur-sm">
                <h2 class="text-2xl font-bold mb-4 text-white">Stay Updated</h2>
                <p class="text-gray-300 mb-4">
                  Subscribe to my newsletter for updates on projects, research, and exclusive content.
                </p>

                <!-- Stack on mobile, row on >=640px -->
                <form id="newsletterForm" class="flex flex-col sm:flex-row gap-3 sm:gap-0">
                  <label for="newsletterEmail" class="sr-only">Email address</label>
                  <input
                    id="newsletterEmail"
                    type="email"
                    inputmode="email"
                    autocomplete="email"
                    required
                    placeholder="Your email address"
                    class="flex-1 min-w-0 w-full px-4 py-3
                          bg-white/10 border-0 outline-none ring-0
                          rounded-lg sm:rounded-l-lg sm:rounded-r-none
                          focus:outline-none focus:ring-0 focus:border-0 focus:border-transparent
                          text-white placeholder-gray-300"
                  />

                  <button
                    type="submit"
                    class="px-6 py-3 font-semibold w-full sm:w-auto
                          rounded-lg sm:rounded-r-lg sm:rounded-l-none
                          text-white bg-white/15 hover:bg-white/25
                          backdrop-blur-sm transition-colors duration-200">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  function applyBackground(page) {
    document.body.classList.toggle('is-home', page === 'home');
    document.body.classList.toggle('is-nonhome', page !== 'home');
  }

  // Render --------------------------------------------------------------
  function render() {
    if (state.loading) { app.innerHTML = Loading(); refreshIcons(); return; }
    if (state.error)   { app.innerHTML = ErrorView(); refreshIcons(); return; }

    const view =
      state.activePage === 'home'    ? HomePage()    :
      state.activePage === 'shop'    ? ShopPage()    :
      state.activePage === 'projects'? ProjectsPage() :
      state.activePage === 'papers'  ? PapersPage()  :
      state.activePage === 'product' ? ProductPage() :
      state.activePage === 'about'   ? AboutPage()   :
      state.activePage === 'contact' ? ContactPage() : HomePage();

    app.innerHTML = view;
    refreshIcons();

    const v = document.getElementById('homeHeroVideo');
    if (v) {
      v.muted = true;
      const p = v.play?.();
      if (p && p.catch) p.catch(() => {/* ignore if browser blocks */});
    }

    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    const cnt = document.getElementById('cartCount');
    if (cnt) {
      cnt.textContent = String(state.cart.length || 0);
      cnt.classList.toggle('hidden', state.cart.length === 0);
    }

    app.setAttribute('tabindex', '-1'); app.focus();
    renderCartDrawer(); // keep drawer in sync
  }

  // Events --------------------------------------------------------------
  document.addEventListener('click', (e) => {
    // 0) Add to cart — handle FIRST and cancel bubbling/default (anchors/tiles won't hijack)
    const addBtn = e.target.closest('[data-add-to-cart]');
    if (addBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = Number(addBtn.getAttribute('data-add-to-cart'));
      const prod = (state.data.products || []).find(p => Number(p.id) === id);
      if (prod) {
        state.cart.push(prod);
        saveCart();
        state.ui.cartOpen = true;           // open drawer on add
        render();
      }
      return;
    }

    // 1) Hash-nav anchors (e.g., href="#about")
    const hashLink = e.target.closest('a[href^="#"]');
    if (hashLink) {
      const target = (hashLink.getAttribute('href') || '').slice(1).split('/')[0];
      if (pages.includes(target)) {
        e.preventDefault();
        e.stopPropagation();
        setActivePage(target);
        applyBackground(target);            // <— apply new background
        return;
      }
    }

    // 2) Explicit data-nav buttons
    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) {
      e.preventDefault();
      e.stopPropagation();
      const target = navBtn.getAttribute('data-nav');
      setActivePage(target);
      applyBackground(target);              // <— apply new background
      return;
    }

    // 3) Product tile -> detail (runs only if we didn't click add-to-cart)
    const tile = e.target.closest('[data-product-id]');
    if (tile) {
      e.preventDefault();
      e.stopPropagation();
      openProduct(Number(tile.getAttribute('data-product-id')));
      applyBackground('product');           // <— optional, non-home background
      return;
    }

    // 4) Remove from cart
    const remBtn = e.target.closest('[data-remove-index]');
    if (remBtn) {
      e.preventDefault();
      e.stopPropagation();
      const idx = Number(remBtn.getAttribute('data-remove-index'));
      state.cart = state.cart.filter((_, i) => i !== idx);
      saveCart();
      render();
      return;
    }

    // 5) Category filter
    const catBtn = e.target.closest('[data-category-id]');
    if (catBtn) {
      e.preventDefault();
      e.stopPropagation();
      state.selectedCategory = catBtn.getAttribute('data-category-id');
      render();
      return;
    }

    // 6) Cart drawer toggle
    const cartToggle = e.target.closest('[data-cart-toggle], #cartButton, [aria-label="Cart"], .js-cart-button');
    if (cartToggle) {
      e.preventDefault();
      e.stopPropagation();
      state.ui.cartOpen = !state.ui.cartOpen;
      renderCartDrawer();
      return;
    }

    // 7) Close cart (overlay or X)
    const cartClose = e.target.closest('[data-cart-close], [data-cart-overlay]');
    if (cartClose) {
      e.preventDefault();
      e.stopPropagation();
      state.ui.cartOpen = false;
      renderCartDrawer();
      return;
    }

    // 8) Checkout -> 404
    const checkout = e.target.closest('[data-checkout]');
    if (checkout) {
      e.preventDefault();
      e.stopPropagation();
      location.href = '404.html';
      return;
    }

    // 9) Mobile menu toggle (if present)
    const mb = e.target.closest('#menuToggle');
    if (mb) {
      e.preventDefault();
      e.stopPropagation();
      $('#mobileMenu')?.classList.toggle('hidden');
      const icon = mb.querySelector('i');
      if (icon) {
        const isOpen = !$('#mobileMenu').classList.contains('hidden');
        icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
        refreshIcons();
      }
      return;
    }
  });

  // Close cart on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.ui.cartOpen) {
      state.ui.cartOpen = false;
      renderCartDrawer();
    }
  });

  // Form (demo)
  document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'contactForm') {
      e.preventDefault();
      alert('Thanks! Your message has been recorded (demo).');
    }
  });

  // Hash/back support
  window.addEventListener('hashchange', () => {
    parseHash();
    render();
    applyBackground(state.activePage);   // keep background in sync
  });

  window.addEventListener('DOMContentLoaded', () => {
    render();
    loadData();
    updateNavActive(state.activePage);
    applyBackground(state.activePage);   // set correct background initially
  });

  window.addEventListener('resize', () => {
    // Tailwind lg breakpoint ≈ 1024
    if (window.innerWidth >= 1024) {
      const mm = document.getElementById('mobileMenu');
      if (mm) mm.classList.add('hidden');
      const icon = document.querySelector('#menuToggle i');
      if (icon) { icon.setAttribute('data-lucide', 'menu'); refreshIcons(); }
    }
  });


  // Init ---------------------------------------------------------------
  loadCart();
  parseHash();
  window.addEventListener('DOMContentLoaded', () => {
    render();
    loadData();
    updateNavActive(state.activePage);
  });
})();

