/* Mapa muscular SVG (vista frontal centrada en x=50, trasera en x=160). */
window.MUSCLES = {
  chest: "Pecho", frontDelt: "Deltoide anterior", sideDelt: "Deltoide lateral", rearDelt: "Deltoide posterior",
  traps: "Trapecio", lats: "Dorsal", midback: "Espalda media", biceps: "Bíceps", triceps: "Tríceps",
  forearms: "Antebrazo", abs: "Abdominales", obliques: "Oblicuos", lowback: "Lumbar", glutes: "Glúteo",
  quads: "Cuádriceps", adductors: "Aductores", hamstrings: "Isquiotibiales", calves: "Gemelos"
};

(function () {
  const e = (m, cx, cy, rx, ry) => `<ellipse data-m="${m}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
  const pair = (m, cx, cy, rx, ry, c) => e(m, cx, cy, rx, ry) + e(m, 2 * c - cx, cy, rx, ry);
  const base = c => `<g class="b"><circle cx="${c}" cy="14" r="9"/><rect x="${c - 4}" y="21" width="8" height="9"/>` +
    `<rect x="${c - 18}" y="29" width="36" height="58" rx="10"/><rect x="${c - 14}" y="84" width="28" height="18" rx="6"/>` +
    `<circle cx="${c - 28}" cy="94" r="4"/><circle cx="${c + 28}" cy="94" r="4"/><circle cx="${c - 8}" cy="142" r="4.5"/>` +
    `<circle cx="${c + 8}" cy="142" r="4.5"/><ellipse cx="${c - 9}" cy="186" rx="5" ry="3"/><ellipse cx="${c + 9}" cy="186" rx="5" ry="3"/></g>`;
  const front = base(50) + pair("sideDelt", 27, 41, 4, 7, 50) + pair("frontDelt", 33, 37, 6, 6, 50) + pair("chest", 43, 44, 9, 7, 50) +
    pair("biceps", 27, 57, 5, 10, 50) + pair("forearms", 24, 78, 4.5, 11, 50) + pair("obliques", 37.5, 68, 4, 12, 50) +
    `<rect data-m="abs" x="43" y="53" width="14" height="32" rx="4"/>` + pair("quads", 42, 119, 7, 20, 50) +
    pair("adductors", 46.5, 110, 2.6, 12, 50) + pair("calves", 41, 163, 5, 14, 50);
  const back = base(160) + pair("sideDelt", 137, 41, 4, 7, 160) + pair("rearDelt", 143, 38, 6, 6, 160) +
    `<path data-m="lats" d="M146 46 Q139 62 148 83 L157 83 L157 58 Z"/><path data-m="lats" d="M174 46 Q181 62 172 83 L163 83 L163 58 Z"/>` +
    pair("midback", 152.5, 49, 5, 6.5, 160) + `<path data-m="traps" d="M151 25 L169 25 L177 35 L160 57 L143 35 Z"/>` +
    pair("triceps", 137, 57, 5, 10, 160) + pair("forearms", 134, 78, 4.5, 11, 160) +
    `<rect data-m="lowback" x="153" y="70" width="14" height="16" rx="4"/>` + pair("glutes", 153, 96, 8, 8, 160) +
    pair("hamstrings", 152, 124, 7, 17, 160) + pair("calves", 151, 161, 6, 14, 160);
  const SHAPES = front + back;

  window.bodySVG = function (p, s) {
    const id = "b" + Math.random().toString(36).slice(2, 8);
    const rules = p.map(m => `#${id} [data-m="${m}"]{fill:var(--accent)}`)
      .concat(s.filter(m => !p.includes(m)).map(m => `#${id} [data-m="${m}"]{fill:var(--accent-soft)}`));
    return `<svg id="${id}" class="body" viewBox="0 0 210 192" role="img" aria-label="Músculos: ${p.map(m => MUSCLES[m]).join(", ")}">` +
      `<style>#${id} .b *,#${id} [data-m]{fill:var(--body);stroke:var(--body-edge);stroke-width:.6}${rules.join("")}</style>${SHAPES}</svg>`;
  };
})();
