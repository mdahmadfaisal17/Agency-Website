const phrases = [
  "MOCKUP EXPERT",
  "SOCIAL MEDIA DESIGNER",
  "BRAND IDENTITY DESIGNER"
];

const textEl = document.getElementById("expertText");
const caretEl = document.getElementById("caret");

let p = 0;   // কোন phrase চলছে
let i = 0;   // কতগুলো অক্ষর দেখানো হয়েছে

function type() {
  const word = phrases[p];

  // টাইপিং চললে কার্সর দেখাও (blink)
  caretEl.classList.remove("hidden");

  // এক অক্ষর করে বাড়াও
  textEl.textContent = word.slice(0, ++i);

  if (i === word.length) {
    // শব্দ শেষ: ২ সেকেন্ড pause, কার্সর লুকাও
    caretEl.classList.add("hidden");
    setTimeout(() => {
      // পরের শব্দ শুরু
      p = (p + 1) % phrases.length;
      i = 0;
      type();
    }, 2000);
  } else {
    // টাইপিং স্পিড
    setTimeout(type, 110);
  }
}

type();







/* Brand marquee: auto-clone + auto-duration */
(function () {
  const track = document.querySelector('.brand-rail .brand-track'); // ← এখানে পরিবর্তন
  if (!track) return;

  const speed = Number(track.dataset.speed || 110); // px/sec
  const container = track.parentElement;
  const baseRow = track.querySelector('.brand-row');
  if (!baseRow) return;

  function setup() {
    [...track.querySelectorAll('.brand-row')].slice(1).forEach(n => n.remove());

    const baseWidth = baseRow.getBoundingClientRect().width;
    const viewportW = container.clientWidth;

    let unitWidth = baseWidth;
    while (unitWidth < viewportW + baseWidth) {
      track.appendChild(baseRow.cloneNode(true)).setAttribute('aria-hidden','true');
      unitWidth += baseWidth;
    }

    const unitClone = document.createDocumentFragment();
    [...track.querySelectorAll('.brand-row')].forEach(row => {
      unitClone.appendChild(row.cloneNode(true)).firstChild?.setAttribute?.('aria-hidden','true');
    });
    track.appendChild(unitClone);

    const total = track.getBoundingClientRect().width;
    const scrollDistance = total / 2;
    track.style.setProperty('--scroll-distance', `${scrollDistance}px`);
    track.style.setProperty('--scroll-duration', `${scrollDistance / speed}s`);
  }

  window.addEventListener('load', setup);
  window.addEventListener('resize', setup);
})();











/* ===== Stats counter (on scroll) ===== */
(function(){
  const els = document.querySelectorAll('.kpi-value');
  if(!els.length) return;

  const DURATION = 3500; // ms (৩.৫s). চাইলে 3000–6000 এর মধ্যে সেট করো

  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  function animate(el){
    const target = Number(el.dataset.target || 0);
    const decimals = Number(el.dataset.decimals || 0);
    const suffix = el.dataset.suffix || '';

    let start = null;
    const startVal = 0;

    function step(ts){
      if(!start) start = ts;
      const p = Math.min(1, (ts - start) / DURATION);
      const eased = easeOutCubic(p);
      const value = startVal + (target - startVal) * eased;

      el.textContent = value.toFixed(decimals) + suffix;

      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Run once when stats section enters viewport
  const obs = new IntersectionObserver((entries, ob)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.querySelectorAll('.kpi-value').forEach(animate);
        ob.unobserve(entry.target); // একবারই চলবে
      }
    });
  }, { threshold: 0.35 });

  const section = document.querySelector('.stats');
  if(section) obs.observe(section);
})();





