(function () {
  var M = (window.Motor = window.Motor || {});
  var PUNTUABLES = { quiz: true, completar: true, corta: true, imagenes: true, deslizar: true, ramas: true, arrastrar: true, trivia: true, ruleta: true, memoria: true, escape: true, detective: true };

  function suma(o) {
    return Object.keys(o).reduce(function (s, k) { return s + o[k]; }, 0);
  }

  M.puntaje = {
    maximosDeDeck: function (spec) {
      var max = {};
      (spec.slides || []).forEach(function (s) {
        (s.componentes || []).forEach(function (c) {
          if (PUNTUABLES[c.tipo] && typeof c.puntos === 'number' && c.puntos > 0) max[c.id] = c.puntos;
        });
        if (s.id && PUNTUABLES[s.layout] && typeof s.puntos === 'number' && s.puntos > 0) {
          max[s.id] = s.puntos;
        }
      });
      return max;
    },
    crear: function (opciones) {
      var aprobacion = typeof opciones.notaAprobacion === 'number' ? opciones.notaAprobacion : 70;
      var maximos = Object.assign({}, opciones.maximos || {});
      var obtenidos = {};
      var api = {
        aprobacion: aprobacion,
        registrar: function (id, pts) {
          if (!(id in maximos) || typeof pts !== 'number' || isNaN(pts)) return false;
          obtenidos[id] = Math.max(0, Math.min(pts, maximos[id]));
          return true;
        },
        nota: function () {
          var m = suma(maximos);
          return m === 0 ? 100 : Math.round((100 * suma(obtenidos)) / m);
        },
        aprobado: function () { return api.nota() >= aprobacion; },
        obtenidos: function () { return Object.assign({}, obtenidos); },
        maximo: function () { return suma(maximos); },
      };
      return api;
    },
  };
})();

;
(function () {
  var M = (window.Motor = window.Motor || {});

  function semillaNumerica(texto) {
    var h = 2166136261;
    for (var i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // Fisher–Yates con generador congruencial; si queda igual, rota una posición.
  M.mezclar = function (arr, semilla) {
    var r = arr.slice();
    if (r.length < 2) return r;
    var s = semillaNumerica(String(semilla));
    for (var i = r.length - 1; i > 0; i--) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      var j = s % (i + 1);
      var t = r[i]; r[i] = r[j]; r[j] = t;
    }
    var igual = r.every(function (x, k) { return x === arr[k]; });
    if (igual) r.push(r.shift());
    return r;
  };
})();

;
// Codec de suspend_data para SCORM 1.2 (< 4096 caracteres garantizados).
(function () {
  var M = (window.Motor = window.Motor || {});
  var MARGEN = 3500; // SCORM 1.2 admite 4096; queda holgura

  M.estado = {
    codificar: function (e) {
      var completo = JSON.stringify({ s: e.slide, k: e.comp || {}, h: e.hechos || [] });
      if (completo.length < MARGEN) return completo;
      var hechos = {};
      (e.hechos || []).forEach(function (id) { hechos[id] = true; });
      var bits = (e.orden || []).map(function (id) { return hechos[id] ? '1' : '0'; }).join('');
      return JSON.stringify({ s: e.slide, b: bits }).slice(0, MARGEN);
    },
    decodificar: function (texto, orden) {
      try {
        if (typeof texto !== 'string' || !texto) return null;
        var o = JSON.parse(texto);
        if (!o || typeof o.s !== 'number' || !(o.s >= 0)) return null;
        if (o.k !== undefined || o.h !== undefined) {
          return { slide: o.s, comp: (o.k && typeof o.k === 'object') ? o.k : {}, hechos: Array.isArray(o.h) ? o.h : [] };
        }
        if (typeof o.b !== 'string') return null;
        var hechos = [];
        (orden || []).forEach(function (id, i) { if (o.b.charAt(i) === '1') hechos.push(id); });
        return { slide: o.s, comp: {}, hechos: hechos };
      } catch (err) { return null; }
    },
  };
})();

;
// Anfitrión común para componentes de presentación y SCORM.
(function () {
  var M = (window.Motor = window.Motor || {});

  M.host = {
    crear: function (spec, opciones) {
      var alCambiar = (opciones && opciones.alCambiar) || function () {};
      var orden = [];
      (spec.slides || []).forEach(function (s) {
        if (Array.isArray(s.componentes)) {
          s.componentes.forEach(function (c) { if (c && c.id) orden.push(c.id); });
        } else if (s.id && s.layout && !/^(portada|paso|contenido|cierre)$/.test(s.layout)) {
          orden.push(s.id);
        }
      });
      var puntaje = M.puntaje.crear({
        notaAprobacion: spec.meta && spec.meta.notaAprobacion,
        maximos: M.puntaje.maximosDeDeck(spec),
      });
      var hechos = {};
      var estados = {};

      var host = {
        orden: orden,
        ctxPara: function (def) {
          return {
            estadoInicial: estados[def.id],
            reducido: window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
            registrar: function (pts) { puntaje.registrar(def.id, pts); alCambiar(); },
            guardar: function (e) { estados[def.id] = e; alCambiar(); },
            completar: function () { if (!hechos[def.id]) { hechos[def.id] = true; alCambiar(); } },
          };
        },
        resumen: function () {
          var n = orden.filter(function (id) { return hechos[id]; }).length;
          return {
            nota: puntaje.nota(),
            aprobado: puntaje.aprobado(),
            maximo: puntaje.maximo(),
            completados: n,
            total: orden.length,
            todosCompletos: orden.length === 0 || n === orden.length,
          };
        },
        serializar: function (slide) {
          if (M.estado && M.estado.codificar) {
            return M.estado.codificar({
              slide: slide,
              comp: estados,
              hechos: orden.filter(function (id) { return hechos[id]; }),
              orden: orden,
            });
          }
          return JSON.stringify({ s: slide, k: estados, h: orden.filter(function (id) { return hechos[id]; }) });
        },
        restaurar: function (texto) {
          if (!texto) return null;
          if (M.estado && M.estado.decodificar) {
            var d = M.estado.decodificar(texto, orden);
            if (!d) return null;
            estados = d.comp || {};
            (d.hechos || []).forEach(function (id) { hechos[id] = true; });
            return d.slide;
          }
          try {
            var o = JSON.parse(texto);
            if (!o || typeof o.s !== 'number') return null;
            estados = (o.k && typeof o.k === 'object') ? o.k : {};
            (Array.isArray(o.h) ? o.h : []).forEach(function (id) { hechos[id] = true; });
            return o.s;
          } catch (e) { return null; }
        },
      };
      return host;
    },
  };
})();

;
// Generador de sonido procedural sintético con Web Audio API (0 dependencias, silenciado por defecto).
(function () {
  var M = (window.Motor = window.Motor || {});
  var ctx = null;
  var habilitado = false;

  function obtenerCtx() {
    if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }
    return ctx;
  }

  function beep(frecuencia, duracion, tipo, ganancia) {
    if (!habilitado) return;
    try {
      var c = obtenerCtx();
      if (!c) return;
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.type = tipo || 'sine';
      osc.frequency.setValueAtTime(frecuencia, c.currentTime);
      gain.gain.setValueAtTime(ganancia || 0.15, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duracion);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + duracion);
    } catch (e) {}
  }

  M.sonido = {
    estaHabilitado: function () { return habilitado; },
    habilitar: function (v) { habilitado = Boolean(v); return habilitado; },
    toggle: function () { habilitado = !habilitado; return habilitado; },
    acierto: function () {
      beep(587.33, 0.15, 'sine', 0.15); // D5
      if (typeof setTimeout !== 'undefined') {
        setTimeout(function () { beep(880.00, 0.35, 'triangle', 0.20); }, 120); // A5
      }
    },
    error: function () {
      beep(220.00, 0.25, 'sawtooth', 0.12);
      if (typeof setTimeout !== 'undefined') {
        setTimeout(function () { beep(185.00, 0.30, 'sawtooth', 0.10); }, 150);
      }
    },
    click: function () {
      beep(440, 0.05, 'sine', 0.08);
    },
    giro: function () {
      beep(659.25, 0.04, 'sine', 0.05);
    },
  };
})();

;
// Componente de evaluación interactiva: Quiz con retroalimentación y puntaje.
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  M.componentes.quiz = function (cont, def, ctx) {
    if (def.variante === 'multiple' && M.componentes._seleccion) return M.componentes._seleccion(cont, def, ctx);
    var opciones = def.variante === 'vf' ? ['Verdadero', 'Falso'] : (def.opciones || []);
    var raiz = document.createElement('div');
    raiz.className = 'comp comp-quiz';
    raiz.setAttribute('role', 'group');

    var p = document.createElement('p');
    p.className = 'quiz-pregunta';
    p.id = 'pregunta-' + def.id;
    p.setAttribute('data-anim', 'item');
    p.textContent = def.pregunta;
    raiz.setAttribute('aria-labelledby', p.id);
    raiz.appendChild(p);

    var lista = document.createElement('div');
    lista.className = 'quiz-opciones';
    raiz.appendChild(lista);

    var retro = document.createElement('p');
    retro.className = 'quiz-retro';
    retro.setAttribute('role', 'status');
    retro.setAttribute('aria-live', 'polite');
    raiz.appendChild(retro);

    var botones = opciones.map(function (txt, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'quiz-opcion';
      b.setAttribute('data-anim', 'item');
      b.textContent = txt;
      b.addEventListener('click', function () { elegir(i); });
      lista.appendChild(b);
      return b;
    });

    var elegida = -1;
    function elegir(i) {
      if (elegida !== -1) return;
      elegida = i;
      botones.forEach(function (b, k) {
        b.disabled = true;
        if (k === def.correcta) {
          b.classList.add('ok');
          b.setAttribute('aria-label', texto(k) + ' (correcta)');
        } else if (k === i) {
          b.classList.add('mal');
          b.setAttribute('aria-label', texto(k) + ' (incorrecta)');
        }
      });
      var acierto = (i === def.correcta);
      var msg = (def.retro && def.retro[i]) || (acierto ? '¡Correcto!' : 'Respuesta incorrecta. La correcta es: ' + opciones[def.correcta]);
      retro.textContent = msg;
      retro.className = 'quiz-retro ' + (acierto ? 'ok' : 'mal');
      ctx.registrar(acierto ? (def.puntos || 0) : 0);
      ctx.guardar(i);
      ctx.completar();
    }
    function texto(k) { return opciones[k]; }

    cont.appendChild(raiz);
    if (typeof ctx.estadoInicial === 'number' && ctx.estadoInicial >= 0 && ctx.estadoInicial < opciones.length) {
      elegir(ctx.estadoInicial);
    }
  };
})();

;
// Componente de contenido interactivo: Tarjetas (Flip, Pestañas, Acordeón).
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  M.componentes.tarjetas = function (cont, def, ctx) {
    var elementos = def.elementos || [];
    var n = elementos.length;
    var abiertas = {};
    var variante = def.variante || 'flip';
    if (variante === 'pestanas') variante = 'pestañas';
    if (variante === 'acordeon') variante = 'acordeón';

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-tarjetas tarjetas-' + (variante === 'pestañas' ? 'pestanas' : variante === 'acordeón' ? 'acordeon' : 'flip');
    raiz.setAttribute('data-anim', 'item');
    cont.appendChild(raiz);

    function marcar(i) {
      abiertas[i] = true;
      ctx.guardar(Object.keys(abiertas).map(Number));
      if (Object.keys(abiertas).length === n) ctx.completar();
    }

    if (variante === 'flip') {
      elementos.forEach(function (e, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'tarjeta-flip';
        b.setAttribute('aria-pressed', 'false');
        var t = document.createElement('span');
        t.className = 'flip-titulo';
        t.textContent = e.titulo;
        var x = document.createElement('span');
        x.className = 'flip-texto';
        x.textContent = e.texto;
        b.appendChild(t);
        b.appendChild(x);
        b.addEventListener('click', function () {
          var on = b.getAttribute('aria-pressed') !== 'true';
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          if (on) marcar(i);
        });
        raiz.appendChild(b);
      });
    } else if (variante === 'pestañas') {
      var lista = document.createElement('div');
      lista.className = 'pestanas-lista';
      lista.setAttribute('role', 'tablist');
      var panel = document.createElement('div');
      panel.className = 'pestanas-panel';
      panel.setAttribute('role', 'tabpanel');
      var tabs = [];

      function sel(i, enfocar) {
        tabs.forEach(function (t, k) {
          t.setAttribute('aria-selected', k === i ? 'true' : 'false');
          t.tabIndex = k === i ? 0 : -1;
        });
        panel.textContent = elementos[i] ? elementos[i].texto : '';
        if (tabs[i]) panel.setAttribute('aria-labelledby', tabs[i].id);
        if (enfocar && tabs[i]) tabs[i].focus();
        marcar(i);
      }

      elementos.forEach(function (e, i) {
        var t = document.createElement('button');
        t.type = 'button';
        t.className = 'pestana';
        t.setAttribute('role', 'tab');
        t.id = 'tab-' + def.id + '-' + i;
        t.textContent = e.titulo;
        t.addEventListener('click', function () { sel(i, false); });
        t.addEventListener('keydown', function (ev) {
          var d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          ev.preventDefault();
          ev.stopPropagation();
          sel((i + d + n) % n, true);
        });
        tabs.push(t);
        lista.appendChild(t);
      });
      raiz.appendChild(lista);
      raiz.appendChild(panel);
      if (n > 0) sel(0, false);
    } else {
      elementos.forEach(function (e, i) {
        var h = document.createElement('button');
        h.type = 'button';
        h.className = 'acordeon-cabecera';
        h.setAttribute('aria-expanded', 'false');
        h.id = 'acc-' + def.id + '-' + i;
        h.textContent = e.titulo;

        var p = document.createElement('div');
        p.className = 'acordeon-panel';
        p.hidden = true;
        p.setAttribute('role', 'region');
        p.setAttribute('aria-labelledby', h.id);
        p.textContent = e.texto;

        h.addEventListener('click', function () {
          var on = h.getAttribute('aria-expanded') !== 'true';
          h.setAttribute('aria-expanded', on ? 'true' : 'false');
          p.hidden = !on;
          if (on) marcar(i);
        });
        raiz.appendChild(h);
        raiz.appendChild(p);
      });
    }

    if (Array.isArray(ctx.estadoInicial)) {
      ctx.estadoInicial.forEach(function (i) {
        if (i >= 0 && i < n) abiertas[i] = true;
      });
    }
    if (Object.keys(abiertas).length === n && n > 0) ctx.completar();
  };
})();

