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
  const launchDuration = 1800;

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
    // When the page loads, reveal the sculpture FROM the actual punctuation.
    // Scroll scrubs that same journey in reverse without starting another animation.
    const launch = reduceMotion ? 1 : smoothstep(0, launchDuration, launchTime);
    const contraction = smoothstep(.06, .98, p);
    // Exactly one shape parameter controls both directions of the same animation.
    const open = launch * (1 - contraction);
    // Fade only after the ring has landed over the visible period.
    // The ring keeps the diameter of the dot, instead of collapsing to 1px.
    const opacity = smoothstep(.015, .12, open);
    const fade = 1 - opacity;
    const pulse = .48 + .16 * open;
    const target = punctuationPosition();
    // The orbit arrives at the centre well before the final fade.
    const travel = smoothstep(.135, .985, open);
    const cx = mix(target.x, width * (mobile ? .735 : .716), travel);
    const cy = mix(target.y, height * (mobile ? .36 : .45), travel);
    const baseRadius = Math.min(width * (mobile ? .58 : .29), height * (mobile ? .305 : .382));
    const dotDiameter = period.getBoundingClientRect().width;
    const restingRadius = dotDiameter / 2.35;
    const radius = mix(restingRadius, baseRadius, smoothstep(0, 1, open));
    // Idle motion only when fully expanded AND at the top of the page. At the
    // first scroll movement it eases out, leaving one reversible geometry path.
    // Phases are integrated every frame and then held during scroll. Never
    // multiply a large running clock by a fading weight (which caused the snap).
    const yaw = .12 + (1-open) * .22 + idleYaw;
    const drift = Math.sin(idleYaw * .64) * .04;

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
        const one = point(path, a, yaw, radius, cx, cy, (1-open) * .22);
        const two = point(path, b, yaw, radius, cx, cy, (1-open) * .22);
        const z = (one.z + two.z) * .5;
        const glint = Math.pow(Math.max(0, Math.cos(a - 1 - i * .75 + (1-open) * .9 + drift * .42)), 15);
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
      const a = path.phase + (1-open) * .60 * (i%2 ? -1 : 1) + idleNodePhase * (i%2 ? -1 : 1);
      const dot = point(path,a,yaw,radius,cx,cy,(1-open)*.22);
      const visible = clamp((dot.z+.75)/1.25,.4,1)*(1-fade);
      const lightSize = mix(3,mobile?11:15,open);
      const g=ctx.createRadialGradient(dot.x,dot.y,.1,dot.x,dot.y,lightSize);
      g.addColorStop(0,`rgba(255,199,148,${.58*visible})`);
      g.addColorStop(.25,`rgba(237,111,58,${.29*visible})`);
      g.addColorStop(1,'rgba(237,111,58,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(dot.x,dot.y,lightSize,0,TWO_PI);ctx.fill();
      ctx.fillStyle=`rgba(255,195,139,${.78*visible})`;
      ctx.beginPath();ctx.arc(dot.x,dot.y,mix(.7,1.65,open),0,TWO_PI);ctx.fill();
    });

    // One brief 'arrival' bloom. It then leaves only the actual orange full stop.
    // A restrained glint at the point as the sculpture departs or returns.
    // One soft merge pulse tied to the contact itself (also reverses on scroll up).
    const arrival = smoothstep(.01,.07,open) * (1-smoothstep(.13,.24,open));
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
      if (heroScroll < .99 && elapsed > 480) launchTime = Math.min(launchDuration, launchTime + dt);
      // Ease the angular velocity to zero, not the accumulated angle to zero.
      // This preserves absolute orientation at the start of every scroll.
      const open = smoothstep(0,launchDuration,launchTime) * (1-smoothstep(.06,.98,heroScroll));
      const speed = smoothstep(.65,.99,open) * (1-smoothstep(.015,.15,heroScroll));
      idleYaw += dt * .00013 * speed;
      idleNodePhase += dt * .00011 * speed;
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
    const upper = smoothstep(.08,.95,sequence);
    const main = smoothstep(0,.82,sequence);
    const lower = smoothstep(.17,1,sequence);
    products.style.setProperty('--draw-upper',upper.toFixed(4));
    products.style.setProperty('--draw-main',main.toFixed(4));
    products.style.setProperty('--draw-lower',lower.toFixed(4));
    products.style.setProperty('--made-end-opacity',smoothstep(.77,.99,sequence).toFixed(4));
    products.style.setProperty('--made-tip-opacity',smoothstep(.02,.14,sequence).toFixed(4));
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
    const launch = reduceMotion ? 1 : smoothstep(0,launchDuration,launchTime);
    const open = launch * (1-smoothstep(.06,.98,progress));
    const merge = smoothstep(.01,.07,open)*(1-smoothstep(.13,.24,open));
    stage.style.setProperty('--dot-arrival', merge.toFixed(4));
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