/* ===== Services: Infinite center-focus carousel (left-based, double-clone, snap-fix) ===== */
document.addEventListener("DOMContentLoaded", () => {
  const viewport = document.querySelector(".srv-viewport");
  const track    = document.querySelector(".srv-track");
  const prevBtn  = document.querySelector(".srv-arrow.prev");
  const nextBtn  = document.querySelector(".srv-arrow.next");
  const pills    = [...document.querySelectorAll(".service-name")];

  // left-ভিত্তিক easing
  const EASE = "left 520ms cubic-bezier(.22,.61,.36,1)";
  if (!viewport || !track) return;

  /* ---------- real items ---------- */
  const real = [...track.querySelectorAll(".srv-card")];
  const R = real.length;
  if (!R) return;

  // ক্যাটাগরি -> প্রথম real index
  const firstIndexOfCat = {};
  real.forEach((card, i) => {
    const cat = card.dataset.cat || "default";
    if (firstIndexOfCat[cat] == null) firstIndexOfCat[cat] = i;
  });

  /* ---------- double clones: [last2,last1, ...real..., first1,first2] ---------- */
  const last1  = real[R - 1].cloneNode(true);
  const last2  = real[(R - 2 + R) % R].cloneNode(true);
  const first1 = real[0].cloneNode(true);
  const first2 = real[1 % R].cloneNode(true);
  [last1, last2, first1, first2].forEach(n => n.classList.add("clone"));

  track.insertBefore(last2, real[0]);   // 0
  track.insertBefore(last1, real[0]);   // 1
  track.appendChild(first1);            // R+2
  track.appendChild(first2);            // R+3

  let items = [...track.querySelectorAll(".srv-card")];

  const OFFSET = 2;                     // প্রথম real = 2
  const IDX = { FIRST: R+2, SECOND: R+3, LAST1: 1, LAST2: 0 };

  // safety: CSS যদি সেট না থাকে, JS থেকে সেট করে দিই
  track.style.position   = getComputedStyle(track).position === 'static' ? 'relative' : getComputedStyle(track).position;
  if (!getComputedStyle(track).transition.includes('left')) track.style.transition = EASE;

  let current = OFFSET;
  let isAnimating = false;

  /* ---------- helpers ---------- */
  function setActivePill(cat){
    pills.forEach(p => p.classList.toggle("is-active", p.dataset.cat === cat));
  }
  function runScaleStates(center){
    items.forEach(el => el.classList.remove("is-left","is-center","is-right"));
    const L = items.length;
    items[(center - 1 + L) % L]?.classList.add("is-left");
    items[center]?.classList.add("is-center");
    items[(center + 1) % L]?.classList.add("is-right");
  }
  // ভিউপোর্ট সেন্টারে আনতে track.left কত হবে
  function centerX(i){
    const card = items[i];
    const vMid = viewport.clientWidth / 2;
    const cMid = card.offsetLeft + card.offsetWidth / 2;
    return vMid - cMid;
  }
  function setOffset(x, animate = true){
    track.style.transition = animate ? EASE : "none";
    track.style.left = `${x}px`;
  }
  function moveTo(i, animate = true){
    if (isAnimating && animate) return;
    const L = items.length;
    current = ((i % L) + L) % L;
    isAnimating = !!animate;

    runScaleStates(current);
    const cat = items[current]?.dataset.cat;
    if (cat) setActivePill(cat);

    setOffset(centerX(current), animate);
  }

  /* ---------- transition end: clone → real snap-compensation ---------- */
  function onTransitionEnd(e){
    if (e.propertyName !== "left") return;
    isAnimating = false;

    // জাম্প দরকার কি না নির্ধারণ
    let needJump = false;
    let newIndex = current;
    if (current === IDX.FIRST)      { newIndex = OFFSET;        needJump = true; }
    else if (current === IDX.SECOND){ newIndex = OFFSET + 1;    needJump = true; }
    else if (current === IDX.LAST1) { newIndex = OFFSET + R - 1;needJump = true; }
    else if (current === IDX.LAST2) { newIndex = OFFSET + R - 2;needJump = true; }
    if (!needJump) return;

    // ভিজ্যুয়াল স্ন্যাপ এড়াতে delta compensate করি
    const prevLeft   = parseFloat(getComputedStyle(track).left) || 0;
    const beforeLeft = centerX(current);     // clone অবস্থার target

    viewport.classList.add("no-anim");
    track.style.transition = "none";

    current = newIndex;
    const afterLeft = centerX(current);      // real অবস্থার target
    const delta = afterLeft - beforeLeft;    // compensate
    track.style.left = `${prevLeft + delta}px`;

    runScaleStates(current);
    setActivePill(items[current]?.dataset.cat || "");

    requestAnimationFrame(() => {
      void track.offsetWidth;
      viewport.classList.remove("no-anim");
      track.style.transition = EASE;
    });
  }

  /* ---------- events ---------- */
  nextBtn?.addEventListener("click", () => moveTo(current + 1, true));
  prevBtn?.addEventListener("click", () => moveTo(current - 1, true));
  items.forEach((el, idx) => el.addEventListener("click", () => moveTo(idx, true)));
  pills.forEach(p => p.addEventListener("click", () => {
    const realIdx = firstIndexOfCat[p.dataset.cat] ?? 0;
    moveTo(OFFSET + realIdx, true);
  }));
  viewport.setAttribute("tabindex","0");
  viewport.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft")  moveTo(current - 1, true);
    if (e.key === "ArrowRight") moveTo(current + 1, true);
  });

  track.addEventListener("transitionend", onTransitionEnd);
  window.addEventListener("resize", () => moveTo(current, false));
  window.addEventListener("load",   () => moveTo(current, false));

  // init
  moveTo(OFFSET, false);
});