;
// Componente interactivo: Puntos calientes (Hotspots) sobre imagen.
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  M.componentes.hotspots = function (cont, def, ctx) {
    var vistas = {};
    var zonas = def.zonas || [];
    var n = zonas.length;
    var raiz = document.createElement('div');
    raiz.className = 'comp comp-hotspots';
    raiz.setAttribute('data-anim', 'item');

    var marco = document.createElement('div');
    marco.className = 'hotspots-marco';
    var img = document.createElement('img');
    img.src = def.imagen;
    img.alt = def.alt || '';
    marco.appendChild(img);

    var detalle = document.createElement('div');
    detalle.className = 'zona-detalle';
    detalle.setAttribute('role', 'status');
    detalle.setAttribute('aria-live', 'polite');

    function abrir(i) {
      var z = zonas[i];
      if (!z) return;
      detalle.replaceChildren();
      var t = document.createElement('strong');
      t.textContent = z.titulo;
      var p = document.createElement('span');
      p.textContent = z.texto;
      detalle.appendChild(t);
      detalle.appendChild(p);

      botones.forEach(function (b, k) {
        b.classList.toggle('activa', k === i);
      });
      vistas[i] = true;
      ctx.guardar(Object.keys(vistas).map(Number));
      if (Object.keys(vistas).length === n) ctx.completar();
    }

    var botones = zonas.map(function (z, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'zona';
      b.style.left = z.x + '%';
      b.style.top = z.y + '%';
      b.setAttribute('aria-label', z.titulo);
      var num = document.createElement('span');
      num.setAttribute('aria-hidden', 'true');
      num.textContent = String(i + 1);
      b.appendChild(num);
      b.addEventListener('click', function () { abrir(i); });
      marco.appendChild(b);
      return b;
    });

    raiz.appendChild(marco);
    raiz.appendChild(detalle);
    cont.appendChild(raiz);

    if (Array.isArray(ctx.estadoInicial)) {
      ctx.estadoInicial.forEach(function (i) {
        if (i >= 0 && i < n) vistas[i] = true;
      });
      if (Object.keys(vistas).length === n && n > 0) ctx.completar();
    }
  };
})();

;
// Componente interactivo: Arrastrar y soltar (Emparejar, Ordenar, Clasificar).
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  function puntosPorFallos(puntos, fallos, n) {
    if (typeof puntos !== 'number' || puntos <= 0) return 0;
    if (n <= 0) return puntos;
    return Number((puntos * (1 - Math.min(fallos, n) / n)).toFixed(4));
  }

  M.componentes.arrastrar = function (cont, def, ctx) {
    var raiz = document.createElement('div');
    raiz.className = 'comp comp-arrastrar';
    raiz.setAttribute('data-anim', 'item');

    var msg = document.createElement('p');
    msg.className = 'arr-mensaje';
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');

    var fallos = 0;
    var resuelto = false;

    function terminar(n) {
      resuelto = true;
      ctx.registrar(puntosPorFallos(def.puntos || 0, fallos, n));
      ctx.guardar(1);
      ctx.completar();
      msg.textContent = '¡Muy bien! Completaste la actividad.';
      msg.className = 'arr-mensaje ok';
    }

    if (def.modo === 'emparejar') {
      var pares = def.pares || [];
      var n = pares.length;
      var mezclarFn = (M.mezclar || function (a) { return a.slice(); });
      var izq = mezclarFn(pares.map(function (p, i) { return { t: p.izq, i: i }; }), def.id + 'i');
      var der = mezclarFn(pares.map(function (p, i) { return { t: p.der, i: i }; }), def.id + 'd');

      var colI = document.createElement('div');
      colI.className = 'arr-col';
      var colD = document.createElement('div');
      colD.className = 'arr-col';
      var sel = null;
      var puestos = 0;

      function colocar(item, destino) {
        if (resuelto || item.classList.contains('colocado') || destino.classList.contains('lleno')) return;
        if (item.dataset.i === destino.dataset.i) {
          item.classList.add('colocado');
          item.disabled = true;
          item.setAttribute('aria-pressed', 'false');
          destino.classList.add('lleno');
          var c = document.createElement('span');
          c.className = 'arr-unido';
          c.textContent = ' ← ' + item.textContent;
          destino.appendChild(c);
          msg.textContent = 'Correcto.';
          msg.className = 'arr-mensaje ok';
          puestos++;
          if (puestos === n) terminar(n);
        } else {
          fallos++;
          msg.textContent = 'Inténtalo de nuevo: esa pareja no es correcta.';
          msg.className = 'arr-mensaje mal';
        }
        if (sel) {
          sel.setAttribute('aria-pressed', 'false');
          sel = null;
        }
      }

      izq.forEach(function (o) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'arr-item';
        b.draggable = true;
        b.dataset.i = String(o.i);
        b.setAttribute('aria-pressed', 'false');
        b.textContent = o.t;
        b.addEventListener('click', function () {
          if (resuelto || b.disabled) return;
          if (sel) sel.setAttribute('aria-pressed', 'false');
          sel = (sel === b) ? null : b;
          if (sel) sel.setAttribute('aria-pressed', 'true');
        });
        b.addEventListener('dragstart', function (e) {
          e.dataTransfer.setData('text/plain', String(o.i));
          e.dataTransfer.effectAllowed = 'move';
          window.__arrastrando = b;
        });
        colI.appendChild(b);
      });

      der.forEach(function (o) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'arr-destino';
        d.dataset.i = String(o.i);
        var t = document.createElement('span');
        t.textContent = o.t;
        d.appendChild(t);
        d.addEventListener('click', function () {
          if (sel) colocar(sel, d);
        });
        d.addEventListener('dragover', function (e) { e.preventDefault(); });
        d.addEventListener('drop', function (e) {
          e.preventDefault();
          if (window.__arrastrando) colocar(window.__arrastrando, d);
        });
        colD.appendChild(d);
      });

      var tabla = document.createElement('div');
      tabla.className = 'arr-tabla';
      tabla.appendChild(colI);
      tabla.appendChild(colD);
      raiz.appendChild(tabla);

      var barraAcciones = document.createElement('div');
      barraAcciones.className = 'arr-acciones';
      if (def.pista) {
        var btnPista = document.createElement('button');
        btnPista.type = 'button';
        btnPista.className = 'arr-pista';
        btnPista.textContent = 'Pista';
        btnPista.addEventListener('click', function () {
          msg.textContent = def.pista;
          msg.className = 'arr-mensaje';
        });
        barraAcciones.appendChild(btnPista);
      }
      raiz.appendChild(barraAcciones);
      raiz.appendChild(msg);
      cont.appendChild(raiz);

      if (ctx.estadoInicial === 1) {
        puestos = n;
        Array.prototype.forEach.call(raiz.querySelectorAll('.arr-item'), function (b) {
          b.classList.add('colocado');
          b.disabled = true;
        });
        terminar(n);
        fallos = 0;
      }
    } else if (def.modo === 'clasificar') {
      // Modo clasificar: elementos a categorías
      var categorias = def.categorias || [];
      var elementosClasif = def.elementos || [];
      var nClasif = elementosClasif.length;
      var selItem = null;
      var colocadosClasif = 0;

      var contCategorias = document.createElement('div');
      contCategorias.className = 'clasif-categorias arr-tabla';

      var zonasCategorias = {};
      categorias.forEach(function (cat) {
        var zonaCat = document.createElement('div');
        zonaCat.className = 'arr-col clasif-zona';
        var tituloCat = document.createElement('strong');
        tituloCat.textContent = cat;
        zonaCat.appendChild(tituloCat);
        zonasCategorias[cat] = zonaCat;
        contCategorias.appendChild(zonaCat);
      });

      var colItems = document.createElement('div');
      colItems.className = 'clasif-items arr-col';

      elementosClasif.forEach(function (elItem, idx) {
        var btnItem = document.createElement('button');
        btnItem.type = 'button';
        btnItem.className = 'arr-item';
        btnItem.textContent = elItem.texto;
        btnItem.dataset.cat = elItem.categoria;
        btnItem.addEventListener('click', function () {
          if (btnItem.disabled) return;
          if (selItem) selItem.setAttribute('aria-pressed', 'false');
          selItem = (selItem === btnItem) ? null : btnItem;
          if (selItem) selItem.setAttribute('aria-pressed', 'true');
        });
        colItems.appendChild(btnItem);
      });

      categorias.forEach(function (cat) {
        var zonaCat = zonasCategorias[cat];
        zonaCat.addEventListener('click', function () {
          if (!selItem) return;
          if (selItem.dataset.cat === cat) {
            selItem.classList.add('colocado');
            selItem.disabled = true;
            zonaCat.appendChild(selItem);
            msg.textContent = '¡Correcto!';
            msg.className = 'arr-mensaje ok';
            colocadosClasif++;
            if (colocadosClasif === nClasif) terminar(nClasif);
          } else {
            fallos++;
            msg.textContent = 'Esa categoría no corresponde.';
            msg.className = 'arr-mensaje mal';
          }
          if (selItem) {
            selItem.setAttribute('aria-pressed', 'false');
            selItem = null;
          }
        });
      });

      var tablaClasif = document.createElement('div');
      tablaClasif.className = 'arr-tabla';
      tablaClasif.appendChild(colItems);
      tablaClasif.appendChild(contCategorias);
      raiz.appendChild(tablaClasif);
      raiz.appendChild(msg);
      cont.appendChild(raiz);

      if (ctx.estadoInicial === 1) {
        terminar(nClasif);
        fallos = 0;
      }
    } else {
      // Modo ordenar
      var total = (def.orden || []).length;
      var mezclarFnOrd = (M.mezclar || function (a) { return a.slice(); });
      var lista = mezclarFnOrd((def.orden || []).slice(), def.id);
      var caja = document.createElement('div');
      caja.className = 'ord-lista';
      var marcada = -1;

      function pintar() {
        caja.replaceChildren();
        lista.forEach(function (t, i) {
          var fila = document.createElement('div');
          fila.className = 'ord-item-fila';

          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'ord-item';
          b.draggable = !resuelto;
          b.setAttribute('aria-pressed', i === marcada ? 'true' : 'false');
          b.textContent = t;
          b.disabled = resuelto;

          b.addEventListener('click', function () {
            if (marcada === -1) {
              marcada = i;
            } else {
              var temp = lista[marcada];
              lista[marcada] = lista[i];
              lista[i] = temp;
              marcada = -1;
            }
            pintar();
          });

          b.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', String(i));
            window.__ordIdx = i;
          });
          b.addEventListener('dragover', function (e) { e.preventDefault(); });
          b.addEventListener('drop', function (e) {
            e.preventDefault();
            var o = window.__ordIdx;
            if (typeof o === 'number' && o !== i) {
              var temp = lista[o];
              lista[o] = lista[i];
              lista[i] = temp;
              pintar();
            }
          });

          fila.appendChild(b);

          if (!resuelto) {
            var btnArriba = document.createElement('button');
            btnArriba.type = 'button';
            btnArriba.className = 'ord-btn-nav';
            btnArriba.textContent = '↑';
            btnArriba.setAttribute('aria-label', 'Subir ' + t);
            btnArriba.disabled = (i === 0);
            btnArriba.addEventListener('click', function (ev) {
              ev.stopPropagation();
              if (i > 0) {
                var temp = lista[i - 1];
                lista[i - 1] = lista[i];
                lista[i] = temp;
                pintar();
              }
            });
            var btnAbajo = document.createElement('button');
            btnAbajo.type = 'button';
            btnAbajo.className = 'ord-btn-nav';
            btnAbajo.textContent = '↓';
            btnAbajo.setAttribute('aria-label', 'Bajar ' + t);
            btnAbajo.disabled = (i === lista.length - 1);
            btnAbajo.addEventListener('click', function (ev) {
              ev.stopPropagation();
              if (i < lista.length - 1) {
                var temp = lista[i + 1];
                lista[i + 1] = lista[i];
                lista[i] = temp;
                pintar();
              }
            });
            fila.appendChild(btnArriba);
            fila.appendChild(btnAbajo);
          }

          caja.appendChild(fila);
        });
      }

      var comprobar = document.createElement('button');
      comprobar.type = 'button';
      comprobar.className = 'arr-comprobar';
      comprobar.textContent = 'Comprobar orden';
      comprobar.addEventListener('click', function () {
        if (resuelto) return;
        var ok = lista.every(function (t, i) { return t === def.orden[i]; });
        if (ok) {
          terminar(total);
          comprobar.disabled = true;
          pintar();
        } else {
          fallos++;
          msg.textContent = 'Aún no está en el orden correcto. Intercambia dos elementos o usa las flechas.';
          msg.className = 'arr-mensaje mal';
        }
      });

      var reintentarBtn = null;
      if (def.reinicio) {
        reintentarBtn = document.createElement('button');
        reintentarBtn.type = 'button';
        reintentarBtn.className = 'arr-reinicio';
        reintentarBtn.textContent = 'Reiniciar';
        reintentarBtn.addEventListener('click', function () {
          lista = mezclarFnOrd((def.orden || []).slice(), def.id + Date.now());
          marcada = -1;
          resuelto = false;
          comprobar.disabled = false;
          msg.textContent = '';
          pintar();
        });
      }

      raiz.appendChild(caja);
      raiz.appendChild(comprobar);
      if (reintentarBtn) raiz.appendChild(reintentarBtn);
      raiz.appendChild(msg);
      cont.appendChild(raiz);

      if (ctx.estadoInicial === 1) {
        lista = (def.orden || []).slice();
        resuelto = true;
        comprobar.disabled = true;
        terminar(total);
        fallos = 0;
      }
      pintar();
    }
  };

  // Alias ordenar
  M.componentes.ordenar = function (cont, def, ctx) {
    def.modo = 'ordenar';
    return M.componentes.arrastrar(cont, def, ctx);
  };
})();

