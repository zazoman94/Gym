/* Rutina: ejercicios y días.
   p = músculos principales, s = secundarios (claves de MUSCLES en body.js)
   w0 = peso de partida en kg (null = peso corporal)
   assisted = máquina asistida: MENOS peso es MEJOR
   unit = 'reps' (por defecto) o 's' (segundos, isométricos) */
window.EXERCISES = {
  "press-plano-smith": { n: "Press de banca plano en Smith", p: ["chest"], s: ["frontDelt", "triceps"], w0: 30,
    t: ["Escápulas juntas y hacia abajo, ligero arco en la espalda.", "Baja la barra a la parte baja del pecho con los codos a 45-60°.", "Sube sin rebotar la barra en el pecho."] },
  "press-incl-manc": { n: "Press inclinado con mancuernas", p: ["chest"], s: ["frontDelt", "triceps"], w0: 12.5, perSide: true,
    t: ["Banco a 30-45°.", "Baja hasta notar estiramiento en el pecho.", "Acerca las mancuernas arriba sin chocarlas."] },
  "aperturas-maquina": { n: "Aperturas en máquina", p: ["chest"], s: ["frontDelt"], w0: 30,
    t: ["Codos ligeramente flexionados y fijos.", "Abre hasta un estiramiento cómodo.", "Aprieta 1 segundo con los brazos cerrados."] },
  "militar-manc": { n: "Press militar con mancuernas sentado", p: ["frontDelt", "sideDelt"], s: ["triceps", "traps"], w0: 10, perSide: true,
    t: ["Respaldo vertical o casi.", "Empieza con las mancuernas a la altura de las orejas.", "Sube sin bloquear del todo los codos."] },
  "elev-lateral": { n: "Elevación lateral con mancuernas", p: ["sideDelt"], s: ["traps"], w0: 5, perSide: true,
    t: ["Sube hasta la altura del hombro, no más.", "Lidera con el codo, ligeramente flexionado.", "Sin balanceo: si necesitas impulso, baja el peso."] },
  "triceps-polea": { n: "Extensión de tríceps en polea", p: ["triceps"], s: ["forearms"], w0: 22,
    t: ["Codos pegados al cuerpo y quietos.", "Extiende del todo y aprieta abajo.", "Controla la subida."] },
  /* El id se conserva por compatibilidad con sesiones ya guardadas (antes era la extensión sobre la cabeza) */
  "triceps-largo-polea": { n: "Skullcrusher en polea a una mano", p: ["triceps"], s: [], w0: 7.5, perSide: true,
    t: ["Tumbado en banco plano, con la cabeza hacia la polea baja.", "Codo apuntando al techo y quieto; solo se mueve el antebrazo.", "Baja la mano hacia la frente y extiende del todo."] },
  "jalon": { n: "Jalón al pecho", p: ["lats"], s: ["biceps", "midback", "rearDelt"], w0: 50,
    t: ["Pecho arriba y ligera inclinación hacia atrás.", "Tira llevando los codos hacia abajo y atrás.", "Barra a la parte alta del pecho; sube controlado."] },
  "remo-sentado": { n: "Remo sentado en polea, agarre neutro", p: ["midback", "lats"], s: ["biceps", "rearDelt"], w0: 50,
    t: ["Espalda recta, sin balancear el tronco.", "Tira hacia el ombligo.", "Junta las escápulas al final."] },
  "remo-manc": { n: "Remo con mancuerna a una mano", p: ["lats", "midback"], s: ["biceps", "rearDelt"], w0: 12.5, perSide: true,
    t: ["Mano y rodilla del mismo lado apoyadas en el banco.", "Espalda plana, paralela al suelo.", "Tira llevando la mancuerna hacia la cadera."] },
  "face-pull": { n: "Face pull con cuerda", p: ["rearDelt"], s: ["midback", "traps"], w0: 22,
    t: ["Polea a la altura de la cara.", "Tira separando la cuerda hacia las orejas.", "Codos altos todo el movimiento."] },
  "curl-inclinado": { n: "Curl con mancuernas en banco inclinado", p: ["biceps"], s: [], w0: 10, perSide: true,
    t: ["Banco a 45-60°, brazos colgando por detrás del cuerpo.", "No adelantes el codo al subir.", "Baja del todo para estirar el bíceps."] },
  "curl-martillo": { n: "Curl martillo con mancuernas", p: ["biceps", "forearms"], s: [], w0: 12.5, perSide: true,
    t: ["Agarre neutro (palmas mirándose).", "Codos fijos a los lados.", "Sin balancear el cuerpo."] },
  "antebrazo-polea": { n: "Antebrazo en polea", p: ["forearms"], s: [], w0: 7.5,
    t: ["Antebrazo quieto; solo se mueve la muñeca.", "Rango completo, bajando del todo."] },
  "sentadilla-manc": { n: "Sentadilla goblet con mancuerna", p: ["quads", "glutes"], s: ["adductors", "abs"], w0: 12.5,
    t: ["Mancuerna pegada al pecho, tronco erguido.", "Rodillas en la dirección de la punta de los pies.", "Si 12 reps son fáciles, pasa a más peso o a la Smith."] },
  "pm-polea": { n: "Peso muerto en polea baja", p: ["hamstrings", "glutes"], s: ["lowback"], w0: 35,
    t: ["Bisagra: la cadera va hacia atrás.", "Rodillas algo flexionadas, espalda neutra.", "Baja hasta notar estiramiento detrás del muslo."] },
  "ext-piernas": { n: "Extensión de piernas en máquina", p: ["quads"], s: [], w0: 55,
    t: ["Rodilla alineada con el eje de la máquina.", "Pausa breve arriba, baja controlado."] },
  "curl-femoral-polea": { n: "Curl femoral en polea", p: ["hamstrings"], s: ["calves"], w0: 10,
    t: ["Cadera quieta, sin arquear la espalda.", "Lleva el talón al glúteo y baja despacio."] },
  "zancada": { n: "Zancadas con mancuernas", p: ["quads", "glutes"], s: ["adductors", "hamstrings"], w0: 7.5, perSide: true,
    t: ["Paso largo, tronco erguido.", "La rodilla trasera baja casi al suelo.", "Empuja con el talón delantero."] },
  "aductor-polea": { n: "Aductor en polea", p: ["adductors"], s: [], w0: 7.5,
    t: ["Tobillera en la pierna más cercana a la polea.", "Cruza la pierna por delante de forma controlada."] },
  "gemelo-pie": { n: "Gemelo de pie en Smith", p: ["calves"], s: [], w0: 35,
    t: ["Antepié sobre un disco o escalón.", "Baja del todo, pausa 1 s y sube hasta la punta."] },
  "gemelo-sentado": { n: "Gemelo sentado en Smith (sóleo)", p: ["calves"], s: [], w0: 35,
    t: ["Barra sobre las rodillas con almohadilla.", "Rango completo con pausa abajo."] },
  "abdominales": { n: "Abdominales", p: ["abs"], s: ["obliques"], w0: null,
    t: ["Enrolla la columna; no tires del cuello.", "Controla la bajada."] },
  "isometricos": { n: "Plancha (isométrico)", p: ["abs", "obliques"], s: ["lowback"], w0: null, unit: "s",
    t: ["Cuerpo en línea recta, glúteos apretados.", "Para cuando pierdas la posición."] },
  "press-incl-smith": { n: "Press de banca inclinado en Smith", p: ["chest"], s: ["frontDelt", "triceps"], w0: 20,
    t: ["Banco a 30-45°.", "Baja la barra a la parte alta del pecho.", "Escápulas juntas todo el recorrido."] },
  "dips": { n: "Fondos en paralelas asistidos", p: ["chest", "triceps"], s: ["frontDelt"], w0: 25, assisted: true,
    t: ["Inclina el tronco hacia delante para dar más trabajo al pecho.", "Baja hasta que el hombro quede a la altura del codo.", "Progresar es REDUCIR la asistencia."] },
  "doble-polea": { n: "Cruce de poleas", p: ["chest"], s: ["frontDelt"], w0: 15,
    t: ["Un paso adelante, ligera inclinación.", "Junta las manos delante del pecho en arco.", "Codos ligeramente flexionados y fijos."] },
  "tiron-lateral-polea": { n: "Tirón en polea baja con cuerda", p: ["sideDelt"], s: ["traps"], w0: 20,
    t: ["Codos hacia fuera y arriba.", "Para cuando los codos lleguen a la altura de los hombros."] },
  "maquina-triceps": { n: "Máquina de tríceps", p: ["triceps"], s: [], w0: 40,
    t: ["Codos alineados con el eje de la máquina.", "Extiende del todo y controla la vuelta."] },
  "triceps-tras-nuca": { n: "Extensión de tríceps con mancuerna tras la cabeza", p: ["triceps"], s: [], w0: 12.5,
    t: ["Mancuerna sujeta con ambas manos.", "Codos hacia arriba, sin abrirse.", "Baja hasta notar estiramiento."] },
  "flexiones": { n: "Flexiones", p: ["chest"], s: ["triceps", "frontDelt", "abs"], w0: null,
    t: ["Solo si te queda energía.", "Cuerpo recto, pecho casi al suelo."] },
  "dominada-asistida": { n: "Dominada asistida", p: ["lats"], s: ["biceps", "midback"], w0: 30, assisted: true,
    t: ["Empieza colgando con los brazos estirados.", "Sube hasta que la barbilla pase la barra.", "Progresar es REDUCIR la asistencia."] },
  "jalon-inclinado": { n: "Jalón al pecho, variante inclinada", p: ["lats", "midback"], s: ["biceps", "rearDelt"], w0: 45,
    t: ["Tronco más inclinado hacia atrás que en el jalón normal.", "Tira hacia la parte baja del pecho juntando escápulas."] },
  "maquina-curl": { n: "Máquina de curl", p: ["biceps"], s: [], w0: 30,
    t: ["Brazos bien apoyados en el soporte.", "Baja hasta casi estirar del todo."] }
};

