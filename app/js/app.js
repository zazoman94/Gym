/* Gym · lógica de la interfaz. Sin dependencias. */
(function () {
  const $ = s => document.querySelector(s);
  const view = $("#view");
  const S = Store;
  const ui = { tab: "train", open: null, progEx: null, confirm: null };
  const fmtW = w => (w == null || w === "" ? "" : String(+(+w).toFixed(2)).replace(".", ","));
  const parseNum = v => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const dateShort = iso => new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
  const dateLong = iso => new Date(iso).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  const ago = iso => { const d = Math.floor((Date.now() - new Date(iso)) / 864e5); return d <= 0 ? "hoy" : d === 1 ? "ayer" : `hace ${d} días`; };
  const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  if (S.ENV === "dev") { document.body.classList.add("dev"); $("#envbar").hidden = false; document.title = "Gym DEV"; }

  /* ---------- Navegación ---------- */
  document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => {
    ui.tab = b.dataset.tab; ui.confirm = null;
    document.querySelectorAll(".tabs button").forEach(x => x === b ? x.setAttribute("aria-current", "page") : x.removeAttribute("aria-current"));
    render(); window.scrollTo(0, 0);
  }));

  function render() {
    const fn = { train: renderTrain, progress: renderProgress, history: renderHistory, settings: renderSettings }[ui.tab];
    fn();
  }

  /* ---------- Entrenar ---------- */
  function nextDayIndex() {
    const f = S.finished().sort((a, b) => b.start.localeCompare(a.start));
    return f.length ? (f[0].day + 1) % DAYS.length : 0;
  }

  function startSession(day) {
    const entries = {};
    DAYS[day].ex.forEach(([id, sets]) => {
      const last = S.lastFor(id);
      const ex = EXERCISES[id];
      const w = last ? last.sets[0].w : ex.w0;
      entries[id] = Array.from({ length: Math.max(sets, last ? Math.min(last.sets.length, 6) : 0) }, () => ({ w: w == null ? null : w, r: null, done: false }));
    });
    const s = { id: Date.now().toString(36), day, start: new Date().toISOString(), end: null, entries };
    S.data.sessions.push(s); S.data.active = s.id; S.save();
    ui.open = DAYS[day].ex[0][0];
    requestWakeLock();
    render();
  }

  function renderTrain() {
    const s = S.activeSession();
    if (!s) {
      $("#title").textContent = "Entrenar";
      const next = nextDayIndex();
      const lastByDay = {};
      S.finished().forEach(x => { if (!lastByDay[x.day] || x.start > lastByDay[x.day]) lastByDay[x.day] = x.start; });
      view.innerHTML = `<p class="muted small" style="margin:0">Elige el día. El marcado es el siguiente de tu secuencia.</p>
        <div class="days">${DAYS.map((d, i) => `
          <button class="day ${i === next ? "next" : ""}" data-start="${i}">
            <span class="n">${i + 1}</span>
            <span><b>${d.name}</b> ${i === next ? '<span class="pill">Siguiente</span>' : ""}</span>
            <span class="when">${lastByDay[i] ? ago(lastByDay[i]) : "sin hacer"}</span>
            <span class="muted small">${d.sub} · ${d.ex.length} ejercicios</span>
          </button>`).join("")}</div>`;
      return;
    }
    const plan = DAYS[s.day];
    $("#title").textContent = plan.name;
    let doneEx = 0;
    const cards = plan.ex.map(([id, planSets, lo, hi, note]) => {
      const ex = EXERCISES[id];
      const sets = s.entries[id] || (s.entries[id] = []);
      const nDone = sets.filter(x => x.done).length;
      const complete = nDone >= planSets;
      if (complete) doneEx++;
      const open = ui.open === id;
      const unit = ex.unit === "s" ? "seg" : "reps";
      const last = S.lastFor(id, s.id);
      let lastTxt = "", hint = "";
      if (last) {
        const ws = [...new Set(last.sets.map(x => fmtW(x.w)))].filter(Boolean);
        lastTxt = `<div class="last">Última vez (${dateShort(last.session.start)}): <b>${ws.length ? ws.join("/") + " kg · " : ""}${last.sets.map(x => x.r).join("-")}</b></div>`;
        if (last.sets.length >= planSets && last.sets.every(x => x.r >= hi)) {
          hint = ex.w0 == null ? `<div class="hint">Llegaste al tope del rango: añade repeticiones o una variante más difícil.</div>`
            : ex.assisted ? `<div class="hint">Llegaste al tope del rango: baja la asistencia.</div>`
            : `<div class="hint">Llegaste al tope del rango: sube el peso y vuelve a ${lo} ${unit}.</div>`;
        }
      }
      const wLabel = ex.assisted ? "asist. kg" : ex.perSide ? "kg c/u" : "kg";
      return `<section class="ex ${complete ? "done" : ""}" data-ex="${id}">
        <button class="ex-head" data-toggle="${id}" aria-expanded="${open}">
          <h3>${esc(ex.n)}</h3><span class="count">${nDone}/${planSets}</span>
          <span class="meta">${planSets} × ${lo === hi ? lo : lo + "-" + hi} ${unit}${note ? " · " + esc(note) : ""}</span>
        </button>
        ${open ? `<div class="ex-body">
          <div class="ex-info">${bodySVG(ex.p, ex.s)}<div><ul>${ex.t.map(t => `<li>${esc(t)}</li>`).join("")}</ul></div></div>
          ${lastTxt}${hint}
          <div class="sethead"><span>#</span><span>${ex.w0 == null ? "lastre kg" : wLabel}</span><span>${unit}</span><span></span></div>
          <div class="sets">${sets.map((x, i) => `
            <div class="set ${x.done ? "ok" : ""}">
              <span class="i">${i + 1}</span>
              <input id="w-${id}-${i}" data-w="${id}:${i}" inputmode="decimal" value="${fmtW(x.w)}" placeholder="${ex.w0 == null ? "0" : "kg"}" aria-label="Peso serie ${i + 1}">
              <input id="r-${id}-${i}" data-r="${id}:${i}" inputmode="numeric" value="${x.r ?? ""}" placeholder="${last && last.sets[i] ? last.sets[i].r : hi}" aria-label="${unit} serie ${i + 1}">
              <button class="check" data-done="${id}:${i}" aria-label="Marcar serie ${i + 1}" aria-pressed="${x.done}">${CHECK}</button>
            </div>`).join("")}</div>
          <div class="row"><button class="chip" data-addset="${id}">+ Serie</button>${sets.length > 1 ? `<button class="chip" data-delset="${id}">− Serie</button>` : ""}
          ${ex.assisted ? '<span class="muted small">Menos asistencia = más fuerza</span>' : ""}</div>
        </div>` : ""}
      </section>`;
    }).join("");
    const pct = Math.round(doneEx / plan.ex.length * 100);
    const conf = ui.confirm === "discard" ? `<div class="confirm"><b>¿Descartar este entrenamiento?</b><span class="small">Se borran las series que has marcado hoy.</span>
        <div class="row"><button class="btn danger" data-act="discard-yes">Descartar</button><button class="btn ghost" data-act="cancel">Volver</button></div></div>` : "";
    view.innerHTML = `<div class="session-head"><span class="muted small">${doneEx} de ${plan.ex.length} ejercicios</span><span class="muted small">${plan.sub}</span></div>
      <div class="progressbar"><div style="width:${pct}%"></div></div>
      ${cards}
      ${conf}
      <div class="row"><button class="btn" data-act="finish">Terminar entrenamiento</button><button class="btn ghost" data-act="discard">Descartar</button></div>`;
  }

  view.addEventListener("click", e => {
    const t = e.target.closest("button");
    if (!t) return;
    const s = S.activeSession();
    if (t.dataset.start) return startSession(+t.dataset.start);
    if (t.dataset.toggle) { ui.open = ui.open === t.dataset.toggle ? null : t.dataset.toggle; render(); const el = document.querySelector(`[data-ex="${t.dataset.toggle}"]`); if (el && ui.open) el.scrollIntoView({ block: "nearest" }); return; }
    if (t.dataset.done && s) {
      const [id, i] = t.dataset.done.split(":"); const set = s.entries[id][+i];
      readInputs(id);
      if (!set.done) {
        if (set.r == null) { const ph = document.getElementById(`r-${id}-${i}`); set.r = parseNum(ph && ph.placeholder); }
        set.done = true;
        const plan = DAYS[s.day].ex.find(x => x[0] === id);
        const allDone = s.entries[id].filter(x => x.done).length >= plan[1] && s.entries[id].every(x => x.done);
        if (allDone) { const idx = DAYS[s.day].ex.indexOf(plan); const nx = DAYS[s.day].ex.slice(idx + 1).find(x => !(s.entries[x[0]] || []).some(y => y.done)); if (nx) ui.open = nx[0]; }
      } else set.done = false;
      S.save(); render(); return;
    }
    if (t.dataset.addset && s) { const a = s.entries[t.dataset.addset]; readInputs(t.dataset.addset); const p = a[a.length - 1]; a.push({ w: p ? p.w : null, r: null, done: false }); S.save(); render(); return; }
    if (t.dataset.delset && s) { const a = s.entries[t.dataset.delset]; readInputs(t.dataset.delset); a.pop(); S.save(); render(); return; }
    const act = t.dataset.act;
    if (act === "finish" && s) {
      s.end = new Date().toISOString();
      for (const k in s.entries) { s.entries[k] = s.entries[k].filter(x => x.done); if (!s.entries[k].length) delete s.entries[k]; }
      if (!Object.keys(s.entries).length) { S.data.sessions = S.data.sessions.filter(x => x.id !== s.id); toast("No había series marcadas: no se ha guardado."); }
      else toast("Entrenamiento guardado");
      S.data.active = null; S.save(); releaseWakeLock(); ui.open = null; render(); window.scrollTo(0, 0); return;
    }
    if (act === "discard") { ui.confirm = "discard"; render(); return; }
    if (act === "discard-yes" && s) { S.data.sessions = S.data.sessions.filter(x => x.id !== s.id); S.data.active = null; S.save(); ui.confirm = null; releaseWakeLock(); render(); toast("Entrenamiento descartado"); return; }
    if (act === "cancel") { ui.confirm = null; render(); return; }
    if (act === "del-session") { ui.confirm = "del:" + t.dataset.id; render(); return; }
    if (act === "del-yes") { S.data.sessions = S.data.sessions.filter(x => x.id !== t.dataset.id); S.save(); ui.confirm = null; render(); toast("Sesión borrada"); return; }
    if (act === "export") return doExport();
    if (act === "import") return $("#importfile").click();
    if (act === "reset") { ui.confirm = "reset"; render(); return; }
    if (act === "reset-yes") { S.reset(); ui.confirm = null; render(); toast("Datos borrados"); return; }
    if (act === "seed") { S.seedDemo(); releaseWakeLock(); toast("Datos de ejemplo cargados"); render(); return; }
    if (act === "install" && deferredInstall) { deferredInstall.prompt(); deferredInstall = null; return; }
    if (act === "update") return checkUpdate(true);
  });

  /* Guarda lo escrito en los campos al salir de ellos */
  view.addEventListener("change", e => {
    const t = e.target, s = S.activeSession();
    if (s && (t.dataset.w || t.dataset.r)) {
      const [id, i] = (t.dataset.w || t.dataset.r).split(":");
      const set = s.entries[id][+i];
      if (t.dataset.w) {
        set.w = parseNum(t.value);
        /* Si cambias el peso de una serie, las siguientes sin marcar lo copian */
        s.entries[id].forEach((x, j) => { if (j > +i && !x.done) x.w = set.w; });
        s.entries[id].forEach((x, j) => { const el = document.getElementById(`w-${id}-${j}`); if (el && j > +i && !x.done) el.value = fmtW(x.w); });
      } else set.r = parseNum(t.value);
      S.save();
    }
    if (t.id === "progEx") { ui.progEx = t.value; renderProgress(); }
    if (t.id === "importfile" && t.files[0]) {
      const r = new FileReader();
      r.onload = () => { try { const n = S.importJSON(r.result); toast(`Copia restaurada: ${n} sesiones`); render(); } catch (err) { toast(err.message || "No se pudo leer el archivo"); } };
      r.readAsText(t.files[0]);
    }
  });
  function readInputs(id) {
    const s = S.activeSession(); if (!s) return;
    s.entries[id].forEach((x, i) => {
      const w = document.getElementById(`w-${id}-${i}`), r = document.getElementById(`r-${id}-${i}`);
      if (w) x.w = parseNum(w.value);
      if (r) x.r = parseNum(r.value);
    });
  }

  /* Mantener la pantalla encendida durante el entrenamiento */
  let wake = null;
  async function requestWakeLock() { try { if ("wakeLock" in navigator && S.activeSession()) wake = await navigator.wakeLock.request("screen"); } catch (e) { } }
  function releaseWakeLock() { try { wake && wake.release(); } catch (e) { } wake = null; }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") requestWakeLock(); });

  /* ---------- Progreso ---------- */
  function renderProgress() {
    $("#title").textContent = "Progreso";
    const fin = S.finished();
    if (!fin.length) { view.innerHTML = `<div class="empty">Aún no hay entrenamientos terminados.<br>Cuando completes el primero verás aquí tu evolución.</div>`; return; }
    const weekAgo = Date.now() - 7 * 864e5;
    const thisWeek = fin.filter(s => new Date(s.start) > weekAgo).length;
    const last = fin.reduce((a, s) => s.start > a ? s.start : a, "");
    const used = new Set(); fin.forEach(s => Object.keys(s.entries).forEach(k => used.add(k)));
    if (!ui.progEx || !used.has(ui.progEx)) ui.progEx = DAYS.flatMap(d => d.ex.map(x => x[0])).find(id => used.has(id));
    const seen = new Set();
    const opts = DAYS.map(d => `<optgroup label="${d.name}">${d.ex.filter(([id]) => used.has(id) && !seen.has(id) && seen.add(id)).map(([id]) => `<option value="${id}" ${id === ui.progEx ? "selected" : ""}>${esc(EXERCISES[id].n)}</option>`).join("")}</optgroup>`).join("");
    const ex = EXERCISES[ui.progEx];
    const ser = S.seriesFor(ui.progEx);
    const bw = ex.w0 == null;
    const pts = ser.map(p => ({ x: new Date(p.date).getTime(), y: bw ? p.reps.reduce((a, b) => a + b, 0) : p.top, y2: bw || ex.assisted ? null : p.e1rm }));
    const first = ser[0], lastP = ser[ser.length - 1];
    let delta = "";
    if (first && lastP && ser.length > 1) {
      const d = bw ? pts[pts.length - 1].y - pts[0].y : lastP.top - first.top;
      const good = ex.assisted ? d < 0 : d > 0;
      delta = `<span class="${good ? "hint" : "muted"} small">${d > 0 ? "+" : ""}${fmtW(d)} ${bw ? (ex.unit === "s" ? "s" : "reps") : "kg"} desde ${dateShort(first.date)}</span>`;
    }
    view.innerHTML = `
      <div class="stats">
        <div class="stat"><span class="label">Esta semana</span><b>${thisWeek}</b></div>
        <div class="stat"><span class="label">Total</span><b>${fin.length}</b></div>
        <div class="stat"><span class="label">Último</span><b style="font-size:1rem;padding-top:6px">${ago(last)}</b></div>
      </div>
      <label class="field"><span class="label">Ejercicio</span><select id="progEx" class="big">${opts}</select></label>
      <div class="card">
        <div class="row" style="justify-content:space-between"><h2>${bw ? (ex.unit === "s" ? "Segundos totales" : "Repeticiones totales") : ex.assisted ? "Asistencia (menos es mejor)" : "Peso máximo"}</h2>${delta}</div>
        ${pts.length ? chartSVG(pts, ex.assisted) : '<p class="muted">Sin datos.</p>'}
        <div class="legend"><span><i></i>${bw ? "Total" : ex.assisted ? "Asistencia" : "Peso máximo"}</span>${pts.some(p => p.y2) ? '<span><i class="l2"></i>1RM estimado</span>' : ""}</div>
      </div>
      <div class="card"><h2>Sesiones</h2>
        <div style="overflow-x:auto"><table><thead><tr><th>Fecha</th><th>Peso</th><th>Reps</th></tr></thead><tbody>
        ${ser.slice().reverse().slice(0, 12).map(p => `<tr><td>${dateShort(p.date)}</td><td class="num">${[...new Set(p.sets.map(x => fmtW(x.w)))].join("/") || "—"}</td><td class="num">${p.reps.join("-")}</td></tr>`).join("")}
        </tbody></table></div></div>`;
  }

  function chartSVG(pts, invert) {
    const W = 340, H = 190, L = 38, R = 12, T = 12, B = 24;
    const ys = pts.flatMap(p => [p.y, p.y2]).filter(v => v != null);
    let lo = Math.min(...ys), hi = Math.max(...ys);
    if (lo === hi) { lo -= 5; hi += 5; }
    const step = niceStep((hi - lo) / 4);
    lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
    const x0 = pts[0].x, x1 = pts[pts.length - 1].x || x0 + 1;
    const X = x => pts.length === 1 ? (L + W - R) / 2 : L + (x - x0) / (x1 - x0) * (W - L - R);
    const Y = y => T + (1 - (y - lo) / (hi - lo)) * (H - T - B);
    let grid = "";
    for (let v = lo; v <= hi + 1e-9; v += step) grid += `<line class="grid" x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${L - 6}" y="${Y(v) + 3}" text-anchor="end">${fmtW(v)}</text>`;
    const line = pts.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(" ");
    const area = `${line} L${X(pts[pts.length - 1].x).toFixed(1)} ${H - B} L${X(pts[0].x).toFixed(1)} ${H - B} Z`;
    const p2 = pts.filter(p => p.y2 != null);
    const line2 = p2.length ? `<path class="line2" d="${p2.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)} ${Y(p.y2).toFixed(1)}`).join(" ")}"/>` : "";
    const dots = pts.map(p => `<circle class="dot" cx="${X(p.x)}" cy="${Y(p.y)}" r="2.5"/>`).join("");
    const e = pts[pts.length - 1];
    const xl = `<text x="${L}" y="${H - 6}">${dateShort(new Date(pts[0].x).toISOString())}</text><text x="${W - R}" y="${H - 6}" text-anchor="end">${dateShort(new Date(e.x).toISOString())}</text>`;
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución">${grid}${invert ? "" : `<path class="area" d="${area}"/>`}${line2}<path class="line" d="${line}"/>${dots}<circle class="end" cx="${X(e.x)}" cy="${Y(e.y)}" r="5"/>${xl}</svg>`;
  }
  function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(raw || 1))); const n = raw / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }

  /* ---------- Historial ---------- */
  function renderHistory() {
    $("#title").textContent = "Historial";
    const list = S.finished().sort((a, b) => b.start.localeCompare(a.start));
    if (!list.length) { view.innerHTML = `<div class="empty">Todavía no hay entrenamientos guardados.</div>`; return; }
    view.innerHTML = list.slice(0, 120).map(s => {
      const mins = Math.round((new Date(s.end) - new Date(s.start)) / 6e4);
      const nSets = Object.values(s.entries).reduce((a, x) => a + x.length, 0);
      const conf = ui.confirm === "del:" + s.id;
      return `<details class="hist" ${conf ? "open" : ""}><summary><span><b>${DAYS[s.day] ? DAYS[s.day].name : "Día " + (s.day + 1)}</b><br><span class="muted small">${dateLong(s.start)}</span></span><span class="muted small" style="text-align:right">${mins} min<br>${nSets} series</span></summary>
        <div class="det">${Object.entries(s.entries).map(([id, sets]) => `<div class="l"><span>${esc(EXERCISES[id] ? EXERCISES[id].n : id)}</span><span>${sets.map(x => (x.w ? fmtW(x.w) + "×" : "") + x.r).join(" · ")}</span></div>`).join("")}
        ${conf ? `<div class="confirm"><b>¿Borrar esta sesión?</b><div class="row"><button class="btn danger" data-act="del-yes" data-id="${s.id}">Borrar</button><button class="btn ghost" data-act="cancel">Volver</button></div></div>`
          : `<div><button class="chip" data-act="del-session" data-id="${s.id}">Borrar sesión</button></div>`}</div></details>`;
    }).join("");
  }

  /* ---------- Ajustes ---------- */
  function renderSettings() {
    $("#title").textContent = "Ajustes";
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    view.innerHTML = `
      <div class="card"><h2>Copia de seguridad</h2>
        <p class="small muted" style="margin:0">Tus datos viven en este móvil. Exporta de vez en cuando y guarda el archivo en OneDrive (en el menú de compartir elige OneDrive).</p>
        <div class="row"><button class="btn" data-act="export">Exportar</button><button class="btn ghost" data-act="import">Importar</button></div>
        <input id="importfile" type="file" accept="application/json,.json" hidden>
      </div>
      ${standalone ? "" : `<div class="card"><h2>Instalar</h2>
        ${deferredInstall ? '<button class="btn" data-act="install">Instalar en el móvil</button>' :
          `<p class="small" style="margin:0">${ios ? "En Safari: botón Compartir → «Añadir a pantalla de inicio»." : "En Chrome: menú ⋮ → «Instalar aplicación» o «Añadir a pantalla de inicio»."}</p>`}</div>`}
      <div class="card"><h2>Acerca de</h2>
        <p class="small" style="margin:0">Versión <b>${self.APP_VERSION}</b> · entorno <b>${S.ENV === "dev" ? "desarrollo" : "producción"}</b> · ${S.data.sessions.filter(s => s.end).length} sesiones guardadas</p>
        ${S.ENV === "prod" ? '<button class="btn ghost" data-act="update">Buscar actualización</button>' : '<button class="btn ghost" data-act="seed">Cargar datos de ejemplo (solo desarrollo)</button>'}
      </div>
      ${ui.confirm === "reset" ? `<div class="confirm"><b>¿Borrar todos los datos de este entorno?</b><span class="small">No se puede deshacer. Exporta antes si quieres conservarlos.</span>
        <div class="row"><button class="btn danger" data-act="reset-yes">Borrar todo</button><button class="btn ghost" data-act="cancel">Volver</button></div></div>`
        : '<button class="btn danger" data-act="reset">Borrar todos los datos</button>'}`;
  }

  async function doExport() {
    const name = `gym-${S.ENV === "dev" ? "dev-" : ""}backup-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([S.exportJSON()], { type: "application/json" });
    try {
      const file = new File([blob], name, { type: "application/json" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Copia de Gym" }); return; }
    } catch (e) { if (e && e.name === "AbortError") return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast("Copia descargada");
  }

  /* ---------- Avisos ---------- */
  let toastT;
  function toast(msg, action) {
    const el = $("#toast"); el.innerHTML = `<span>${esc(msg)}</span>`;
    if (action) { const b = document.createElement("button"); b.textContent = action.label; b.onclick = () => { el.hidden = true; action.fn(); }; el.appendChild(b); }
    el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, action ? 15000 : 2600);
  }

  /* ---------- PWA: instalación y actualizaciones (solo producción) ---------- */
  let deferredInstall = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; if (ui.tab === "settings") render(); });
  let reg = null;
  if ("serviceWorker" in navigator) {
    if (S.ENV === "prod") {
      navigator.serviceWorker.register("sw.js").then(r => {
        reg = r;
        const offer = w => toast("Hay una versión nueva", { label: "Actualizar", fn: () => w.postMessage("skipWaiting") });
        if (r.waiting && navigator.serviceWorker.controller) offer(r.waiting);
        r.addEventListener("updatefound", () => { const w = r.installing; w && w.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) offer(w); }); });
      }).catch(err => console.warn("SW", err));
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => { if (!reloaded) { reloaded = true; location.reload(); } });
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
    } else {
      /* En desarrollo no se cachea nada: siempre ves el último código */
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
    }
  }
  function checkUpdate(manual) { if (!reg) return toast("Sin service worker"); reg.update().then(() => { if (manual && !reg.waiting && !reg.installing) toast("Ya tienes la última versión"); }); }

  if (S.activeSession()) { ui.open = null; requestWakeLock(); }
  render();
})();