;
// Juego interactivo: Trivia con tiempo, vidas, racha y comodines (50/50, saltar).
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  M.componentes.trivia = function (cont, def, ctx) {
    var preguntas = def.preguntas || [];
    var totalPreguntas = preguntas.length;
    var vidasMax = def.vidas || 3;
    var vidas = vidasMax;
    var tiempoMax = def.tiempo || 0; // en segundos, 0 = sin límite
    var comodin50Usado = false;
    var comodinSaltarUsado = false;
    var idxActual = 0;
    var rachaActual = 0;
    var rachaMax = 0;
    var aciertos = 0;
    var temporizadorId = null;
    var tiempoRestante = tiempoMax;

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-trivia';
    raiz.setAttribute('data-anim', 'item');

    // Barra superior: vidas, racha, comodines
    var cabecera = document.createElement('div');
    cabecera.className = 'trivia-cabecera';

    var vidasEl = document.createElement('div');
    vidasEl.className = 'trivia-vidas';
    vidasEl.setAttribute('aria-label', 'Vidas restantes: ' + vidas);

    var rachaEl = document.createElement('div');
    rachaEl.className = 'trivia-racha';

    var comodinesEl = document.createElement('div');
    comodinesEl.className = 'trivia-comodines';

    var btn50 = document.createElement('button');
    btn50.type = 'button';
    btn50.className = 'trivia-btn-comodin';
    btn50.textContent = '50/50';
    btn50.title = 'Descarta dos opciones incorrectas';
    btn50.addEventListener('click', usar5050);

    var btnSaltar = document.createElement('button');
    btnSaltar.type = 'button';
    btnSaltar.className = 'trivia-btn-comodin';
    btnSaltar.textContent = 'Saltar';
    btnSaltar.title = 'Salta esta pregunta sin perder vidas';
    btnSaltar.addEventListener('click', usarSaltar);

    comodinesEl.appendChild(btn50);
    comodinesEl.appendChild(btnSaltar);

    cabecera.appendChild(vidasEl);
    cabecera.appendChild(rachaEl);
    cabecera.appendChild(comodinesEl);
    raiz.appendChild(cabecera);

    // Barra de tiempo si aplica
    var barraTiempoCont = document.createElement('div');
    barraTiempoCont.className = 'trivia-tiempo-cont';
    var barraTiempo = document.createElement('div');
    barraTiempo.className = 'trivia-tiempo-barra';
    barraTiempoCont.appendChild(barraTiempo);
    if (tiempoMax > 0) raiz.appendChild(barraTiempoCont);

    // Área de pregunta y opciones
    var areaJuego = document.createElement('div');
    areaJuego.className = 'trivia-area-juego';

    var preguntaEl = document.createElement('h3');
    preguntaEl.className = 'quiz-pregunta';

    var opcionesEl = document.createElement('div');
    opcionesEl.className = 'quiz-opciones';

    var retroEl = document.createElement('p');
    retroEl.className = 'quiz-retro';
    retroEl.setAttribute('role', 'status');
    retroEl.setAttribute('aria-live', 'polite');

    areaJuego.appendChild(preguntaEl);
    areaJuego.appendChild(opcionesEl);
    areaJuego.appendChild(retroEl);
    raiz.appendChild(areaJuego);

    // Pantalla de resultado final
    var pantallaFinal = document.createElement('div');
    pantallaFinal.className = 'trivia-resultado';
    pantallaFinal.hidden = true;
    raiz.appendChild(pantallaFinal);

    cont.appendChild(raiz);

    function actualizarMarcador() {
      vidasEl.replaceChildren();
      for (var v = 0; v < vidasMax; v++) {
        var corazon = document.createElement('span');
        corazon.className = 'trivia-corazon' + (v < vidas ? ' activo' : ' perdido');
        corazon.textContent = v < vidas ? '❤️' : '🖤';
        vidasEl.appendChild(corazon);
      }
      rachaEl.textContent = 'Racha: ' + rachaActual + (rachaActual >= 3 ? ' 🔥' : '');
    }

    function pararTemporizador() {
      if (temporizadorId) {
        clearInterval(temporizadorId);
        temporizadorId = null;
      }
    }

    function arrancarTemporizador() {
      pararTemporizador();
      if (tiempoMax <= 0) return;
      tiempoRestante = tiempoMax;
      barraTiempo.style.width = '100%';
      temporizadorId = setInterval(function () {
        tiempoRestante -= 0.1;
        var pct = Math.max(0, (tiempoRestante / tiempoMax) * 100);
        barraTiempo.style.width = pct + '%';
        if (tiempoRestante <= 0) {
          pararTemporizador();
          fallar('¡Tiempo agotado!');
        }
      }, 100);
    }

    function usar5050() {
      if (comodin50Usado) return;
      comodin50Usado = true;
      btn50.disabled = true;
      if (M.sonido) M.sonido.click();
      var q = preguntas[idxActual];
      if (!q) return;
      var incorrectas = [];
      q.opciones.forEach(function (_, idx) {
        if (idx !== q.correcta) incorrectas.push(idx);
      });
      // Descartar dos
      var descarte = incorrectas.slice(0, 2);
      var botones = opcionesEl.querySelectorAll('.quiz-opcion');
      descarte.forEach(function (idx) {
        if (botones[idx]) {
          botones[idx].disabled = true;
          botones[idx].style.opacity = '0.25';
        }
      });
    }

    function usarSaltar() {
      if (comodinSaltarUsado) return;
      comodinSaltarUsado = true;
      btnSaltar.disabled = true;
      if (M.sonido) M.sonido.click();
      pararTemporizador();
      idxActual++;
      if (idxActual < totalPreguntas) {
        mostrarPregunta();
      } else {
        finalizar();
      }
    }

    function responder(i) {
      pararTemporizador();
      var q = preguntas[idxActual];
      var acierto = (i === q.correcta);
      var botones = opcionesEl.querySelectorAll('.quiz-opcion');
      botones.forEach(function (b, k) {
        b.disabled = true;
        if (k === q.correcta) b.classList.add('ok');
        else if (k === i) b.classList.add('mal');
      });

      if (acierto) {
        aciertos++;
        rachaActual++;
        if (rachaActual > rachaMax) rachaMax = rachaActual;
        retroEl.textContent = (q.retro && q.retro[i]) || '¡Correcto!';
        retroEl.className = 'quiz-retro ok';
        if (M.sonido) M.sonido.acierto();
      } else {
        rachaActual = 0;
        vidas--;
        retroEl.textContent = (q.retro && q.retro[i]) || ('Incorrecto. La respuesta era: ' + q.opciones[q.correcta]);
        retroEl.className = 'quiz-retro mal';
        if (M.sonido) M.sonido.error();
      }
      actualizarMarcador();

      var espera = ctx.reducido ? 100 : 1400;
      setTimeout(function () {
        if (vidas <= 0 || idxActual >= totalPreguntas - 1) {
          finalizar();
        } else {
          idxActual++;
          mostrarPregunta();
        }
      }, espera);
    }

    function fallar(motivo) {
      vidas--;
      rachaActual = 0;
      actualizarMarcador();
      retroEl.textContent = motivo;
      retroEl.className = 'quiz-retro mal';
      if (M.sonido) M.sonido.error();
      var espera = ctx.reducido ? 100 : 1400;
      setTimeout(function () {
        if (vidas <= 0 || idxActual >= totalPreguntas - 1) {
          finalizar();
        } else {
          idxActual++;
          mostrarPregunta();
        }
      }, espera);
    }

    function mostrarPregunta() {
      var q = preguntas[idxActual];
      if (!q) return;
      preguntaEl.textContent = (idxActual + 1) + '. ' + q.pregunta;
      retroEl.textContent = '';
      retroEl.className = 'quiz-retro';
      opcionesEl.replaceChildren();

      q.opciones.forEach(function (txt, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'quiz-opcion';
        b.textContent = txt;
        b.addEventListener('click', function () { responder(i); });
        opcionesEl.appendChild(b);
      });

      arrancarTemporizador();
    }

    function finalizar() {
      pararTemporizador();
      areaJuego.hidden = true;
      cabecera.hidden = true;
      pantallaFinal.hidden = false;
      pantallaFinal.replaceChildren();

      var ptsTotales = def.puntos || 20;
      var pct = totalPreguntas > 0 ? (aciertos / totalPreguntas) : 0;
      var ptsGanados = Math.round(ptsTotales * pct);

      ctx.registrar(ptsGanados);
      ctx.guardar({ aciertos: aciertos, rachaMax: rachaMax, completado: true });
      ctx.completar();

      var tit = document.createElement('h3');
      tit.className = 'trivia-res-titulo';
      tit.textContent = vidas > 0 ? '¡Trivia Completada!' : '¡Fin de la partida!';

      var resumen = document.createElement('p');
      resumen.className = 'trivia-res-detalle';
      resumen.textContent = 'Aciertos: ' + aciertos + ' de ' + totalPreguntas + ' — Racha máxima: ' + rachaMax + ' — Puntos: ' + ptsGanados + ' / ' + ptsTotales;

      pantallaFinal.appendChild(tit);
      pantallaFinal.appendChild(resumen);
    }

    actualizarMarcador();
    if (ctx.estadoInicial) {
      if (typeof ctx.estadoInicial === 'object' && ctx.estadoInicial.aciertos !== undefined) {
        aciertos = ctx.estadoInicial.aciertos;
        rachaMax = ctx.estadoInicial.rachaMax || 0;
      } else {
        aciertos = totalPreguntas;
      }
      finalizar();
    } else if (totalPreguntas > 0) {
      mostrarPregunta();
    }
  };
})();

;
// Juego interactivo: Ruleta animada que asigna retos o preguntas.
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  M.componentes.ruleta = function (cont, def, ctx) {
    var sectores = def.sectores || def.retos || [
      { titulo: 'Reto 1', descripcion: 'Explica qué es un contexto de filtro en DAX', puntos: 10 },
      { titulo: 'Reto 2', descripcion: 'Nombra dos diferencias entre columna calculada y medida', puntos: 10 },
      { titulo: 'Reto 3', descripcion: '¿Por qué evitar relaciones de muchos a muchos?', puntos: 10 },
      { titulo: 'Reto 4', descripcion: 'Menciona las tres vistas principales de Power BI Desktop', puntos: 10 },
      { titulo: 'Reto 5', descripcion: '¿Cuál es la función del esquema estrella?', puntos: 10 },
      { titulo: 'Reto 6', descripcion: 'Explica cómo segmentar datos por fecha', puntos: 10 }
    ];
    var n = sectores.length;
    var anguloSector = 360 / n;
    var rotacionActual = 0;
    var girando = false;
    var colores = ['#003B7A', '#176EE4', '#63B82E', '#FFD100', '#002152', '#0284c7'];

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-ruleta';
    raiz.setAttribute('data-anim', 'item');

    var marco = document.createElement('div');
    marco.className = 'ruleta-marco';

    // Aguja / indicador
    var aguja = document.createElement('div');
    aguja.className = 'ruleta-aguja';
    aguja.setAttribute('aria-hidden', 'true');
    marco.appendChild(aguja);

    var SVG_NS = 'http' + '://www.w3.org/2000/svg';

    // SVG de la ruleta
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 500 500');
    svg.setAttribute('class', 'ruleta-disco');
    var centroX = 250, centroY = 250, radio = 230;

    for (var i = 0; i < n; i++) {
      var a1 = (i * anguloSector - 90) * Math.PI / 180;
      var a2 = ((i + 1) * anguloSector - 90) * Math.PI / 180;
      var x1 = centroX + radio * Math.cos(a1);
      var y1 = centroY + radio * Math.sin(a1);
      var x2 = centroX + radio * Math.cos(a2);
      var y2 = centroY + radio * Math.sin(a2);

      var path = document.createElementNS(SVG_NS, 'path');
      var d = ['M', centroX, centroY, 'L', x1, y1, 'A', radio, radio, 0, 0, 1, x2, y2, 'Z'].join(' ');
      path.setAttribute('d', d);
      path.setAttribute('fill', colores[i % colores.length]);
      svg.appendChild(path);

      // Texto de sector
      var aMed = (i * anguloSector + anguloSector / 2 - 90) * Math.PI / 180;
      var tx = centroX + (radio * 0.65) * Math.cos(aMed);
      var ty = centroY + (radio * 0.65) * Math.sin(aMed);
      var text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', String(tx));
      text.setAttribute('y', String(ty));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', (i % colores.length === 3) ? '#002152' : '#ffffff');
      text.setAttribute('font-size', '20');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('font-family', 'sans-serif');
      var rotTexto = (i * anguloSector + anguloSector / 2);
      text.setAttribute('transform', 'rotate(' + (rotTexto + 90) + ' ' + tx + ' ' + ty + ')');
      text.textContent = sectores[i].titulo;
      svg.appendChild(text);
    }

    // Centro
    var circCentro = document.createElementNS(SVG_NS, 'circle');
    circCentro.setAttribute('cx', '250');
    circCentro.setAttribute('cy', '250');
    circCentro.setAttribute('r', '45');
    circCentro.setAttribute('fill', '#ffffff');
    circCentro.setAttribute('stroke', '#003B7A');
    circCentro.setAttribute('stroke-width', '8');
    svg.appendChild(circCentro);

    marco.appendChild(svg);
    raiz.appendChild(marco);

    // Controles
    var panelControl = document.createElement('div');
    panelControl.className = 'ruleta-panel-control';

    var btnGirar = document.createElement('button');
    btnGirar.type = 'button';
    btnGirar.className = 'ruleta-btn-girar';
    btnGirar.textContent = '🎲 ¡Girar Ruleta!';
    btnGirar.addEventListener('click', girar);
    panelControl.appendChild(btnGirar);

    var areaResultado = document.createElement('div');
    areaResultado.className = 'ruleta-area-resultado';
    areaResultado.setAttribute('role', 'status');
    areaResultado.setAttribute('aria-live', 'polite');

    var tituloReto = document.createElement('h4');
    tituloReto.className = 'ruleta-titulo-reto';
    var descReto = document.createElement('p');
    descReto.className = 'ruleta-desc-reto';

    var btnResolver = document.createElement('button');
    btnResolver.type = 'button';
    btnResolver.className = 'ruleta-btn-resolver';
    btnResolver.textContent = 'Completar reto (+ puntos)';
    btnResolver.hidden = true;
    btnResolver.addEventListener('click', function () {
      btnResolver.disabled = true;
      btnResolver.textContent = '✓ Reto completado';
      ctx.registrar(def.puntos || 20);
      ctx.guardar(1);
      ctx.completar();
      if (M.sonido) M.sonido.acierto();
    });

    areaResultado.appendChild(tituloReto);
    areaResultado.appendChild(descReto);
    areaResultado.appendChild(btnResolver);
    panelControl.appendChild(areaResultado);

    raiz.appendChild(panelControl);
    cont.appendChild(raiz);

    function girar() {
      if (girando) return;
      girando = true;
      btnGirar.disabled = true;
      btnResolver.hidden = true;
      tituloReto.textContent = 'Girando ruleta...';
      descReto.textContent = 'Esperando sector seleccionado...';
      if (M.sonido) M.sonido.giro();

      // Elegir sector destino aleatorio
      var elegidoIdx = Math.floor(Math.random() * n);
      var vueltas = 4 + Math.floor(Math.random() * 3);
      var targetAngle = (360 * vueltas) + (360 - (elegidoIdx * anguloSector + anguloSector / 2));
      rotacionActual += targetAngle;

      if (ctx.reducido || !window.gsap) {
        svg.style.transform = 'rotate(' + rotacionActual + 'deg)';
        girando = false;
        btnGirar.disabled = false;
        mostrarReto(elegidoIdx);
      } else {
        window.gsap.to(svg, {
          rotation: rotacionActual,
          duration: 3.5,
          ease: 'power4.out',
          transformOrigin: '50% 50%',
          onComplete: function () {
            girando = false;
            btnGirar.disabled = false;
            mostrarReto(elegidoIdx);
          }
        });
      }
    }

    function mostrarReto(idx) {
      var item = sectores[idx];
      tituloReto.textContent = '🎯 ' + item.titulo;
      descReto.textContent = item.descripcion;
      btnResolver.hidden = false;
      btnResolver.disabled = false;
      btnResolver.textContent = 'Completar reto (+ puntos)';
      if (M.sonido) M.sonido.acierto();
    }

    if (ctx.estadoInicial === 1) {
      tituloReto.textContent = '✓ Reto completado previamente';
      descReto.textContent = 'Has participado exitosamente en la ruleta de retos.';
      btnGirar.disabled = true;
    }
  };
})();

