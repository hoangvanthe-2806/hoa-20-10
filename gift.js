// The gift scene: two emoji-style characters drawn in SVG. One runs in, picks up the bouquet the garden
// just turned into, carries it to the other and hands it over, then a letter appears for her to open.
(() => {
  'use strict';

  const clamp = n => Math.max(0, Math.min(1, n));
  const easeInOut = n => n < .5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2;
  const easeOut = n => 1 - Math.pow(1 - n, 3);
  const lerp = (a, b, n) => a + (b - a) * n;
  const seg = (t, a, b, ease = easeInOut) => ease(clamp((t - a) / (b - a)));

  const SKIN = '#ffd66b', SKIN_EDGE = '#f2b84b', MOUTH = '#8a3b2e', EYE = '#3a2a2a', BLUSH = '#ff8fa3';
  const face = (hairFront, extra = '') => `
    <circle cx="50" cy="48" r="30" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="1.5"/>
    ${hairFront}
    <circle cx="30" cy="60" r="5.5" fill="${BLUSH}" opacity=".5" class="blush"/>
    <circle cx="70" cy="60" r="5.5" fill="${BLUSH}" opacity=".5" class="blush"/>
    <g class="eyes-open"><ellipse cx="39" cy="50" rx="3.4" ry="4.6" fill="${EYE}"/><ellipse cx="61" cy="50" rx="3.4" ry="4.6" fill="${EYE}"/>
      <circle cx="40.2" cy="48.4" r="1.2" fill="#fff"/><circle cx="62.2" cy="48.4" r="1.2" fill="#fff"/></g>
    <g class="eyes-happy" display="none" fill="none" stroke="${EYE}" stroke-width="2.6" stroke-linecap="round">
      <path d="M34 52 Q39 45 44 52"/><path d="M56 52 Q61 45 66 52"/></g>
    <path class="mouth-smile" d="M41 62 Q50 70 59 62" fill="none" stroke="${MOUTH}" stroke-width="2.6" stroke-linecap="round"/>
    <path class="mouth-grin" display="none" d="M39 60 Q50 80 61 60 Z" fill="${MOUTH}" stroke="${MOUTH}" stroke-width="1.5" stroke-linejoin="round"/>
    <ellipse class="mouth-o" display="none" cx="50" cy="66" rx="5" ry="6.5" fill="${MOUTH}"/>
    ${extra}`;
  const limb = (cls, px, py, body, hand) => `<g class="${cls}" data-pivot="${px} ${py}">${body}${hand}</g>`;
  const arm = (cls, px, color, handX) => limb(cls, px, 90,
    `<rect x="${px - 4.5}" y="88" width="9" height="42" rx="4.5" fill="${color}"/>`, `<circle cx="${handX}" cy="132" r="5.8" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="1"/>`);
  const leg = (cls, px, color, shoe) => limb(cls, px, 128,
    `<rect x="${px - 5}" y="124" width="10" height="${shoe.legEnd - 124}" rx="5" fill="${color}"/>`,
    `<ellipse cx="${px + 1.5}" cy="${shoe.legEnd + 1}" rx="9" ry="5" fill="${shoe.color}"/>`);

  const MARKUP = {
    boy: `<svg viewBox="0 0 100 200" aria-hidden="true">
      <ellipse cx="50" cy="191" rx="28" ry="4.5" fill="#2f5a3a" opacity=".16"/>
      ${leg('leg-l', 42, '#3b4a6b', { legEnd: 182, color: '#2b2b33' })}${leg('leg-r', 58, '#3b4a6b', { legEnd: 182, color: '#2b2b33' })}
      <rect x="30" y="80" width="40" height="56" rx="16" fill="#5aa9e6"/>
      ${arm('arm-l', 32, '#5aa9e6', 32)}${arm('arm-r', 68, '#5aa9e6', 68)}
      <g class="head">${face('<path d="M19 48 Q16 12 50 12 Q84 12 81 48 Q74 30 58 28 Q40 34 19 48Z" fill="#5a3a22"/>')}</g></svg>`,
    girl: `<svg viewBox="0 0 100 200" aria-hidden="true">
      <ellipse cx="50" cy="191" rx="28" ry="4.5" fill="#2f5a3a" opacity=".16"/>
      <path d="M15 52 Q12 6 50 6 Q88 6 85 52 L90 100 Q70 106 66 84 L34 84 Q30 106 10 100Z" fill="#3a2418"/>
      ${leg('leg-l', 42, SKIN, { legEnd: 180, color: '#ff9fbd' })}${leg('leg-r', 58, SKIN, { legEnd: 180, color: '#ff9fbd' })}
      <path d="M33 82 Q50 76 67 82 L84 152 Q50 164 16 152Z" fill="#f58fb0"/>
      <path d="M16 152 Q50 164 84 152" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/>
      ${arm('arm-l', 33, '#f58fb0', 33)}${arm('arm-r', 67, '#f58fb0', 67)}
      <g class="head">${face('<path d="M19 46 Q22 12 50 12 Q78 12 81 46 Q66 24 50 34 Q34 24 19 46Z" fill="#3a2418"/>',
        '<g transform="translate(72 22)"><ellipse cx="-6" cy="0" rx="8" ry="5" fill="#ff7aa5" transform="rotate(-25 -6 0)"/><ellipse cx="6" cy="0" rx="8" ry="5" fill="#ff7aa5" transform="rotate(25 6 0)"/><circle r="3.6" fill="#ffb3cb"/></g>')}</g></svg>`
  };

  function makeCharacter(kind, flip) {
    const el = document.createElement('div');
    el.className = `gift-char gift-${kind}`;
    el.innerHTML = MARKUP[kind];
    const q = s => el.querySelector(s);
    const parts = { legL: q('.leg-l'), legR: q('.leg-r'), armL: q('.arm-l'), armR: q('.arm-r'), head: q('.head') };
    const rotate = (node, deg) => { const [x, y] = node.dataset.pivot.split(' '); node.setAttribute('transform', `rotate(${deg} ${x} ${y})`); };
    const show = (sel, on) => q(sel).setAttribute('display', on ? 'inline' : 'none');
    return {
      el, flip, x: 0, bob: 0, mouth: 'smile', eyes: 'open',
      pose({ phase = 0, amp = 0, hold = 0, wave = 0 }) {
        const swing = Math.sin(phase) * amp;
        rotate(parts.legL, swing * 30); rotate(parts.legR, -swing * 30);
        rotate(parts.armL, lerp(-swing * 26, -32, hold));
        rotate(parts.armR, lerp(swing * 26, 32, hold) + wave);
        parts.head.setAttribute('transform', `rotate(${Math.sin(phase * .5) * amp * 3} 50 78)`);
      },
      face(mouth, eyes) {
        if (mouth !== this.mouth) { this.mouth = mouth; ['smile', 'grin', 'o'].forEach(m => show(`.mouth-${m}`, m === mouth)); }
        if (eyes !== this.eyes) { this.eyes = eyes; show('.eyes-open', eyes === 'open'); show('.eyes-happy', eyes === 'happy'); }
      }
    };
  }

  function start(options) {
    const { host, caption, onLetter } = options;
    const w = host.clientWidth, h = host.clientHeight;
    const stage = document.createElement('div');
    stage.className = 'gift-stage';
    const ground = document.createElement('div');
    ground.className = 'gift-ground';
    const bouquet = new Image();
    bouquet.src = './assets/bouquet.webp';
    bouquet.alt = '';
    bouquet.className = 'gift-bouquet';
    const boy = makeCharacter('boy', false);
    const girl = makeCharacter('girl', true);
    const bubble = document.createElement('div');
    bubble.className = 'gift-bubble'; bubble.textContent = '!';
    const letter = document.createElement('button');
    letter.type = 'button'; letter.className = 'gift-letter'; letter.hidden = true;
    letter.setAttribute('aria-label', 'Mở lá thư dành cho bạn');
    letter.innerHTML = '<svg viewBox="0 0 80 56" aria-hidden="true"><rect x="2" y="6" width="76" height="48" rx="6" fill="#fff4f8" stroke="#e7a9c0" stroke-width="2"/><path d="M4 10 L40 36 L76 10" fill="none" stroke="#e7a9c0" stroke-width="2" stroke-linejoin="round"/><path d="M40 44 C26 36 28 24 36 24 C38 24 40 26 40 27 C40 26 42 24 44 24 C52 24 54 36 40 44Z" fill="#e0517f"/></svg><span>Chạm để mở thư</span>';
    stage.append(ground, boy.el, girl.el, bouquet, bubble, letter);
    host.append(stage);

    // Layout, all in CSS pixels. Characters are 100x200 SVG units; the feet sit at y = 187.
    const groundY = h * .8;
    const H = Math.max(130, Math.min(230, h * .27));
    const k = H / 200;
    const bouquetH = Math.min(w * .78, h * .46);
    const bouquetW = bouquetH * (761 / 868);
    const heldH = H * .44;
    const bx = w / 2, by = Math.min(h * .5, groundY - bouquetH * .5);
    const girlX = w * (w < 640 ? .75 : .68);
    const boyStop = Math.max(H * .55, bx - bouquetW * .5 - H * .1);
    const boyFinal = girlX - H * .62;
    ground.style.top = `${groundY - 6}px`;
    [boy, girl].forEach(c => { c.el.style.width = `${100 * k}px`; c.el.style.height = `${200 * k}px`; });
    const hand = (c, x) => ({ x: x + (c.flip ? -1 : 1) * 3 * k, y: groundY - 61 * k - c.bob });
    girl.x = girlX; boy.x = -H;

    const setBouquet = (x, y, height, opacity, rotation = 0) => {
      bouquet.style.height = `${height}px`;
      bouquet.style.opacity = opacity;
      bouquet.style.transform = `translate(${x - height * (761 / 868) / 2}px, ${y - height / 2}px) rotate(${rotation}deg)`;
    };
    const place = c => {
      c.el.style.transform = `translate(${c.x - 50 * k}px, ${groundY - 187 * k - c.bob}px)${c.flip ? ' scaleX(-1)' : ''}`;
    };
    const say = (text) => {
      if (!caption) return;
      caption.classList.remove('on');
      setTimeout(() => { caption.textContent = text; caption.classList.add('on'); }, 700);
    };
    const hearts = () => {
      const heart = document.createElement('span');
      heart.className = 'gift-heart'; heart.textContent = '♥';
      heart.style.left = `${girlX + (Math.random() - .5) * H * .7}px`;
      heart.style.top = `${groundY - H * .95}px`;
      heart.style.fontSize = `${14 + Math.random() * 14}px`;
      heart.style.setProperty('--dx', `${(Math.random() - .5) * 60}px`);
      stage.append(heart);
      setTimeout(() => heart.remove(), 2600);
    };

    const cues = [[300, 'Có một người đang chạy thật nhanh…'], [3200, 'mang theo cả một vườn hoa…'], [6000, 'để trao tận tay bạn.']];
    let cueIndex = 0, last = 0, phase = 0, nextHeart = 0, letterShown = false, handoffFrom = null;
    const t0 = performance.now();
    const handoffAt = 6500, handoffEnd = 7700, letterAt = 8300;

    function frame(now) {
      const t = now - t0, dt = last ? Math.min(50, now - last) : 16; last = now;
      while (cueIndex < cues.length && t >= cues[cueIndex][0]) say(cues[cueIndex++][1]);

      ground.style.opacity = seg(t, 0, 900, easeOut);
      girl.el.style.opacity = seg(t, 200, 900, easeOut);

      // Boy: runs in, stops at the bouquet, picks it up, runs to the girl.
      const run1 = seg(t, 900, 2700), run2 = seg(t, 3500, 6000);
      boy.x = t < 3500 ? lerp(-H, boyStop, run1) : lerp(boyStop, boyFinal, run2);
      const running = (t > 900 && t < 2700) || (t > 3500 && t < 6000);
      if (running) phase += dt * .016;
      boy.bob = running ? Math.abs(Math.sin(phase)) * 5 * k : (t > 7700 ? Math.abs(Math.sin(t * .008)) * 4 * k * seg(t, 7700, 7900) : 0);
      const holding = seg(t, 2500, 3100) * (1 - seg(t, handoffAt + 500, handoffEnd));
      boy.pose({ phase, amp: running ? 1 : 0, hold: holding, wave: t > 7900 ? -150 - Math.sin(t * .012) * 20 : 0 });
      boy.face(t > 7700 ? 'grin' : 'smile', t > 3100 ? 'happy' : 'open');

      // Girl: waits, startles when he arrives, blushes when she gets the flowers.
      const received = seg(t, handoffAt + 400, handoffEnd);
      const startled = t > 5600 && t < handoffEnd;
      girl.bob = startled ? Math.abs(Math.sin((t - 5600) * .012)) * 7 * k * (1 - seg(t, 6400, 6700)) : 0;
      girl.pose({ phase: t * .003, amp: 0, hold: received });
      girl.face(startled && t < handoffAt + 600 ? 'o' : t >= handoffAt + 600 ? 'grin' : 'smile', t >= handoffAt + 600 ? 'happy' : 'open');
      bubble.style.opacity = t > 5600 && t < 7000 ? 1 : 0;
      bubble.style.transform = `translate(${girlX - 14}px, ${groundY - H * 1.02 - (t > 5600 ? seg(t, 5600, 5900, easeOut) * 10 : 0)}px) scale(${seg(t, 5600, 5850, easeOut)})`;
      place(boy); place(girl);

      // Bouquet: appears where the light gathered, hops into the boy's hands, then into the girl's.
      const boyHand = hand(boy, boy.x), girlHand = hand(girl, girl.x);
      if (t < 2700) {
        const born = seg(t, 0, 900, easeOut);
        setBouquet(bx, by + Math.sin(t * .004) * 5 * born, bouquetH * (.9 + .1 * born), born);
      } else if (t < 3500) {
        const e = seg(t, 2700, 3500);
        setBouquet(lerp(bx, boyHand.x + 4 * k, e), lerp(by, boyHand.y, e) - Math.sin(e * Math.PI) * H * .35, lerp(bouquetH, heldH, e), 1, Math.sin(e * Math.PI) * -10);
      } else if (t < handoffAt) {
        setBouquet(boyHand.x + 4 * k, boyHand.y, heldH, 1);
      } else if (t < handoffEnd) {
        handoffFrom = handoffFrom || { x: boyHand.x + 4 * k, y: boyHand.y };
        const e = seg(t, handoffAt + 200, handoffEnd);
        setBouquet(lerp(handoffFrom.x, girlHand.x, e), lerp(handoffFrom.y, girlHand.y, e) - Math.sin(e * Math.PI) * H * .3, heldH, 1, Math.sin(e * Math.PI) * 8);
      } else {
        setBouquet(girlHand.x, girlHand.y - Math.sin(t * .004) * 2, heldH, 1);
      }

      if (t > handoffEnd - 200 && t > nextHeart && t < handoffEnd + 4500) { hearts(); nextHeart = t + 380; }
      if (!letterShown && t > letterAt) {
        letterShown = true;
        letter.hidden = false;
        letter.style.left = `${girlX}px`;
        letter.style.top = `${groundY - H * 1.28}px`;
        say('Có một lá thư gửi riêng cho bạn.');
        if (onLetter) onLetter(letter);
      }
      requestAnimationFrame(frame);
    }
    bouquet.decode().catch(() => {}).finally(() => requestAnimationFrame(frame));
    return { letter };
  }

  window.GiftScene = { start };
})();
