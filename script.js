(() => {
  'use strict';
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  const intro = $('#intro');
  const enter = $('#enterExperience');
  const status = $('#audioStatus');
  const audio = $('#siteAudio');
  let started = false;
  let introClosed = false;

  // Audio: try audible autoplay first. If the browser blocks it, keep the track
  // ready and ask for one deliberate tap/click. This is required by modern browsers.
  async function startAudio({unmute = true} = {}) {
    if (!audio) return false;
    try {
      if (unmute) audio.muted = false;
      audio.volume = 0.42;
      await audio.play();
      started = true;
      if (status) status.textContent = 'AUDIO EXPERIENCE • ON';
      syncPlayer();
      return true;
    } catch {
      try {
        audio.muted = true;
        await audio.play();
        if (status) status.textContent = 'TAP ENTER TO ENABLE SOUND';
        return false;
      } catch {
        if (status) status.textContent = 'TAP ENTER TO START';
        return false;
      }
    }
  }

  async function enterExperience() {
    if (introClosed) return;
    const audible = await startAudio({unmute: true});
    if (!audible) {
      audio.muted = false;
      try { await audio.play(); started = true; } catch {}
    }
    introClosed = true;
    intro.classList.add('exit');
    document.body.classList.add('experience-started');
    setTimeout(() => intro.remove(), 1100);
  }

  window.addEventListener('load', async () => {
    // Give the cinematic intro time to breathe while attempting autoplay.
    const ok = await startAudio({unmute: true});
    if (ok) setTimeout(enterExperience, 4300);
  }, {once: true});
  enter?.addEventListener('click', enterExperience);
  intro?.addEventListener('pointerdown', e => { if (e.target === intro) enterExperience(); });

  // First real user interaction: unlock audio on mobile/strict browsers.
  const unlock = async () => {
    if (!started) await enterExperience();
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach(type => window.addEventListener(type, unlock, {once:true, passive:true}));

  // Cursor glow + desktop parallax + touch parallax.
  const glow = $('.cursor-glow');
  const parallaxTargets = $$('.parallax-photo, .parallax-card, .hero-content');
  let px = 0, py = 0, tx = 0, ty = 0;
  function setPointer(x, y) { tx = (x / innerWidth - .5); ty = (y / innerHeight - .5); }
  window.addEventListener('pointermove', e => {
    setPointer(e.clientX, e.clientY);
    if (glow) { glow.style.left = `${e.clientX}px`; glow.style.top = `${e.clientY}px`; opacity = 1; }
  }, {passive:true});
  window.addEventListener('touchmove', e => { const t = e.touches[0]; if (t) setPointer(t.clientX, t.clientY); }, {passive:true});
  window.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

  function parallaxLoop() {
    px += (tx - px) * .055; py += (ty - py) * .055;
    const transforms = [`translate3d(${px*-10}px,${py*-7}px,0)`, `translate3d(${px*15}px,${py*11}px,0)`, `translate3d(${px*-6}px,${py*-4}px,0)`];
    parallaxTargets.forEach((el, i) => el.style.transform = transforms[i % transforms.length]);
    $$('.ambient-orb').forEach((el, i) => { const f = (i+1)*11; el.style.translate = `${px*f}px ${py*f}px`; });
    requestAnimationFrame(parallaxLoop);
  }
  requestAnimationFrame(parallaxLoop);

  // Scroll reveals.
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  }), {threshold:.12, rootMargin:'0px 0px -40px'});
  $$('.reveal').forEach((el, i) => { el.style.setProperty('--delay', `${Math.min(i%5,4)*70}ms`); revealObserver.observe(el); });

  // Navigation.
  const nav = $('#siteNav'), menu = $('#menuButton'), links = $$('.nav-links a');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open));
    menu.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    $('#navLinks')?.classList.toggle('open', !open);
  });
  links.forEach(link => link.addEventListener('click', () => { menu?.setAttribute('aria-expanded','false'); $('#navLinks')?.classList.remove('open'); }));
  window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', scrollY > 24), {passive:true});

  // Music player uses the same audio as the intro, so there is only one track instance.
  const play = $('#play'), progress = $('#progress'), current = $('#current'), duration = $('#duration'), wave = $('#wave');
  for (let i=0;i<64;i++) { const bar=document.createElement('i'); bar.style.setProperty('--h', `${16 + Math.random()*78}%`); wave?.appendChild(bar); }
  const fmt = s => Number.isFinite(s) ? `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}` : '0:00';
  function syncPlayer(){ if (!play || !audio) return; play.textContent = audio.paused ? '▶' : 'Ⅱ'; wave?.classList.toggle('playing', !audio.paused); }
  play?.addEventListener('click', async () => { if (audio.paused) { audio.muted=false; try {await audio.play();} catch{} } else audio.pause(); syncPlayer(); });
  audio?.addEventListener('loadedmetadata', () => { if(duration) duration.textContent=fmt(audio.duration); });
  audio?.addEventListener('timeupdate', () => { if(current) current.textContent=fmt(audio.currentTime); if(progress && audio.duration) progress.value=(audio.currentTime/audio.duration)*100; });
  audio?.addEventListener('play', syncPlayer); audio?.addEventListener('pause', syncPlayer);
  progress?.addEventListener('input', () => { if(audio.duration) audio.currentTime=(progress.value/100)*audio.duration; });
  $('#back')?.addEventListener('click', () => { audio.currentTime=0; });
  $('#mute')?.addEventListener('click', () => { audio.muted=!audio.muted; $('#mute').classList.toggle('muted', audio.muted); if(!audio.paused) audio.play().catch(()=>{}); });

  // Active section indicator.
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  }), {rootMargin:'-38% 0px -55% 0px'});
  $$('main section[id]').forEach(s => sectionObserver.observe(s));

  // Respect reduced-motion preference.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) document.body.classList.add('reduce-motion');
})();
