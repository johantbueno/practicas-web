// Estilo «vivo» del visor: escenas ilustradas por tema, mascota que reacciona, confeti y decoración animada.
// Se activa con deck.meta.estilo === "vivo". Sin red, sin dependencias (usa Motor.iconos). Todo el texto va con textContent.
(function () {
  var M = (window.Motor = window.Motor || {});
  var PALETAS = [
    ['#002152', '#176EE4', '#FFD100'],
    ['#14532d', '#63B82E', '#FFD100'],
    ['#4a1d96', '#8b5cf6', '#FFD100'],
    ['#7c2d12', '#f97316', '#FFD100'],
    ['#0f4c5c', '#14b8a6', '#FFD100']
  ];
  // [expresión regular sobre texto sin tildes, ícono principal, satélites, etiqueta]
  var TEMAS = [
    [/phishing|enlace|correo|mensaje sospech/, 'mail', ['bug', 'alert-triangle', 'shield-lock'], 'Cuidado'],
    [/copia de seguridad|backup|respaldo|recuper/, 'database-export', ['cloud', 'refresh', 'shield-lock'], 'Respaldo'],
    [/contrasen|autentic|2fa|clave/, 'key', ['fingerprint', 'lock', 'shield-lock'], 'Acceso'],
    [/privacidad|confidencial|datos personales|proteger|seguridad/, 'shield-lock', ['lock', 'key', 'fingerprint'], 'Protege'],
    [/alucin|sesgo|riesgo|error|vulnerab|amenaza/, 'alert-triangle', ['eye', 'scale', 'search'], 'Ojo'],
    [/verific|fuente|derechos de autor|propiedad intelectual|confiab/, 'search', ['checklist', 'certificate', 'eye'], 'Verifica'],
    [/prompt|instruccion|rol|contexto/, 'pencil', ['message-circle', 'list-check', 'target'], 'Instrucción'],
    [/generativ|chatgpt|asistente|conversacional|gemini|copilot/, 'message-chatbot', ['sparkles', 'wand', 'language'], 'IA generativa'],
    [/automat|repetitiv|flujo/, 'settings-automation', ['bolt', 'clock', 'refresh'], 'Automatiza'],
    [/productiv|ahorro|tiempo|eficien/, 'bolt', ['clock', 'checklist', 'rocket'], 'Productividad'],
    [/marketing|publicidad|redes sociales|ventas|cliente|atencion/, 'speakerphone', ['chart-line', 'users', 'mail'], 'Negocio'],
    [/mipyme|negocio|empresa|comercio|colmado|ferreter/, 'building-store', ['shopping-cart', 'coin', 'chart-bar'], 'MIPYME'],
    [/proyecto|plan|ruta|hoja de ruta|implement|pitch|presenta/, 'rocket', ['flag', 'route', 'target'], 'Proyecto'],
    [/retroaliment|feedback|opinion/, 'message-circle', ['thumb-up', 'users', 'star'], 'Feedback'],
    [/reto|quiz|pregunta|verdadero|falso|evalua/, 'help-circle', ['target', 'star', 'trophy'], 'Reto'],
    [/ciber|hacker|ataque|ransomware|malware/, 'bug', ['shield-lock', 'alert-triangle', 'lock'], 'Ciberseguridad'],
    [/automatizacion tradicional|reglas/, 'settings', ['list-check', 'cpu', 'refresh'], 'Reglas'],
    [/inteligencia artificial|ia\b|modelo|aprendizaje|algoritmo/, 'brain', ['robot', 'sparkles', 'cpu'], 'Inteligencia Artificial'],
    [/ejemplo|caso|practica/, 'bulb', ['puzzle', 'star', 'checklist'], 'Ejemplo']
  ];

  function sinTildes(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function elegir(texto) {
    var t = sinTildes(texto);
    for (var i = 0; i < TEMAS.length; i++) if (TEMAS[i][0].test(t)) return TEMAS[i];
    return [null, 'sparkles', ['bulb', 'star', 'puzzle'], 'Idea clave'];
  }
  function ic(n, t, c, sw) { return M.icono ? M.icono(n, t, c, sw) : ''; }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;   // solo SVG propio de Motor.icono
    return e;
  }
  var contador = 0;

  // ---------------------------------------------------------------- escena ilustrada
  M.vivo = M.vivo || {};
  M.vivo.escena = function (texto, opciones) {
    opciones = opciones || {};
    var tema = opciones.icono ? [null, opciones.icono, opciones.satelites || ['star', 'bulb', 'sparkles'], opciones.etiqueta || ''] : elegir(texto);
    var pal = PALETAS[(opciones.paleta != null ? opciones.paleta : contador++) % PALETAS.length];
    var envoltorio = el('div', 'vivo-escena-env');
    envoltorio.setAttribute('data-anim', 'media');   // la animación de entrada borra el style del nodo animado: los colores van en el hijo
    var e = el('div', 'vivo-escena' + (opciones.oscura ? ' oscura' : ''));
    e.style.setProperty('--c1', pal[0]); e.style.setProperty('--c2', pal[1]); e.style.setProperty('--c3', pal[2]);
    envoltorio.setAttribute('aria-hidden', 'true');
    e.appendChild(el('div', 'vivo-puntos'));
    e.appendChild(el('div', 'vivo-halo'));
    e.appendChild(el('div', 'vivo-anillo r1'));
    e.appendChild(el('div', 'vivo-anillo r2'));
    e.appendChild(el('div', 'vivo-centro', ic(tema[1], 230, '#fff', 1.35)));
    for (var i = 0; i < 3; i++) e.appendChild(el('div', 'vivo-sat s' + (i + 1), ic(tema[2][i], 64, '#fff', 1.7)));
    if (tema[3] && !opciones.sinEtiqueta) { var ch = el('div', 'vivo-chip'); ch.textContent = tema[3]; e.appendChild(ch); }
    if (opciones.numero != null) { var n = el('div', 'vivo-numero'); n.textContent = String(opciones.numero); e.appendChild(n); }
    envoltorio.appendChild(e);
    // inclinación 3D suave siguiendo el puntero (solo con movimiento permitido)
    if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      envoltorio.addEventListener('pointermove', function (ev) {
        var r = envoltorio.getBoundingClientRect();
        var dx = (ev.clientX - r.left) / r.width - 0.5, dy = (ev.clientY - r.top) / r.height - 0.5;
        e.style.transform = 'perspective(1100px) rotateY(' + (dx * 9).toFixed(2) + 'deg) rotateX(' + (-dy * 9).toFixed(2) + 'deg)';
      });
      envoltorio.addEventListener('pointerleave', function () { e.style.transform = ''; });
    }
    return envoltorio;
  };

  // ---------------------------------------------------------------- mascota «Nico»
  var NICO = '<svg viewBox="0 0 200 230" aria-hidden="true">' +
    '<g class="nico-antena"><line x1="100" y1="22" x2="100" y2="46" stroke="#002152" stroke-width="6" stroke-linecap="round"/><circle cx="100" cy="16" r="11" fill="#FFD100" stroke="#002152" stroke-width="4"/></g>' +
    '<rect x="30" y="44" width="140" height="112" rx="38" fill="#176EE4" stroke="#002152" stroke-width="6"/>' +
    '<rect x="46" y="62" width="108" height="76" rx="26" fill="#EAF2FF"/>' +
    '<g class="nico-ojos"><circle cx="78" cy="94" r="14" fill="#fff" stroke="#002152" stroke-width="4"/><circle cx="122" cy="94" r="14" fill="#fff" stroke="#002152" stroke-width="4"/>' +
    '<circle class="pupila" cx="80" cy="96" r="6" fill="#002152"/><circle class="pupila" cx="124" cy="96" r="6" fill="#002152"/></g>' +
    '<path class="nico-boca nb-neutra" d="M82 122 Q100 130 118 122" fill="none" stroke="#002152" stroke-width="6" stroke-linecap="round"/>' +
    '<path class="nico-boca nb-feliz" d="M78 118 Q100 144 122 118 Z" fill="#fff" stroke="#002152" stroke-width="6" stroke-linejoin="round"/>' +
    '<path class="nico-boca nb-triste" d="M82 130 Q100 116 118 130" fill="none" stroke="#002152" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="58" cy="116" r="7" fill="#FF6B57" opacity=".55"/><circle cx="142" cy="116" r="7" fill="#FF6B57" opacity=".55"/>' +
    '<rect x="62" y="158" width="76" height="56" rx="20" fill="#003B7A" stroke="#002152" stroke-width="6"/>' +
    '<circle cx="100" cy="186" r="9" fill="#FFD100"/>' +
    '<g class="nico-brazo-i"><rect x="24" y="166" width="38" height="14" rx="7" fill="#176EE4" stroke="#002152" stroke-width="5"/></g>' +
    '<g class="nico-brazo-d"><rect x="138" y="166" width="38" height="14" rx="7" fill="#176EE4" stroke="#002152" stroke-width="5"/></g></svg>';

  M.vivo.mascota = function (mensajeInicial) {
    var c = el('div', 'vivo-mascota estado-neutra');
    var burbuja = el('div', 'vivo-burbuja'); burbuja.setAttribute('role', 'status'); burbuja.setAttribute('aria-live', 'polite');
    burbuja.textContent = mensajeInicial || '¡Tú puedes! Elige una respuesta.';
    c.appendChild(burbuja);
    var cuerpo = el('div', 'vivo-nico', NICO); c.appendChild(cuerpo);
    c.setAttribute('data-anim', 'media');
    var api = {
      nodo: c,
      reaccionar: function (estado, msg) {
        c.className = 'vivo-mascota estado-' + estado;
        if (msg) burbuja.textContent = msg;
        void c.offsetWidth;
        c.classList.add('animar');
      }
    };
    c._api = api;
    return api;
  };

  // ---------------------------------------------------------------- confeti
  var COLORES = ['#FFD100', '#63B82E', '#176EE4', '#FF6B57', '#8b5cf6', '#14b8a6'];
  M.vivo.confeti = function (anfitrion, cantidad) {
    var lienzo = document.getElementById('lienzo') || anfitrion;
    var caja = el('div', 'vivo-confeti'); caja.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < (cantidad || 46); i++) {
      var p = el('span', 'vivo-papel');
      p.style.left = (10 + Math.random() * 80) + '%';
      p.style.background = COLORES[i % COLORES.length];
      p.style.setProperty('--dx', (Math.random() * 560 - 280) + 'px');
      p.style.setProperty('--rot', (Math.random() * 900 - 450) + 'deg');
      p.style.animationDelay = (Math.random() * 0.25) + 's';
      p.style.animationDuration = (1.5 + Math.random() * 1.1) + 's';
      caja.appendChild(p);
    }
    lienzo.appendChild(caja);
    setTimeout(function () { if (caja.parentNode) caja.parentNode.removeChild(caja); }, 3200);
  };

  // ---------------------------------------------------------------- partículas de fondo
  M.vivo.particulas = function (seccion, oscuras) {
    var cont = el('div', 'vivo-particulas' + (oscuras ? ' oscuras' : '')); cont.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 14; i++) {
      var p = el('span', 'vivo-particula');
      var s = 10 + Math.random() * 38;
      p.style.width = s + 'px'; p.style.height = s + 'px';
      p.style.left = (Math.random() * 100) + '%'; p.style.top = (Math.random() * 100) + '%';
      p.style.animationDelay = (-Math.random() * 12) + 's';
      p.style.animationDuration = (9 + Math.random() * 10) + 's';
      p.style.background = COLORES[i % COLORES.length];
      cont.appendChild(p);
    }
    seccion.insertBefore(cont, seccion.firstChild);
  };

  // ---------------------------------------------------------------- quiz: V/F con íconos, letras en opciones y reacción de la mascota
  M.vivo.decorarQuiz = function (raiz, mascota) {
    var quizzes = raiz.querySelectorAll('.comp-quiz');
    Array.prototype.forEach.call(quizzes, function (q) {
      var ops = q.querySelectorAll('.quiz-opcion');
      var esVF = ops.length === 2 && /^verdadero$/i.test(ops[0].textContent.trim()) && /^falso$/i.test(ops[1].textContent.trim());
      var lista = q.querySelector('.quiz-opciones');
      if (esVF) {
        lista.classList.add('vf');
        ops[0].classList.add('vf-v'); ops[1].classList.add('vf-f');
        ops[0].insertAdjacentHTML('afterbegin', '<span class="vf-ic">' + ic('check', 54, '#fff', 2.4) + '</span>');
        ops[1].insertAdjacentHTML('afterbegin', '<span class="vf-ic">' + ic('x', 54, '#fff', 2.4) + '</span>');
      }
      var vistos = false;
      var obs = new MutationObserver(function () {
        var ok = q.querySelector('.quiz-opcion.ok'); var mal = q.querySelector('.quiz-opcion.mal');
        if (!ok && !mal) return;
        if (vistos) return; vistos = true;
        var retro = q.querySelector('.quiz-retro');
        var acerto = ok && !mal;
        if (mascota) mascota.reaccionar(acerto ? 'feliz' : 'triste', acerto ? '¡Excelente! Respuesta correcta.' : 'Casi. Lee la explicación y sigue adelante.');
        if (acerto) M.vivo.confeti(q.closest('.slide'));
        void retro;
      });
      obs.observe(q, { attributes: true, subtree: true, attributeFilter: ['class'] });
    });
  };

  // ---------------------------------------------------------------- autoajuste: reduce la tipografía (--k) hasta que el contenido quepa sin cortarse
  M.vivo.ajustar = function (seccion) {
    var caja = seccion.querySelector('.paso-grid') || seccion.querySelector('.vivo-split');
    if (!caja) return;
    var contenido = caja.querySelector('.paso-col-izq') || caja.querySelector('.contenido-wrapper');
    if (!contenido) return;
    var disponible = 1080 - 80 - 130;
    for (var k = 1; k >= 0.5; k -= 0.05) {
      caja.style.setProperty('--k', k.toFixed(2));
      if (contenido.scrollHeight <= disponible) break;
    }
  };

  // ---------------------------------------------------------------- confeti al llegar a una diapositiva marcada
  M.vivo.alActivar = function (seccion, fn) {
    var obs = new MutationObserver(function () { if (seccion.classList.contains('activa')) fn(); });
    obs.observe(seccion, { attributes: true, attributeFilter: ['class'] });
  };

  // ---------------------------------------------------------------- efectos de texto en el título (deck.slides[].efecto)
  M.efectos = {
    aplicar: function (seccion, efecto) {
      var t = seccion.querySelector('.slide-titulo, .portada-titulo, .cierre-titulo');
      if (!t) return;
      var txt = t.getAttribute('data-orig');
      if (txt === null) { txt = t.textContent; t.setAttribute('data-orig', txt); }
      t.className = t.className.replace(/efecto-\S+/g, '').replace(/\s+/g, ' ').trim();
      t.removeAttribute('style');
      t.textContent = txt;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (efecto === 'escribir' && txt.length > 38) efecto = 'palabras';   // el efecto de máquina de escribir solo cabe en títulos cortos
      if (efecto === 'palabras') {
        t.textContent = '';
        txt.split(' ').forEach(function (w, i) {
          var sp = document.createElement('span'); sp.className = 'ef-p'; sp.style.setProperty('--i', String(i)); sp.textContent = w;
          t.appendChild(sp); t.appendChild(document.createTextNode(' '));
        });
        t.classList.add('efecto-palabras');
      } else if (efecto === 'escribir') {
        t.style.setProperty('--n', String(txt.length)); t.style.setProperty('--dur', Math.min(3.6, 0.6 + txt.length * 0.05).toFixed(2) + 's');
        void t.offsetWidth; t.classList.add('efecto-escribir');
      } else if (efecto === 'resaltar') { void t.offsetWidth; t.classList.add('efecto-resaltar'); }
    }
  };
})();
