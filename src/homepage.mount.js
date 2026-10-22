export function mountHomepage() {
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
  let heroScroll = 0;

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
  const easeOut = t => 1 - Math.pow(1 - t, 3);

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

  function render() {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    const mobile = width < 700;
    const p = heroScroll;
    const travel = smoothstep(.06, .82, p);
    const shrink = smoothstep(.16, .97, p);
    const fade = smoothstep(.77, .99, p);
    const pulse = .5 + .5 * Math.sin(elapsed * .0012);
    const target = punctuationPosition();
    const cx = mix(width * (mobile ? .735 : .716), target.x, travel);
    const cy = mix(height * (mobile ? .36 : .45), target.y, travel);
    const baseRadius = Math.min(width * (mobile ? .58 : .29), height * (mobile ? .305 : .382));
    const radius = baseRadius * mix(1, .012, shrink * shrink * (3 - 2 * shrink));
    const yaw = (reduceMotion ? .12 : Math.sin(elapsed * .00012) * .20) + p * 7.1;

    // Ambient light tracks the sculpture toward the punctuation.
    const glowSize = Math.max(25, radius * 1.6);
    const halo = ctx.createRadialGradient(cx,cy,1,cx,cy,glowSize);
    halo.addColorStop(0,`rgba(238,103,53,${(.10 + pulse * .045)*(1-fade*.8)})`);
    halo.addColorStop(.52,`rgba(172,65,39,${.05*(1-fade)})`);
    halo.addColorStop(1,'rgba(173,73,42,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(cx-glowSize,cy-glowSize,glowSize*2,glowSize*2);

    const samples = 210;
    const strokes = [];
    paths.forEach((path, i) => {
      for (let j = 0; j < samples; j++) {
        const a = j / samples * TWO_PI;
        const b = (j + 1) / samples * TWO_PI;
        const one = point(path, a, yaw, radius, cx, cy, shrink * .22);
        const two = point(path, b, yaw, radius, cx, cy, shrink * .22);
        const z = (one.z + two.z) * .5;
        const glint = Math.pow(Math.max(0, Math.cos(a - 1 - i * .75 + p * 5.3)), 15);
        strokes.push({one,two,z,glint,path});
      }
    });
    strokes.sort((a,b)=>a.z-b.z);
    ctx.lineCap = 'round';
    strokes.forEach(seg => {
      const front = clamp((seg.z+.65)/1.55,0,1);
      const alpha = (.085 + .43*Math.pow(front,1.85)+seg.glint*.24)*(1-fade);
      if(alpha < .002)return;
      const [r,g,b] = seg.path.tint;
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
      ctx.lineWidth = .85+front*.65+seg.glint*.65;
      ctx.beginPath();ctx.moveTo(seg.one.x,seg.one.y);ctx.lineTo(seg.two.x,seg.two.y);ctx.stroke();
    });

    // The same three light points travel with the converging trajectories.
    paths.forEach((path,i) => {
      const a = path.phase + (reduceMotion ? 0 : elapsed*.00010*(i%2?-1:1)) + p * 3.5;
      const dot = point(path,a,yaw,radius,cx,cy,shrink*.22);
      const visible = clamp((dot.z+.75)/1.25,.4,1)*(1-fade);
      const lightSize = mix(mobile?11:15,4,shrink);
      const g=ctx.createRadialGradient(dot.x,dot.y,.1,dot.x,dot.y,lightSize);
      g.addColorStop(0,`rgba(255,199,148,${.58*visible})`);
      g.addColorStop(.25,`rgba(237,111,58,${.29*visible})`);
      g.addColorStop(1,'rgba(237,111,58,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(dot.x,dot.y,lightSize,0,TWO_PI);ctx.fill();
      ctx.fillStyle=`rgba(255,195,139,${.78*visible})`;
      ctx.beginPath();ctx.arc(dot.x,dot.y,mix(1.65,.7,shrink),0,TWO_PI);ctx.fill();
    });

    // One brief 'arrival' bloom. It then leaves only the actual orange full stop.
    const arrival=smoothstep(.68,.88,p)*(1-smoothstep(.93,1,p));
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
    if (previousTime) elapsed += Math.min(now - previousTime, 50);
    previousTime = now;
    render();
    raf = requestAnimationFrame(animate);
  }
  function start() {
    if (raf === null && onScreen && tabVisible && !reduceMotion) {
      previousTime = 0;
      raf = requestAnimationFrame(animate);
    }
  }
  function stop() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null; previousTime = 0;
  }

  const onResize = () => { resize(); setScrollPosition(); };
  const onVisibility = () => {
    tabVisible = !document.hidden;
    tabVisible ? start() : stop();
  };
  resize();
  start();
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  const heroObserver = new IntersectionObserver(entries => {
    onScreen = entries[0].isIntersecting;
    onScreen ? start() : stop();
  }, { threshold: 0 });
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
      const pos = madeMain.getPointAtLength(madeMainLength);
      for (const dot of [madeBeacon, madeBeaconHalo]) {
        dot.setAttribute('cx',pos.x.toFixed(2));dot.setAttribute('cy',pos.y.toFixed(2));
      }
      for (const el of [document.querySelector('.made-upper'), madeMain, document.querySelector('.made-lower')]) {
        const length = el.getTotalLength();
        el.style.strokeDasharray = `${length}`;
        el.style.strokeDashoffset = '0';
      }
      return;
    }
    const ap=sectionScrollProgress(approach);
    approach.style.setProperty('--approach-progress', ap.toFixed(4));
    const sectionRect = products.getBoundingClientRect();
    const fieldRect = madeField.getBoundingClientRect();
    const entered = innerHeight - sectionRect.top;
    const drawStart = fieldRect.top - sectionRect.top;
    const drawEnd = sectionRect.height * 0.8;
    const fieldP = clamp((entered - drawStart) / Math.max(1, drawEnd - drawStart), 0, 1);
    const along = (start) => clamp((fieldP - start) / (1 - start), 0, 1);
    const upper = along(.08);
    const main = fieldP;
    const lower = along(.12);
    const ghosts = document.querySelectorAll('.made-ghost');
    const drawStroke = (el, amount) => {
      const length = el.getTotalLength();
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length * (1 - amount)}`;
    };
    drawStroke(ghosts[0], upper);
    drawStroke(document.querySelector('.made-upper'), upper);
    drawStroke(ghosts[1], main);
    drawStroke(madeMain, main);
    drawStroke(ghosts[2], lower);
    drawStroke(document.querySelector('.made-lower'), lower);
    products.style.setProperty('--draw-upper',upper.toFixed(4));
    products.style.setProperty('--draw-main',main.toFixed(4));
    products.style.setProperty('--draw-lower',lower.toFixed(4));
    products.style.setProperty('--made-end-opacity',smoothstep(.88,1,fieldP).toFixed(4));
    products.style.setProperty('--made-tip-opacity',smoothstep(.02,.14,fieldP).toFixed(4));
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
  let scrollFrame = null;
  function setScrollPosition() {
    scrollQueued = false;
    scrollFrame = null;
    const progress = reduceMotion ? 0 : clamp(-scene.getBoundingClientRect().top / Math.max(1, scene.offsetHeight - stage.offsetHeight), 0, 1);
    heroScroll = progress;
    stage.style.setProperty('--scroll-progress', progress.toFixed(3));
    stage.style.setProperty('--dot-arrival',(smoothstep(.69,.89,progress)*(1-smoothstep(.94,1,progress))).toFixed(4));
    scrollSections();
    if (reduceMotion || !raf) render();
  }
  const onScroll = () => {
    if (!scrollQueued) {
      scrollQueued = true;
      scrollFrame = requestAnimationFrame(setScrollPosition);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  setScrollPosition();

  let revealObserver = null;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .09, rootMargin: '0px 0px -42px 0px' });
    document.querySelectorAll('.reveal,.rule-reveal').forEach(el => revealObserver.observe(el));
  }

  return () => {
    stop();
    if (scrollFrame !== null) cancelAnimationFrame(scrollFrame);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibility);
    heroObserver.disconnect();
    revealObserver?.disconnect();
    document.documentElement.classList.remove('motion-ready');
  };
}