;
// Juego interactivo: Memoria (Parejas de tarjetas con contador de intentos).
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  M.componentes.memoria = function (cont, def, ctx) {
    var pares = def.parejas || [
      { a: 'DAX', b: 'Fórmulas analíticas' },
      { a: 'Power Query', b: 'Transformación ETL' },
      { a: 'Esquema Estrella', b: 'Hechos y Dimensiones' },
      { a: 'KPI', b: 'Indicador clave de rendimiento' }
    ];
    var cartas = [];
    pares.forEach(function (p, parId) {
      cartas.push({ id: parId + '-a', parId: parId, texto: p.a });
      cartas.push({ id: parId + '-b', parId: parId, texto: p.b });
    });

    var mezclarFn = M.mezclar || function (arr) { return arr.slice(); };
    var cartasBarajadas = mezclarFn(cartas, def.id || 'memoria');
    var totalPares = pares.length;
    var aciertos = 0;
    var intentos = 0;
    var seleccionadas = [];
    var bloqueado = false;

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-memoria';
    raiz.setAttribute('data-anim', 'item');

    // Marcador
    var marcador = document.createElement('div');
    marcador.className = 'memoria-marcador';

    var intentosEl = document.createElement('span');
    intentosEl.className = 'memoria-intentos';
    intentosEl.textContent = 'Intentos: 0';

    var aciertosEl = document.createElement('span');
    aciertosEl.className = 'memoria-aciertos';
    aciertosEl.textContent = 'Parejas: 0 / ' + totalPares;

    marcador.appendChild(intentosEl);
    marcador.appendChild(aciertosEl);
    raiz.appendChild(marcador);

    // Tablero de cartas
    var tablero = document.createElement('div');
    tablero.className = 'memoria-tablero';

    var elementosCarta = [];

    cartasBarajadas.forEach(function (carta, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'memoria-carta';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Carta ' + (idx + 1));

      var frente = document.createElement('div');
      frente.className = 'carta-frente';
      frente.textContent = carta.texto;

      var dorso = document.createElement('div');
      dorso.className = 'carta-dorso';
      dorso.textContent = '🎴';

      btn.appendChild(frente);
      btn.appendChild(dorso);

      btn.addEventListener('click', function () {
        if (bloqueado || btn.disabled || seleccionadas.indexOf(idx) >= 0) return;
        voltear(idx);
      });

      tablero.appendChild(btn);
      elementosCarta.push(btn);
    });

    raiz.appendChild(tablero);

    var mensajeFinal = document.createElement('div');
    mensajeFinal.className = 'memoria-resultado';
    mensajeFinal.hidden = true;
    raiz.appendChild(mensajeFinal);

    cont.appendChild(raiz);

    function voltear(idx) {
      var btn = elementosCarta[idx];
      btn.classList.add('volteada');
      btn.setAttribute('aria-pressed', 'true');
      seleccionadas.push(idx);

      if (seleccionadas.length === 2) {
        intentos++;
        intentosEl.textContent = 'Intentos: ' + intentos;
        var i1 = seleccionadas[0];
        var i2 = seleccionadas[1];
        var c1 = cartasBarajadas[i1];
        var c2 = cartasBarajadas[i2];

        if (c1.parId === c2.parId) {
          // Pareja correcta
          aciertos++;
          aciertosEl.textContent = 'Parejas: ' + aciertos + ' / ' + totalPares;
          elementosCarta[i1].classList.add('pareja-ok');
          elementosCarta[i2].classList.add('pareja-ok');
          elementosCarta[i1].disabled = true;
          elementosCarta[i2].disabled = true;
          seleccionadas = [];
          if (M.sonido) M.sonido.acierto();

          if (aciertos === totalPares) {
            terminar();
          }
        } else {
          // No coinciden
          bloqueado = true;
          if (M.sonido) M.sonido.error();
          setTimeout(function () {
            elementosCarta[i1].classList.remove('volteada');
            elementosCarta[i2].classList.remove('volteada');
            elementosCarta[i1].setAttribute('aria-pressed', 'false');
            elementosCarta[i2].setAttribute('aria-pressed', 'false');
            seleccionadas = [];
            bloqueado = false;
          }, 900);
        }
      }
    }

    function terminar() {
      tablero.hidden = true;
      mensajeFinal.hidden = false;
      var pts = def.puntos || 20;
      ctx.registrar(pts);
      ctx.guardar(1);
      ctx.completar();

      var t = document.createElement('h3');
      t.className = 'memoria-res-titulo';
      t.textContent = '¡Memoria Completada!';

      var p = document.createElement('p');
      p.className = 'memoria-res-detalle';
      p.textContent = '¡Excelente concentración! Encontraste las ' + totalPares + ' parejas en ' + intentos + ' intentos. (+ ' + pts + ' puntos)';

      mensajeFinal.appendChild(t);
      mensajeFinal.appendChild(p);
    }

    if (ctx.estadoInicial === 1) {
      terminar();
    }
  };
})();

;
// Juego interactivo: Escape Room con retos encadenados y puerta con candados.
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  M.componentes.escape = function (cont, def, ctx) {
    var retos = def.retos || [
      {
        titulo: 'Cerradura 1: Orígenes de Datos',
        pista: '¿Cuál es la extensión típica del archivo de proyecto de Power BI Desktop?',
        solucion: 'pbix',
        ayuda: 'Son 4 letras que empiezan por pbi...'
      },
      {
        titulo: 'Cerradura 2: El Lenguaje Clave',
        pista: 'Escribe las siglas del lenguaje usado para modelar y crear medidas analíticas:',
        solucion: 'dax',
        ayuda: 'Data Analysis Expressions'
      },
      {
        titulo: 'Cerradura 3: Código de Seguridad',
        pista: 'Si una tabla de ventas tiene 100 registros y se filtra por el año 2026 que tiene el 40%, ¿cuántas filas ve el contexto de filtro?',
        solucion: '40',
        ayuda: 'Calcula el 40% de 100'
      }
    ];

    var totalRetos = retos.length;
    var idxActual = 0;
    var resueltos = 0;
    var fallos = 0;

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-escape';
    raiz.setAttribute('data-anim', 'item');

    // Estado de la puerta y candados
    var marcoPuerta = document.createElement('div');
    marcoPuerta.className = 'escape-puerta';

    var estadoCandados = document.createElement('div');
    estadoCandados.className = 'escape-candados';

    var indicadores = [];
    for (var i = 0; i < totalRetos; i++) {
      var ind = document.createElement('div');
      ind.className = 'escape-indicador cerrado';
      ind.textContent = '🔒 Reto ' + (i + 1);
      estadoCandados.appendChild(ind);
      indicadores.push(ind);
    }
    marcoPuerta.appendChild(estadoCandados);

    var graficoPuerta = document.createElement('div');
    graficoPuerta.className = 'escape-puerta-grafico';
    graficoPuerta.textContent = '🚪';
    marcoPuerta.appendChild(graficoPuerta);

    raiz.appendChild(marcoPuerta);

    // Área del reto actual
    var areaReto = document.createElement('div');
    areaReto.className = 'escape-area-reto';

    var titReto = document.createElement('h3');
    titReto.className = 'escape-tit-reto';

    var pistaReto = document.createElement('p');
    pistaReto.className = 'escape-pista-reto';

    var formReto = document.createElement('div');
    formReto.className = 'escape-form';

    var inputClave = document.createElement('input');
    inputClave.type = 'text';
    inputClave.className = 'escape-input';
    inputClave.placeholder = 'Ingresa el código o palabra clave...';
    inputClave.setAttribute('aria-label', 'Respuesta para el reto');

    var btnDesbloquear = document.createElement('button');
    btnDesbloquear.type = 'button';
    btnDesbloquear.className = 'escape-btn-desbloquear';
    btnDesbloquear.textContent = 'Desbloquear 🔓';

    var btnAyuda = document.createElement('button');
    btnAyuda.type = 'button';
    btnAyuda.className = 'escape-btn-ayuda';
    btnAyuda.textContent = 'Pista 💡';

    formReto.appendChild(inputClave);
    formReto.appendChild(btnDesbloquear);
    formReto.appendChild(btnAyuda);

    var msgFeedback = document.createElement('p');
    msgFeedback.className = 'escape-feedback';
    msgFeedback.setAttribute('role', 'status');
    msgFeedback.setAttribute('aria-live', 'polite');

    areaReto.appendChild(titReto);
    areaReto.appendChild(pistaReto);
    areaReto.appendChild(formReto);
    areaReto.appendChild(msgFeedback);
    raiz.appendChild(areaReto);

    // Pantalla de escape final
    var pantallaExito = document.createElement('div');
    pantallaExito.className = 'escape-exito';
    pantallaExito.hidden = true;
    raiz.appendChild(pantallaExito);

    cont.appendChild(raiz);

    function actualizarReto() {
      if (idxActual >= totalRetos) {
        finalizarEscape();
        return;
      }
      var r = retos[idxActual];
      titReto.textContent = r.titulo;
      pistaReto.textContent = r.pista;
      inputClave.value = '';
      try { inputClave.focus(); } catch (e) {}
      msgFeedback.textContent = '';
      msgFeedback.className = 'escape-feedback';
    }

    function normalizar(txt) {
      return String(txt || '').trim().toLowerCase().replace(/[.\s_-]/g, '');
    }

    function intentarDesbloqueo() {
      var val = normalizar(inputClave.value);
      var r = retos[idxActual];
      var sol = normalizar(r.solucion);

      if (val === sol) {
        // Acierto
        indicadores[idxActual].className = 'escape-indicador abierto';
        indicadores[idxActual].textContent = '🔓 Reto ' + (idxActual + 1);
        resueltos++;
        msgFeedback.textContent = '¡Código correcto! Cerradura desbloqueada.';
        msgFeedback.className = 'escape-feedback ok';
        if (M.sonido) M.sonido.acierto();

        idxActual++;
        var espera = ctx.reducido ? 50 : 1000;
        setTimeout(function () {
          actualizarReto();
        }, espera);
      } else {
        fallos++;
        msgFeedback.textContent = 'Código incorrecto. Revisa la pista e inténtalo de nuevo.';
        msgFeedback.className = 'escape-feedback mal';
        if (M.sonido) M.sonido.error();
      }
    }

    btnDesbloquear.addEventListener('click', intentarDesbloqueo);
    inputClave.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        intentarDesbloqueo();
      }
    });

    btnAyuda.addEventListener('click', function () {
      var r = retos[idxActual];
      msgFeedback.textContent = 'Pista: ' + (r.ayuda || 'Analiza con cuidado la pregunta');
      msgFeedback.className = 'escape-feedback';
      if (M.sonido) M.sonido.click();
    });

    function finalizarEscape() {
      areaReto.hidden = true;
      pantallaExito.hidden = false;
      graficoPuerta.textContent = '🚪🔓';
      graficoPuerta.classList.add('abierta');

      var ptsTotales = def.puntos || 20;
      var deduccion = Math.min(fallos * 2, ptsTotales * 0.5);
      var ptsGanados = Math.round(ptsTotales - deduccion);

      ctx.registrar(ptsGanados);
      ctx.guardar(1);
      ctx.completar();

      var tit = document.createElement('h3');
      tit.className = 'escape-res-titulo';
      tit.textContent = '🎉 ¡Has Escapado con Éxito!';

      var desc = document.createElement('p');
      desc.className = 'escape-res-desc';
      desc.textContent = 'Desbloqueaste las ' + totalRetos + ' cerraduras de seguridad del informe analítico. Puntuación obtenida: ' + ptsGanados + ' / ' + ptsTotales + ' pts.';

      pantallaExito.appendChild(tit);
      pantallaExito.appendChild(desc);
      if (M.sonido) M.sonido.acierto();
    }

    if (ctx.estadoInicial === 1) {
      indicadores.forEach(function (ind, k) {
        ind.className = 'escape-indicador abierto';
        ind.textContent = '🔓 Reto ' + (k + 1);
      });
      finalizarEscape();
    } else {
      actualizarReto();
    }
  };
})();

