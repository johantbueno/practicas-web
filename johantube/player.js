/**
 * JohanTube Player
 * Reproductor interactivo profesional para prácticas y docencia.
 * Código propio sin dependencias externas (excepto hls.js en window).
 */

(function () {
  'use strict';

  // Configuración base
  var BASE_DEFAULT = 'https://johantube.167.88.36.13.sslip.io';
  var VIDEOS_CONFIG = {
    felicidad: {
      titulo: 'En busca de la felicidad',
      secciones: 4,
      partes: 12
    },
    'diablo-moda': {
      titulo: 'El diablo viste a la moda',
      secciones: 4
    },
    'lobo-wallstreet': {
      titulo: 'El lobo de Wall Street',
      secciones: 4
    }
  };

  // Parsing de URL y parámetros seguros
  var q = new URLSearchParams(window.location.search);
  var hashStr = window.location.hash.replace(/^#/, '');
  var h = new URLSearchParams(hashStr);

  var isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  var customBase = q.get('base');
  var BASE = (isLocalHost && customBase) ? customBase.replace(/\/+$/, '') : BASE_DEFAULT;

  var KEY = h.get('k') || '';
  var vidId = q.get('v') || 'felicidad';
  var initialPartParam = parseInt(q.get('p') || q.get('s') || '1', 10);
  var initialTimeParam = parseFloat(q.get('t') || '0') || 0;

  // Elementos DOM principales
  var appEl = document.getElementById('jt-app');
  var playerWrapper = document.getElementById('jt-player-wrapper');
  var playerEl = document.getElementById('jt-player');
  var videoEl = document.getElementById('jt-video');
  var controlsEl = document.getElementById('jt-controls');

  // Overlays y mensajes
  var overlayMsgEl = document.getElementById('jt-overlay-message');
  var overlayMsgText = document.getElementById('jt-overlay-text');
  var overlayMsgSub = document.getElementById('jt-overlay-subtext');
  var overlayMsgBtn = document.getElementById('jt-overlay-btn');
  var spinnerEl = document.getElementById('jt-spinner-overlay');
  var speedBadgeEl = document.getElementById('jt-speed-badge');
  var rippleLeft = document.getElementById('jt-ripple-left');
  var rippleRight = document.getElementById('jt-ripple-right');

  // Tarjeta de pregunta y modal de fin
  var questionCard = document.getElementById('jt-question-card');
  var questionText = document.getElementById('jt-question-text');
  var questionBtnContinue = document.getElementById('jt-question-continue');
  var questionBtnRewind = document.getElementById('jt-question-rewind');
  var endOverlay = document.getElementById('jt-end-overlay');
  var endCountdownEl = document.getElementById('jt-end-seconds');
  var endBtnCancel = document.getElementById('jt-end-cancel');
  var endBtnNext = document.getElementById('jt-end-next');
  var resumeToast = document.getElementById('jt-resume-toast');
  var resumeText = document.getElementById('jt-resume-text');
  var resumeBtn = document.getElementById('jt-resume-btn');
  var resumeClose = document.getElementById('jt-resume-close');

  // Subtítulos
  var captionsLayer = document.getElementById('jt-captions-layer');
  var captionCueEl = document.getElementById('jt-caption-cue');

  // Barra de progreso y Tooltip
  var progressContainer = document.getElementById('jt-progress-container');
  var progressBuffer = document.getElementById('jt-progress-buffer');
  var progressHoverBar = document.getElementById('jt-progress-hover-bar');
  var progressPlayed = document.getElementById('jt-progress-played');
  var progressThumb = document.getElementById('jt-progress-thumb');
  var progressMarkersWrap = document.getElementById('jt-progress-markers');
  var progressChaptersWrap = document.getElementById('jt-progress-chapters');
  var tooltipEl = document.getElementById('jt-tooltip');
  var tooltipThumb = document.getElementById('jt-tooltip-thumb');
  var tooltipTime = document.getElementById('jt-tooltip-time');

  // Botones de controles
  var btnPlay = document.getElementById('jt-btn-play');
  var btnNext = document.getElementById('jt-btn-next');
  var btnMute = document.getElementById('jt-btn-mute');
  var volumeSlider = document.getElementById('jt-volume-slider');
  var timeDisplay = document.getElementById('jt-time-display');
  var btnCc = document.getElementById('jt-btn-cc');
  var btnSettings = document.getElementById('jt-btn-settings');
  var btnTheater = document.getElementById('jt-btn-theater');
  var btnPip = document.getElementById('jt-btn-pip');
  var btnFullscreen = document.getElementById('jt-btn-fullscreen');

  // Menú de ajustes
  var settingsMenu = document.getElementById('jt-settings-menu');
  var menuMain = document.getElementById('jt-menu-main');
  var menuSpeed = document.getElementById('jt-menu-speed');
  var menuQuality = document.getElementById('jt-menu-quality');
  var menuSubs = document.getElementById('jt-menu-subs');
  var speedLabel = document.getElementById('jt-speed-label');
  var qualityLabel = document.getElementById('jt-quality-label');
  var subsLabel = document.getElementById('jt-subs-label');

  // Pestañas del sidebar
  var tabBtns = document.querySelectorAll('.jt-tab-btn');
  var tabScenes = document.getElementById('jt-tab-scenes');
  var tabTranscript = document.getElementById('jt-tab-transcript');
  var tabParts = document.getElementById('jt-tab-parts');
  var scenesList = document.getElementById('jt-scenes-list');
  var transcriptList = document.getElementById('jt-transcript-list');
  var transcriptSearch = document.getElementById('jt-transcript-search');
  var partsGrid = document.getElementById('jt-parts-grid');
  var headerTitle = document.getElementById('jt-header-title');
  var headerPartPill = document.getElementById('jt-header-part-pill');

  // Estado reactivo del reproductor
  var state = {
    vidId: vidId,
    key: KEY,
    parte: isNaN(initialPartParam) ? 1 : Math.max(1, initialPartParam),
    totalPartes: 4,
    useSecciones: true,
    meta: null,
    duration: 0,
    currentTime: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
    currentLevel: -1,
    subsEnabled: false,
    theaterMode: false,
    hls: null,
    isDragging: false,
    thumbsVtt: [],
    spriteUrl: '',
    subsCues: [],
    transcript: [],
    questions: [],
    shownQuestions: {}, // id o seg de preguntas ya mostradas
    answeredQuestions: {}, // id o key de preguntas respondidas
    activeQuestion: null,
    controlsTimeout: null,
    endCountdownTimer: null,
    endCountdownSec: 5,
    lastTapTime: 0,
    lastTapX: 0,
    pressTimer: null,
    isLongPressing: false,
    rateBeforePress: 1
  };

  // ===== Progreso persistente: sobrevive a recargas y cortes de internet =====
  var PROG_KEY = 'johantube_prog_v2_' + vidId;
  var META_KEY = 'johantube_meta_v2_' + vidId;

  function progVacio() {
    return { answers: {}, completed: [], drafts: {}, parte: 1, seg: 0 };
  }

  function loadProgress() {
    try {
      var raw = JSON.parse(localStorage.getItem(PROG_KEY) || 'null');
      if (raw && typeof raw === 'object') {
        var p = progVacio();
        if (raw.answers && typeof raw.answers === 'object') p.answers = raw.answers;
        if (Array.isArray(raw.completed)) p.completed = raw.completed;
        if (raw.drafts && typeof raw.drafts === 'object') p.drafts = raw.drafts;
        p.parte = parseInt(raw.parte, 10) || 1;
        p.seg = parseFloat(raw.seg) || 0;
        return p;
      }
    } catch (e) {}
    return progVacio();
  }

  function saveProgress() {
    try { localStorage.setItem(PROG_KEY, JSON.stringify(state.prog)); } catch (e) {}
  }

  state.prog = loadProgress();
  Object.keys(state.prog.answers).forEach(function (id) { state.answeredQuestions[id] = true; });
  state.reconectando = false;
  state.metaFallo = false;
  state.posLista = false;
  state.resumeAt = 0;

  function seccionCompleta(n) { return state.prog.completed.indexOf(n) !== -1; }

  function primeraIncompleta() {
    for (var i = 1; i <= state.totalPartes; i++) {
      if (!seccionCompleta(i)) return i;
    }
    return state.totalPartes;
  }

  // Solo se puede abrir una sección si todas las anteriores están terminadas
  function puedeAbrir(n) { return n >= 1 && n <= state.totalPartes && n <= primeraIncompleta(); }

  function preguntasDe(n) {
    return (state.questions || []).filter(function (q) {
      return (q.seccion === n || q.parte === n);
    }).sort(function (a, b) { return a.seg - b.seg; });
  }

  function claveDe(q, n) { return q.id || (n + '_' + q.seg); }

  // Comunicación con la página que incrusta el reproductor
  function avisarPadre(msg) {
    msg.vidId = state.vidId;
    if (window.parent && window.parent !== window) {
      try { window.parent.postMessage(msg, '*'); } catch (e) {}
    }
  }

  function enviarEstado() {
    avisarPadre({
      johantube: 'estado',
      answers: state.prog.answers,
      completed: state.prog.completed,
      totalPartes: state.totalPartes,
      totalPreguntas: (state.questions || []).length
    });
  }

  function registrarRespuesta(msg) {
    msg.johantube = 'respuesta';
    msg.seccion = state.parte;
    msg.vidId = state.vidId;
    state.prog.answers[msg.id] = msg;
    delete state.prog.drafts[msg.id];
    state.answeredQuestions[msg.id] = true;
    saveProgress();
    renderProgressMarkers();
    avisarPadre(msg);
  }

  // Aviso breve dentro del reproductor
  var toastTimer = null;
  function avisar(msg, ms) {
    if (!resumeToast || !resumeText) return;
    resumeText.textContent = msg;
    if (resumeBtn) resumeBtn.style.display = 'none';
    resumeToast.classList.add('active');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { resumeToast.classList.remove('active'); }, ms || 5000);
    if (resumeClose) resumeClose.onclick = function () { resumeToast.classList.remove('active'); };
  }

  // Formato mm:ss o hh:mm:ss
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    var sec = Math.floor(seconds);
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    var ss = s < 10 ? '0' + s : s;
    if (h > 0) {
      var mm = m < 10 ? '0' + m : m;
      return h + ':' + mm + ':' + ss;
    }
    var mm2 = m < 10 ? '0' + m : m;
    return mm2 + ':' + ss;
  }

  // Parseo de WebVTT simple para thumbnails y subtítulos
  function parseVTTTime(str) {
    if (!str) return 0;
    var parts = str.trim().split(':');
    var s = 0;
    if (parts.length === 3) {
      s = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2].replace(',', '.'));
    } else if (parts.length === 2) {
      s = parseFloat(parts[0]) * 60 + parseFloat(parts[1].replace(',', '.'));
    }
    return isNaN(s) ? 0 : s;
  }

  function parseThumbsVTT(text) {
    var lines = text.split(/\r?\n/);
    var cues = [];
    var current = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line === 'WEBVTT') continue;

      if (line.indexOf('-->') !== -1) {
        var tParts = line.split('-->');
        current = {
          start: parseVTTTime(tParts[0]),
          end: parseVTTTime(tParts[1])
        };
      } else if (current && line.indexOf('#xywh=') !== -1) {
        var frag = line.split('#xywh=');
        var url = frag[0];
        var coords = (frag[1] || '').split(',').map(function (n) { return parseInt(n, 10); });
        current.url = url;
        current.x = coords[0] || 0;
        current.y = coords[1] || 0;
        current.w = coords[2] || 160;
        current.h = coords[3] || 67;
        cues.push(current);
        current = null;
      }
    }
    return cues;
  }

  function parseSubsVTT(text) {
    var lines = text.split(/\r?\n/);
    var cues = [];
    var current = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line === 'WEBVTT' || line.indexOf('NOTE') === 0) continue;

      if (line.indexOf('-->') !== -1) {
        var tParts = line.split('-->');
        current = {
          start: parseVTTTime(tParts[0]),
          end: parseVTTTime(tParts[1]),
          text: ''
        };
      } else if (current) {
        if (current.text) current.text += '\n' + line;
        else current.text = line;

        // Si la siguiente línea está vacía o es la última, guardamos
        if (i + 1 >= lines.length || !lines[i + 1].trim()) {
          cues.push(current);
          current = null;
        }
      }
    }
    return cues;
  }

  // URLs de recursos
  function getPartFolder(n) {
    var pStr = String(n).padStart(2, '0');
    var prefix = state.useSecciones ? 'seccion' : 'parte';
    return BASE + '/' + state.key + '/' + state.vidId + '/' + prefix + pStr + '/';
  }

  function getHlsUrl(n) {
    return getPartFolder(n) + 'index.m3u8';
  }

  function getMetaUrl() {
    return BASE + '/' + state.key + '/' + state.vidId + '/meta.json';
  }

  // Notificaciones y alertas en overlay
  function showOverlayError(title, subtext, showRetry) {
    overlayMsgText.textContent = title;
    overlayMsgSub.textContent = subtext || '';
    overlayMsgBtn.style.display = showRetry ? 'inline-flex' : 'none';
    overlayMsgEl.classList.add('active');
  }

  function hideOverlayMessage() {
    overlayMsgEl.classList.remove('active');
  }

  // Actualización de títulos y header
  function updateHeader() {
    var title = (state.meta && state.meta.titulo) || (VIDEOS_CONFIG[state.vidId] ? VIDEOS_CONFIG[state.vidId].titulo : state.vidId);
    if (headerTitle) headerTitle.textContent = title;
    var label = state.useSecciones ? 'Sección ' : 'Parte ';
    if (headerPartPill) headerPartPill.textContent = label + state.parte + ' de ' + state.totalPartes;
  }

  // Control de visibilidad de controles y temporizador
  function showControls() {
    controlsEl.classList.remove('jt-controls-hidden');
    clearTimeout(state.controlsTimeout);
    if (!videoEl.paused) {
      state.controlsTimeout = setTimeout(function () {
        if (!settingsMenu.classList.contains('active') && !state.isDragging) {
          controlsEl.classList.add('jt-controls-hidden');
        }
      }, 3000);
    }
  }

  function hideControls() {
    if (!videoEl.paused && !settingsMenu.classList.contains('active') && !state.isDragging) {
      controlsEl.classList.add('jt-controls-hidden');
    }
  }

  // Reproducir / Pausar
  function togglePlay() {
    if (videoEl.paused) {
      videoEl.play().catch(function () {});
    } else {
      videoEl.pause();
    }
  }

  function updatePlayBtn() {
    var iconPlay = btnPlay.querySelector('.jt-icon-play');
    var iconPause = btnPlay.querySelector('.jt-icon-pause');
    if (videoEl.paused) {
      if (iconPlay) iconPlay.style.display = 'block';
      if (iconPause) iconPause.style.display = 'none';
      btnPlay.setAttribute('aria-label', 'Reproducir (espacio/K)');
    } else {
      if (iconPlay) iconPlay.style.display = 'none';
      if (iconPause) iconPause.style.display = 'block';
      btnPlay.setAttribute('aria-label', 'Pausar (espacio/K)');
    }
  }

  // Volumen
  function setVolume(val) {
    val = Math.max(0, Math.min(1, val));
    videoEl.volume = val;
    state.volume = val;
    if (val === 0) {
      videoEl.muted = true;
    } else if (videoEl.muted) {
      videoEl.muted = false;
    }
    updateVolumeUI();
  }

  function toggleMute() {
    videoEl.muted = !videoEl.muted;
    if (!videoEl.muted && videoEl.volume === 0) {
      videoEl.volume = 0.5;
    }
    updateVolumeUI();
  }

  function updateVolumeUI() {
    var iconHigh = btnMute.querySelector('.jt-vol-high');
    var iconLow = btnMute.querySelector('.jt-vol-low');
    var iconMute = btnMute.querySelector('.jt-vol-muted');
    var isM = videoEl.muted || videoEl.volume === 0;
    var v = videoEl.volume;

    volumeSlider.value = isM ? 0 : v;

    if (iconHigh) iconHigh.style.display = (!isM && v >= 0.5) ? 'block' : 'none';
    if (iconLow) iconLow.style.display = (!isM && v > 0 && v < 0.5) ? 'block' : 'none';
    if (iconMute) iconMute.style.display = isM ? 'block' : 'none';

    btnMute.setAttribute('aria-label', isM ? 'Reactivar sonido (M)' : 'Silenciar (M)');
  }

  // Velocidad de reproducción
  function setPlaybackRate(rate) {
    rate = parseFloat(rate) || 1;
    videoEl.playbackRate = rate;
    state.playbackRate = rate;
    if (speedLabel) speedLabel.textContent = rate === 1 ? 'Normal' : rate + 'x';

    var items = menuSpeed.querySelectorAll('.jt-menu-item');
    items.forEach(function (btn) {
      var r = parseFloat(btn.getAttribute('data-rate'));
      if (r === rate) btn.classList.add('selected');
      else btn.classList.remove('selected');
    });
  }

  // Nivel de Calidad HLS
  function setQualityLevel(levelIdx) {
    levelIdx = parseInt(levelIdx, 10);
    state.currentLevel = levelIdx;
    if (state.hls) {
      state.hls.currentLevel = levelIdx;
    }

    var items = menuQuality.querySelectorAll('.jt-menu-item');
    items.forEach(function (btn) {
      var idx = parseInt(btn.getAttribute('data-level'), 10);
      if (idx === levelIdx) {
        btn.classList.add('selected');
        if (qualityLabel) qualityLabel.textContent = btn.querySelector('.jt-menu-item-text').textContent;
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  // Subtítulos
  function toggleSubtitles() {
    setSubtitlesEnabled(!state.subsEnabled);
  }

  function setSubtitlesEnabled(enabled) {
    state.subsEnabled = !!enabled;
    if (state.subsEnabled) {
      btnCc.classList.add('active');
      if (subsLabel) subsLabel.textContent = 'Español';
    } else {
      btnCc.classList.remove('active');
      if (subsLabel) subsLabel.textContent = 'Desactivados';
      captionCueEl.style.display = 'none';
    }

    var items = menuSubs.querySelectorAll('.jt-menu-item');
    items.forEach(function (btn) {
      var v = btn.getAttribute('data-sub') === 'es';
      if (v === state.subsEnabled) btn.classList.add('selected');
      else btn.classList.remove('selected');
    });
  }

  function updateSubtitles() {
    if (!state.subsEnabled || !state.subsCues || state.subsCues.length === 0) {
      captionCueEl.style.display = 'none';
      return;
    }
    var ct = videoEl.currentTime;
    var found = null;
    for (var i = 0; i < state.subsCues.length; i++) {
      var c = state.subsCues[i];
      if (ct >= c.start && ct <= c.end) {
        found = c;
        break;
      }
    }
    if (found) {
      captionCueEl.textContent = found.text;
      captionCueEl.style.display = 'inline-block';
    } else {
      captionCueEl.style.display = 'none';
    }
  }

  // Modo Cine
  function toggleTheaterMode() {
    state.theaterMode = !state.theaterMode;
    if (state.theaterMode) {
      appEl.classList.add('theater-mode');
      btnTheater.classList.add('active');
    } else {
      appEl.classList.remove('theater-mode');
      btnTheater.classList.remove('active');
    }
  }

  // Picture in Picture
  function togglePip() {
    if (!document.pictureInPictureEnabled) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(function () {});
    } else {
      videoEl.requestPictureInPicture().catch(function () {});
    }
  }

  // Pantalla Completa
  function toggleFullscreen() {
    var isFull = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
    if (!isFull) {
      if (playerEl.requestFullscreen) {
        playerEl.requestFullscreen();
      } else if (playerEl.webkitRequestFullscreen) {
        playerEl.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  function updateFullscreenBtn() {
    var isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
    var iconEnter = btnFullscreen.querySelector('.jt-icon-fs-enter');
    var iconExit = btnFullscreen.querySelector('.jt-icon-fs-exit');
    if (iconEnter) iconEnter.style.display = isFull ? 'none' : 'block';
    if (iconExit) iconExit.style.display = isFull ? 'block' : 'none';
    btnFullscreen.setAttribute('aria-label', isFull ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)');
  }

  // Barra de progreso y arrastre
  function updateProgressBar() {
    var ct = videoEl.currentTime || 0;
    var dur = videoEl.duration || state.duration || 0;
    state.currentTime = ct;
    if (dur > 0) state.duration = dur;

    var pct = dur > 0 ? (ct / dur) * 100 : 0;
    if (!state.isDragging) {
      progressPlayed.style.width = pct + '%';
      progressThumb.style.left = pct + '%';
      progressContainer.setAttribute('aria-valuenow', Math.round(ct));
      progressContainer.setAttribute('aria-valuemax', Math.round(dur));
      progressContainer.setAttribute('aria-valuetext', formatTime(ct) + ' de ' + formatTime(dur));
    }

    // Buffer cargado
    if (videoEl.buffered && videoEl.buffered.length > 0 && dur > 0) {
      var bufEnd = 0;
      for (var i = 0; i < videoEl.buffered.length; i++) {
        if (videoEl.buffered.start(i) <= ct && videoEl.buffered.end(i) >= ct) {
          bufEnd = videoEl.buffered.end(i);
          break;
        }
      }
      var bufPct = Math.min(100, (bufEnd / dur) * 100);
      progressBuffer.style.width = bufPct + '%';
    } else {
      progressBuffer.style.width = '0%';
    }

    // Tiempo texto
    timeDisplay.textContent = formatTime(ct) + ' / ' + formatTime(dur);

    // Revisión de subtítulos
    updateSubtitles();

    // Revisión de preguntas activas
    checkQuestions(ct);

    // Sincronización de transcripción
    updateTranscriptHighlight(ct);

    // Guardado periódico de reanudación
    saveResumePosition(ct);
  }

  // Límite de avance según preguntas pendientes
  function getMaxAllowedTime() {
    var qs = preguntasDe(state.parte);
    for (var i = 0; i < qs.length; i++) {
      if (!state.answeredQuestions[claveDe(qs[i], state.parte)]) return qs[i].seg;
    }
    return (videoEl.duration || state.duration || 999999);
  }

  function safeSeekTo(targetTime) {
    var maxAllowed = getMaxAllowedTime();
    if (targetTime > maxAllowed) {
      targetTime = maxAllowed;
    }
    videoEl.currentTime = Math.max(0, targetTime);
  }

  function seekByPercent(pct) {
    pct = Math.max(0, Math.min(1, pct));
    var dur = videoEl.duration || state.duration || 0;
    if (dur > 0) {
      safeSeekTo(pct * dur);
    }
  }

  function handleProgressPointer(e) {
    var rect = progressContainer.getBoundingClientRect();
    var clientX = e.clientX;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    }
    var pos = (clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    return pos;
  }

  // Tooltip con preview y sprite
  function showTooltipAt(pos, clientX) {
    var dur = videoEl.duration || state.duration || 0;
    var t = pos * dur;
    tooltipTime.textContent = formatTime(t);

    var rect = progressContainer.getBoundingClientRect();
    var pWidth = rect.width;
    var x = pos * pWidth;

    // Búsqueda del cue de miniatura
    var foundThumb = null;
    if (state.thumbsVtt && state.thumbsVtt.length > 0) {
      for (var i = 0; i < state.thumbsVtt.length; i++) {
        var cue = state.thumbsVtt[i];
        if (t >= cue.start && t < cue.end) {
          foundThumb = cue;
          break;
        }
      }
      if (!foundThumb && state.thumbsVtt.length > 0) {
        foundThumb = state.thumbsVtt[state.thumbsVtt.length - 1];
      }
    }

    if (foundThumb && state.spriteUrl) {
      tooltipThumb.classList.add('has-sprite');
      tooltipThumb.style.backgroundImage = 'url("' + state.spriteUrl + '")';
      tooltipThumb.style.backgroundPosition = '-' + foundThumb.x + 'px -' + foundThumb.y + 'px';
      tooltipThumb.style.width = foundThumb.w + 'px';
      tooltipThumb.style.height = foundThumb.h + 'px';
    } else {
      tooltipThumb.classList.remove('has-sprite');
    }

    // Clamp para que no desborde horizontalmente
    var tooltipW = 168;
    var minX = tooltipW / 2;
    var maxX = pWidth - (tooltipW / 2);
    var clampedX = Math.max(minX, Math.min(maxX, x));

    tooltipEl.style.left = clampedX + 'px';
    tooltipEl.classList.add('active');
    progressHoverBar.style.width = (pos * 100) + '%';
  }

  function hideTooltip() {
    tooltipEl.classList.remove('active');
    progressHoverBar.style.width = '0%';
  }

  // Setup de eventos en la barra de progreso
  progressContainer.addEventListener('pointerdown', function (e) {
    state.isDragging = true;
    progressContainer.classList.add('dragging');
    var pos = handleProgressPointer(e);
    progressPlayed.style.width = (pos * 100) + '%';
    progressThumb.style.left = (pos * 100) + '%';
    seekByPercent(pos);
    showTooltipAt(pos, e.clientX);
    progressContainer.setPointerCapture(e.pointerId);
  });

  progressContainer.addEventListener('pointermove', function (e) {
    var pos = handleProgressPointer(e);
    if (state.isDragging) {
      progressPlayed.style.width = (pos * 100) + '%';
      progressThumb.style.left = (pos * 100) + '%';
      seekByPercent(pos);
    }
    showTooltipAt(pos, e.clientX);
  });

  function stopDragging(e) {
    if (state.isDragging) {
      state.isDragging = false;
      progressContainer.classList.remove('dragging');
      var pos = handleProgressPointer(e);
      seekByPercent(pos);
      try {
        progressContainer.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  }

  progressContainer.addEventListener('pointerup', stopDragging);
  progressContainer.addEventListener('pointercancel', stopDragging);
  progressContainer.addEventListener('mouseleave', hideTooltip);

  // Accesibilidad por teclado en la barra
  progressContainer.addEventListener('keydown', function (e) {
    var step = 5;
    if (e.key === 'ArrowLeft') {
      videoEl.currentTime = Math.max(0, videoEl.currentTime - step);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      safeSeekTo(videoEl.currentTime + step);
      e.preventDefault();
    }
  });

  // Marcadores de preguntas y capítulos en la barra
  function renderProgressMarkers() {
    progressMarkersWrap.innerHTML = '';
    progressChaptersWrap.innerHTML = '';
    var dur = state.duration || 1;

    // Preguntas de esta parte
    var partQuestions = (state.questions || []).filter(function (q) {
      return (q.seccion === state.parte || q.parte === state.parte);
    });
    partQuestions.forEach(function (q) {
      var dot = document.createElement('div');
      dot.className = 'jt-progress-marker' + (state.answeredQuestions[claveDe(q, state.parte)] ? ' done' : '');
      dot.title = 'Pregunta: ' + q.texto;
      var pct = dur > 0 ? (q.seg / dur) * 100 : 0;
      dot.style.left = pct + '%';
      progressMarkersWrap.appendChild(dot);
    });

    // Capítulos de esta parte
    if (state.meta && state.meta.capitulos) {
      var partCaps = state.meta.capitulos.filter(function (c) {
        return (c.seccion === state.parte || c.parte === state.parte) && c.seg > 0;
      });
      partCaps.forEach(function (c) {
        var divider = document.createElement('div');
        divider.className = 'jt-chapter-divider';
        divider.title = c.titulo;
        var pct = dur > 0 ? (c.seg / dur) * 100 : 0;
        divider.style.left = pct + '%';
        progressChaptersWrap.appendChild(divider);
      });
    }
  }

  // Preguntas interactivas durante la reproducción
  function checkQuestions(ct) {
    if (!state.questions || state.questions.length === 0) return;
    if (state.activeQuestion || !state.posLista) return;
    var qs = preguntasDe(state.parte);
    for (var i = 0; i < qs.length; i++) {
      var k = claveDe(qs[i], state.parte);
      if (!state.answeredQuestions[k]) {
        if (ct >= qs[i].seg) triggerQuestion(qs[i], k);
        break;
      }
    }
  }

  function reanudarTrasPregunta() {
    questionCard.classList.remove('active');
    state.activeQuestion = null;
    saveProgress();
    var d = videoEl.duration || 0;
    if (videoEl.ended || (d > 0 && videoEl.currentTime >= d - 0.3)) {
      onPartEnded();
    } else {
      // Retrocede un instante para no perder la última palabra de la escena
      try { videoEl.currentTime = Math.max(0, videoEl.currentTime - 0.8); } catch (e) {}
      videoEl.play().catch(function () {});
    }
  }

  function triggerQuestion(qItem, qKey) {
    state.activeQuestion = qItem;
    state.shownQuestions[qKey] = true;
    videoEl.pause();
    try { videoEl.currentTime = Math.min(qItem.seg, videoEl.duration || qItem.seg); } catch (e) {}

    var badgeText = document.getElementById('jt-question-badge-text');
    var qBody = document.getElementById('jt-question-body');
    var qRetro = document.getElementById('jt-question-retro');

    if (badgeText) {
      if (qItem.tipo === 'opcion') badgeText.textContent = 'Pregunta de opción múltiple';
      else if (qItem.tipo === 'vf') badgeText.textContent = 'Verdadero o Falso';
      else if (qItem.tipo === 'abierta') badgeText.textContent = 'Reflexión gerencial';
      else badgeText.textContent = 'Pregunta interactiva';
    }

    questionText.textContent = qItem.texto;
    if (qBody) qBody.innerHTML = '';
    if (qRetro) {
      qRetro.style.display = 'none';
      qRetro.className = 'jt-question-retro';
      qRetro.textContent = '';
    }
    questionBtnContinue.disabled = true;
    questionBtnContinue.onclick = reanudarTrasPregunta;

    if (qItem.tipo === 'opcion' || qItem.tipo === 'vf') {
      var optsDiv = document.createElement('div');
      optsDiv.className = 'jt-question-options';

      var opciones = qItem.opciones || (qItem.tipo === 'vf' ? ['Verdadero', 'Falso'] : []);
      opciones.forEach(function (optText, idx) {
        var optBtn = document.createElement('button');
        optBtn.className = 'jt-option-btn';
        optBtn.type = 'button';
        optBtn.textContent = optText;

        optBtn.onclick = function () {
          var allBtns = optsDiv.querySelectorAll('.jt-option-btn');
          allBtns.forEach(function (b) { b.disabled = true; });

          var isCorrect = (idx === qItem.correcta);
          if (isCorrect) {
            optBtn.classList.add('correct');
            if (qRetro) {
              qRetro.className = 'jt-question-retro success';
              qRetro.innerHTML = '<strong>¡Respuesta correcta!</strong><br>' + (qItem.retro || '');
            }
          } else {
            optBtn.classList.add('incorrect');
            if (allBtns[qItem.correcta]) {
              allBtns[qItem.correcta].classList.add('correct');
            }
            if (qRetro) {
              qRetro.className = 'jt-question-retro warning';
              qRetro.innerHTML = '<strong>Respuesta incorrecta.</strong><br>' + (qItem.retro || '');
            }
          }
          if (qRetro) qRetro.style.display = 'block';
          questionBtnContinue.disabled = false;

          registrarRespuesta({
            id: qItem.id,
            tipo: qItem.tipo,
            respuesta: optText,
            opcionIndex: idx,
            correcta: qItem.correcta,
            esCorrecta: isCorrect,
            puntos: isCorrect ? (qItem.puntos || 10) : 0,
            totalPuntos: qItem.puntos || 10,
            tema: qItem.tema || '',
            texto: qItem.texto
          });
        };
        optsDiv.appendChild(optBtn);
      });
      if (qBody) qBody.appendChild(optsDiv);
    } else if (qItem.tipo === 'abierta') {
      var minWords = qItem.palabras_minimas || 30;
      var ta = document.createElement('textarea');
      ta.className = 'jt-textarea';
      ta.rows = 4;
      ta.placeholder = 'Escriba su análisis y reflexión profesional (mínimo ' + minWords + ' palabras)...';

      var wcDiv = document.createElement('div');
      wcDiv.className = 'jt-word-count';
      wcDiv.innerHTML = '<span id="jt-wc-num">0</span> / ' + minWords + ' palabras requeridas';

      function countWords(str) {
        var matches = str.trim().match(/\S+/g);
        return matches ? matches.length : 0;
      }

      ta.oninput = function () {
        var cnt = countWords(ta.value);
        var numEl = document.getElementById('jt-wc-num');
        if (numEl) numEl.textContent = cnt;
        if (cnt >= minWords) {
          wcDiv.classList.add('valid');
          questionBtnContinue.disabled = false;
        } else {
          wcDiv.classList.remove('valid');
          questionBtnContinue.disabled = true;
        }
        // Borrador: si se corta el internet o se recarga, no se pierde lo escrito
        state.prog.drafts[qItem.id] = ta.value;
        saveProgress();
      };

      questionBtnContinue.onclick = function () {
        registrarRespuesta({
          id: qItem.id,
          tipo: 'abierta',
          respuesta: ta.value.trim(),
          correcta: null,
          esCorrecta: true,
          puntos: qItem.puntos || 15,
          totalPuntos: qItem.puntos || 15,
          tema: qItem.tema || '',
          texto: qItem.texto
        });
        reanudarTrasPregunta();
      };

      if (qBody) {
        qBody.appendChild(ta);
        qBody.appendChild(wcDiv);
      }
      if (state.prog.drafts[qItem.id]) {
        ta.value = state.prog.drafts[qItem.id];
        ta.oninput();
      }
    } else {
      questionBtnContinue.disabled = false;
      questionBtnContinue.onclick = function () {
        state.answeredQuestions[claveDe(qItem, state.parte)] = true;
        reanudarTrasPregunta();
      };
    }

    questionCard.classList.add('active');
    avisarPadre({ johantube: 'pregunta_abierta', id: qItem.id });
  }

  questionBtnRewind.onclick = function () {
    questionCard.classList.remove('active');
    state.activeQuestion = null;
    var rewindTarget = Math.max(0, videoEl.currentTime - 40);
    videoEl.currentTime = rewindTarget;
    videoEl.play().catch(function () {});
  };

  // Pantalla de Fin de Parte y cuenta regresiva
  function siguientePendiente() {
    var qs = preguntasDe(state.parte);
    for (var i = 0; i < qs.length; i++) {
      if (!state.answeredQuestions[claveDe(qs[i], state.parte)]) return qs[i];
    }
    return null;
  }

  function onPartEnded() {
    // Si quedó alguna pregunta sin responder, no se da la sección por terminada
    var pend = siguientePendiente();
    if (pend) {
      triggerQuestion(pend, claveDe(pend, state.parte));
      return;
    }

    if (!seccionCompleta(state.parte)) {
      state.prog.completed.push(state.parte);
      state.prog.completed.sort(function (a, b) { return a - b; });
    }
    state.prog.parte = state.parte < state.totalPartes ? state.parte + 1 : state.parte;
    state.prog.seg = 0;
    saveProgress();
    avisarPadre({ johantube: 'seccion_completa', seccion: state.parte });
    updateActivePartButtons();
    renderScenesTab();

    if (state.parte < state.totalPartes) {
      var t = endOverlay.querySelector('.jt-end-title');
      var c = endOverlay.querySelector('.jt-end-countdown');
      if (t) t.textContent = 'Sección ' + state.parte + ' completada ✓';
      if (c) c.innerHTML = 'Siguiente sección en <span id="jt-end-seconds">5</span> s...';
      endCountdownEl = document.getElementById('jt-end-seconds');
      state.endCountdownSec = 5;
      endCountdownEl.textContent = state.endCountdownSec;
      endOverlay.classList.add('active');

      clearInterval(state.endCountdownTimer);
      state.endCountdownTimer = setInterval(function () {
        state.endCountdownSec--;
        endCountdownEl.textContent = state.endCountdownSec;
        if (state.endCountdownSec <= 0) {
          clearInterval(state.endCountdownTimer);
          endOverlay.classList.remove('active');
          cargarParte(state.parte + 1, 0, true);
        }
      }, 1000);
    } else {
      showOverlayError('¡Completaste todas las secciones!', 'Tus respuestas están guardadas. Revisa y envía tus resultados en la página.', false);
      avisarPadre({ johantube: 'fin', totalPartes: state.totalPartes });
    }
  }

  endBtnCancel.addEventListener('click', function () {
    clearInterval(state.endCountdownTimer);
    endOverlay.classList.remove('active');
  });

  endBtnNext.addEventListener('click', function () {
    clearInterval(state.endCountdownTimer);
    endOverlay.classList.remove('active');
    cargarParte(state.parte + 1, 0, true);
  });

  // Guardado de la posición: se retoma exactamente donde se quedó
  var lastSaveTime = 0;
  function guardarPosicion(force) {
    if (!state.key || !state.posLista || seccionCompleta(state.parte)) return;
    var now = Date.now();
    if (!force && now - lastSaveTime < 2000) return;
    lastSaveTime = now;
    var ct = videoEl.currentTime || 0;
    if (state.activeQuestion) ct = Math.max(0, state.activeQuestion.seg - 6);
    state.prog.parte = state.parte;
    state.prog.seg = Math.max(0, Math.floor(ct));
    saveProgress();
  }

  function saveResumePosition() { guardarPosicion(false); }

  // Sin internet: el avance queda guardado y se retoma solo al volver la conexión
  function manejarRedCaida() {
    state.reconectando = true;
    state.resumeAt = state.activeQuestion ? state.activeQuestion.seg : (videoEl.currentTime || state.resumeAt || 0);
    guardarPosicion(true);
    spinnerEl.classList.remove('active');
    if (state.activeQuestion) {
      avisar('Sin conexión. Puedes responder: tu avance está guardado.', 6000);
    } else {
      showOverlayError('Sin conexión a internet', 'Tu avance está guardado. Retomaremos solos en cuanto vuelva la conexión.', true);
    }
  }

  function reintentarCarga() {
    if (!state.reconectando) return;
    state.reconectando = false;
    hideOverlayMessage();
    var t = state.resumeAt || 0;
    var reanudar = !state.activeQuestion;
    if (state.hls && videoEl.readyState > 0) {
      try {
        state.hls.startLoad(t);
        if (reanudar) videoEl.play().catch(function () {});
        return;
      } catch (e) {}
    }
    spinnerEl.classList.add('active');
    cargarParte(state.parte, t, reanudar);
  }

  window.addEventListener('online', function () {
    if (state.metaFallo) arrancar();
    else reintentarCarga();
  });
  window.addEventListener('offline', function () {
    guardarPosicion(true);
    avisar('Sin conexión. Tu avance está guardado.', 6000);
  });
  setInterval(function () {
    if (navigator.onLine === false) return;
    if (state.metaFallo) arrancar();
    else if (state.reconectando) reintentarCarga();
  }, 7000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') guardarPosicion(true);
  });
  window.addEventListener('pagehide', function () { guardarPosicion(true); });
  window.addEventListener('beforeunload', function () { guardarPosicion(true); });

  // Pestaña Escenas (Capítulos)
  function renderScenesTab() {
    scenesList.innerHTML = '';

    // Si hay secciones definidas en meta.json
    if (state.meta && state.meta.secciones && state.meta.secciones.length > 0) {
      state.meta.secciones.forEach(function (s) {
        var item = document.createElement('button');
        item.className = 'jt-scene-item';
        if (s.n === state.parte) {
          item.classList.add('active');
        }
        if (!puedeAbrir(s.n)) {
          item.classList.add('jt-locked');
          item.setAttribute('aria-disabled', 'true');
        }

        var thumbDiv = document.createElement('div');
        thumbDiv.className = 'jt-scene-thumb';
        var timeTag = document.createElement('span');
        timeTag.className = 'jt-scene-thumb-time';
        timeTag.textContent = formatTime(s.duracion || 0);
        thumbDiv.appendChild(timeTag);

        var infoDiv = document.createElement('div');
        infoDiv.className = 'jt-scene-info';

        var titleDiv = document.createElement('div');
        titleDiv.className = 'jt-scene-title';
        titleDiv.textContent = (seccionCompleta(s.n) ? '✓ ' : (puedeAbrir(s.n) ? '' : '🔒 ')) + 'Sección ' + s.n + ': ' + s.titulo;

        var metaDiv = document.createElement('div');
        metaDiv.className = 'jt-scene-meta';
        metaDiv.textContent = s.leccion ? s.leccion.slice(0, 90) + '...' : 'Duración: ' + formatTime(s.duracion || 0);

        infoDiv.appendChild(titleDiv);
        infoDiv.appendChild(metaDiv);
        item.appendChild(thumbDiv);
        item.appendChild(infoDiv);

        item.addEventListener('click', function () {
          if (s.n !== state.parte) {
            cargarParte(s.n, 0, true);
          } else {
            videoEl.currentTime = 0;
            videoEl.play().catch(function () {});
          }
        });

        scenesList.appendChild(item);
      });
      return;
    }

    var caps = (state.meta && state.meta.capitulos) ? state.meta.capitulos : [];
    if (caps.length === 0) {
      scenesList.innerHTML = '<div class="jt-empty-state"><p>No hay capítulos definidos para este video.</p></div>';
      return;
    }

    caps.forEach(function (c) {
      var item = document.createElement('button');
      item.className = 'jt-scene-item';
      var partVal = c.seccion || c.parte;
      if (partVal === state.parte && Math.abs(c.seg - (videoEl.currentTime || 0)) < 30) {
        item.classList.add('active');
      }

      var thumbDiv = document.createElement('div');
      thumbDiv.className = 'jt-scene-thumb';

      if (partVal === state.parte && state.spriteUrl && state.thumbsVtt.length > 0) {
        for (var i = 0; i < state.thumbsVtt.length; i++) {
          var t = state.thumbsVtt[i];
          if (c.seg >= t.start && c.seg < t.end) {
            thumbDiv.style.backgroundImage = 'url("' + state.spriteUrl + '")';
            thumbDiv.style.backgroundPosition = '-' + t.x + 'px -' + t.y + 'px';
            thumbDiv.style.backgroundSize = '1600px 804px';
            break;
          }
        }
      }

      var timeTag = document.createElement('span');
      timeTag.className = 'jt-scene-thumb-time';
      timeTag.textContent = formatTime(c.seg);
      thumbDiv.appendChild(timeTag);

      var infoDiv = document.createElement('div');
      infoDiv.className = 'jt-scene-info';

      var titleDiv = document.createElement('div');
      titleDiv.className = 'jt-scene-title';
      titleDiv.textContent = c.titulo;

      var metaDiv = document.createElement('div');
      metaDiv.className = 'jt-scene-meta';
      var labelP = state.useSecciones ? 'Sección ' : 'Parte ';
      metaDiv.textContent = labelP + partVal + ' • ' + formatTime(c.seg);

      infoDiv.appendChild(titleDiv);
      infoDiv.appendChild(metaDiv);

      item.appendChild(thumbDiv);
      item.appendChild(infoDiv);

      item.addEventListener('click', function () {
        if (partVal !== state.parte) {
          cargarParte(partVal, c.seg, true);
        } else {
          safeSeekTo(c.seg);
          videoEl.play().catch(function () {});
        }
      });

      scenesList.appendChild(item);
    });
  }

  // Pestaña Transcripción
  function renderTranscriptTab() {
    transcriptList.innerHTML = '';
    if (!state.transcript || state.transcript.length === 0) {
      transcriptList.innerHTML = '<div class="jt-empty-state"><p>Transcripción no disponible para esta parte.</p></div>';
      return;
    }

    var filter = (transcriptSearch.value || '').toLowerCase().trim();

    state.transcript.forEach(function (line, index) {
      if (filter && line.texto.toLowerCase().indexOf(filter) === -1) {
        return;
      }

      var row = document.createElement('div');
      row.className = 'jt-transcript-item';
      row.setAttribute('data-index', index);
      row.setAttribute('data-ini', line.ini);
      row.setAttribute('data-fin', line.fin);

      var timeCol = document.createElement('span');
      timeCol.className = 'jt-transcript-time';
      timeCol.textContent = formatTime(line.ini);

      var textCol = document.createElement('span');
      textCol.className = 'jt-transcript-text';
      textCol.textContent = line.texto;

      row.appendChild(timeCol);
      row.appendChild(textCol);

      row.addEventListener('click', function () {
        safeSeekTo(line.ini);
        videoEl.play().catch(function () {});
      });

      transcriptList.appendChild(row);
    });
  }

  transcriptSearch.addEventListener('input', function () {
    renderTranscriptTab();
  });

  function updateTranscriptHighlight(ct) {
    var items = transcriptList.querySelectorAll('.jt-transcript-item');
    if (items.length === 0) return;

    var activeItem = null;
    items.forEach(function (el) {
      var ini = parseFloat(el.getAttribute('data-ini'));
      var fin = parseFloat(el.getAttribute('data-fin'));
      if (ct >= ini && ct <= fin + 0.3) {
        el.classList.add('active');
        activeItem = el;
      } else {
        el.classList.remove('active');
      }
    });

    if (activeItem && !transcriptSearch.matches(':focus')) {
      // Auto-scroll suave dentro de la lista
      var containerTop = transcriptList.scrollTop;
      var containerBottom = containerTop + transcriptList.clientHeight;
      var elemTop = activeItem.offsetTop - transcriptList.offsetTop;
      var elemBottom = elemTop + activeItem.clientHeight;

      if (elemTop < containerTop || elemBottom > containerBottom) {
        transcriptList.scrollTo({
          top: elemTop - (transcriptList.clientHeight / 2) + (activeItem.clientHeight / 2),
          behavior: 'smooth'
        });
      }
    }
  }

  // Pestaña Partes / Secciones
  function renderPartsGrid() {
    partsGrid.innerHTML = '';
    var label = state.useSecciones ? 'Sección' : 'Parte';
    for (var i = 1; i <= state.totalPartes; i++) {
      (function (n) {
        var btn = document.createElement('button');
        btn.className = 'jt-part-btn';
        btn.setAttribute('aria-label', label + ' ' + n);
        btn.setAttribute('aria-current', n === state.parte ? 'true' : 'false');

        var numSpan = document.createElement('span');
        numSpan.textContent = n;

        var subSpan = document.createElement('span');
        subSpan.className = 'jt-part-btn-sub';
        subSpan.textContent = label;

        btn.appendChild(numSpan);
        btn.appendChild(subSpan);

        btn.addEventListener('click', function () {
          cargarParte(n, 0, true);
        });

        partsGrid.appendChild(btn);
      })(i);
    }
  }

  function updateActivePartButtons() {
    var btns = partsGrid.querySelectorAll('.jt-part-btn');
    btns.forEach(function (b, idx) {
      var n = idx + 1;
      b.setAttribute('aria-current', (n === state.parte) ? 'true' : 'false');
      b.classList.toggle('jt-locked', !puedeAbrir(n));
      b.classList.toggle('jt-done', seccionCompleta(n));
      b.setAttribute('aria-disabled', puedeAbrir(n) ? 'false' : 'true');
      b.title = seccionCompleta(n) ? 'Sección completada' : (puedeAbrir(n) ? 'Sección en curso' : 'Bloqueada: termine primero la sección ' + primeraIncompleta());
    });
    btnNext.disabled = state.parte >= state.totalPartes || !seccionCompleta(state.parte);
    btnNext.title = btnNext.disabled && state.parte < state.totalPartes ? 'Termine esta sección para continuar' : 'Siguiente sección';
  }

  // Carga asíncrona de recursos por parte (thumbs, subs, transcripcion)
  function fetchPartAssets(partNum) {
    var folder = getPartFolder(partNum);

    // Miniaturas
    state.thumbsVtt = [];
    state.spriteUrl = folder + 'sprite.jpg';
    fetch(folder + 'thumbs.vtt')
      .then(function (res) {
        if (!res.ok) throw new Error('thumbs.vtt not found');
        return res.text();
      })
      .then(function (txt) {
        state.thumbsVtt = parseThumbsVTT(txt);
        renderScenesTab();
      })
      .catch(function () {
        state.thumbsVtt = [];
        state.spriteUrl = '';
      });

    // Subtítulos
    state.subsCues = [];
    fetch(folder + 'subs.vtt')
      .then(function (res) {
        if (!res.ok) throw new Error('subs.vtt not found');
        return res.text();
      })
      .then(function (txt) {
        state.subsCues = parseSubsVTT(txt);
        btnCc.disabled = false;
      })
      .catch(function () {
        state.subsCues = [];
        btnCc.disabled = true;
        setSubtitlesEnabled(false);
      });

    // Transcripción
    state.transcript = [];
    fetch(folder + 'transcripcion.json')
      .then(function (res) {
        if (!res.ok) throw new Error('transcripcion.json not found');
        return res.json();
      })
      .then(function (data) {
        state.transcript = Array.isArray(data) ? data : [];
        renderTranscriptTab();
      })
      .catch(function () {
        state.transcript = [];
        renderTranscriptTab();
      });
  }

  // Carga de metadatos globales (meta.json). Sin las preguntas no se reproduce nada.
  function aplicarMeta(meta) {
    state.meta = meta;
    if (meta.secciones && Array.isArray(meta.secciones)) {
      state.useSecciones = true;
      state.totalPartes = meta.secciones.length;
    } else if (meta.partes) {
      state.useSecciones = false;
      state.totalPartes = meta.partes;
    }
    state.questions = meta.preguntas || [];
    updateHeader();
    renderProgressMarkers();
    renderScenesTab();
    renderPartsGrid();
  }

  function fetchMeta() {
    var intentos = 0;
    function intentar() {
      return fetch(getMetaUrl(), { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('meta.json ' + res.status);
          return res.json();
        })
        .then(function (meta) {
          try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) {}
          return meta;
        })
        .catch(function (err) {
          intentos++;
          if (intentos < 3) {
            return new Promise(function (ok) { setTimeout(ok, 1200 * intentos); }).then(intentar);
          }
          try {
            var c = JSON.parse(localStorage.getItem(META_KEY) || 'null');
            if (c && c.preguntas && c.secciones) return c;
          } catch (e) {}
          throw err;
        });
    }
    return intentar().then(aplicarMeta);
  }

  // Menú de Calidad en Settings
  function populateQualityMenu(levels) {
    menuQuality.innerHTML = '<div class="jt-menu-header" id="jt-back-quality">' +
      '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>' +
      '<span>Calidad</span></div>';

    // Opción Automática
    var autoBtn = document.createElement('button');
    autoBtn.className = 'jt-menu-item' + (state.currentLevel === -1 ? ' selected' : '');
    autoBtn.setAttribute('data-level', '-1');
    autoBtn.innerHTML = '<span class="jt-menu-item-text">Automática</span><span class="jt-menu-item-right">✓</span>';
    autoBtn.onclick = function () { setQualityLevel(-1); };
    menuQuality.appendChild(autoBtn);

    if (levels && levels.length > 0) {
      levels.forEach(function (lvl, idx) {
        var btn = document.createElement('button');
        btn.className = 'jt-menu-item' + (state.currentLevel === idx ? ' selected' : '');
        btn.setAttribute('data-level', idx);
        var label = lvl.height ? lvl.height + 'p' : 'Nivel ' + (idx + 1);
        btn.innerHTML = '<span class="jt-menu-item-text">' + label + '</span><span class="jt-menu-item-right">✓</span>';
        btn.onclick = function () { setQualityLevel(idx); };
        menuQuality.appendChild(btn);
      });
    }

    document.getElementById('jt-back-quality').onclick = function () {
      switchMenuView(menuMain);
    };
  }

  function switchMenuView(targetView) {
    var views = [menuMain, menuSpeed, menuQuality, menuSubs];
    views.forEach(function (v) {
      if (v === targetView) v.classList.add('active');
      else v.classList.remove('active');
    });
  }

  // Carga de una parte y reproducción
  function cargarParte(n, startTime, autoplay) {
    n = parseInt(n, 10) || 1;
    if (!puedeAbrir(n)) {
      avisar('Primero termine la sección ' + primeraIncompleta() + ' para abrir la ' + n + '.', 5000);
      return;
    }
    // Nunca empezar más adelante de la próxima pregunta pendiente
    var tope = 0;
    var pendientes = preguntasDe(n);
    for (var qi = 0; qi < pendientes.length; qi++) {
      if (!state.answeredQuestions[claveDe(pendientes[qi], n)]) { tope = pendientes[qi].seg; break; }
    }
    if (tope && (startTime || 0) > tope) startTime = Math.max(0, tope - 6);
    state.parte = n;
    state.posLista = false;
    state.activeQuestion = null;
    questionCard.classList.remove('active');
    clearInterval(state.endCountdownTimer);
    endOverlay.classList.remove('active');
    hideOverlayMessage();
    try { videoEl.pause(); } catch (e) {}
    try { videoEl.currentTime = startTime || 0; } catch (e) {}
    updateHeader();
    updateActivePartButtons();
    renderProgressMarkers();
    fetchPartAssets(n);

    var videoUrl = getHlsUrl(n);

    if (state.hls) {
      state.hls.destroy();
      state.hls = null;
    }

    spinnerEl.classList.add('active');

    var onMediaReady = function () {
      spinnerEl.classList.remove('active');
      if (typeof startTime === 'number' && !isNaN(startTime)) {
        videoEl.currentTime = startTime;
      }
      state.posLista = true;
      videoEl.playbackRate = state.playbackRate;
      renderProgressMarkers();
      renderScenesTab();
      if (autoplay) {
        videoEl.play().catch(function () {});
      }
    };

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true,
        manifestLoadingMaxRetry: 4,
        manifestLoadingRetryDelay: 1000,
        levelLoadingMaxRetry: 4,
        levelLoadingRetryDelay: 1000,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 1000
      });
      state.hls = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(videoEl);

      hls.on(window.Hls.Events.MANIFEST_PARSED, function (e, data) {
        populateQualityMenu(data.levels);
        onMediaReady();
      });

      hls.on(window.Hls.Events.LEVEL_SWITCHED, function (e, data) {
        var lvl = hls.levels[data.level];
        if (state.currentLevel === -1 && lvl && qualityLabel) {
          qualityLabel.textContent = 'Auto (' + lvl.height + 'p)';
        }
      });

      hls.on(window.Hls.Events.ERROR, function (e, data) {
        if (data.fatal) {
          spinnerEl.classList.remove('active');
          switch (data.type) {
            case window.Hls.ErrorTypes.NETWORK_ERROR:
              manejarRedCaida();
              break;
            case window.Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              showOverlayError('No se pudo reproducir el video', 'Verifique el enlace o pida uno nuevo.', true);
              break;
          }
        }
      });
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = videoUrl;
      videoEl.addEventListener('loadedmetadata', function () {
        onMediaReady();
      }, { once: true });
      videoEl.onerror = function () {
        spinnerEl.classList.remove('active');
        showOverlayError('No se pudo reproducir el video', 'Verifique su conexión o intente nuevamente.', true);
      };
    } else {
      spinnerEl.classList.remove('active');
      showOverlayError('Navegador no compatible', 'Su navegador no soporta reproducción HLS.', false);
    }
  }

  // Atajos de teclado profesionales
  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', function (e) {
      // Ignorar si el foco está en un input, textarea o contenido editable
      var target = e.target || document.activeElement;
      if (target && target.matches && (target.matches('input, textarea, select, [contenteditable]') || target.isContentEditable)) {
        return;
      }

      var key = e.key;

      // Espacio o K: reproducir / pausar
      if (key === ' ' || key === 'k' || key === 'K') {
        e.preventDefault();
        togglePlay();
        showControls();
        return;
      }

      // J: -10s
      if (key === 'j' || key === 'J') {
        e.preventDefault();
        videoEl.currentTime = Math.max(0, videoEl.currentTime - 10);
        showControls();
        return;
      }

      // L: +10s
      if (key === 'l' || key === 'L') {
        e.preventDefault();
        safeSeekTo(videoEl.currentTime + 10);
        showControls();
        return;
      }

      // Flecha izquierda: -5s
      if (key === 'ArrowLeft') {
        e.preventDefault();
        videoEl.currentTime = Math.max(0, videoEl.currentTime - 5);
        showControls();
        return;
      }

      // Flecha derecha: +5s
      if (key === 'ArrowRight') {
        e.preventDefault();
        safeSeekTo(videoEl.currentTime + 5);
        showControls();
        return;
      }

      // Flecha arriba: Volumen +5%
      if (key === 'ArrowUp') {
        e.preventDefault();
        setVolume(videoEl.volume + 0.05);
        showControls();
        return;
      }

      // Flecha abajo: Volumen -5%
      if (key === 'ArrowDown') {
        e.preventDefault();
        setVolume(videoEl.volume - 0.05);
        showControls();
        return;
      }

      // M: Silenciar / Reactivar
      if (key === 'm' || key === 'M') {
        e.preventDefault();
        toggleMute();
        showControls();
        return;
      }

      // F: Pantalla Completa
      if (key === 'f' || key === 'F') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // C: Subtítulos
      if (key === 'c' || key === 'C') {
        e.preventDefault();
        toggleSubtitles();
        showControls();
        return;
      }

      // T: Modo Cine
      if (key === 't' || key === 'T') {
        e.preventDefault();
        toggleTheaterMode();
        return;
      }

      // I: Picture in Picture
      if (key === 'i' || key === 'I') {
        e.preventDefault();
        togglePip();
        return;
      }

      // 0-9: Saltar a porcentaje (0% a 90%)
      if (key >= '0' && key <= '9') {
        e.preventDefault();
        var pct = parseInt(key, 10) * 0.1;
        seekByPercent(pct);
        showControls();
        return;
      }

      // , (coma) y . (punto): Fotograma a fotograma en pausa
      if (videoEl.paused) {
        if (key === ',') {
          e.preventDefault();
          videoEl.currentTime = Math.max(0, videoEl.currentTime - 0.04);
          return;
        }
        if (key === '.') {
          e.preventDefault();
          safeSeekTo(videoEl.currentTime + 0.04);
          return;
        }
      }

      // < o >: Ajustar velocidad
      if (key === '<') {
        e.preventDefault();
        setPlaybackRate(Math.max(0.5, state.playbackRate - 0.25));
        return;
      }
      if (key === '>') {
        e.preventDefault();
        setPlaybackRate(Math.min(2.0, state.playbackRate + 0.25));
        return;
      }

      // Home y End
      if (key === 'Home') {
        e.preventDefault();
        videoEl.currentTime = 0;
        return;
      }
      if (key === 'End') {
        e.preventDefault();
        safeSeekTo(videoEl.duration || 0);
        return;
      }
    });
  }

  // Interacción móvil: Toque, Doble Toque, Long Press (2x)
  function setupTouchAndGestures() {
    function triggerRipple(side, text) {
      var ripple = side === 'left' ? rippleLeft : rippleRight;
      var textEl = ripple.querySelector('.jt-ripple-text');
      if (textEl) textEl.textContent = text;
      ripple.classList.remove('animate');
      void ripple.offsetWidth; // Forzar reflow
      ripple.classList.add('animate');
      setTimeout(function () {
        ripple.classList.remove('animate');
      }, 600);
    }

    videoEl.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') {
        // Long press detection para 2x
        state.isLongPressing = false;
        state.rateBeforePress = state.playbackRate;
        clearTimeout(state.pressTimer);
        state.pressTimer = setTimeout(function () {
          state.isLongPressing = true;
          videoEl.playbackRate = 2.0;
          speedBadgeEl.classList.add('active');
        }, 500);
      }
    });

    function releaseLongPress() {
      clearTimeout(state.pressTimer);
      if (state.isLongPressing) {
        state.isLongPressing = false;
        videoEl.playbackRate = state.rateBeforePress;
        speedBadgeEl.classList.remove('active');
      }
    }

    videoEl.addEventListener('pointerup', releaseLongPress);
    videoEl.addEventListener('pointercancel', releaseLongPress);

    // Doble toque y toque simple
    videoEl.addEventListener('click', function (e) {
      if (state.isLongPressing) return;

      var now = Date.now();
      var rect = videoEl.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var relX = x / rect.width;

      var timeDiff = now - state.lastTapTime;
      var distDiff = Math.abs(x - state.lastTapX);

      if (timeDiff < 320 && distDiff < 60) {
        // Doble toque detectado
        state.lastTapTime = 0; // reset
        if (relX < 0.35) {
          // Tercio izquierdo: -10s
          videoEl.currentTime = Math.max(0, videoEl.currentTime - 10);
          triggerRipple('left', '-10 s');
        } else if (relX > 0.65) {
          // Tercio derecho: +10s
          safeSeekTo(videoEl.currentTime + 10);
          triggerRipple('right', '+10 s');
        } else {
          // Tercio central: alternar play
          togglePlay();
        }
      } else {
        // Toque simple: actualizar timestamp
        state.lastTapTime = now;
        state.lastTapX = x;

        // Alternar controles
        if (controlsEl.classList.contains('jt-controls-hidden')) {
          showControls();
        } else {
          hideControls();
        }
      }
    });

    // Movimiento de mouse en player para mostrar controles
    playerEl.addEventListener('mousemove', showControls);
    playerEl.addEventListener('pointermove', showControls);
  }

  // Configuración de Menú de Ajustes Popover
  function setupSettingsMenu() {
    btnSettings.addEventListener('click', function (e) {
      e.stopPropagation();
      settingsMenu.classList.toggle('active');
      if (settingsMenu.classList.contains('active')) {
        switchMenuView(menuMain);
      }
    });

    // Cerrar menú si se hace clic fuera
    document.addEventListener('click', function (e) {
      if (!settingsMenu.contains(e.target) && e.target !== btnSettings && !btnSettings.contains(e.target)) {
        settingsMenu.classList.remove('active');
      }
    });

    // Navegación dentro del menú
    document.getElementById('jt-menu-open-speed').onclick = function () {
      switchMenuView(menuSpeed);
    };
    document.getElementById('jt-back-speed').onclick = function () {
      switchMenuView(menuMain);
    };

    document.getElementById('jt-menu-open-quality').onclick = function () {
      switchMenuView(menuQuality);
    };

    document.getElementById('jt-menu-open-subs').onclick = function () {
      switchMenuView(menuSubs);
    };
    document.getElementById('jt-back-subs').onclick = function () {
      switchMenuView(menuMain);
    };

    // Opciones de velocidad
    menuSpeed.querySelectorAll('.jt-menu-item').forEach(function (btn) {
      btn.onclick = function () {
        var r = parseFloat(btn.getAttribute('data-rate'));
        setPlaybackRate(r);
        settingsMenu.classList.remove('active');
      };
    });

    // Opciones de subtítulos
    menuSubs.querySelectorAll('.jt-menu-item').forEach(function (btn) {
      btn.onclick = function () {
        var sub = btn.getAttribute('data-sub');
        setSubtitlesEnabled(sub === 'es');
        settingsMenu.classList.remove('active');
      };
    });
  }

  // Configuración de Pestañas
  function setupTabs() {
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-tab');

        tabBtns.forEach(function (b) {
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });

        var panes = [tabScenes, tabTranscript, tabParts];
        panes.forEach(function (pane) {
          if (pane.id === targetId) {
            pane.classList.add('active');
          } else {
            pane.classList.remove('active');
          }
        });
      });
    });
  }

  // Configuración de Botones de Controles
  function setupControls() {
    btnPlay.addEventListener('click', togglePlay);
    btnNext.addEventListener('click', function () {
      if (state.parte < state.totalPartes) {
        cargarParte(state.parte + 1, 0, true);
      }
    });
    // Comprobación fina: la pregunta aparece justo al llegar a su momento
    setInterval(function () {
      if (!videoEl.paused && !videoEl.seeking) checkQuestions(videoEl.currentTime);
    }, 100);

    btnMute.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', function () {
      setVolume(parseFloat(this.value));
    });

    btnCc.addEventListener('click', toggleSubtitles);
    btnTheater.addEventListener('click', toggleTheaterMode);
    btnPip.addEventListener('click', togglePip);
    btnFullscreen.addEventListener('click', toggleFullscreen);

    overlayMsgBtn.addEventListener('click', function () {
      if (state.metaFallo) { arrancar(); return; }
      if (state.reconectando) { reintentarCarga(); return; }
      cargarParte(state.parte, state.prog.seg || 0, true);
    });

    // Ocultar PiP si no está soportado
    if (!document.pictureInPictureEnabled) {
      btnPip.style.display = 'none';
    }

    document.addEventListener('fullscreenchange', updateFullscreenBtn);
    document.addEventListener('webkitfullscreenchange', updateFullscreenBtn);
  }

  // Eventos del elemento Video
  function setupVideoEvents() {
    videoEl.addEventListener('play', function () {
      updatePlayBtn();
      showControls();
    });

    videoEl.addEventListener('pause', function () {
      updatePlayBtn();
      showControls();
      guardarPosicion(true);
    });

    videoEl.addEventListener('timeupdate', updateProgressBar);

    videoEl.addEventListener('waiting', function () {
      spinnerEl.classList.add('active');
    });

    videoEl.addEventListener('playing', function () {
      spinnerEl.classList.remove('active');
    });

    videoEl.addEventListener('ended', onPartEnded);

    videoEl.addEventListener('volumechange', updateVolumeUI);
  }

  // Comunicación bidireccional vía postMessage
  function setupPostMessage() {
    window.addEventListener('message', function (ev) {
      var d = ev.data;
      if (!d) return;

      // { saltar: { parte, seg } }
      if (d.saltar) {
        var s = d.saltar;
        var targetPart = parseInt(s.parte, 10) || state.parte;
        var targetSeg = parseFloat(s.seg) || 0;

        if (targetPart !== state.parte || videoEl.readyState < 1) {
          cargarParte(targetPart, targetSeg, true);
        } else {
          videoEl.currentTime = targetSeg;
          videoEl.play().catch(function () {});
        }
      }

      // { pausar: true }
      if (d.pausar) {
        videoEl.pause();
      }

      // { pedirEstado: true }
      if (d.pedirEstado) {
        enviarEstado();
      }
    });
  }

  // Inicialización de la aplicación
  var controlesListos = false;

  function arrancar() {
    state.metaFallo = false;
    hideOverlayMessage();
    fetchMeta().then(function () {
      var p = state.prog.parte;
      var t = state.prog.seg;
      if (q.get('p') || q.get('s')) { p = initialPartParam; t = initialTimeParam; }
      if (!puedeAbrir(p)) { p = primeraIncompleta(); t = 0; }
      if (seccionCompleta(p) && p !== state.totalPartes) { p = primeraIncompleta(); t = 0; }
      cargarParte(p, t, false);
      enviarEstado();
      if (t > 5) {
        avisar('Retomamos donde lo dejaste: sección ' + p + ', minuto ' + formatTime(t) + '. Pulsa ▶ para continuar.', 7000);
      }
    }).catch(function () {
      state.metaFallo = true;
      spinnerEl.classList.remove('active');
      showOverlayError('No se pudo cargar la práctica', 'Revise su conexión a internet. Su avance está guardado y se reintentará solo.', true);
    });
  }

  function init() {
    // Si falta la llave
    if (!state.key) {
      showOverlayError('Enlace incompleto', 'Pida a su facilitador el enlace del video.', false);
      return;
    }

    if (!controlesListos) {
      controlesListos = true;
      setupControls();
      setupSettingsMenu();
      setupKeyboardShortcuts();
      setupTouchAndGestures();
      setupTabs();
      setupVideoEvents();
      setupPostMessage();
    }
    arrancar();
  }

  // Exponer API mínima para inspección y testing local
  window.johanTube = {
    state: state,
    video: videoEl,
    cargarParte: cargarParte,
    setPlaybackRate: setPlaybackRate,
    setQualityLevel: setQualityLevel,
    seekByPercent: seekByPercent,
    puedeAbrir: puedeAbrir,
    seccionCompleta: seccionCompleta
  };

  // Arranque al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
