(() => {
  const WEDDING = new Date("2026-11-01T18:00:00+05:00");
  const MUSIC_START = 26; // qöşiq aytiliş boşlanadigan soniya

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Musiqa ---------- */
  const audio = $("#music");
  const musicBtn = $("#musicBtn");
  let musicOk = true;

  function seekStart() {
    try { audio.currentTime = MUSIC_START; } catch (e) {}
  }
  if (audio.readyState >= 1) seekStart();
  else audio.addEventListener("loadedmetadata", seekStart, { once: true });

  // Qöşiq tugasa yana aytiliş joyidan qaytadan boşlansin
  audio.addEventListener("ended", () => { seekStart(); audio.play().catch(() => {}); });
  audio.addEventListener("play", () => musicBtn.classList.add("playing"));
  audio.addEventListener("pause", () => musicBtn.classList.remove("playing"));
  audio.addEventListener("error", () => { musicOk = false; musicBtn.hidden = true; });

  function playMusic() {
    if (!musicOk) return;
    if (audio.currentTime < MUSIC_START) seekStart();
    audio.volume = 0;
    audio.play().then(fadeIn).catch(() => {});
  }
  function fadeIn() {
    let v = 0;
    const t = setInterval(() => {
      v = Math.min(1, v + 0.05);
      audio.volume = v;
      if (v >= 1) clearInterval(t);
    }, 80);
  }
  musicBtn.addEventListener("click", () => (audio.paused ? playMusic() : audio.pause()));

  // Brauzer ruxsat bersa — darhol avtomatik boşlanadi
  playMusic();

  /* ---------- Konvert ---------- */
  const intro = $("#intro");
  const envelope = $("#envelope");
  function openEnvelope() {
    if (intro.classList.contains("opening")) return;
    intro.classList.add("opening");
    playMusic();
    setTimeout(() => {
      intro.classList.add("gone");
      document.body.classList.remove("locked");
      document.body.classList.add("ready");
      musicBtn.classList.add("show");
      startLeaves();
      revealCheck();
    }, 3300);
    setTimeout(() => intro.remove(), 4600);
  }
  envelope.addEventListener("click", openEnvelope);
  envelope.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEnvelope(); } });

  /* ---------- Barglar ---------- */
  const leavesBox = $("#leaves");
  const colors = ["#c9824a", "#b5562c", "#d4a24c", "#9a6b3f", "#c96f3b", "#e0b36a", "#a8452a"];
  function startLeaves() {
    const count = window.innerWidth < 600 ? 14 : 22;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "leaf";
      el.style.cssText = `
        left:${Math.random() * 100}%;
        --s:${12 + Math.random() * 18}px;
        --c:${colors[i % colors.length]};
        --d:${11 + Math.random() * 10}s;
        --delay:${-Math.random() * 20}s;
        --x:${(Math.random() - 0.5) * 240}px;
        --r:${(Math.random() > 0.5 ? 1 : -1) * (300 + Math.random() * 360)}deg;
        --o:${0.45 + Math.random() * 0.35};`;
      el.innerHTML = `<svg viewBox="0 0 100 100"><use href="#${i % 3 === 0 ? "maple" : "leaf"}"/></svg>`;
      leavesBox.appendChild(el);
    }
  }

  /* ---------- Sanoq ---------- */
  const cd = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  function tick() {
    let diff = Math.max(0, WEDDING - Date.now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    cd.d.textContent = d;
    cd.h.textContent = String(h).padStart(2, "0");
    cd.m.textContent = String(m).padStart(2, "0");
    cd.s.textContent = String(s).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Taqvim (2026-yil noyabr, 1-kun yakşanba) ---------- */
  const firstDow = 6; // Du=0 ... Ya=6
  let html = "";
  for (let i = 0; i < firstDow; i++) html += "<span></span>";
  for (let d = 1; d <= 30; d++) html += `<span class="${d === 1 ? "day" : ""}">${d}</span>`;
  $("#calDays").innerHTML = html;

  /* ---------- Paydo böliş ---------- */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 })
    : null;
  function revealCheck() {
    $$(".reveal:not(.in)").forEach(el => (io ? io.observe(el) : el.classList.add("in")));
  }

  /* ---------- Toast ---------- */
  const toast = $("#toast");
  let toastT;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  /* ---------- Karta nusxasi ---------- */
  const card = $("#bankCard");
  async function copyCard() {
    const num = $("#cardNum").textContent.replace(/\s/g, "");
    try {
      await navigator.clipboard.writeText(num);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = num; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove();
    }
    card.classList.remove("copied"); void card.offsetWidth; card.classList.add("copied");
    showToast("Karta raqami nusxalandi ✓");
  }
  $("#copyBtn").addEventListener("click", copyCard);
  card.addEventListener("click", copyCard);

  // Karta sichqonça / barmoq ortidan 3D egiladi, yorug'lik ergaşadi
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.classList.add("tilting");
    card.style.setProperty("--ry", `${(x - 0.5) * 16}deg`);
    card.style.setProperty("--rx", `${(0.5 - y) * 14}deg`);
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
  });
  const resetCard = () => {
    card.classList.remove("tilting");
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };
  card.addEventListener("pointerleave", resetCard);
  card.addEventListener("pointercancel", resetCard);

  /* ---------- Taşqi havolalar yangi oynada oçilsin ---------- */
  $$('a[target="_blank"]').forEach(a => a.addEventListener("click", e => {
    const w = window.open(a.href, "_blank", "noopener");
    if (w) e.preventDefault();
  }));

  /* ---------- Modal ---------- */
  function openModal(m) { m.hidden = false; setTimeout(() => $("input", m)?.focus(), 50); }
  function closeModal(m) { m.hidden = true; $(".form-msg", m).textContent = ""; }
  $$(".modal").forEach(m => $$("[data-close]", m).forEach(b => b.addEventListener("click", () => closeModal(m))));
  document.addEventListener("keydown", e => { if (e.key === "Escape") $$(".modal:not([hidden])").forEach(closeModal); });

  async function post(url, data) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Xatolik");
    return res.json();
  }

  /* ---------- RSVP ---------- */
  const rsvpModal = $("#rsvpModal");
  const rsvpForm = $("#rsvpForm");
  const rsvpDone = $("#rsvpDone");
  let attending = 1;

  function showRsvpDone(a) {
    $(".rsvp-btns").hidden = true;
    rsvpDone.hidden = false;
    rsvpDone.textContent = a ? "Sizni intizorlik bilan kutamiz! 🥂" : "Javobingiz uçun rahmat. Duolaringizda böling 💐";
  }
  try {
    const saved = localStorage.getItem("rsvp");
    if (saved !== null) showRsvpDone(saved === "1");
  } catch (e) {}

  $$(".rsvp-btn").forEach(b => b.addEventListener("click", () => {
    attending = Number(b.dataset.attend);
    $("#rsvpHeading").textContent = attending ? "Albatta boraman 🥂" : "Kela olmayman 💐";
    $("#guestsLabel").hidden = !attending;
    openModal(rsvpModal);
  }));

  rsvpForm.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = $("button[type=submit]", rsvpForm);
    const msg = $(".form-msg", rsvpForm);
    const fd = Object.fromEntries(new FormData(rsvpForm));
    btn.disabled = true; msg.textContent = "Yuborilmoqda...";
    try {
      await post("/api/rsvp", { name: fd.name, attending, guests: attending ? Number(fd.guests) : 0 });
      try { localStorage.setItem("rsvp", String(attending)); } catch (e) {}
      closeModal(rsvpModal);
      showRsvpDone(attending);
      showToast("Javobingiz qabul qilindi ✓");
    } catch (err) {
      msg.textContent = "Yuborib bölmadi. Qaytadan urinib köring.";
    } finally { btn.disabled = false; }
  });
})();