;
// Juego interactivo: Detective de Phishing y Ciberseguridad (Modo botones y desliza).
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  M.componentes.detective = function (cont, def, ctx) {
    var casos = def.casos || [
      {
        titulo: 'Caso 1: Notificación Urgente de Cuenta',
        remitente: 'soporte@seguridad-infotep.example',
        asunto: '¡URGENTE! Tu contraseña expirará en 2 horas',
        mensaje: 'Estimado facilitador, haz clic en el enlace para actualizar tus credenciales inmediatamente o tu cuenta será suspendida: actualiza-login.example/infotep',
        seguro: false,
        pistas: [
          'Sentido artificial de extrema urgencia para provocar pánico.',
          'El dominio del remitente no es el dominio oficial de la institución.',
          'El enlace utiliza un dominio sospechoso no institucional (.example).'
        ]
      },
      {
        titulo: 'Caso 2: Boletín Mensual de Innovación',
        remitente: 'comunicaciones@infotep.example',
        asunto: 'Boletín de novedades y buenas prácticas formativas',
        mensaje: 'Te compartimos las principales actividades formativas del mes en nuestro portal oficial aulavirtual.infotep.example/boletin.',
        seguro: true,
        pistas: [
          'Remitente coincide con el dominio oficial.',
          'Enlace institucional apuntando al portal verificado.',
          'No solicita contraseñas, pagos ni datos confidenciales.'
        ]
      },
      {
        titulo: 'Caso 3: Bono de Regalo Inesperado',
        remitente: 'premios@ganadores-rd.example',
        asunto: 'Has ganado un bono de combustible de RD$ 25,000',
        mensaje: 'Felicidades Johan Tapia, ingresa tu cédula y número de tarjeta aquí: reclama-tu-premio.example',
        seguro: false,
        pistas: [
          'Oferta no solicitada demasiado buena para ser real.',
          'Solicita datos financieros sensibles (tarjeta de crédito).',
          'El remitente no tiene relación con entidades autorizadas.'
        ]
      }
    ];

    var totalCasos = casos.length;
    var idxActual = 0;
    var aciertos = 0;

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-detective';
    raiz.setAttribute('data-anim', 'item');

    // Tarjeta del caso actual
    var tarjetaCaso = document.createElement('div');
    tarjetaCaso.className = 'detective-tarjeta';

    var cabeceraCaso = document.createElement('div');
    cabeceraCaso.className = 'detective-cabecera';

    var titCaso = document.createElement('h3');
    titCaso.className = 'detective-titulo';

    var metaCaso = document.createElement('div');
    metaCaso.className = 'detective-meta';

    var remitenteEl = document.createElement('p');
    remitenteEl.className = 'detective-remitente';

    var asuntoEl = document.createElement('p');
    asuntoEl.className = 'detective-asunto';

    metaCaso.appendChild(remitenteEl);
    metaCaso.appendChild(asuntoEl);
    cabeceraCaso.appendChild(titCaso);
    cabeceraCaso.appendChild(metaCaso);
    tarjetaCaso.appendChild(cabeceraCaso);

    var cuerpoEl = document.createElement('div');
    cuerpoEl.className = 'detective-cuerpo';
    tarjetaCaso.appendChild(cuerpoEl);

    // Controles de veredicto
    var panelBotones = document.createElement('div');
    panelBotones.className = 'detective-acciones';

    var btnSospechoso = document.createElement('button');
    btnSospechoso.type = 'button';
    btnSospechoso.className = 'detective-btn btn-sospechoso';
    btnSospechoso.textContent = '⚠️ Sospechoso / Phishing';
    btnSospechoso.addEventListener('click', function () { evaluar(false); });

    var btnSeguro = document.createElement('button');
    btnSeguro.type = 'button';
    btnSeguro.className = 'detective-btn btn-seguro';
    btnSeguro.textContent = '🛡️ Mensaje Seguro';
    btnSeguro.addEventListener('click', function () { evaluar(true); });

    panelBotones.appendChild(btnSospechoso);
    panelBotones.appendChild(btnSeguro);
    tarjetaCaso.appendChild(panelBotones);

    // Área de explicación educativa
    var areaPistas = document.createElement('div');
    areaPistas.className = 'detective-explicacion';
    areaPistas.hidden = true;
    tarjetaCaso.appendChild(areaPistas);

    raiz.appendChild(tarjetaCaso);

    // Pantalla de cierre de investigación
    var pantallaFin = document.createElement('div');
    pantallaFin.className = 'detective-fin';
    pantallaFin.hidden = true;
    raiz.appendChild(pantallaFin);

    cont.appendChild(raiz);

    function mostrarCaso() {
      var c = casos[idxActual];
      if (!c) return;
      titCaso.textContent = c.titulo + ' (' + (idxActual + 1) + ' / ' + totalCasos + ')';
      remitenteEl.textContent = 'De: ' + c.remitente;
      asuntoEl.textContent = 'Asunto: ' + c.asunto;
      cuerpoEl.textContent = c.mensaje;

      areaPistas.hidden = true;
      areaPistas.replaceChildren();
      btnSeguro.disabled = false;
      btnSospechoso.disabled = false;
    }

    function evaluar(esSeguroElegido) {
      btnSeguro.disabled = true;
      btnSospechoso.disabled = true;
      var c = casos[idxActual];
      var correcto = (esSeguroElegido === c.seguro);

      if (correcto) {
        aciertos++;
        if (M.sonido) M.sonido.acierto();
      } else {
        if (M.sonido) M.sonido.error();
      }

      areaPistas.hidden = false;
      areaPistas.replaceChildren();

      var verdictHeader = document.createElement('h4');
      verdictHeader.className = 'detective-veredicto-titulo ' + (correcto ? 'ok' : 'mal');
      verdictHeader.textContent = correcto ? '¡Veredicto Correcto!' : 'Veredicto Erróneo';
      areaPistas.appendChild(verdictHeader);

      var pExp = document.createElement('p');
      pExp.textContent = c.seguro ? 'Este mensaje es legítimo y seguro.' : 'Este mensaje es una amenaza de Phishing / Ingeniería Social.';
      areaPistas.appendChild(pExp);

      var ulPistas = document.createElement('ul');
      ulPistas.className = 'detective-lista-pistas';
      (c.pistas || []).forEach(function (pista) {
        var li = document.createElement('li');
        li.textContent = pista;
        ulPistas.appendChild(li);
      });
      areaPistas.appendChild(ulPistas);

      var btnSiguiente = document.createElement('button');
      btnSiguiente.type = 'button';
      btnSiguiente.className = 'detective-btn-sig';
      btnSiguiente.textContent = (idxActual < totalCasos - 1) ? 'Siguiente Caso →' : 'Ver Informe Final';
      btnSiguiente.addEventListener('click', function () {
        idxActual++;
        if (idxActual < totalCasos) {
          mostrarCaso();
        } else {
          finalizar();
        }
      });
      areaPistas.appendChild(btnSiguiente);
    }

    function finalizar() {
      tarjetaCaso.hidden = true;
      pantallaFin.hidden = false;
      pantallaFin.replaceChildren();

      var ptsTotales = def.puntos || 20;
      var ptsGanados = Math.round(ptsTotales * (aciertos / totalCasos));
      ctx.registrar(ptsGanados);
      ctx.guardar(1);
      ctx.completar();

      var tit = document.createElement('h3');
      tit.className = 'detective-fin-titulo';
      tit.textContent = '🕵️ ¡Investigación Concluida!';

      var resumen = document.createElement('p');
      resumen.className = 'detective-fin-desc';
      resumen.textContent = 'Identificaste correctamente ' + aciertos + ' de ' + totalCasos + ' casos. Puntuación: ' + ptsGanados + ' / ' + ptsTotales + ' pts.';

      pantallaFin.appendChild(tit);
      pantallaFin.appendChild(resumen);
    }

    if (ctx.estadoInicial === 1) {
      finalizar();
    } else {
      mostrarCaso();
    }
  };
})();

;
// Componente para Facilitadores: Modo Aula con temporizador grande, equipos y revelar respuesta.
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  M.componentes.aula = function (cont, def, ctx) {
    var equiposNombres = def.equipos || ['Equipo Alfa', 'Equipo Beta', 'Equipo Gamma'];
    var tiempoInicial = def.tiempo || 300; // 5 minutos por defecto
    var tiempoRestante = tiempoInicial;
    var timerActivo = false;
    var timerInterval = null;

    var puntosEquipos = equiposNombres.map(function () { return 0; });

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-aula';
    raiz.setAttribute('data-anim', 'item');

    // Barra de herramientas superior
    var barraSuperior = document.createElement('div');
    barraSuperior.className = 'aula-barra-sup';

    var btnPantalla = document.createElement('button');
    btnPantalla.type = 'button';
    btnPantalla.className = 'aula-btn-pantalla';
    btnPantalla.textContent = '⛶ Pantalla Completa';
    btnPantalla.addEventListener('click', function () {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
      } else {
        if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
      }
    });

    barraSuperior.appendChild(btnPantalla);
    raiz.appendChild(barraSuperior);

    // Temporizador grande
    var bloqueTimer = document.createElement('div');
    bloqueTimer.className = 'aula-bloque-timer';

    var displayTimer = document.createElement('div');
    displayTimer.className = 'aula-timer-display';
    bloqueTimer.appendChild(displayTimer);

    var controlesTimer = document.createElement('div');
    controlesTimer.className = 'aula-timer-controles';

    var btnStart = document.createElement('button');
    btnStart.type = 'button';
    btnStart.className = 'aula-btn-timer';
    btnStart.textContent = '▶ Iniciar';

    var btnPause = document.createElement('button');
    btnPause.type = 'button';
    btnPause.className = 'aula-btn-timer';
    btnPause.textContent = '⏸ Pausar';

    var btnReset = document.createElement('button');
    btnReset.type = 'button';
    btnReset.className = 'aula-btn-timer';
    btnReset.textContent = '↺ Reiniciar';

    controlesTimer.appendChild(btnStart);
    controlesTimer.appendChild(btnPause);
    controlesTimer.appendChild(btnReset);
    bloqueTimer.appendChild(controlesTimer);
    raiz.appendChild(bloqueTimer);

    function formatearTiempo(seg) {
      var m = Math.floor(seg / 60);
      var s = seg % 60;
      return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    function pintarTimer() {
      displayTimer.textContent = formatearTiempo(tiempoRestante);
    }

    btnStart.addEventListener('click', function () {
      if (timerActivo) return;
      timerActivo = true;
      ctx.completar();
      timerInterval = setInterval(function () {
        if (tiempoRestante > 0) {
          tiempoRestante--;
          pintarTimer();
        } else {
          clearInterval(timerInterval);
          timerActivo = false;
          if (M.sonido) M.sonido.acierto();
        }
      }, 1000);
    });

    btnPause.addEventListener('click', function () {
      timerActivo = false;
      if (timerInterval) clearInterval(timerInterval);
    });

    btnReset.addEventListener('click', function () {
      timerActivo = false;
      if (timerInterval) clearInterval(timerInterval);
      tiempoRestante = tiempoInicial;
      pintarTimer();
    });

    pintarTimer();

    // Tabla de equipos con puntuaciones
    var tablaEquipos = document.createElement('div');
    tablaEquipos.className = 'aula-tabla-equipos';

    var marcadorEquiposEl = [];

    equiposNombres.forEach(function (nombre, idx) {
      var colEquipo = document.createElement('div');
      colEquipo.className = 'aula-col-equipo';

      var nomEl = document.createElement('h4');
      nomEl.className = 'aula-nom-equipo';
      nomEl.textContent = nombre + ' (Tecla ' + (idx + 1) + ')';

      var ptsEl = document.createElement('div');
      ptsEl.className = 'aula-pts-equipo';
      ptsEl.textContent = '0 pts';
      marcadorEquiposEl.push(ptsEl);

      var btnsPuntos = document.createElement('div');
      btnsPuntos.className = 'aula-btns-puntos';

      var bMas1 = document.createElement('button');
      bMas1.type = 'button';
      bMas1.className = 'aula-btn-sumar';
      bMas1.textContent = '+1';
      bMas1.addEventListener('click', function () { sumar(idx, 1); });

      var bMas5 = document.createElement('button');
      bMas5.type = 'button';
      bMas5.className = 'aula-btn-sumar';
      bMas5.textContent = '+5';
      bMas5.addEventListener('click', function () { sumar(idx, 5); });

      var bMenos1 = document.createElement('button');
      bMenos1.type = 'button';
      bMenos1.className = 'aula-btn-restar';
      bMenos1.textContent = '-1';
      bMenos1.addEventListener('click', function () { sumar(idx, -1); });

      btnsPuntos.appendChild(bMas1);
      btnsPuntos.appendChild(bMas5);
      btnsPuntos.appendChild(bMenos1);

      colEquipo.appendChild(nomEl);
      colEquipo.appendChild(ptsEl);
      colEquipo.appendChild(btnsPuntos);
      tablaEquipos.appendChild(colEquipo);
    });

    raiz.appendChild(tablaEquipos);

    function sumar(idx, cantidad) {
      puntosEquipos[idx] = Math.max(0, puntosEquipos[idx] + cantidad);
      marcadorEquiposEl[idx].textContent = puntosEquipos[idx] + ' pts';
      if (M.sonido) M.sonido.click();
    }

    // Atajos de teclado para sumar puntos a equipos (1, 2, 3...)
    window.addEventListener('keydown', function (e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      var slideEl = raiz.closest ? raiz.closest('.slide') : null;
      if (slideEl && !slideEl.classList.contains('activa')) return;
      var num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= equiposNombres.length) {
        sumar(num - 1, 1);
      }
    });

    // Botón Revelar Respuesta / Pregunta plenaria
    if (def.pregunta || def.respuesta) {
      var bloquePlenaria = document.createElement('div');
      bloquePlenaria.className = 'aula-bloque-plenaria';

      if (def.pregunta) {
        var pregEl = document.createElement('h3');
        pregEl.className = 'aula-pregunta-plenaria';
        pregEl.textContent = def.pregunta;
        bloquePlenaria.appendChild(pregEl);
      }

      if (def.respuesta) {
        var respEl = document.createElement('div');
        respEl.className = 'aula-respuesta-revelada';
        respEl.textContent = def.respuesta;
        respEl.hidden = true;

        var btnRevelar = document.createElement('button');
        btnRevelar.type = 'button';
        btnRevelar.className = 'aula-btn-revelar';
        btnRevelar.textContent = '👁️ Revelar Respuesta';
        btnRevelar.addEventListener('click', function () {
          respEl.hidden = !respEl.hidden;
          btnRevelar.textContent = respEl.hidden ? '👁️ Revelar Respuesta' : 'Ocultar Respuesta';
          ctx.completar();
          if (M.sonido) M.sonido.acierto();
        });

        bloquePlenaria.appendChild(btnRevelar);
        bloquePlenaria.appendChild(respEl);
      }
      raiz.appendChild(bloquePlenaria);
    }

    cont.appendChild(raiz);
  };
})();

