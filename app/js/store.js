/* Almacenamiento local. Desarrollo y producción usan claves distintas,
   así las pruebas nunca tocan tus datos reales. */
(function () {
  const h = location.hostname;
  const isDev = h === "localhost" || h === "127.0.0.1" || h === "[::1]" || /^(10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(h) || location.protocol === "file:";
  const ENV = isDev ? "dev" : "prod";
  const KEY = `gym:${ENV}:v1`;
  const SCHEMA = 1;

  const empty = () => ({ schema: SCHEMA, sessions: [], active: null, settings: { restBig: 150, restSmall: 75, sound: true, vibrate: true } });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      const d = JSON.parse(raw);
      const base = empty();
      return { ...base, ...d, settings: { ...base.settings, ...(d.settings || {}) } };
    } catch (e) { return empty(); }
  }

  const Store = {
    ENV, KEY,
    data: load(),
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); return true; }
      catch (e) { console.error("No se pudo guardar", e); return false; }
    },
    finished() { return this.data.sessions.filter(s => s.end); },
    activeSession() { return this.data.sessions.find(s => s.id === this.data.active) || null; },

    /* Última sesión terminada que incluye el ejercicio (con al menos una serie hecha) */
    lastFor(exId, excludeId) {
      const list = this.finished().filter(s => s.id !== excludeId).sort((a, b) => b.start.localeCompare(a.start));
      for (const s of list) {
        const sets = (s.entries[exId] || []).filter(x => x.done);
        if (sets.length) return { session: s, sets };
      }
      return null;
    },

    /* Serie temporal para gráficas: una entrada por sesión */
    seriesFor(exId) {
      return this.finished().sort((a, b) => a.start.localeCompare(b.start)).map(s => {
        const sets = (s.entries[exId] || []).filter(x => x.done && x.r > 0);
        if (!sets.length) return null;
        const ws = sets.map(x => x.w || 0);
        const top = EXERCISES[exId] && EXERCISES[exId].assisted ? Math.min(...ws) : Math.max(...ws);
        const e1rm = Math.max(...sets.map(x => (x.w || 0) * (1 + x.r / 30)));
        const vol = sets.reduce((a, x) => a + (x.w || 0) * x.r, 0);
        const reps = sets.map(x => x.r);
        return { date: s.start, top, e1rm, vol, reps, sets };
      }).filter(Boolean);
    },

    exportJSON() {
      return JSON.stringify({ app: "gym", env: ENV, version: self.APP_VERSION, exported: new Date().toISOString(), data: this.data }, null, 2);
    },
    importJSON(text) {
      const obj = JSON.parse(text);
      const d = obj && obj.data ? obj.data : obj;
      if (!d || !Array.isArray(d.sessions)) throw new Error("El archivo no tiene el formato de copia de Gym.");
      const base = empty();
      this.data = { ...base, ...d, settings: { ...base.settings, ...(d.settings || {}) } };
      this.save();
      return this.data.sessions.length;
    },
    reset() { this.data = empty(); this.save(); },

    /* Solo desarrollo: 8 semanas de datos inventados para probar gráficas */
    seedDemo() {
      const now = Date.now(), DAY = 864e5;
      const sessions = [];
      let k = 0;
      for (let wk = 8; wk >= 1; wk--) {
        for (let d = 0; d < 5; d++) {
          const start = new Date(now - (wk * 7 - d * 1.4) * DAY);
          const plan = DAYS[d];
          const entries = {};
          plan.ex.forEach(([id, sets, lo, hi]) => {
            const ex = EXERCISES[id];
            const prog = 8 - wk;
            const w = ex.w0 == null ? 0 : Math.max(2.5, ex.assisted ? ex.w0 - prog * 1.25 : ex.w0 + Math.floor(prog / 2) * 2.5);
            entries[id] = Array.from({ length: sets }, (_, i) => ({ w, r: Math.max(lo, Math.min(hi, lo + (prog % 3) + 1 - i)), done: true }));
          });
          sessions.push({ id: "demo" + (k++), day: d, start: start.toISOString(), end: new Date(start.getTime() + 70 * 6e4).toISOString(), entries });
        }
      }
      this.data.sessions = sessions; this.data.active = null; this.save();
    }
  };
  window.Store = Store;
})();
