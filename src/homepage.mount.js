// V15 approved scroll choreography, adapted from the standalone preview.
// All listeners and frames are disposed when React unmounts (including StrictMode).
export function mountHomepage() {
  let active = true;
  const frames = new Set();
  const cleanups = [];
  const observers = [];
  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  }
  function observe(handler, options) {
    const io = new IntersectionObserver(handler, options);
    observers.push(io);
    return io;
  }
  function scheduleFrame(handler) {
    if (!active) return null;
    const id = window.requestAnimationFrame(time => {
      frames.delete(id);
      if (active) handler(time);
    });
    frames.add(id);
    return id;
  }
  function cancelFrame(id) {
    frames.delete(id);
    if (id != null) window.cancelAnimationFrame(id);
  }
  function onFontsReady(handler) {
    document.fonts?.ready?.then(() => { if (active) handler(); });
  }

  // Standalone animation module 1
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('orbit');
  const stage = document.querySelector('.poster');
  const scene = document.querySelector('.poster-scene');
  const ctx = canvas.getContext('2d', { alpha: true });
  const TWO_PI = Math.PI * 2;
  let width = 0, height = 0, pixelRatio = 1;
  let onScreen = true, tabVisible = !document.hidden, raf = null;
  let previousTime = 0, elapsed = 0;
  let idleYaw = 0, idleNodePhase = 0;
  let heroScroll = 0;
  let launchTime = 0;
  let scrollRate = 0;
  let lastScrollSample = window.scrollY;
  const launchDuration = 2300;

  const paths = [
    { tilt: .95, direction: -.83, radius: .92, phase: .28, tint: [245, 143, 91] },
    { tilt: 1.15, direction: .34, radius: 1.02, phase: 2.37, tint: [226, 110, 66] },
    { tilt: .90, direction: 1.43, radius: 1.10, phase: 4.42, tint: [252, 178, 120] }
  ];

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / Math.max(0.0001, b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  function launchState(ms) {
    if (reduceMotion) return { open: 1, pulse: 0, rings: [1, 1, 1] };
    const t = clamp(ms, 0, launchDuration);
    const first = Math.exp(-(((t - 420) / 150) ** 2));
    const second = Math.exp(-(((t - 980) / 125) ** 2)) * 1.08;
    const third = Math.exp(-(((t - 1480) / 115) ** 2)) * 1.16;
    const depart = [260, 820, 1360];
    const durations = [980, 920, 880];
    const rings = depart.map((start, i) => {
      const u = clamp((t - start) / durations[i], 0, 1);
      return u * u * (3 - 2 * u);
    });
    return { open: rings[0], pulse: Math.min(1, Math.max(first, second, third)), rings };
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    width = r.width; height = r.height;
    pixelRatio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(width * pixelRatio));
    canvas.height = Math.max(1, Math.round(height * pixelRatio));
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    render();
  }

  function point(path, angle, orbitRotation, radius, cx, cy, morph) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const adjustedTilt = mix(path.tilt, 0.18 + path.direction * 0.02, morph);
    let x = c * radius * path.radius;
    let y = s * radius * path.radius * Math.cos(adjustedTilt);
    let z = s * radius * path.radius * Math.sin(adjustedTilt);
    const direction = path.direction + morph * 0.65;
    const cosD = Math.cos(direction), sinD = Math.sin(direction);
    const xx = x * cosD - y * sinD;
    const yy = x * sinD + y * cosD;
    x = xx; y = yy;
    const cyaw = Math.cos(orbitRotation), syaw = Math.sin(orbitRotation);
    const xyz = x * cyaw + z * syaw;
    z = -x * syaw + z * cyaw;
    x = xyz;
    const depth = 1 + z / (radius * mix(5.2, 7.2, morph));
    return { x: cx + x * depth, y: cy + y * depth, z: z / radius };
  }

  const period = document.getElementById('origin-dot');

  // The CSS period is itself a circle; its centre is a precise, font-independent target.
  // Both rectangles include any sticky positioning or headline transforms.
  function punctuationPosition() {
    const r = period.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    return { x: r.left + r.width / 2 - cr.left, y: r.top + r.height / 2 - cr.top };
  }

  function restingOrbit() {
    const mobile = width < 700;
    const headline = document.querySelector('.headline');
    const canvasBox = canvas.getBoundingClientRect();
    const titleRight = headline
      ? headline.getBoundingClientRect().right - canvasBox.left
      : width * 0.42;
    const gap = width - titleRight;
    if (!mobile && gap > width * 0.36) {
      const margin = Math.max(48, gap * 0.08);
      const room = Math.max(120, gap - margin * 1.4);
      const radius = Math.min(room * 0.46, height * 0.44);
      const reach = radius * 1.16;
      return {
        cx: clamp(titleRight + margin + reach, reach, width - reach),
        cy: height * 0.46,
        radius
      };
    }
    return {
      cx: width * (mobile ? .735 : .716),
      cy: height * (mobile ? .36 : .45),
      radius: Math.min(width * (mobile ? .58 : .29), height * (mobile ? .305 : .382))
    };
  }

  function render() {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    const mobile = width < 700;
    // Each ring draws out of the period on its own, already near its final size.
    const launched = launchState(launchTime);
    const rings = launched.rings;
    const revealed = Math.max(rings[0], rings[1], rings[2]);
    const fade = 1 - smoothstep(.04, .2, revealed);
    const pulse = .48 + .16 * revealed;
    const target = punctuationPosition();
    const home = restingOrbit();
    const explode = reduceMotion ? 0 : smoothstep(.02, .88, heroScroll);
    const cover = Math.hypot(width, height) * 0.58;
    const bloom = explode * 0.62;
    const yaw = .12 + idleYaw;
    const drift = Math.sin(idleYaw * .64) * .04;
    const ringGeom = paths.map((path, i) => {
      const settle = rings[i];
      const ringRadius = home.radius * mix(.8, 1, settle);
      const fromCx = mix(target.x, home.cx, .68);
      const fromCy = mix(target.y, home.cy, .68);
      const ringCx = mix(fromCx, home.cx, settle);
      const ringCy = mix(fromCy, home.cy, settle);
      return {
        path,
        reveal: rings[i],
        cx: mix(ringCx, width * 0.5, explode),
        cy: mix(ringCy, height * 0.5, explode),
        radius: mix(ringRadius, cover, explode)
      };
    });

    const shown = ringGeom.filter(g => g.reveal > .03);
    if (shown.length) {
      const gx = shown.reduce((s, g) => s + g.cx, 0) / shown.length;
      const gy = shown.reduce((s, g) => s + g.cy, 0) / shown.length;
      const gr = shown.reduce((s, g) => s + g.radius, 0) / shown.length;
      const glowSize = Math.max(25, gr * 1.6);
      const halo = ctx.createRadialGradient(gx, gy, 1, gx, gy, glowSize);
      halo.addColorStop(0, `rgba(238,103,53,${(.10 + pulse * .045) * (1 - fade * .8)})`);
      halo.addColorStop(.52, `rgba(172,65,39,${.05 * (1 - fade)})`);
      halo.addColorStop(1, 'rgba(173,73,42,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(gx - glowSize, gy - glowSize, glowSize * 2, glowSize * 2);
    }

    function facingAngle(path, radius, cx, cy) {
      const dist2 = (a) => {
        const p = point(path, a, yaw, radius, cx, cy, bloom);
        const dx = p.x - target.x, dy = p.y - target.y;
        return dx * dx + dy * dy;
      };
      let best = 0, bestD = Infinity;
      for (let k = 0; k < 36; k++) {
        const a = k / 36 * TWO_PI;
        const d = dist2(a);
        if (d < bestD) { bestD = d; best = a; }
      }
      let left = best - TWO_PI / 36, right = best + TWO_PI / 36;
      for (let n = 0; n < 8; n++) {
        const m1 = left + (right - left) / 3;
        const m2 = right - (right - left) / 3;
        if (dist2(m1) < dist2(m2)) right = m2;
        else left = m1;
      }
      return (left + right) / 2;
    }

    const samples = 210;
    const step = TWO_PI / samples;
    const strokes = [];
    ringGeom.forEach((geom, i) => {
      if (geom.reveal < .015) return;
      if (geom.path.drawOrigin == null) {
        geom.path.drawOrigin = facingAngle(geom.path, geom.radius, geom.cx, geom.cy);
      }
      const origin = geom.path.drawOrigin;
      const span = geom.reveal * TWO_PI;
      const count = Math.max(1, Math.ceil(span / step));
      for (let j = 0; j < count; j++) {
        const a = origin + j * step;
        const b = origin + Math.min(span, (j + 1) * step);
        const one = point(geom.path, a, yaw, geom.radius, geom.cx, geom.cy, bloom);
        const two = point(geom.path, b, yaw, geom.radius, geom.cx, geom.cy, bloom);
        const z = (one.z + two.z) * .5;
        const glint = Math.pow(Math.max(0, Math.cos(a - 1 - i * .75 + drift * .42)), 15);
        strokes.push({ one, two, z, glint, path: geom.path, reveal: geom.reveal });
      }
    });
    strokes.sort((a, b) => a.z - b.z);
    ctx.lineCap = 'round';
    strokes.forEach(seg => {
      const front = clamp((seg.z + .65) / 1.55, 0, 1);
      const appear = smoothstep(.02, .14, seg.reveal);
      const forming = 1 - smoothstep(.82, 1, seg.reveal);
      const floor = mix(.085, .34, forming);
      const alpha = (floor + .43 * Math.pow(front, 1.85) + seg.glint * .24 * (1 - forming * .75)) * appear;
      if (alpha < .002) return;
      const [r, g, b] = seg.path.tint;
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
      ctx.lineWidth = .85 + front * .65 + seg.glint * .65;
      ctx.beginPath(); ctx.moveTo(seg.one.x, seg.one.y); ctx.lineTo(seg.two.x, seg.two.y); ctx.stroke();
    });

    ringGeom.forEach((geom, i) => {
      if (geom.reveal < .04) return;
      const origin = geom.path.drawOrigin ?? geom.path.phase;
      if (geom.reveal >= 1 && geom.path.spinFrom == null) geom.path.spinFrom = idleNodePhase;
      const spin = geom.path.spinFrom == null ? 0 : (idleNodePhase - geom.path.spinFrom) * (i % 2 ? -1 : 1);
      const cruise = origin + Math.min(1, geom.reveal) * TWO_PI + spin;
      const dot = point(geom.path, cruise, yaw, geom.radius, geom.cx, geom.cy, bloom);
      const visible = clamp((dot.z + .75) / 1.25, .4, 1) * smoothstep(.04, .16, geom.reveal);
      const lightSize = (mobile ? 11 : 15) * mix(1, 2.1, explode);
      const g = ctx.createRadialGradient(dot.x, dot.y, .1, dot.x, dot.y, lightSize);
      g.addColorStop(0, `rgba(255,199,148,${.58 * visible})`);
      g.addColorStop(.25, `rgba(237,111,58,${.29 * visible})`);
      g.addColorStop(1, 'rgba(237,111,58,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dot.x, dot.y, lightSize, 0, TWO_PI); ctx.fill();
      ctx.fillStyle = `rgba(255,195,139,${.78 * visible})`;
      ctx.beginPath(); ctx.arc(dot.x, dot.y, mix(1.1, 1.65, geom.reveal), 0, TWO_PI); ctx.fill();
    });

    // One brief 'arrival' bloom. It then leaves only the actual orange full stop.
    // A restrained glint at the point as the sculpture departs or returns.
    // One soft merge pulse tied to the contact itself (also reverses on scroll up).
    const arrival = launched.pulse;
    if(arrival>.001){
      const sz=mix(2,37,arrival);
      const g=ctx.createRadialGradient(target.x,target.y,1,target.x,target.y,sz);
      g.addColorStop(0,`rgba(252,167,108,${arrival*.32})`);
      g.addColorStop(.35,`rgba(234,92,40,${arrival*.11})`);
      g.addColorStop(1,'rgba(234,92,40,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(target.x,target.y,sz,0,TWO_PI);ctx.fill();
    }
  }

  function animate(now) {
    raf = null;
    if (!tabVisible || !onScreen || reduceMotion) return;
    if (previousTime) {
      const dt = Math.min(now - previousTime, 50);
      elapsed += dt;
      if (elapsed > 40) launchTime = Math.min(launchDuration, launchTime + dt);
      const { open, pulse, rings } = launchState(launchTime);
      stage.classList.toggle('is-launching', !reduceMotion && launchTime < launchDuration);
      stage.style.setProperty('--dot-arrival', pulse.toFixed(4));
      const spinning = smoothstep(.02, .12, open);
      const y = window.scrollY;
      const instant = (y - lastScrollSample) / Math.max(1, dt);
      lastScrollSample = y;
      scrollRate += (instant - scrollRate) * 0.22;
      // Downward travel, leaving the hero, speeds the spin. Slowing or
      // scrolling back lets it fall toward a quieter rate.
      const outward = Math.max(0, scrollRate);
      const returning = Math.max(0, -scrollRate);
      const idle = 0.00015;
      const stillForming = 1 - Math.min(rings[0], rings[1], rings[2]);
      const rate = Math.max(0.00005, idle - returning * 0.00035) + outward * 0.00115 + stillForming * 0.00072;
      idleYaw += dt * rate * spinning;
      idleNodePhase += dt * rate * spinning;
    }
    previousTime = now;
    render();
    raf = scheduleFrame(animate);
  }
  function start() {
    if (raf === null && onScreen && tabVisible && !reduceMotion) {
      previousTime = 0;
      raf = scheduleFrame(animate);
    }
  }
  function stop() {
    if (raf !== null) cancelFrame(raf);
    raf = null; previousTime = 0;
  }

  resize();
  start();
  listen(window,'resize', () => {resize(); setScrollPosition();}, { passive: true });
  listen(document,'visibilitychange', () => {
    tabVisible = !document.hidden;
    tabVisible ? start() : stop();
  });
  const heroObserver = observe(entries => {
    onScreen = entries[0].isIntersecting;
    onScreen ? start() : stop();
  }, { threshold: 0, rootMargin: '280px 0px 0px 0px' });
  heroObserver.observe(stage);

  const approach = document.querySelector('.work-intro');
  const products = document.querySelector('.products-wrap');
  const madeField = products.querySelector('.made-field');
  const madeMain = document.getElementById('made-main');
  const madeBeacon = document.getElementById('made-beacon');
  const madeBeaconHalo = document.getElementById('made-beacon-halo');
  const madeMainLength = madeMain.getTotalLength();
  const contact = document.querySelector('.last');
  function sectionScrollProgress(el) {
    const r=el.getBoundingClientRect();
    return clamp((innerHeight * .94 - r.top) / Math.max(innerHeight * .78, r.height * .76), 0, 1);
  }
  function scrollSections() {
    if (reduceMotion) {
      approach.style.setProperty('--complex-clip','0%');
      window.dispatchEvent(new CustomEvent('complex-progress',{detail:{value:1}}));
      products.style.setProperty('--ideas-scale', 1);
      products.style.setProperty('--real-clip','0%');
      window.dispatchEvent(new CustomEvent('made-progress', { detail: {value:1} }));
      const pos = madeMain.getPointAtLength(madeMainLength);
      for (const dot of [madeBeacon, madeBeaconHalo]) {
        dot.setAttribute('cx',pos.x.toFixed(2));dot.setAttribute('cy',pos.y.toFixed(2));
      }
      return;
    }
    const approachTop = scrollY + approach.getBoundingClientRect().top;
    // Scrub while the *visible content* crosses the viewport, not during an
    // oversized invisible sticky chapter. This gives ~700 px of real scroll.
    const approachStart = approachTop - innerHeight * .78;
    const approachTravel = Math.max(680,innerHeight * .83);
    const ap = clamp((scrollY - approachStart) / approachTravel,0,1);
    approach.style.setProperty('--approach-progress', ap.toFixed(4));
    const decoding = smoothstep(.12,.82,ap);
    approach.style.setProperty('--complex-solid',smoothstep(.55,.97,decoding).toFixed(5));
    window.dispatchEvent(new CustomEvent('complex-progress',{detail:{value:decoding}}));

    const madeScene = document.querySelector('.made-sequence');
    const madeTop = scrollY + madeScene.getBoundingClientRect().top;
    const madeStart = madeTop - innerHeight * .87;
    const madeTravel = Math.max(730,innerHeight * .91);
    const fieldP = clamp((scrollY-madeStart)/madeTravel,0,1);
    const sequence = smoothstep(.015,.99,fieldP);
    const ideasProgress = smoothstep(0,.43,sequence);
    const realProgress = smoothstep(.43,1,sequence);
    products.style.setProperty('--ideas-scale',(0.25 + .75*ideasProgress).toFixed(4));
    products.style.setProperty('--real-solid',smoothstep(.52,.94,realProgress).toFixed(5));
    window.dispatchEvent(new CustomEvent('made-progress',{detail:{value:realProgress}}));
    const fieldTopNow = madeField.getBoundingClientRect().top;
    const lineStart = innerHeight * 0.9;
    const lineEnd = innerHeight * 0.55;
    const lineP = clamp((lineStart - fieldTopNow) / Math.max(1, lineStart - lineEnd), 0, 1);
    const upper = smoothstep(.08, 1, lineP);
    const main = lineP;
    const lower = smoothstep(.14, 1, lineP);
    products.style.setProperty('--draw-upper',upper.toFixed(4));
    products.style.setProperty('--draw-main',main.toFixed(4));
    products.style.setProperty('--draw-lower',lower.toFixed(4));
    products.style.setProperty('--made-end-opacity',smoothstep(.82,1,lineP).toFixed(4));
    products.style.setProperty('--made-tip-opacity',smoothstep(.02,.16,lineP).toFixed(4));
    const pos = madeMain.getPointAtLength(main * madeMainLength);
    madeBeacon.setAttribute('cx',pos.x.toFixed(2));
    madeBeacon.setAttribute('cy',pos.y.toFixed(2));
    madeBeaconHalo.setAttribute('cx',pos.x.toFixed(2));
    madeBeaconHalo.setAttribute('cy',pos.y.toFixed(2));
    const cp=sectionScrollProgress(contact);
    contact.style.setProperty('--contact-progress',cp.toFixed(4));
    contact.style.setProperty('--arrow-progress',smoothstep(.26,.83,cp).toFixed(4));
    contact.style.setProperty('--arrow-tip',smoothstep(.78,.91,cp).toFixed(4));
  }

  let scrollQueued = false;
  function setScrollPosition() {
    scrollQueued = false;
    const progress = reduceMotion ? 0 : clamp(-scene.getBoundingClientRect().top / Math.max(1, scene.offsetHeight - stage.offsetHeight), 0, 1);
    heroScroll = progress;
    stage.style.setProperty('--scroll-progress', progress.toFixed(3));
    const { pulse } = launchState(launchTime);
    stage.classList.toggle('is-launching', !reduceMotion && launchTime < launchDuration);
    stage.style.setProperty('--dot-arrival', pulse.toFixed(4));
    scrollSections();
    if (reduceMotion || !raf) render();
  }
  listen(window,'scroll', () => {
    if (!scrollQueued) {
      scrollQueued = true;
      scheduleFrame(setScrollPosition);
    }
  }, { passive: true });
  setScrollPosition();

  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    const revealObserver = observe(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .09, rootMargin: '0px 0px -42px 0px' });
    document.querySelectorAll('.reveal,.rule-reveal').forEach(el => revealObserver.observe(el));
  }
  cleanups.push(stop);
})();

  // Standalone animation module 2
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const labels = [...document.querySelectorAll('.eyebrow .label-type')];
  const cards = [...document.querySelectorAll('.product-grid > div')];
  const products = document.getElementById('products');
  const ideas = document.querySelector('.ideas-grow');
  const emailArea = document.querySelector('.email-area');
  const emailTld = document.querySelector('.email-tld');
  const arrow = document.querySelector('.contact-swoop');
  const clamp = (n,a=0,b=1) => Math.min(b,Math.max(a,n));
  const smooth = n => n*n*(3-2*n);

  function placeArrowTip(){
    const stroke = arrow.querySelector('.swoop-stroke');
    const tip = arrow.querySelector('.swoop-tip');
    const raw = getComputedStyle(document.querySelector('.last')).getPropertyValue('--arrow-progress');
    const progress = clamp(parseFloat(raw) || 0);
    const length = stroke.getTotalLength();
    const dist = Math.max(0.5, progress * length);
    const point = stroke.getPointAtLength(Math.min(length, dist));
    const prev = stroke.getPointAtLength(Math.max(0, dist - 14));
    const heading = Math.atan2(point.y - prev.y, point.x - prev.x) * 180 / Math.PI;
    tip.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${(heading - 180).toFixed(2)}) translate(-5 -69)`);
    tip.style.opacity = progress > 0.03 ? '1' : '0';
  }
  function positionArrow(){
    // Use layout offsets rather than getBoundingClientRect so unrelated
    // reveal transforms can never shift the arrow tip away from the glyphs.
    const link = emailArea.querySelector('.email-link');
    const targetX = link.offsetLeft + emailTld.offsetLeft + emailTld.offsetWidth + 15; // gap after .io, never inside text
    const targetY = link.offsetTop + emailTld.offsetTop + emailTld.offsetHeight / 2;
    const {width:w, height:h} = arrow.getBoundingClientRect();
    // Keep the arrowhead level with the middle of '.io', with a visible gap.
    // When there isn't room on the right (mobile), curve in from above-left.
    const areaRect = emailArea.getBoundingClientRect();
    const roomRight = innerWidth - (areaRect.left + targetX);
    const flip = roomRight < w * .65;
    arrow.classList.toggle('arrow-flipped', flip);
    arrow.style.left = `${flip ? targetX - (215 * w / 220) : targetX - (5 * w / 220)}px`;
    arrow.style.top = `${targetY - 69 * h / 85}px`;
    placeArrowTip();
  }
  function updateScrollMotion(){
    for (const label of labels) {
      const el = label.closest('.eyebrow');
      const y = el.getBoundingClientRect().top / innerHeight;
      // Enter from bottom: type. Leave through top: erase. Fully reversible.
      const entering = smooth(clamp((.91-y)/.23));
      const leaving = smooth(clamp((y+.07)/.21));
      const t = reduced ? 1 : Math.min(entering,leaving);
      const chars = Math.floor((label.textContent?.length || 1)*t + 1e-6);
      const fraction = chars / (label.textContent?.length || 1);
      label.style.clipPath = `inset(0 ${(100*(1-fraction)).toFixed(4)}% 0 0)`;
    }
    placeArrowTip();
    // Made here headline is orchestrated with the same timeline as the SVG paths.
  }
  function placeEverything(){updateScrollMotion();positionArrow();}
  if(reduced || !('IntersectionObserver' in window)){
    cards.forEach(el=>el.classList.add('in-view'));
  } else {
    const observer = observe(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}
      });
    },{threshold:.1,rootMargin:'0px 0px -20px 0px'});
    cards.forEach(el=>observer.observe(el));
  }
  let queued=false;
  listen(window,'scroll',()=>{
    if(!queued){queued=true;scheduleFrame(()=>{queued=false;updateScrollMotion()})}
  },{passive:true});
  listen(window,'resize',placeEverything,{passive:true});
  onFontsReady(positionArrow);
  placeEverything();
})();

  // Standalone animation module 3
(() => {
  'use strict';
  const line = document.querySelector('.products-line');
  const label = line.querySelector('.real-words');
  const canvas = line.querySelector('.real-fragments');
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pieces = [], source = null;
  const text = label.textContent;
  let value = reduced ? 1 : 0, width = 0, height = 0, dpr = 1;
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => {n=clamp(n);return n*n*(3-2*n)};
  const ramp = (a,b,n) => smooth((n-a)/(b-a));
  const noise = n => {const s=Math.sin(n*127.1+78.233)*43758.5453;return s-Math.floor(s)};
  function rebuild() {
    const box = canvas.getBoundingClientRect();
    width=Math.max(1,Math.ceil(box.width));height=Math.max(1,Math.ceil(box.height));
    dpr=Math.min(2,devicePixelRatio||1);
    canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if(reduced) return;
    const computed=getComputedStyle(label);
    const size=parseFloat(computed.fontSize);
    const off=document.createElement('canvas');
    off.width=width;off.height=height;
    const o=off.getContext('2d',{willReadFrequently:true});
    o.font=`${computed.fontWeight} ${size}px ${computed.fontFamily}`;
    if('letterSpacing' in o)o.letterSpacing=computed.letterSpacing;
    o.textAlign='left';o.textBaseline='alphabetic';
    // A zero-sized inline box measures the *actual CSS baseline*.
    const marker=document.createElement('span');
    marker.setAttribute('aria-hidden','true');
    marker.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline;padding:0;border:0;margin:0;';
    label.appendChild(marker);
    const baseline=marker.getBoundingClientRect().top-box.top;
    marker.remove();
    o.fillStyle='#191b19';o.fillText(text,0,baseline);
    source=off;
    const data=o.getImageData(0,0,width,height).data;
    const unit=width<450?3:4;
    pieces=[];
    for(let y=0;y<height;y+=unit){
      for(let x=0;x<width;x+=unit){
        let coverage=0;
        for(const oy of [1,unit-1])for(const ox of [1,unit-1]){
          let xx=Math.min(width-1,x+ox),yy=Math.min(height-1,y+oy);
          coverage+=data[(yy*width+xx)*4+3];
        }
        if(coverage<90)continue;
        const n=pieces.length+1;
        const r=noise(n*.863),q=noise(n*1.951),k=noise(n*3.197);
        // The motion follows short, loosely parallel streams rather than flying
        // in randomly from all sides. Each tile settles into a real glyph pixel.
        pieces.push({x,y,unit,dx:9+r*17,dy:(q-.5)*14,delay:(x/Math.max(1,width))*.11+k*.04,fade:k});
      }
    }
    render();
  }
  function render() {
    if(reduced||!width||!height)return;
    ctx.clearRect(0,0,width,height);
    if(value<.002||value>=.998)return;
    const emerge=ramp(0,.14,value);
    // Retain V13's character-rich pixel-to-glyph transition, but fade its
    // aligned sampled ink out *continuously* as the native text fades in.
    const handoff=1-ramp(.58,.98,value);
    for(const part of pieces){
      const t=ramp(part.delay,Math.min(.98,part.delay+.66),value);
      if(t<=.002)continue;
      const free=1-t;
      const x=part.x + part.dx*free*free;
      const y=part.y + part.dy*free*free + Math.sin(part.x*.025+value*3)*2*free;
      const side=part.unit*(.75+.25*t);
      const alpha=emerge*handoff*(.32+.56*t);
      ctx.globalAlpha=alpha;
      const shape=ramp(.24,.76,t);
      if(shape<.995){
        ctx.fillStyle='#343832';
        ctx.fillRect(x,y,side,side);
      }
      if(shape>.005){
        ctx.globalAlpha=alpha*shape;
        ctx.drawImage(source,part.x,part.y,part.unit,part.unit,x,y,part.unit,part.unit);
      }
    }
    ctx.globalAlpha=1;
  }
  listen(window,'made-progress',event=>{value=event.detail.value;render()});
  listen(window,'resize',rebuild,{passive:true});
  onFontsReady(rebuild);
  rebuild();
  // The first frame is set by the shared scroll controller's custom event.
  render();
})();

  // Standalone animation module 4
(() => {
  'use strict';
  const wrapper=document.querySelector('.decode-wrap');
  const label=wrapper.querySelector('.decode-source');
  const canvas=wrapper.querySelector('.decode-canvas');
  const ctx=canvas.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const word=label.textContent;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
  const ramp=(a,b,n)=>smooth((n-a)/(b-a));
  const noise=n=>{const s=Math.sin(n*157.77+24.56)*43758.545;return s-Math.floor(s)};
  const glyphs='01A7#X3F+<>/∴';
  let progress=reduced?1:0, positions=[],baseline=0,font='',width=0,height=0,dpr=1;
  function measure(){
    const br=canvas.getBoundingClientRect();
    width=Math.max(1,Math.ceil(br.width));height=Math.max(1,Math.ceil(br.height));
    dpr=Math.min(2,devicePixelRatio||1);
    canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const style=getComputedStyle(label);
    font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.font=font;
    // Align scrambled glyphs to the precise DOM baseline, including descenders.
    const marker=document.createElement('span');
    marker.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline;padding:0;margin:0;border:0;';
    label.appendChild(marker);
    baseline=marker.getBoundingClientRect().top-br.top;
    marker.remove();
    const node=label.firstChild;
    positions=[];
    for(let i=0;i<word.length;i++){
      const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);
      const r=range.getBoundingClientRect();
      positions.push({x:r.left-br.left,w:r.width});
    }
    draw();
  }
  function draw(){
    ctx.clearRect(0,0,width,height);
    if(reduced||progress>=.998)return;
    ctx.textBaseline='alphabetic';
    ctx.textAlign='center';
    const early=ramp(0,.10,progress);
    const fade=1-ramp(.64,.97,progress);
    positions.forEach((pos,i)=>{
      const local=ramp(.03+i*.025,.46+i*.027,progress);
      const center=pos.x+pos.w/2;
      const shift=(1-local)*((noise(i*6.7)-.5)*5);
      const phase=Math.floor(progress*13);
      const char=glyphs[Math.floor(noise(i*29.1+phase*11.7)*glyphs.length)%glyphs.length];
      if(local<.99){
        ctx.globalAlpha=(.12+.34*(1-local))*early*fade;
        ctx.fillStyle=i%4===1?'#b27856':'#70766e';
        ctx.font=`${Math.round(parseFloat(getComputedStyle(label).fontSize)*.78)}px ui-monospace,Menlo,monospace`;
        ctx.fillText(char,center+shift,baseline);
        // A few microscopic drafting strokes for a decode/scribble feel.
        if(i%3===0&&progress>.03){
          ctx.strokeStyle='#c0784d';ctx.lineWidth=1;
          const x=center+shift+pos.w*.15,y=baseline-parseFloat(getComputedStyle(label).fontSize)*.6;
          ctx.beginPath();ctx.moveTo(x-4,y+3);ctx.lineTo(x+4,y-3);ctx.stroke();
        }
      }

    });
    ctx.globalAlpha=1;
  }
  listen(window,'complex-progress',event=>{progress=event.detail.value;draw()});
  listen(window,'resize',measure,{passive:true});
  onFontsReady(measure);
  measure();
  // Shared scroll controller owns the authoritative progress.
  draw();
})();

  // First mount may start at a restored scroll position; replay progress
  // after all dependent modules have subscribed to their custom events.
  scheduleFrame(() => window.dispatchEvent(new Event('scroll')));
  return () => {
    active = false;
    for (const cleanup of cleanups.reverse()) cleanup();
    for (const observer of observers) observer.disconnect();
    for (const frame of frames) window.cancelAnimationFrame(frame);
    frames.clear();
    document.documentElement.classList.remove('motion-ready');
  };
}