;
// Selección múltiple (varias correctas) e Imágenes (tarjetas con ícono para elegir). Puntaje proporcional, sin penalizar por debajo de 0.
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  function crear(cont, def, ctx, conIconos) {
    var elementos = conIconos ? (def.elementos || []).map(function (e) { return { texto: e.titulo, icono: e.icono || null, detalle: e.texto }; })
      : (def.opciones || []).map(function (t) { return { texto: t, icono: null }; });
    var correctas = Array.isArray(def.correctas) ? def.correctas.slice() : [];
    var puntos = def.puntos || 0;
    var elegidas = {};
    var listo = false;

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-quiz comp-seleccion' + (conIconos ? ' seleccion-imagenes' : '');
    raiz.setAttribute('role', 'group');

    var p = document.createElement('p');
    p.className = 'quiz-pregunta';
    p.id = 'pregunta-' + def.id;
    p.setAttribute('data-anim', 'item');
    p.textContent = def.pregunta || '';
    raiz.setAttribute('aria-labelledby', p.id);
    raiz.appendChild(p);

    var ayuda = document.createElement('p');
    ayuda.className = 'seleccion-ayuda';
    ayuda.textContent = 'Marca todas las correctas (hay ' + correctas.length + ') y pulsa Comprobar.';
    raiz.appendChild(ayuda);

    var lista = document.createElement('div');
    lista.className = 'quiz-opciones seleccion-lista';
    raiz.appendChild(lista);

    var botones = elementos.map(function (e, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'quiz-opcion seleccion-opcion';
      b.setAttribute('role', 'checkbox');
      b.setAttribute('aria-checked', 'false');
      b.setAttribute('data-anim', 'item');
      if (conIconos && e.icono && M.icono) {
        var ic = document.createElement('span');
        ic.className = 'seleccion-icono';
        ic.innerHTML = M.icono(e.icono, 88, 'currentColor', 1.5);   // SVG propio de Motor.iconos
        b.appendChild(ic);
      }
      var t = document.createElement('span');
      t.className = 'seleccion-texto';
      t.textContent = e.texto;
      b.appendChild(t);
      b.addEventListener('click', function () { alternar(i); });
      lista.appendChild(b);
      return b;
    });

    var acciones = document.createElement('div');
    acciones.className = 'quiz-acciones';
    var comprobar = document.createElement('button');
    comprobar.type = 'button';
    comprobar.className = 'quiz-btn-reintentar seleccion-comprobar';
    comprobar.textContent = 'Comprobar';
    comprobar.disabled = true;
    comprobar.addEventListener('click', function () { evaluar(); });
    acciones.appendChild(comprobar);
    raiz.appendChild(acciones);

    var retro = document.createElement('p');
    retro.className = 'quiz-retro';
    retro.setAttribute('role', 'status');
    retro.setAttribute('aria-live', 'polite');
    raiz.appendChild(retro);

    function seleccionadas() { return Object.keys(elegidas).filter(function (k) { return elegidas[k]; }).map(Number); }

    function alternar(i) {
      if (listo) return;
      elegidas[i] = !elegidas[i];
      botones[i].setAttribute('aria-checked', elegidas[i] ? 'true' : 'false');
      botones[i].classList.toggle('marcada', !!elegidas[i]);
      comprobar.disabled = seleccionadas().length === 0;
    }

    function evaluar(restaurando) {
      if (listo) return;
      listo = true;
      var sel = seleccionadas();
      var aciertos = 0, errores = 0;
      botones.forEach(function (b, i) {
        b.disabled = true;
        var esC = correctas.indexOf(i) >= 0, marc = sel.indexOf(i) >= 0;
        if (esC && marc) { b.classList.add('ok'); aciertos++; }
        else if (!esC && marc) { b.classList.add('mal'); errores++; }
        else if (esC && !marc) { b.classList.add('falto'); }
      });
      comprobar.disabled = true;
      var fraccion = correctas.length ? Math.max(0, (aciertos - errores) / correctas.length) : 0;
      var perfecto = aciertos === correctas.length && errores === 0;
      retro.textContent = perfecto ? ((def.retro && def.retro[0]) || '¡Perfecto! Marcaste todas las correctas.')
        : ((def.retro && def.retro[1]) || ('Acertaste ' + aciertos + ' de ' + correctas.length + (errores ? ' y marcaste ' + errores + ' de más.' : '. Faltó marcar alguna.')));
      retro.className = 'quiz-retro ' + (perfecto ? 'ok' : 'mal');
      // también al restaurar: el puntaje del host se reconstruye con lo que cada componente registra (igual que quiz.js)
      ctx.registrar(Math.round(puntos * fraccion));
      ctx.guardar({ sel: sel });
      ctx.completar();
      void restaurando;
    }

    cont.appendChild(raiz);
    var ini = ctx.estadoInicial;
    if (ini && Array.isArray(ini.sel)) {
      ini.sel.forEach(function (i) { if (i >= 0 && i < elementos.length) { elegidas[i] = true; botones[i].classList.add('marcada'); botones[i].setAttribute('aria-checked', 'true'); } });
      evaluar(true);
    }
  }

  M.componentes._seleccion = function (cont, def, ctx) { crear(cont, def, ctx, false); };
  M.componentes.imagenes = function (cont, def, ctx) { crear(cont, def, ctx, true); };
})();

;
// Completar espacios: texto con [[respuesta]] (o [[resp|alterna]]). Con banco de palabras (tocar palabra y luego hueco) o escribiendo.
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  function norm(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  M.normalizar = M.normalizar || norm;

  M.componentes.completar = function (cont, def, ctx) {
    var partes = [];     // {t: texto} o {h: indice}
    var huecos = [];     // {ok:[respuestas aceptadas], mostrar: primera}
    String(def.texto || '').split(/(\[\[[^\]]+\]\])/).forEach(function (seg) {
      var m = seg.match(/^\[\[([^\]]+)\]\]$/);
      if (m) { var alt = m[1].split('|').map(function (s) { return s.trim(); }).filter(Boolean); huecos.push({ ok: alt, mostrar: alt[0] }); partes.push({ h: huecos.length - 1 }); }
      else if (seg) partes.push({ t: seg });
    });
    var conBanco = def.banco !== false;
    var puntos = def.puntos || 0;
    var valores = huecos.map(function () { return ''; });
    var listo = false;
    var palabraSel = -1;

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-completar';
    raiz.setAttribute('role', 'group');

    if (def.pregunta) {
      var p = document.createElement('p');
      p.className = 'quiz-pregunta';
      p.setAttribute('data-anim', 'item');
      p.textContent = def.pregunta;
      raiz.appendChild(p);
    }

    var parrafo = document.createElement('p');
    parrafo.className = 'completar-texto';
    parrafo.setAttribute('data-anim', 'item');
    var campos = [];
    partes.forEach(function (pt) {
      if (pt.t != null) { parrafo.appendChild(document.createTextNode(pt.t)); return; }
      var i = pt.h, el;
      if (conBanco) {
        el = document.createElement('button');
        el.type = 'button';
        el.className = 'completar-hueco';
        el.setAttribute('aria-label', 'Espacio ' + (i + 1) + ', vacío');
        el.textContent = ' ';
        el.addEventListener('click', function () { clicHueco(i); });
      } else {
        el = document.createElement('input');
        el.type = 'text';
        el.className = 'completar-hueco completar-escribir';
        el.setAttribute('aria-label', 'Espacio ' + (i + 1));
        el.autocomplete = 'off';
        el.style.width = Math.max(6, Math.min(24, huecos[i].mostrar.length + 3)) + 'ch';
        el.addEventListener('input', function () { valores[i] = el.value; actualizarBoton(); });
      }
      campos[i] = el;
      parrafo.appendChild(el);
    });
    raiz.appendChild(parrafo);

    var banco = null, fichas = [];
    if (conBanco) {
      banco = document.createElement('div');
      banco.className = 'completar-banco';
      banco.setAttribute('data-anim', 'item');
      var base = huecos.map(function (h) { return h.mostrar; });
      var barajadas = (M.mezclar ? M.mezclar(base.map(function (t, k) { return { t: t, k: k }; }), def.id || 'completar') : base.map(function (t, k) { return { t: t, k: k }; }));
      barajadas.forEach(function (it) {
        var f = document.createElement('button');
        f.type = 'button';
        f.className = 'completar-ficha';
        f.setAttribute('aria-pressed', 'false');
        f.textContent = it.t;
        f.addEventListener('click', function () { clicFicha(f, it.t); });
        banco.appendChild(f);
        fichas.push(f);
      });
      raiz.appendChild(banco);
    }

    var acciones = document.createElement('div');
    acciones.className = 'quiz-acciones';
    var comprobar = document.createElement('button');
    comprobar.type = 'button';
    comprobar.className = 'quiz-btn-reintentar completar-comprobar';
    comprobar.textContent = 'Comprobar';
    comprobar.disabled = true;
    comprobar.addEventListener('click', function () { evaluar(); });
    acciones.appendChild(comprobar);
    raiz.appendChild(acciones);

    var retro = document.createElement('p');
    retro.className = 'quiz-retro';
    retro.setAttribute('role', 'status');
    retro.setAttribute('aria-live', 'polite');
    raiz.appendChild(retro);

    var fichaDe = {};   // indice hueco -> ficha usada
    function actualizarBoton() { comprobar.disabled = listo || valores.some(function (v) { return !String(v).trim(); }); }

    function clicFicha(f, texto) {
      if (listo || f.disabled) return;
      if (palabraSel >= 0 && fichas[palabraSel] === f) { f.setAttribute('aria-pressed', 'false'); palabraSel = -1; return; }
      fichas.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      f.setAttribute('aria-pressed', 'true');
      palabraSel = fichas.indexOf(f);
      // si ya hay un hueco vacío enfocado, colócala ahí
      var vacio = valores.findIndex(function (v) { return !v; });
      if (document.activeElement && campos.indexOf(document.activeElement) >= 0 && !valores[campos.indexOf(document.activeElement)]) vacio = campos.indexOf(document.activeElement);
      void vacio;
      void texto;
    }

    function clicHueco(i) {
      if (listo) return;
      if (valores[i]) {   // devolver la palabra al banco
        var f0 = fichaDe[i];
        if (f0) { f0.disabled = false; f0.classList.remove('usada'); }
        valores[i] = ''; delete fichaDe[i];
        campos[i].textContent = ' '; campos[i].classList.remove('lleno');
        campos[i].setAttribute('aria-label', 'Espacio ' + (i + 1) + ', vacío');
        actualizarBoton();
        return;
      }
      if (palabraSel < 0) { retro.textContent = 'Primero toca una palabra del banco.'; retro.className = 'quiz-retro'; return; }
      var f = fichas[palabraSel];
      valores[i] = f.textContent; fichaDe[i] = f;
      f.disabled = true; f.classList.add('usada'); f.setAttribute('aria-pressed', 'false'); palabraSel = -1;
      campos[i].textContent = valores[i]; campos[i].classList.add('lleno');
      campos[i].setAttribute('aria-label', 'Espacio ' + (i + 1) + ': ' + valores[i]);
      retro.textContent = '';
      actualizarBoton();
    }

    function evaluar() {
      if (listo) return;
      var bien = 0;
      huecos.forEach(function (h, i) {
        var ok = h.ok.some(function (a) { return norm(a) === norm(valores[i]); });
        if (ok) bien++;
        campos[i].classList.add(ok ? 'ok' : 'mal');
        if (!ok) { campos[i].setAttribute('title', 'Correcta: ' + h.mostrar); }
        if (conBanco) campos[i].disabled = true; else campos[i].readOnly = true;
      });
      listo = true;
      comprobar.disabled = true;
      fichas.forEach(function (f) { f.disabled = true; });
      var perfecto = bien === huecos.length;
      retro.textContent = perfecto ? '¡Excelente! Completaste todo bien.' : 'Acertaste ' + bien + ' de ' + huecos.length + '. Las respuestas correctas están en cada espacio rojo.';
      retro.className = 'quiz-retro ' + (perfecto ? 'ok' : 'mal');
      if (!perfecto) campos.forEach(function (c, i) { if (c.classList.contains('mal')) { if (conBanco) c.textContent = huecos[i].mostrar; else c.value = huecos[i].mostrar; } });
      ctx.registrar(Math.round(puntos * (huecos.length ? bien / huecos.length : 0)));
      ctx.guardar({ v: valores.slice() });
      ctx.completar();
    }

    cont.appendChild(raiz);
    var ini = ctx.estadoInicial;
    if (ini && Array.isArray(ini.v) && ini.v.length === huecos.length) {
      ini.v.forEach(function (v, i) {
        valores[i] = v;
        if (conBanco) { campos[i].textContent = v || ' '; if (v) campos[i].classList.add('lleno'); } else campos[i].value = v;
      });
      evaluar();
    }
  };
})();

