(() => {
  const world = document.getElementById('world');
  const app = document.getElementById('app');
  const toast = document.getElementById('toast');

  const topbar = document.querySelector('.topbar');

  function syncTopbarVar(){
    const h = topbar ? topbar.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--topbarH', `${Math.round(h)}px`);
    return h;
  }

  const frames = new Map();
  document.querySelectorAll('[data-frame]').forEach(el => {
    frames.set(el.getAttribute('data-frame'), el);
  });

  // Ordered flow (linear)
  const order = ['map','s1','s3','s4','s2','s8','s9'];

  // Routes
  const routes = {
    dueno: ['map','s1','s4','s2','s8','s9'],
    ops:   ['map','s1','s3','s4','s2','s8'],
    inv:   ['map','s1','s3','s4','s2','s9','s8']
  };
  let activeRoute = null;

  let current = 'map';
  let ghostT = null;

  // Background “Prezi” focus points (vw/vh offsets + scale)
  // Chosen to feel ferretero and to avoid distracting motion.
  const bgFocus = {
    map: {tx: 0,  ty: 0,  s: 1.05, blur: 2.4, dim: .28},
    s1:  {tx: -2, ty: -1, s: 1.12, blur: 2.6, dim: .32},
    s2:  {tx:  2, ty: -1, s: 1.14, blur: 2.6, dim: .32},
    s3:  {tx: -3, ty:  0, s: 1.16, blur: 2.6, dim: .33},
    s4:  {tx:  4, ty:  1, s: 1.18, blur: 2.7, dim: .34},
    s5:  {tx:  1, ty:  2, s: 1.19, blur: 2.7, dim: .34},
    s6:  {tx: -4, ty:  2, s: 1.21, blur: 2.8, dim: .35},
    s7:  {tx:  3, ty:  3, s: 1.22, blur: 2.8, dim: .35},
    s8:  {tx:  5, ty:  0, s: 1.24, blur: 2.8, dim: .36},
    s9:  {tx: -2, ty:  3, s: 1.23, blur: 2.8, dim: .35},
    r1:  {tx:  0, ty:  6, s: 1.10, blur: 2.5, dim: .32},
    r2:  {tx: -3, ty:  6, s: 1.12, blur: 2.5, dim: .32},
    r3:  {tx:  3, ty:  6, s: 1.14, blur: 2.6, dim: .33},
    r4:  {tx:  6, ty:  6, s: 1.16, blur: 2.6, dim: .33},
  };

  function setBg(frameId){
    const p = bgFocus[frameId] || bgFocus.map;
    const r = document.documentElement;
    r.style.setProperty('--bg-tx', `${p.tx}vw`);
    r.style.setProperty('--bg-ty', `${p.ty}vh`);
    r.style.setProperty('--bg-scale', String(p.s));
    r.style.setProperty('--bg-blur', `${p.blur}px`);
    r.style.setProperty('--bg-dim', String(p.dim));
  }

  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1400);
  }

  function rectForFrame(el){
    const left = parseFloat(el.style.left || '0');
    const top = parseFloat(el.style.top || '0');
    const width = parseFloat(el.style.width || el.offsetWidth);
    const height = parseFloat(el.style.height || el.offsetHeight);
    return {left, top, width, height};
  }

  function fitTransform(frameId){
    const el = frames.get(frameId);
    if(!el) return {x:0,y:0,k:1};

    const r = rectForFrame(el);

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Account for fixed topbar height
    const topbarH = syncTopbarVar();

    const pad = 28;
    const usableW = vw - pad*2;
    const usableH = vh - topbarH - pad*2;

    let k = Math.min(usableW / r.width, usableH / r.height);
    // En reportes, evitamos escalar hacia arriba para no pixelar el PDF/imagenes
    if (frameId && String(frameId).startsWith('r')) k = Math.min(k, 1);

    // center in viewport
    const cx = r.left + r.width/2;
    const cy = r.top + r.height/2;

    let targetX = (vw/2) - (cx * k);
    let targetY = ((topbarH + (vh - topbarH)/2)) - (cy * k);

    // Clamp so the active frame never covers the topbar or falls off-screen
    const padY = 22;
    const padX = 22;
    const topEdge = targetY + (r.top * k);
    const bottomEdge = targetY + ((r.top + r.height) * k);
    const leftEdge = targetX + (r.left * k);
    const rightEdge = targetX + ((r.left + r.width) * k);

    if(topEdge < topbarH + padY){
      targetY += (topbarH + padY - topEdge);
    }
    if(bottomEdge > vh - padY){
      targetY -= (bottomEdge - (vh - padY));
    }
    if(leftEdge < padX){
      targetX += (padX - leftEdge);
    }
    if(rightEdge > vw - padX){
      targetX -= (rightEdge - (vw - padX));
    }

    return {x: targetX, y: targetY, k};
  }

  function go(frameId, opts = {}){
    if(!frames.has(frameId)) return;

    const prev = current;
    const {x,y,k} = fitTransform(frameId);

    world.style.transition = opts.instant ? 'none' : 'transform 750ms cubic-bezier(.2,.9,.2,1)';
    world.style.transform = `translate(${x}px, ${y}px) scale(${k})`;

    // Sync background focus with navigation
    setBg(frameId);

    current = frameId;
    app.setAttribute('data-mode', frameId === 'map' ? 'map' : 'slide');

    // CLEAN: only one frame “on top” at a time.
    // Keep the previous frame as a faint ghost during the zoom transition
    // so the screen never flashes empty.
    if(ghostT) clearTimeout(ghostT);
    frames.forEach((el, id) => {
      el.classList.remove('is-active','is-ghost');
      el.setAttribute('aria-hidden', 'true');
    });

    const nextEl = frames.get(frameId);
    if(nextEl){
      nextEl.classList.add('is-active');
      nextEl.setAttribute('aria-hidden', 'false');
    }

    const prevEl = frames.get(prev);
    if(prevEl && prev !== frameId){
      prevEl.classList.add('is-ghost');
      ghostT = setTimeout(() => prevEl.classList.remove('is-ghost'), opts.instant ? 0 : 780);
    }

    // set hash without scrolling
    if(!opts.noHash){
      history.replaceState(null, '', `#${frameId}`);
    }

    if(activeRoute){
      const idx = activeRoute.indexOf(frameId);
      if(idx >= 0){
        showToast(`Ruta: ${idx+1}/${activeRoute.length}`);
      }
    }
  }

  function next(){
    const list = activeRoute || order;
    const idx = list.indexOf(current);
    const nxt = list[Math.min(idx+1, list.length-1)];
    if(nxt && nxt !== current) go(nxt);
  }
  function prev(){
    const list = activeRoute || order;
    const idx = list.indexOf(current);
    const prv = list[Math.max(idx-1, 0)];
    if(prv && prv !== current) go(prv);
  }

  function setRoute(name){
    activeRoute = routes[name] || null;
    const label = name === 'dueno' ? 'Dueño' : name === 'ops' ? 'Operación' : 'Inventarios';
    showToast(`Ruta activa: ${label}`);
    go('map');
  }

  // Click navigation
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if(!t) return;
    const cmd = t.getAttribute('data-go');

    if(cmd === 'map'){
      go('map');
      return;
    }

    if(cmd && cmd.startsWith('route:')){
      const name = cmd.split(':')[1];
      setRoute(name);
      return;
    }

    if(frames.has(cmd)){
      go(cmd);
    }
  });

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' '){
      e.preventDefault();
      next();
    }
    if(e.key === 'ArrowLeft' || e.key === 'PageUp'){
      e.preventDefault();
      prev();
    }
    if(e.key === 'Escape'){
      e.preventDefault();
      go('map');
    }
  }, {passive:false});

  // Touch swipe
  let touch = null;
  window.addEventListener('touchstart', (e) => {
    if(!e.touches || !e.touches[0]) return;
    const t = e.touches[0];
    touch = {x: t.clientX, y: t.clientY, time: Date.now()};
  }, {passive:true});

  window.addEventListener('touchend', (e) => {
    if(!touch) return;
    const dt = Date.now() - touch.time;
    const changed = e.changedTouches && e.changedTouches[0];
    if(!changed) return;
    const dx = changed.clientX - touch.x;
    const dy = changed.clientY - touch.y;

    // swipe horizontal
    if(dt < 600 && Math.abs(dx) > 70 && Math.abs(dy) < 90){
      if(dx < 0) next();
      else prev();
    }
    touch = null;
  }, {passive:true});

  // Resize
  window.addEventListener('resize', () => {
    go(current, {instant:true, noHash:true});
  });

  // Init from hash
  function init(){
    const hash = (location.hash || '').replace('#','');
    // Default to map for Expo (no surprise popups). Deep-link still supported.
    const start = frames.has(hash) ? hash : 'map';
    syncTopbarVar();
    setBg(start);
    go(start, {instant:true, noHash:true});

    // Sin mensajes intrusivos (presentación más limpia)
  }


  // ===== Reportes PDF (Topbar) =====
  const pdfModal = document.getElementById('pdfModal');
  const pdfFrame = document.getElementById('pdfFrame');
  const pdfTitle = document.getElementById('pdfModalTitle');
  const pdfOpen = document.getElementById('pdfModalOpen');

  function openPdfModal(src, title){
    if(!pdfModal || !pdfFrame) return;
    const cleanTitle = (title || 'Reporte').trim();
    if(pdfTitle) pdfTitle.textContent = cleanTitle;
    if(pdfOpen) pdfOpen.setAttribute('href', src || '#');

    pdfModal.classList.add('show');
    pdfModal.setAttribute('aria-hidden','false');

    // Prevent background scroll while viewing PDF
    document.documentElement.style.overflow = 'hidden';

    // Load PDF (FitH)
    const withHash = (src || '') + ((src || '').includes('#') ? '' : '#view=FitH');
    pdfFrame.setAttribute('src', withHash);
  }

  function closePdfModal(){
    if(!pdfModal || !pdfFrame) return;
    pdfModal.classList.remove('show');
    pdfModal.setAttribute('aria-hidden','true');
    pdfFrame.setAttribute('src', '');
    document.documentElement.style.overflow = '';
  }

  // Menú flotante de reportes (hamburguesa)
  const hamburgerReport = document.getElementById('hamburgerReport');
  const reportFloatingMenu = document.getElementById('reportFloatingMenu');
  function toggleReportMenu(){
    if(!reportFloatingMenu || !hamburgerReport) return;
    const isOpen = reportFloatingMenu.classList.toggle('is-open');
    hamburgerReport.setAttribute('aria-expanded', isOpen);
    reportFloatingMenu.setAttribute('aria-hidden', !isOpen);
  }
  function closeReportMenu(){
    if(!reportFloatingMenu || !hamburgerReport) return;
    reportFloatingMenu.classList.remove('is-open');
    hamburgerReport.setAttribute('aria-expanded', 'false');
    reportFloatingMenu.setAttribute('aria-hidden', 'true');
  }
  if(hamburgerReport && reportFloatingMenu){
    hamburgerReport.addEventListener('click', (e) => { e.stopPropagation(); toggleReportMenu(); });
    document.addEventListener('click', (e) => {
      if(reportFloatingMenu.classList.contains('is-open') && !reportFloatingMenu.contains(e.target) && !hamburgerReport.contains(e.target)){
        closeReportMenu();
      }
    });
  }

  // Modal WhatsApp QR
  const whatsappBtn = document.getElementById('whatsappBtn');
  const whatsappOverlay = document.getElementById('whatsappOverlay');
  const whatsappModalClose = document.getElementById('whatsappModalClose');
  function openWhatsApp(){
    if(!whatsappOverlay) return;
    whatsappOverlay.setAttribute('aria-hidden', 'false');
    whatsappOverlay.classList.add('open');
    if(whatsappBtn) whatsappBtn.setAttribute('aria-expanded', 'true');
  }
  function closeWhatsApp(){
    if(!whatsappOverlay) return;
    whatsappOverlay.setAttribute('aria-hidden', 'true');
    whatsappOverlay.classList.remove('open');
    if(whatsappBtn) whatsappBtn.setAttribute('aria-expanded', 'false');
  }
  if(whatsappBtn && whatsappOverlay){
    whatsappBtn.addEventListener('click', openWhatsApp);
    if(whatsappModalClose) whatsappModalClose.addEventListener('click', closeWhatsApp);
    whatsappOverlay.addEventListener('click', (e) => { if(e.target === whatsappOverlay) closeWhatsApp(); });
  }

  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-pdf]');
    if(openBtn){
      e.preventDefault();
      closeReportMenu();
      const src = openBtn.getAttribute('data-pdf');
      const title = openBtn.getAttribute('data-title') || openBtn.textContent || 'Reporte';
      openPdfModal(src, title);
      return;
    }
    const closeBtn = e.target.closest('[data-pdf-close]');
    if(closeBtn){
      e.preventDefault();
      closePdfModal();
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      if(pdfModal && pdfModal.classList.contains('show')) closePdfModal();
      else if(whatsappOverlay && whatsappOverlay.classList.contains('open')) closeWhatsApp();
      else if(reportFloatingMenu && reportFloatingMenu.classList.contains('is-open')) closeReportMenu();
    }
  });

  init();
})();