/* Días: [id, series, repsMin, repsMax, nota] */
window.DAYS = [
  { name: "Empuje A", sub: "Pecho · Hombro · Tríceps", ex: [
    ["press-plano-smith", 3, 6, 10], ["press-incl-manc", 3, 8, 12], ["aperturas-maquina", 3, 12, 15],
    ["militar-manc", 3, 8, 12], ["elev-lateral", 3, 12, 20], ["triceps-polea", 3, 10, 15], ["triceps-largo-polea", 2, 10, 15, "por brazo"]] },
  { name: "Tirón A", sub: "Espalda · Bíceps", ex: [
    ["jalon", 4, 8, 12], ["remo-sentado", 3, 8, 12], ["remo-manc", 3, 8, 12], ["face-pull", 3, 12, 15],
    ["curl-inclinado", 3, 8, 12], ["curl-martillo", 3, 10, 12], ["antebrazo-polea", 2, 12, 15]] },
  { name: "Pierna", sub: "Mantenimiento · Core", ex: [
    ["sentadilla-manc", 3, 8, 12], ["pm-polea", 3, 8, 10], ["ext-piernas", 2, 10, 15], ["curl-femoral-polea", 2, 10, 15],
    ["zancada", 2, 10, 10, "por pierna"], ["aductor-polea", 2, 12, 15], ["gemelo-pie", 3, 10, 15], ["gemelo-sentado", 2, 12, 20],
    ["abdominales", 3, 12, 20], ["isometricos", 3, 30, 60]] },
  { name: "Empuje B", sub: "Pecho · Hombro · Tríceps", ex: [
    ["press-incl-smith", 3, 6, 10], ["dips", 3, 8, 12], ["doble-polea", 3, 12, 15], ["tiron-lateral-polea", 3, 12, 20],
    ["maquina-triceps", 3, 8, 12], ["triceps-tras-nuca", 2, 10, 12], ["flexiones", 2, 8, 30, "al fallo, opcional"]] },
  { name: "Tirón B", sub: "Espalda · Bíceps · Core", ex: [
    ["dominada-asistida", 4, 6, 10], ["jalon-inclinado", 3, 8, 12], ["remo-sentado", 3, 8, 12], ["face-pull", 3, 12, 15],
    ["maquina-curl", 3, 8, 12], ["curl-martillo", 3, 10, 12], ["abdominales", 3, 12, 20]] }
];