;
// Respuesta corta: se escribe y se compara sin tildes ni mayúsculas con las respuestas aceptadas. Dos intentos (100 % y 50 %).
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  M.componentes.corta = function (cont, def, ctx) {
    var norm = M.normalizar || function (t) { return String(t || '').toLowerCase().trim(); };
    var aceptadas = (def.aceptadas || []).slice();
    var puntos = def.puntos || 0;
    var intentos = 0, listo = false;

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-corta';
    raiz.setAttribute('role', 'group');

    var p = document.createElement('p');
    p.className = 'quiz-pregunta';
    p.id = 'pregunta-' + def.id;
    p.setAttribute('data-anim', 'item');
    p.textContent = def.pregunta || '';
    raiz.setAttribute('aria-labelledby', p.id);
    raiz.appendChild(p);

    var fila = document.createElement('div');
    fila.className = 'corta-fila';
    fila.setAttribute('data-anim', 'item');
    var entrada = document.createElement('input');
    entrada.type = 'text';
    entrada.className = 'corta-entrada';
    entrada.autocomplete = 'off';
    entrada.placeholder = 'Escribe tu respuesta';
    entrada.setAttribute('aria-labelledby', p.id);
    var boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'quiz-btn-reintentar corta-comprobar';
    boton.textContent = 'Comprobar';
    fila.appendChild(entrada);
    fila.appendChild(boton);
    raiz.appendChild(fila);

    var retro = document.createElement('p');
    retro.className = 'quiz-retro';
    retro.setAttribute('role', 'status');
    retro.setAttribute('aria-live', 'polite');
    raiz.appendChild(retro);

    function cerrar(texto, ok, pts) {
      listo = true;
      entrada.readOnly = true; boton.disabled = true;
      entrada.classList.add(ok ? 'ok' : 'mal');
      retro.textContent = texto; retro.className = 'quiz-retro ' + (ok ? 'ok' : 'mal');
      ctx.registrar(pts);
      ctx.guardar({ t: entrada.value, i: intentos, ok: ok });
      ctx.completar();
    }

    function comprobar() {
      if (listo) return;
      var v = norm(entrada.value);
      if (!v) { retro.textContent = 'Escribe una respuesta primero.'; retro.className = 'quiz-retro'; return; }
      intentos++;
      var ok = aceptadas.some(function (a) { return norm(a) === v; });
      if (ok) { cerrar(intentos === 1 ? '¡Correcto!' : '¡Correcto en el segundo intento! (50 % del puntaje)', true, intentos === 1 ? puntos : Math.round(puntos / 2)); return; }
      if (intentos >= 2) { cerrar('No es esa. La respuesta era: ' + (aceptadas[0] || ''), false, 0); return; }
      retro.textContent = 'Casi. ' + (def.pista ? 'Pista: ' + def.pista : 'Inténtalo de nuevo.') + ' (te queda 1 intento)';
      retro.className = 'quiz-retro mal';
      entrada.select();
    }
    boton.addEventListener('click', comprobar);
    entrada.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); comprobar(); } e.stopPropagation(); });

    cont.appendChild(raiz);
    var ini = ctx.estadoInicial;
    if (ini && typeof ini.t === 'string') {
      entrada.value = ini.t; intentos = ini.i || 1;
      cerrar(ini.ok ? 'Respondida.' : 'No es esa. La respuesta era: ' + (aceptadas[0] || ''), !!ini.ok, ini.ok ? (intentos === 1 ? puntos : Math.round(puntos / 2)) : 0);
    }
  };
})();

;
// Deslizar (swipe and hit): tarjetas de afirmaciones que se arrastran a la derecha (verdadero) o a la izquierda (falso).
// También con botones y con las flechas ← → cuando el componente tiene el foco. Puntaje proporcional a los aciertos.
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  M.componentes.deslizar = function (cont, def, ctx) {
    var cartas = def.cartas || [];
    var puntos = def.puntos || 0;
    var i = 0, aciertos = 0, respuestas = [];
    var reducido = ctx.reducido;

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-deslizar';
    raiz.setAttribute('role', 'group');
    raiz.tabIndex = 0;
    raiz.setAttribute('aria-label', (def.pregunta || 'Desliza las tarjetas') + '. Usa las flechas izquierda (falso) y derecha (verdadero).');

    var p = document.createElement('p');
    p.className = 'quiz-pregunta';
    p.setAttribute('data-anim', 'item');
    p.textContent = def.pregunta || 'Desliza a la derecha si es verdadero y a la izquierda si es falso.';
    raiz.appendChild(p);

    var marcador = document.createElement('div');
    marcador.className = 'deslizar-marcador';
    var cuenta = document.createElement('span');
    var barra = document.createElement('span');
    barra.className = 'deslizar-barra';
    var relleno = document.createElement('i');
    barra.appendChild(relleno);
    marcador.appendChild(cuenta);
    marcador.appendChild(barra);
    raiz.appendChild(marcador);

    var escenario = document.createElement('div');
    escenario.className = 'deslizar-escenario';
    var etF = document.createElement('div'); etF.className = 'deslizar-et deslizar-et-f'; etF.textContent = '✗ Falso';
    var etV = document.createElement('div'); etV.className = 'deslizar-et deslizar-et-v'; etV.textContent = 'Verdadero ✓';
    escenario.appendChild(etF); escenario.appendChild(etV);
    var pila = document.createElement('div');
    pila.className = 'deslizar-pila';
    escenario.appendChild(pila);
    raiz.appendChild(escenario);

    var botones = document.createElement('div');
    botones.className = 'deslizar-botones';
    var bF = document.createElement('button'); bF.type = 'button'; bF.className = 'deslizar-btn deslizar-btn-f'; bF.textContent = '← Falso';
    var bV = document.createElement('button'); bV.type = 'button'; bV.className = 'deslizar-btn deslizar-btn-v'; bV.textContent = 'Verdadero →';
    botones.appendChild(bF); botones.appendChild(bV);
    raiz.appendChild(botones);

    var retro = document.createElement('p');
    retro.className = 'quiz-retro';
    retro.setAttribute('role', 'status');
    retro.setAttribute('aria-live', 'polite');
    raiz.appendChild(retro);

    function dibujar() {
      pila.textContent = '';
      cuenta.textContent = Math.min(i + 1, cartas.length) + ' / ' + cartas.length;
      relleno.style.width = (100 * i / Math.max(1, cartas.length)) + '%';
      for (var k = Math.min(cartas.length - 1, i + 2); k >= i; k--) {
        var c = document.createElement('div');
        c.className = 'deslizar-carta' + (k === i ? ' superior' : '');
        c.style.setProperty('--pos', String(k - i));
        var t = document.createElement('span');
        t.textContent = cartas[k].texto;
        c.appendChild(t);
        pila.appendChild(c);
        if (k === i) engancharArrastre(c);
      }
    }

    var arrastre = null;
    function engancharArrastre(c) {
      c.addEventListener('pointerdown', function (e) {
        arrastre = { x0: e.clientX, dx: 0 };
        try { c.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
        c.classList.add('arrastrando');
      });
      c.addEventListener('pointermove', function (e) {
        if (!arrastre) return;
        arrastre.dx = e.clientX - arrastre.x0;
        c.style.transform = 'translateX(' + arrastre.dx + 'px) rotate(' + (arrastre.dx / 22) + 'deg)';
        escenario.classList.toggle('hacia-v', arrastre.dx > 40);
        escenario.classList.toggle('hacia-f', arrastre.dx < -40);
      });
      function soltar() {
        if (!arrastre) return;
        var dx = arrastre.dx; arrastre = null;
        c.classList.remove('arrastrando');
        escenario.classList.remove('hacia-v', 'hacia-f');
        if (Math.abs(dx) > 90) responder(dx > 0); else c.style.transform = '';
      }
      c.addEventListener('pointerup', soltar);
      c.addEventListener('pointercancel', soltar);
    }

    function responder(dijoVerdadero) {
      if (i >= cartas.length) return;
      var carta = cartas[i];
      var ok = (!!carta.verdadera) === dijoVerdadero;
      if (ok) aciertos++;
      respuestas.push(dijoVerdadero ? 1 : 0);
      var sup = pila.querySelector('.superior');
      if (sup) {
        sup.classList.add(ok ? 'acierto' : 'error');
        if (!reducido) sup.style.transform = 'translateX(' + (dijoVerdadero ? 900 : -900) + 'px) rotate(' + (dijoVerdadero ? 24 : -24) + 'deg)';
        sup.style.opacity = '0';
      }
      retro.textContent = (ok ? '✓ ' : '✗ ') + (carta.explicacion || (ok ? 'Correcto.' : 'Esa afirmación era ' + (carta.verdadera ? 'verdadera' : 'falsa') + '.'));
      retro.className = 'quiz-retro ' + (ok ? 'ok' : 'mal');
      i++;
      ctx.guardar({ r: respuestas.slice() });
      var siguiente = function () { if (i >= cartas.length) terminar(); else dibujar(); };
      if (reducido) siguiente(); else setTimeout(siguiente, 380);
    }

    function terminar() {
      pila.textContent = '';
      relleno.style.width = '100%';
      cuenta.textContent = cartas.length + ' / ' + cartas.length;
      botones.hidden = true;
      var fin = document.createElement('div');
      fin.className = 'deslizar-fin';
      fin.textContent = 'Acertaste ' + aciertos + ' de ' + cartas.length;
      pila.appendChild(fin);
      ctx.registrar(Math.round(puntos * (cartas.length ? aciertos / cartas.length : 0)));
      ctx.completar();
      if (aciertos === cartas.length && M.vivo && M.vivo.confeti) M.vivo.confeti(raiz.closest('.slide') || raiz, 40);
    }

    bF.addEventListener('click', function () { responder(false); });
    bV.addEventListener('click', function () { responder(true); });
    raiz.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); responder(true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); responder(false); }
    });

    cont.appendChild(raiz);
    var ini = ctx.estadoInicial;
    if (ini && Array.isArray(ini.r)) {
      ini.r.slice(0, cartas.length).forEach(function (r, k) { if ((!!cartas[k].verdadera) === (r === 1)) aciertos++; respuestas.push(r); });
      i = respuestas.length;
    }
    if (i >= cartas.length) { dibujar(); terminar(); } else dibujar();
  };
})();

;
// Escenario con ramas: cada decisión lleva a otro nodo; los nodos finales dan el resultado. Puntaje completo si el final es de éxito.
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  M.componentes.ramas = function (cont, def, ctx) {
    var nodos = def.nodos || [];
    var porId = {};
    nodos.forEach(function (n) { porId[n.id] = n; });
    var puntos = def.puntos || 0;
    var camino = [];
    var actual = nodos.length ? nodos[0].id : null;
    var mejor = 0;

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-ramas';
    raiz.setAttribute('role', 'group');

    var cabecera = document.createElement('div');
    cabecera.className = 'ramas-cabecera';
    var rastro = document.createElement('span');
    rastro.className = 'ramas-rastro';
    cabecera.appendChild(rastro);
    raiz.appendChild(cabecera);

    var tarjeta = document.createElement('div');
    tarjeta.className = 'ramas-tarjeta';
    tarjeta.setAttribute('aria-live', 'polite');
    raiz.appendChild(tarjeta);

    function mostrar(id, animar) {
      var n = porId[id];
      if (!n) return;
      actual = id;
      tarjeta.textContent = '';
      tarjeta.className = 'ramas-tarjeta' + (n.final ? (n.exito ? ' final-exito' : ' final-fallo') : '');
      rastro.textContent = n.final ? 'Resultado' : 'Decisión ' + (camino.length + 1);
      var t = document.createElement('p');
      t.className = 'ramas-texto';
      t.textContent = n.texto;
      tarjeta.appendChild(t);
      if (n.final) {
        var r = document.createElement('p');
        r.className = 'ramas-resultado';
        r.textContent = (n.exito ? '🏆 ' : '↺ ') + (n.resultado || (n.exito ? '¡Lograste el mejor final!' : 'Este final no es el ideal.'));
        tarjeta.appendChild(r);
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'quiz-btn-reintentar ramas-reiniciar';
        b.textContent = 'Probar otro camino';
        b.addEventListener('click', function () { camino = []; mostrar(nodos[0].id, true); ctx.guardar({ c: [], m: mejor }); });
        tarjeta.appendChild(b);
        if (n.exito && !mejor) { mejor = 1; ctx.registrar(puntos); if (M.vivo && M.vivo.confeti) M.vivo.confeti(raiz.closest('.slide') || raiz, 50); }
        ctx.guardar({ c: camino.slice(), m: mejor });
        ctx.completar();
      } else {
        var ul = document.createElement('div');
        ul.className = 'ramas-opciones';
        (n.opciones || []).forEach(function (o, k) {
          var b2 = document.createElement('button');
          b2.type = 'button';
          b2.className = 'ramas-opcion';
          b2.setAttribute('data-anim', 'item');
          var letra = document.createElement('span'); letra.className = 'ramas-letra'; letra.textContent = String.fromCharCode(65 + k);
          var tx = document.createElement('span'); tx.textContent = o.texto;
          b2.appendChild(letra); b2.appendChild(tx);
          b2.addEventListener('click', function () { camino.push(k); ctx.guardar({ c: camino.slice(), m: mejor }); mostrar(o.siguiente, true); });
          ul.appendChild(b2);
        });
        tarjeta.appendChild(ul);
      }
      if (animar && !ctx.reducido) { tarjeta.classList.remove('entra'); void tarjeta.offsetWidth; tarjeta.classList.add('entra'); }
    }

    cont.appendChild(raiz);
    var ini = ctx.estadoInicial;
    if (ini && Array.isArray(ini.c)) {
      mejor = ini.m || 0;
      var id = nodos[0].id;
      ini.c.forEach(function (k) { var n = porId[id]; if (n && n.opciones && n.opciones[k]) { camino.push(k); id = n.opciones[k].siguiente; } });
      if (mejor) ctx.registrar(puntos);
      mostrar(id, false);
    } else if (actual) mostrar(actual, false);
  };
})();

