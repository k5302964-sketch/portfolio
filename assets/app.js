// Renders the portfolio from window.PORTFOLIO (data/projects.js).
(() => {
  const D = window.PORTFOLIO;
  if (!D) return;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const icon = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  };

  const chips = (list = [], cls = "") => list.map((t) => `<span class="chip ${cls}">${esc(t)}</span>`).join("");
  const link = (href, label, cls, ic, newTab = true) =>
    href ? `<a class="btn ${cls}" href="${esc(href)}"${newTab ? ' target="_blank" rel="noopener"' : ""}>${ic ? icon[ic] : ""}${esc(label)}</a>` : "";

  // ---- profile / hero
  const P = D.profile;
  document.title = `${P.name} — ${P.role}`;
  $$("[data-name]").forEach((n) => (n.textContent = P.name));
  $$("[data-initials]").forEach((n) => (n.textContent = P.initials));
  $("#hero-eyebrow").textContent = P.role;
  $("#hero-title").innerHTML = P.headline;
  $("#hero-lede").textContent = P.lede;
  $("#hero-cta").innerHTML =
    `<a class="btn primary" href="#games">${icon.play}Play my games</a>` +
    `<a class="btn" href="#teardowns">${icon.doc}Read teardowns</a>` +
    link(P.linkedin, "LinkedIn", "ghost", "ext");
  $("#hero-stats").innerHTML = D.stats.map((s) => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join("");
  // two portrait game screens plus one landscape teardown page
  const poster = (g) => g.poster || (g.orientation === "portrait" && g.shots && g.shots[1]) || g.cover;
  const heroItems = [
    ...D.games.filter(poster).slice(0, 2).map((g) => ({ key: `game:${g.slug}`, img: poster(g), title: g.title })),
    ...D.teardowns.filter((t) => t.cover).slice(0, 1).map((t) => ({ key: `teardown:${t.slug}`, img: t.cover, title: `Teardown: ${t.title}` })),
  ];
  $("#hero-collage").innerHTML = heroItems
    .map((it) => `<figure data-open="${esc(it.key)}" tabindex="0" role="button" aria-label="Open ${esc(it.title)}"><img src="${esc(it.img)}" alt="" loading="eager"><figcaption>${esc(it.title)}</figcaption></figure>`)
    .join("");

  // ---- games
  // With fewer than three regular cards a grid row looks empty, so every card goes wide instead.
  // Wide cards alternate the side their image is on.
  const wideAll = D.games.filter((g) => !g.featured).length < 3;
  let wideIndex = 0;
  const gameCard = (g) => {
    const wide = g.featured || wideAll;
    const flip = wide && wideIndex++ % 2 === 1;
    return `
    <button class="gcard${wide ? " featured" : ""}${flip ? " flip" : ""}" data-open="game:${esc(g.slug)}">
      <div class="cover">${g.cover ? `<img src="${esc(g.cover)}" alt="${esc(g.title)} screenshot" loading="lazy">` : ""}${g.badge ? `<span class="badge">${esc(g.badge)}</span>` : ""}</div>
      <div class="body">
        <div class="chips">${chips(g.genre)}</div>
        <h3>${esc(g.title)}</h3>
        <p class="pitch">${esc(g.pitch)}</p>
        ${wide && g.facts ? `<div class="facts">${g.facts.map((f) => `<div><b>${esc(f.v)}</b>${esc(f.k)}</div>`).join("")}</div>` : ""}
        <span class="more">${g.play ? "Play &amp; details" : "Details"} ${icon.arrow}</span>
      </div>
    </button>`;
  };
  $("#games-grid").innerHTML = D.games.map(gameCard).join("");

  // ---- teardowns: three per row, or two wide rows when the count divides by two but not three
  const tdGrid = $("#td-grid");
  tdGrid.classList.toggle("two", D.teardowns.length % 3 !== 0 && D.teardowns.length % 2 === 0);
  tdGrid.innerHTML = D.teardowns
    .map(
      (t) => `
    <button class="tcard" data-open="teardown:${esc(t.slug)}">
      <div class="cover">${t.cover ? `<img src="${esc(t.cover)}" alt="${esc(t.title)} teardown cover" loading="lazy">` : ""}<span class="doc">Teardown</span></div>
      <div class="body">
        <p class="meta">${esc([t.platform, t.genre].filter(Boolean).join(" · "))}</p>
        <h3>${esc(t.title)}</h3>
        ${t.insight ? `<blockquote>${esc(t.insight)}</blockquote>` : ""}
        <div class="chips">${chips((t.sections || []).slice(0, 4), "violet")}</div>
        <span class="more">Open teardown ${icon.arrow}</span>
      </div>
    </button>`
    )
    .join("");

  // ---- process, tools, about
  $("#steps").innerHTML = D.process.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>${s.tool ? `<div class="tool">${esc(s.tool)}</div>` : ""}</li>`).join("");
  $("#tools").innerHTML = (D.tools || []).map((t) => `<div class="tool-card"><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p><div class="chips">${chips(t.tags)}</div></div>`).join("");
  $("#about-text").innerHTML = D.about.text.map((p) => `<p>${esc(p)}</p>`).join("") + `<div class="chips" style="margin-top:16px">${chips(D.about.skills)}</div>`;
  $("#about-list").innerHTML = D.about.strengths.map((s) => `<li>${esc(s)}</li>`).join("");
  $("#contact-text").textContent = P.looking;
  $("#contact-cta").innerHTML =
    (P.email ? `<a class="btn primary" href="mailto:${esc(P.email)}">${icon.mail}${esc(P.email)}</a>` : "") +
    link(P.linkedin, "LinkedIn", "", "ext") +
    link(P.github, "GitHub", "", "ext") +
    link(P.telegram, "Telegram", "", "ext");
  $("#footer-note").textContent = D.footer || "";

  // ---- modal
  // On a phone the game opens full screen instead of in a phone frame inside the dialog.
  const phone = matchMedia("(max-width: 620px)");
  const dlg = $("#modal");
  const body = $("#modal-body");
  let lastFocus = null;

  function gallery(shots, title) {
    if (!shots.length) return "";
    return `<div class="m-stage" id="m-stage"><img src="${esc(shots[0])}" alt="${esc(title)} screenshot 1"></div>` +
      (shots.length > 1
        ? `<div class="m-thumbs">${shots.map((s, i) => `<button data-shot="${i}" aria-current="${i === 0}" aria-label="Screenshot ${i + 1}"><img src="${esc(s)}" alt="" loading="lazy"></button>`).join("")}</div>`
        : "");
  }

  function gameView(g) {
    const shots = g.shots && g.shots.length ? g.shots : g.cover ? [g.cover] : [];
    const td = g.teardown ? D.teardowns.find((t) => t.slug === g.teardown) : null;
    return `
      <div class="m-grid">
        <div class="m-media">${gallery(shots, g.title)}
          ${g.play ? `<p class="m-note">${esc(g.note || (g.orientation === "portrait" ? "Made for phones (portrait, touch). Works with a mouse too." : "Runs in the browser on desktop and phone."))}</p>` : ""}
        </div>
        <div class="m-info">
          <div class="chips">${chips(g.genre)}</div>
          <h2 id="modal-title">${esc(g.title)}</h2>
          <p class="pitch">${esc(g.description || g.pitch)}</p>
          <div class="m-actions">
            ${g.play && phone.matches ? link(g.play, "Play", "primary", "play", false) : ""}
            ${g.play && !phone.matches ? `<button class="btn primary" data-play>${icon.play}Play here</button>${link(g.play, "Open full screen", "", "ext")}` : ""}
            ${td ? `<button class="btn violet" data-open="teardown:${esc(td.slug)}">${icon.doc}Read the teardown</button>` : ""}
            ${link(g.source, "Source", "ghost", "ext")}
          </div>
          ${g.role && g.role.length ? `<h4>What I did</h4><ul>${g.role.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
          ${g.highlights && g.highlights.length ? `<h4>Highlights</h4><ul>${g.highlights.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
          <dl class="kv">
            ${g.reference ? `<dt>Based on</dt><dd>${esc(g.reference)}</dd>` : ""}
            ${g.tech ? `<dt>Tech</dt><dd>${esc(g.tech.join(", "))}</dd>` : ""}
            ${g.platform ? `<dt>Platform</dt><dd>${esc(g.platform)}</dd>` : ""}
            ${g.year ? `<dt>Year</dt><dd>${esc(g.year)}</dd>` : ""}
          </dl>
        </div>
      </div>`;
  }

  function teardownView(t) {
    const shots = t.shots && t.shots.length ? t.shots : t.cover ? [t.cover] : [];
    const game = D.games.find((g) => g.teardown === t.slug);
    return `
      <div class="m-grid">
        <div class="m-media">${gallery(shots, t.title)}
          ${t.size ? `<p class="m-note">Single HTML report with embedded evidence frames, ${esc(t.size)}. Best read on a desktop.</p>` : ""}
        </div>
        <div class="m-info">
          <p class="m-note">${esc([t.platform, t.genre, t.studio].filter(Boolean).join(" · "))}</p>
          <h2 id="modal-title">${esc(t.title)}</h2>
          <p class="pitch">${esc(t.summary)}</p>
          <div class="m-actions">
            ${link(t.file, "Open full teardown", "violet", "doc")}
            ${game ? `<button class="btn" data-open="game:${esc(game.slug)}">${icon.play}Game built from it: ${esc(game.title)}</button>` : ""}
          </div>
          ${t.findings && t.findings.length ? `<h4>Key findings</h4><ul>${t.findings.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
          ${t.sections && t.sections.length ? `<h4>Inside the report</h4><div class="chips">${chips(t.sections, "violet")}</div>` : ""}
        </div>
      </div>`;
  }

  function open(key, push = true) {
    const [type, slug] = key.split(":");
    const item = type === "game" ? D.games.find((g) => g.slug === slug) : D.teardowns.find((t) => t.slug === slug);
    if (!item) return;
    dlg.classList.remove("playing");
    body.innerHTML = type === "game" ? gameView(item) : teardownView(item);
    body.scrollTop = 0;
    if (!dlg.open) {
      lastFocus = document.activeElement;
      dlg.showModal();
    }
    if (push) history.replaceState(null, "", `#${type}/${slug}`);
    const play = $("[data-play]", body);
    if (play) play.addEventListener("click", () => startGame(item));
  }

  function startGame(g) {
    const stage = $("#m-stage", body) || $(".m-media", body).insertAdjacentElement("afterbegin", document.createElement("div"));
    stage.id = "m-stage";
    const thumbs = $(".m-thumbs", body);
    if (thumbs) thumbs.remove();
    const frame = `<iframe src="${esc(g.play)}" title="${esc(g.title)}" allow="autoplay; fullscreen; gamepad" allowfullscreen></iframe>`;
    if (g.orientation === "portrait") {
      stage.className = "m-stage phone";
      stage.innerHTML = `<div class="device">${frame}</div>`;
    } else {
      stage.className = "m-stage wide";
      stage.innerHTML = frame;
    }
    $("[data-play]", body)?.remove();
    // Play mode: the dialog grows to almost the whole window, the game takes the full width and the
    // description moves below it, so in-game HUDs and hints have room.
    dlg.classList.add("playing");
    const bar = document.createElement("div");
    bar.className = "m-bar";
    bar.innerHTML = `<button class="btn sm" data-fs>${icon.full}Full screen</button>${link(g.play, "Open in a new tab", "sm ghost", "ext")}`;
    stage.after(bar);
    const iframe = $("iframe", stage);
    // the builds are single files of 0.2–22 MB, so say so while one downloads instead of showing a black box
    const loading = document.createElement("div");
    loading.className = "m-loading";
    loading.innerHTML = `<span class="spin"></span><span>Loading the game${g.size ? ` · ${esc(g.size)}` : ""}…</span>`;
    stage.appendChild(loading);
    iframe.addEventListener("load", () => loading.remove(), { once: true });
    bar.querySelector("[data-fs]").addEventListener("click", () => {
      const req = iframe.requestFullscreen || iframe.webkitRequestFullscreen;
      if (req) req.call(iframe);
      iframe.focus();
    });
    body.scrollTop = 0;
    iframe.focus();
  }

  function close() {
    dlg.close();
  }
  dlg.addEventListener("close", () => {
    body.innerHTML = ""; // stops a running game
    dlg.classList.remove("playing");
    if (location.hash.startsWith("#game/") || location.hash.startsWith("#teardown/")) history.replaceState(null, "", location.pathname + location.search);
    lastFocus?.focus?.();
  });
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) close();
  });
  $("#modal-close").addEventListener("click", close);
  body.addEventListener("click", (e) => {
    const t = e.target.closest("[data-shot]");
    if (!t) return;
    const img = $("#m-stage img", body);
    img.src = $("img", t).src;
    $$("[data-shot]", body).forEach((b) => b.setAttribute("aria-current", String(b === t)));
  });

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open]");
    if (t) open(t.dataset.open);
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("figure[data-open]")) {
      e.preventDefault();
      open(e.target.dataset.open);
    }
  });

  const fromHash = () => {
    const m = location.hash.match(/^#(game|teardown)\/([\w-]+)$/);
    if (m) open(`${m[1]}:${m[2]}`, false);
  };
  window.addEventListener("hashchange", fromHash);
  fromHash();

  // ---- header + theme
  const top = $(".top");
  const onScroll = () => top.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  $("#theme-toggle").addEventListener("click", () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (_) {}
  });
})();
