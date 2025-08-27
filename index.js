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







/*Service Card*/