;
// Línea de tiempo animada (hitos que se revelan) y carrusel de tarjetas (con puntos, flechas y deslizar). Completan al ver todos.
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};

  function icono(nombre, t) { return (nombre && M.icono) ? M.icono(nombre, t, 'currentColor', 1.6) : ''; }

  function base(def, clase, extra) {
    var raiz = document.createElement('div');
    raiz.className = 'comp ' + clase;
    raiz.setAttribute('role', 'group');
    raiz.setAttribute('data-anim', 'item');
    if (def.pregunta) { raiz.setAttribute('aria-label', def.pregunta); }
    void extra;
    return raiz;
  }

  // ------------------------------------------------------------------ línea de tiempo
  M.componentes.tiempo = function (cont, def, ctx) {
    var hitos = def.hitos || [];
    var vistos = {};
    var actual = 0;
    var raiz = base(def, 'comp-tiempo');

    if (def.pregunta) {
      var p = document.createElement('p'); p.className = 'quiz-pregunta'; p.textContent = def.pregunta; raiz.appendChild(p);
    }
    var eje = document.createElement('div');
    eje.className = 'tiempo-eje';
    var linea = document.createElement('div'); linea.className = 'tiempo-linea';
    var avance = document.createElement('i'); linea.appendChild(avance);
    eje.appendChild(linea);
    var puntos = hitos.map(function (h, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tiempo-punto';
      b.style.left = (hitos.length === 1 ? 50 : (100 * i / (hitos.length - 1))) + '%';
      b.setAttribute('aria-label', 'Hito ' + (i + 1) + ': ' + h.titulo);
      var n = document.createElement('span'); n.textContent = String(i + 1); b.appendChild(n);
      var et = document.createElement('em'); et.textContent = h.titulo; b.appendChild(et);
      b.addEventListener('click', function () { ir(i); });
      eje.appendChild(b);
      return b;
    });
    raiz.appendChild(eje);

    var detalle = document.createElement('div');
    detalle.className = 'tiempo-detalle';
    detalle.setAttribute('aria-live', 'polite');
    raiz.appendChild(detalle);

    var nav = document.createElement('div');
    nav.className = 'quiz-acciones tiempo-nav';
    var ant = document.createElement('button'); ant.type = 'button'; ant.className = 'quiz-btn-reintentar tiempo-ant'; ant.textContent = '‹ Anterior';
    var sig = document.createElement('button'); sig.type = 'button'; sig.className = 'quiz-btn-reintentar tiempo-sig'; sig.textContent = 'Siguiente ›';
    ant.addEventListener('click', function () { ir(actual - 1); });
    sig.addEventListener('click', function () { ir(actual + 1); });
    nav.appendChild(ant); nav.appendChild(sig);
    raiz.appendChild(nav);

    function ir(i) {
      if (i < 0 || i >= hitos.length) return;
      actual = i; vistos[i] = true;
      puntos.forEach(function (b, k) {
        b.classList.toggle('actual', k === i);
        b.classList.toggle('visto', !!vistos[k] || k < i);
        if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      avance.style.width = (hitos.length === 1 ? 100 : (100 * i / (hitos.length - 1))) + '%';
      detalle.textContent = '';
      var ic = icono(hitos[i].icono, 64);
      if (ic) { var s = document.createElement('span'); s.className = 'tiempo-icono'; s.innerHTML = ic; detalle.appendChild(s); }   // SVG propio de Motor.iconos
      var d = document.createElement('div');
      var h = document.createElement('h3'); h.textContent = hitos[i].titulo;
      var t = document.createElement('p'); t.textContent = hitos[i].texto;
      d.appendChild(h); d.appendChild(t); detalle.appendChild(d);
      if (!ctx.reducido) { detalle.classList.remove('entra'); void detalle.offsetWidth; detalle.classList.add('entra'); }
      ant.disabled = i === 0; sig.disabled = i === hitos.length - 1;
      var ks = Object.keys(vistos).map(Number);
      ctx.guardar(ks);
      if (ks.length === hitos.length) ctx.completar();
    }

    cont.appendChild(raiz);
    var ini = ctx.estadoInicial;
    if (Array.isArray(ini)) ini.forEach(function (k) { vistos[k] = true; });
    ir(0);
  };

  // ------------------------------------------------------------------ carrusel
  M.componentes.carrusel = function (cont, def, ctx) {
    var items = def.elementos || [];
    var vistos = {};
    var actual = 0;
    var raiz = base(def, 'comp-carrusel');
    if (def.pregunta) { var p = document.createElement('p'); p.className = 'quiz-pregunta'; p.textContent = def.pregunta; raiz.appendChild(p); }

    var marco = document.createElement('div');
    marco.className = 'carrusel-marco';
    marco.tabIndex = 0;
    marco.setAttribute('aria-roledescription', 'carrusel');
    var pista = document.createElement('div');
    pista.className = 'carrusel-pista';
    var tarjetas = items.map(function (e, i) {
      var c = document.createElement('article');
      c.className = 'carrusel-tarjeta';
      c.setAttribute('aria-roledescription', 'diapositiva');
      c.setAttribute('aria-label', (i + 1) + ' de ' + items.length);
      var ic = icono(e.icono, 96);
      if (ic) { var s = document.createElement('div'); s.className = 'carrusel-icono'; s.innerHTML = ic; c.appendChild(s); }   // SVG propio de Motor.iconos
      var h = document.createElement('h3'); h.textContent = e.titulo;
      var t = document.createElement('p'); t.textContent = e.texto;
      c.appendChild(h); c.appendChild(t);
      pista.appendChild(c);
      return c;
    });
    marco.appendChild(pista);
    raiz.appendChild(marco);

    var barra = document.createElement('div');
    barra.className = 'carrusel-barra';
    var ant = document.createElement('button'); ant.type = 'button'; ant.className = 'carrusel-flecha carrusel-ant'; ant.setAttribute('aria-label', 'Anterior'); ant.textContent = '‹';
    var sig = document.createElement('button'); sig.type = 'button'; sig.className = 'carrusel-flecha carrusel-sig'; sig.setAttribute('aria-label', 'Siguiente'); sig.textContent = '›';
    var puntosEl = document.createElement('div'); puntosEl.className = 'carrusel-puntos';
    var dots = items.map(function (e, i) {
      var d = document.createElement('button'); d.type = 'button'; d.className = 'carrusel-punto'; d.setAttribute('aria-label', 'Ir a ' + e.titulo);
      d.addEventListener('click', function () { ir(i); });
      puntosEl.appendChild(d); return d;
    });
    ant.addEventListener('click', function () { ir(actual - 1); });
    sig.addEventListener('click', function () { ir(actual + 1); });
    barra.appendChild(ant); barra.appendChild(puntosEl); barra.appendChild(sig);
    raiz.appendChild(barra);

    function ir(i) {
      if (i < 0 || i >= items.length) return;
      actual = i; vistos[i] = true;
      tarjetas.forEach(function (c, k) {
        var d = k - i;
        c.style.setProperty('--d', String(d));
        c.classList.toggle('centro', d === 0);
        c.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      });
      dots.forEach(function (b, k) { b.classList.toggle('actual', k === i); b.classList.toggle('visto', !!vistos[k]); });
      ant.disabled = i === 0; sig.disabled = i === items.length - 1;
      var ks = Object.keys(vistos).map(Number);
      ctx.guardar(ks);
      if (ks.length === items.length) ctx.completar();
    }

    // deslizar con el dedo o el ratón
    var x0 = null;
    marco.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    marco.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (dx < -50) ir(actual + 1); else if (dx > 50) ir(actual - 1);
    });
    marco.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); ir(actual + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); ir(actual - 1); }
    });

    cont.appendChild(raiz);
    var ini = ctx.estadoInicial;
    if (Array.isArray(ini)) ini.forEach(function (k) { vistos[k] = true; });
    ir(0);
  };
})();

;
// Gráficos animados (barras y anillo) y cifras con contador animado. Se animan al ver la diapositiva. SVG propio, sin librerías.
(function () {
  var M = (window.Motor = window.Motor || {});
  M.componentes = M.componentes || {};
  var COLORES = ['#176EE4', '#63B82E', '#FFD100', '#FF6B57', '#8b5cf6', '#14b8a6', '#f97316', '#003B7A'];
  var NS = ['http:', '', 'www.w3.org', '2000', 'svg'].join('/');   // espacio de nombres SVG (no es una petición de red)

  // Ejecuta fn cuando el elemento se hace visible (la diapositiva activa pasa de display:none a visible) y solo una vez.
  M.alVer = M.alVer || function (el, fn) {
    if (typeof IntersectionObserver === 'undefined') { fn(); return; }
    var hecho = false;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && !hecho) { hecho = true; io.disconnect(); fn(); } });
    }, { threshold: 0.25 });
    io.observe(el);
  };

  M.contar = M.contar || function (el, hasta, formato, reducido) {
    if (reducido || typeof requestAnimationFrame === 'undefined') { el.textContent = formato(hasta); return; }
    var t0 = null, dur = 1400;
    function paso(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = formato(hasta * e);
      if (k < 1) requestAnimationFrame(paso); else el.textContent = formato(hasta);
    }
    requestAnimationFrame(paso);
  };

  function fmt(unidad, decimales) {
    return function (v) {
      var n = decimales ? v.toFixed(decimales) : String(Math.round(v));
      return n.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (unidad || '');
    };
  }

  function svg(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  M.componentes.grafico = function (cont, def, ctx) {
    var datos = def.datos || [];
    var variante = def.variante === 'anillo' ? 'anillo' : 'barras';
    var unidad = def.unidad || '';
    var total = datos.reduce(function (s, d) { return s + d.valor; }, 0) || 1;
    var max = Math.max.apply(null, datos.map(function (d) { return d.valor; })) || 1;

    var raiz = document.createElement('div');
    raiz.className = 'comp comp-grafico grafico-v-' + variante;
    raiz.setAttribute('role', 'img');
    raiz.setAttribute('aria-label', (def.pregunta || 'Gráfico') + ': ' + datos.map(function (d) { return d.etiqueta + ' ' + d.valor + unidad; }).join(', '));
    raiz.setAttribute('data-anim', 'item');
    if (def.pregunta) { var p = document.createElement('p'); p.className = 'quiz-pregunta'; p.textContent = def.pregunta; raiz.appendChild(p); }

    var cuerpo = document.createElement('div');
    cuerpo.className = 'grafico-cuerpo';
    raiz.appendChild(cuerpo);
    var valoresEl = [];

    if (variante === 'barras') {
      datos.forEach(function (d, i) {
        var fila = document.createElement('div'); fila.className = 'grafico-fila';
        var et = document.createElement('span'); et.className = 'grafico-etiqueta'; et.textContent = d.etiqueta;
        var pista = document.createElement('div'); pista.className = 'grafico-pista';
        var barra = document.createElement('i'); barra.style.background = d.color || COLORES[i % COLORES.length]; barra.style.setProperty('--w', (100 * d.valor / max) + '%');
        pista.appendChild(barra);
        var v = document.createElement('b'); v.className = 'grafico-valor'; v.textContent = '0' + unidad;
        valoresEl.push(v);
        fila.appendChild(et); fila.appendChild(pista); fila.appendChild(v);
        cuerpo.appendChild(fila);
      });
    } else {
      var R = 90, C = 2 * Math.PI * R;
      var s = svg('svg', { viewBox: '0 0 240 240', class: 'grafico-anillo-svg', 'aria-hidden': 'true' });
      s.appendChild(svg('circle', { cx: 120, cy: 120, r: R, fill: 'none', stroke: '#e6edf7', 'stroke-width': 34 }));
      var acum = 0;
      datos.forEach(function (d, i) {
        var frac = d.valor / total;
        var seg = svg('circle', { cx: 120, cy: 120, r: R, fill: 'none', stroke: d.color || COLORES[i % COLORES.length], 'stroke-width': 34, 'stroke-dasharray': (C * frac - 3) + ' ' + C, 'stroke-dashoffset': -C * acum, transform: 'rotate(-90 120 120)', class: 'grafico-seg' });
        seg.style.setProperty('--ofs', String(C * frac));
        seg.style.setProperty('--retraso', (i * 0.18) + 's');
        s.appendChild(seg);
        acum += frac;
      });
      var centro = svg('text', { x: 120, y: 128, 'text-anchor': 'middle', class: 'grafico-centro' });
      centro.textContent = def.centro || (Math.round(total) + unidad);
      s.appendChild(centro);
      cuerpo.appendChild(s);
      var leyenda = document.createElement('ul'); leyenda.className = 'grafico-leyenda';
      datos.forEach(function (d, i) {
        var li = document.createElement('li');
        var pt = document.createElement('i'); pt.style.background = d.color || COLORES[i % COLORES.length];
        var tx = document.createElement('span'); tx.textContent = d.etiqueta;
        var v = document.createElement('b'); v.className = 'grafico-valor'; v.textContent = '0' + unidad;
        valoresEl.push(v);
        li.appendChild(pt); li.appendChild(tx); li.appendChild(v);
        leyenda.appendChild(li);
      });
      cuerpo.appendChild(leyenda);
    }

    cont.appendChild(raiz);
    M.alVer(raiz, function () {
      raiz.classList.add('animado');
      datos.forEach(function (d, i) { M.contar(valoresEl[i], d.valor, fmt(unidad, def.decimales || 0), ctx.reducido); });
      ctx.completar();
    });
    if (ctx.reducido) { raiz.classList.add('animado'); datos.forEach(function (d, i) { valoresEl[i].textContent = fmt(unidad, def.decimales || 0)(d.valor); }); }
  };

  M.componentes.cifras = function (cont, def, ctx) {
    var datos = def.datos || [];
    var raiz = document.createElement('div');
    raiz.className = 'comp comp-cifras';
    raiz.setAttribute('role', 'group');
    raiz.setAttribute('data-anim', 'item');
    var nums = datos.map(function (d, i) {
      var t = document.createElement('div'); t.className = 'cifra-tarjeta';
      t.style.setProperty('--c', d.color || COLORES[i % COLORES.length]);
      var n = document.createElement('div'); n.className = 'cifra-numero'; n.textContent = (d.prefijo || '') + '0' + (d.sufijo || '');
      var l = document.createElement('div'); l.className = 'cifra-etiqueta'; l.textContent = d.etiqueta;
      t.appendChild(n); t.appendChild(l); raiz.appendChild(t);
      return n;
    });
    cont.appendChild(raiz);
    function formato(d) { var f = fmt(d.sufijo || '', d.decimales || 0); return function (v) { return (d.prefijo || '') + f(v); }; }
    M.alVer(raiz, function () {
      datos.forEach(function (d, i) { M.contar(nums[i], d.valor, formato(d), ctx.reducido); });
      ctx.completar();
    });
    if (ctx.reducido) datos.forEach(function (d, i) { nums[i].textContent = formato(d)(d.valor); });
  };
})();
