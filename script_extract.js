
(function(){
"use strict";

/* ---------- TUTOR IA (n8n + Ollama en VPS) ---------- */
/* Si el VPS no responde (sin internet, servicio caído, etc.), la página
   sigue funcionando 100% con el motor de reglas y la calificación heurística local. */
var AI_BASE = 'https://n8n-inap.167.88.36.13.sslip.io/webhook';
var AI_CHAT_URL = AI_BASE + '/inap-tutor-chat';
var AI_GRADE_URL = AI_BASE + '/inap-grade';
var AI_CHAT_TIMEOUT = 60000;
var AI_GRADE_TIMEOUT = 650000;
var VOICE_TRANSCRIBE_URL = 'https://n8n-inap.167.88.36.13.sslip.io/webhook/prof-johan-tapia-transcribir';

/* ---------- NOTAS DE VOZ (grabar -> transcribir -> completar el campo) ---------- */
function pickRecorderMime(){
  var candidates = ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus'];
  for(var i=0;i<candidates.length;i++){
    if(window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
  }
  return '';
}
function wireVoiceButtons(){
  if(!navigator.mediaDevices || !window.MediaRecorder){
    document.querySelectorAll('.voice-btn').forEach(function(btn){
      btn.disabled = true; btn.title = 'Grabación de voz no disponible en este navegador';
    });
    return;
  }
  document.querySelectorAll('.voice-btn').forEach(function(btn){
    var targetId = btn.getAttribute('data-target');
    var textarea = document.getElementById(targetId);
    var statusEl = document.querySelector('.voice-status[data-target-status="'+targetId+'"]');
    if(!textarea) return;
    var mediaRecorder = null, chunks = [], stream = null, recording = false;

    function setStatus(msg, cls){
      if(!statusEl) return;
      statusEl.textContent = msg || '';
      statusEl.className = 'voice-status' + (cls ? ' ' + cls : '');
    }

    function stopStream(){
      if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream = null; }
    }

    function startRecording(){
      navigator.mediaDevices.getUserMedia({ audio:true }).then(function(s){
        stream = s;
        chunks = [];
        var mime = pickRecorderMime();
        try{ mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); }
        catch(e){ mediaRecorder = new MediaRecorder(stream); }
        mediaRecorder.addEventListener('dataavailable', function(e){ if(e.data && e.data.size > 0) chunks.push(e.data); });
        mediaRecorder.addEventListener('stop', function(){
          stopStream();
          var blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
          uploadForTranscription(blob);
        });
        mediaRecorder.start();
        recording = true;
        btn.classList.add('recording');
        btn.textContent = '⏹️ Detener grabación';
        setStatus('Grabando… hablen su respuesta y presionen "Detener" al terminar.', '');
      }).catch(function(){
        setStatus('No se pudo acceder al micrófono. Revisen los permisos del navegador, o simplemente escriban la respuesta.', 'err');
      });
    }

    function stopRecording(){
      if(mediaRecorder && recording){
        recording = false;
        btn.classList.remove('recording');
        mediaRecorder.stop();
      }
    }

    function uploadForTranscription(blob){
      btn.disabled = true;
      btn.classList.add('busy');
      btn.textContent = '⏳ Transcribiendo…';
      setStatus('Transcribiendo la nota de voz, un momento…', '');
      var fd = new FormData();
      var ext = (blob.type.indexOf('mp4') !== -1) ? 'm4a' : (blob.type.indexOf('ogg') !== -1 ? 'ogg' : 'webm');
      fd.append('data', blob, 'nota-voz.' + ext);
      fetchWithTimeout(VOICE_TRANSCRIBE_URL, { method:'POST', body: fd }, 60000).then(function(res){
        if(!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function(data){
        if(!data || !data.ok || !data.texto){ throw new Error('sin texto'); }
        var existing = textarea.value.trim();
        textarea.value = existing ? (existing + ' ' + data.texto) : data.texto;
        textarea.dispatchEvent(new Event('input'));
        setStatus('✔ Nota de voz agregada. Pueden revisarla y corregirla si hace falta.', 'ok');
      }).catch(function(){
        setStatus('No se pudo transcribir la nota de voz (puede ser un problema de conexión). Intenten de nuevo o escriban la respuesta directamente.', 'err');
      }).finally(function(){
        btn.disabled = false;
        btn.classList.remove('busy');
        btn.textContent = '🎤 Grabar nota de voz';
      });
    }

    btn.addEventListener('click', function(){
      if(recording) stopRecording(); else startRecording();
    });
  });
}

/* ---------- TAMAÑO DE LETRA (accesibilidad para personas mayores) ---------- */
var FONT_LEVELS = ['normal','grande','xgrande'];
function applyFontSize(level){
  document.documentElement.setAttribute('data-fontsize', level);
  try{ localStorage.setItem('tp_nivel1_fontsize', level); }catch(e){}
}
applyFontSize(localStorage.getItem('tp_nivel1_fontsize') || 'normal');
document.getElementById('font-bigger').addEventListener('click', function(){
  var cur = document.documentElement.getAttribute('data-fontsize') || 'normal';
  var idx = FONT_LEVELS.indexOf(cur);
  if(idx < FONT_LEVELS.length - 1) applyFontSize(FONT_LEVELS[idx+1]);
});
document.getElementById('font-smaller').addEventListener('click', function(){
  var cur = document.documentElement.getAttribute('data-fontsize') || 'normal';
  var idx = FONT_LEVELS.indexOf(cur);
  if(idx > 0) applyFontSize(FONT_LEVELS[idx-1]);
});

/* ---------- LEER EN VOZ ALTA (accesibilidad para quienes no leen) ---------- */
function stopSpeaking(){ if(window.speechSynthesis) speechSynthesis.cancel(); }
function buildSpeakText(root){
  var clone = root.cloneNode(true);
  clone.querySelectorAll('button, .voice-row, .wc, script, select').forEach(function(el){ el.remove(); });
  var text = clone.textContent || '';
  return text.replace(/\s+/g,' ').trim();
}
function speak(text, btn){
  if(!window.speechSynthesis || !text) return;
  stopSpeaking();
  var utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'es-ES';
  utter.rate = 0.95;
  var voices = speechSynthesis.getVoices();
  var esVoice = voices.find(function(v){ return v.lang && v.lang.toLowerCase().indexOf('es') === 0; });
  if(esVoice) utter.voice = esVoice;
  if(btn){
    document.querySelectorAll('.speak-btn.speaking').forEach(function(b){
      b.classList.remove('speaking');
      if(b.dataset.origLabel) b.textContent = b.dataset.origLabel;
    });
    if(!btn.dataset.origLabel) btn.dataset.origLabel = btn.textContent;
    btn.classList.add('speaking');
    btn.textContent = '⏹️ Detener lectura';
    utter.onend = function(){ btn.classList.remove('speaking'); btn.textContent = btn.dataset.origLabel; };
    utter.onerror = function(){ btn.classList.remove('speaking'); btn.textContent = btn.dataset.origLabel; };
  }
  speechSynthesis.speak(utter);
}
function wireSpeakButtons(){
  if(!window.speechSynthesis){
    document.querySelectorAll('.speak-btn').forEach(function(b){ b.disabled = true; b.title = 'La lectura en voz alta no está disponible en este navegador'; });
    return;
  }
  document.querySelectorAll('.speak-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      if(btn.classList.contains('speaking')){
        stopSpeaking();
        btn.classList.remove('speaking');
        if(btn.dataset.origLabel) btn.textContent = btn.dataset.origLabel;
        return;
      }
      var sectionId = btn.getAttribute('data-speak-section');
      var text;
      if(sectionId){
        var el = document.getElementById(sectionId);
        text = el ? el.textContent.replace(/\s+/g,' ').trim() : '';
      } else {
        var root = document.getElementById(btn.getAttribute('data-speak-target'));
        text = root ? buildSpeakText(root) : '';
      }
      speak(text, btn);
    });
  });
}

function fetchWithTimeout(url, options, timeoutMs){
  var controller = new AbortController();
  var timer = setTimeout(function(){ controller.abort(); }, timeoutMs);
  return fetch(url, Object.assign({}, options, { signal: controller.signal }))
    .finally(function(){ clearTimeout(timer); });
}

/* ---------- THEME ---------- */
var themeBtn = document.getElementById('theme-toggle');
function applyTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('tp_u1_theme', t);
}
applyTheme(localStorage.getItem('tp_u1_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeBtn.addEventListener('click', function(){
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ---------- MOBILE NAV ---------- */
var navToggle = document.getElementById('nav-toggle');
var sidebar = document.getElementById('sidebar');
navToggle.addEventListener('click', function(){
  var open = sidebar.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

/* ---------- READING PROGRESS BAR ---------- */
var progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', function(){
  var h = document.documentElement;
  var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = (scrolled || 0) + '%';
}, { passive:true });

/* ---------- ACTIVE NAV HIGHLIGHT ---------- */
var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
var sections = navLinks.map(function(a){ return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
var io = new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    var link = document.querySelector('.nav a[href="#' + entry.target.id + '"]');
    if(!link) return;
    if(entry.isIntersecting) navLinks.forEach(function(l){ l.classList.remove('active'); });
    if(entry.isIntersecting) link.classList.add('active');
  });
}, { rootMargin: '-20% 0px -70% 0px' });
sections.forEach(function(s){ io.observe(s); });

/* ---------- HELPERS ---------- */
function norm(s){ return (s === undefined || s === null) ? '' : String(s).trim(); }
function stripAccents(s){ return norm(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''); }
function wordCount(s){ s = norm(s); return s ? s.split(/\s+/).filter(Boolean).length : 0; }
function sentenceCount(s){ s = norm(s); if(!s) return 0; var m = s.match(/[^.!?]+[.!?]+|[^.!?]+$/g); return m ? m.filter(function(x){return x.trim().length>3;}).length : 0; }
function filled(s){ return norm(s).length > 0; }
function clamp01(n){ return Math.max(0, Math.min(1, n)); }
function val(id){ var el = document.getElementById(id); return el ? el.value : ''; }
function labelOf(id){ var el = document.getElementById(id); if(!el) return id; var lab = document.querySelector('label[for="'+id+'"]'); return lab ? lab.textContent.replace(/\s*\d+\/\d+ palabras\s*/,'').trim() : id; }
function escapeHtml(s){ var d = document.createElement('div'); d.textContent = norm(s); return d.innerHTML; }

/* ---------- CAMPOS DE CADA PASO ---------- */
var STEP_FIELDS = {
  paso1: ['p1_nombre','p1_tipo','p1_tiempo','p1_actividad','p1_beneficiarios'],
  paso2: ['p2_que','p2_como','p2_paraque','p2_mision_final','p2_reflexion'],
  paso3: ['p3_vision','p3_fortaleza1','p3_fortaleza2','p3_debilidad1','p3_debilidad2','p3_oportunidad1','p3_oportunidad2','p3_amenaza1','p3_amenaza2'],
  paso4: ['p4_m1_que','p4_m1_como','p4_m1_resp','p4_m1_cuando','p4_m2_que','p4_m2_como','p4_m2_resp','p4_m2_cuando','p4_m3_que','p4_m3_como','p4_m3_resp','p4_m3_cuando'],
  paso5: ['p5_r1','p5_r2','p5_r3','p5_r4']
};

/* ---------- WORD COUNTERS ---------- */
document.querySelectorAll('.wc[data-for]').forEach(function(span){
  var target = document.getElementById(span.getAttribute('data-for'));
  if(!target) return;
  var min = parseInt(span.getAttribute('data-min'),10) || 0;
  function update(){
    var wc = wordCount(target.value);
    span.textContent = wc + '/' + min + ' palabras';
    span.classList.toggle('ok', wc >= min);
  }
  target.addEventListener('input', update);
  update();
});

/* ---------- AUTOSAVE (localStorage) ---------- */
var STORE_KEY = 'tp_nivel1_respuestas_v1';
var META_FIELDS = ['grp_nombre', 'grp_correo', 'grp_integrantes'];
function allFieldIds(){
  var ids = META_FIELDS.slice();
  Object.keys(STEP_FIELDS).forEach(function(k){ ids = ids.concat(STEP_FIELDS[k]); });
  return ids;
}
function saveAll(){
  var data = {};
  allFieldIds().forEach(function(id){ data[id] = val(id); });
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(data)); }catch(e){}
}
function loadAll(){
  var raw; try{ raw = localStorage.getItem(STORE_KEY); }catch(e){ raw = null; }
  if(!raw) return;
  try{
    var data = JSON.parse(raw);
    Object.keys(data).forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.value = data[id];
    });
  }catch(e){}
}
loadAll();
document.querySelectorAll('.wc[data-for]').forEach(function(span){
  var target = document.getElementById(span.getAttribute('data-for'));
  if(target) target.dispatchEvent(new Event('input'));
});

var saveTimer = null;
document.addEventListener('input', function(e){
  var t = e.target;
  if(t && t.id && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function(){ saveAll(); updateProgress(); }, 400);
  }
});
document.addEventListener('change', function(e){
  var t = e.target;
  if(t && t.tagName === 'SELECT'){ saveAll(); updateProgress(); }
});

/* ---------- PROGRESS ---------- */
function stepRatio(key){
  var ids = STEP_FIELDS[key];
  if(!ids || !ids.length) return 0;
  var n = 0;
  ids.forEach(function(id){ if(filled(val(id))) n++; });
  return n / ids.length;
}
function updateProgress(){
  var keys = Object.keys(STEP_FIELDS);
  var total = 0;
  keys.forEach(function(k){
    var r = stepRatio(k);
    total += r;
    var pctEl = document.querySelector('.pct[data-pct="'+k+'"]');
    var linkEl = document.querySelector('.nav a[data-step="'+k+'"]');
    if(pctEl) pctEl.textContent = Math.round(r*100) + '%';
    if(linkEl) linkEl.classList.toggle('done', r >= 0.95);
  });
  var overall = Math.round((total / keys.length) * 100);
  document.getElementById('progress-count').textContent = overall + '%';
  var fillEl = document.getElementById('progress-fill-el');
  fillEl.style.width = overall + '%';
  fillEl.classList.toggle('complete', overall >= 95);
}
updateProgress();

/* ---------- RÚBRICA TABLE (static reference) ---------- */
var RUBRICA = [
  {n:1, criterio:'Conozcamos nuestra organización (Paso 1)', indicador:'Datos básicos completos y descripción clara de la actividad diaria y de los beneficiarios.', pts:20},
  {n:2, criterio:'¿Por qué existimos? Nuestra misión (Paso 2)', indicador:'Las tres frases guía completas, combinadas en una misión clara, más la reflexión final.', pts:20},
  {n:3, criterio:'¿A dónde queremos llegar? Visión y FODA (Paso 3)', indicador:'Visión de futuro bien desarrollada y los 8 elementos del FODA simple completos.', pts:20},
  {n:4, criterio:'¿Qué queremos lograr? Nuestras metas (Paso 4)', indicador:'3 metas completas, cada una con qué, cómo lo sabremos, responsable y plazo.', pts:20},
  {n:5, criterio:'Reflexión final en equipo (Paso 5)', indicador:'4 preguntas de reflexión respondidas con profundidad y honestidad por el equipo.', pts:20}
];
document.getElementById('rubrica-body').innerHTML = RUBRICA.map(function(r){
  return '<tr><td class="label-cell">'+r.n+'</td><td>'+r.criterio+'</td><td>'+r.indicador+'</td><td class="label-cell">'+r.pts+'</td></tr>';
}).join('') + '<tr><td colspan="3" class="label-cell">TOTAL</td><td class="label-cell">100</td></tr><tr><td colspan="3" class="label-cell">Aprobación mínima</td><td class="label-cell">70</td></tr>';

/* ---------- GRADING ENGINE ---------- */
function ratioFilledFrac(ids){
  if(!ids.length) return 0;
  var n = 0; ids.forEach(function(id){ if(filled(val(id))) n++; });
  return n / ids.length;
}
function singleWordFrac(id, min){ return clamp01(wordCount(val(id)) / min); }
function avgWordFrac(ids, min){
  if(!ids.length) return 0;
  var sum = 0; ids.forEach(function(id){ sum += clamp01(wordCount(val(id)) / min); });
  return sum / ids.length;
}
function reflectionFrac(id, minSentences, minWords){
  var s = val(id);
  return (clamp01(sentenceCount(s)/minSentences) + clamp01(wordCount(s)/minWords)) / 2;
}

function buildCriterion(title, maxPoints, items){
  var score = 0;
  items.forEach(function(it){ score += it.points * clamp01(it.frac); });
  score = Math.round(score * 10) / 10;
  var strong = [], mid = [], weak = [];
  items.forEach(function(it){
    if(it.frac >= 0.85) strong.push(it.label);
    else if(it.frac >= 0.45) mid.push(it.label);
    else weak.push(it.label);
  });
  return { title:title, maxPoints:maxPoints, score:score, strong:strong, mid:mid, weak:weak };
}

function gradeStep1(){
  var basicos = ['p1_nombre','p1_tipo','p1_tiempo'];
  var items = [
    { label:'Datos básicos de la organización (nombre, tipo, tiempo de existencia)', points:6, frac:ratioFilledFrac(basicos) },
    { label:'Descripción clara de qué hace la organización día a día', points:7, frac:singleWordFrac('p1_actividad',25) },
    { label:'Descripción clara de para quién trabaja / quiénes se benefician', points:7, frac:singleWordFrac('p1_beneficiarios',20) }
  ];
  return buildCriterion(RUBRICA[0].criterio, 20, items);
}
function gradeStep2(){
  var items = [
    { label:'Las tres frases guía completas (qué, cómo, para qué)', points:8, frac:avgWordFrac(['p2_que','p2_como','p2_paraque'],10) },
    { label:'Misión final redactada en un solo párrafo coherente', points:8, frac:singleWordFrac('p2_mision_final',30) },
    { label:'Reflexión sobre si todos en la organización conocen la misión', points:4, frac:singleWordFrac('p2_reflexion',20) }
  ];
  return buildCriterion(RUBRICA[1].criterio, 20, items);
}
function gradeStep3(){
  var fodaIds = ['p3_fortaleza1','p3_fortaleza2','p3_debilidad1','p3_debilidad2','p3_oportunidad1','p3_oportunidad2','p3_amenaza1','p3_amenaza2'];
  var items = [
    { label:'Visión de futuro bien desarrollada', points:8, frac:singleWordFrac('p3_vision',25) },
    { label:'Los 8 elementos del FODA simple completos (2 fortalezas, 2 debilidades, 2 oportunidades, 2 amenazas)', points:12, frac:ratioFilledFrac(fodaIds) }
  ];
  return buildCriterion(RUBRICA[2].criterio, 20, items);
}
function gradeStep4(){
  var allIds = STEP_FIELDS.paso4;
  var items = [
    { label:'3 metas completas, cada una con qué, cómo lo sabremos, responsable y plazo', points:20, frac:ratioFilledFrac(allIds) }
  ];
  return buildCriterion(RUBRICA[3].criterio, 20, items);
}
function gradeStep5(){
  var items = ['p5_r1','p5_r2','p5_r3','p5_r4'].map(function(id,i){
    return { label:'Reflexión '+(i+1)+' con profundidad (mínimo 4 oraciones)', points:5, frac:reflectionFrac(id,4,35) };
  });
  return buildCriterion(RUBRICA[4].criterio, 20, items);
}

function runGrading(){
  var criteria = [gradeStep1(), gradeStep2(), gradeStep3(), gradeStep4(), gradeStep5()];
  var total = Math.round(criteria.reduce(function(a,c){ return a + c.score; },0) * 10) / 10;
  return { criteria:criteria, total:total };
}

function critFillClass(pct){
  if(pct >= 80) return 'hi';
  if(pct >= 50) return 'mid';
  return 'lo';
}

function renderResults(result){
  var hero = document.getElementById('score-hero');
  var title = document.getElementById('score-title');
  var desc = document.getElementById('score-desc');
  var num = document.getElementById('score-num');
  num.textContent = result.total;
  hero.classList.remove('pass','warn','fail');
  if(result.total >= 70){
    hero.classList.add('pass');
    title.textContent = '✅ Aprobado — ' + result.total + ' / 100 pts';
    desc.textContent = 'Su trabajo cumple con la aprobación mínima (70%). Revise los criterios en amarillo para pulir detalles antes de entregar a su facilitador.';
  } else if(result.total >= 55){
    hero.classList.add('warn');
    title.textContent = '🟠 Cerca de aprobar — ' + result.total + ' / 100 pts';
    desc.textContent = 'Está por debajo del 70% mínimo. Complete y profundice las secciones marcadas en rojo/ámbar antes de entregar.';
  } else {
    hero.classList.add('fail');
    title.textContent = '🔴 Necesita trabajo adicional — ' + result.total + ' / 100 pts';
    desc.textContent = 'Aún faltan varias secciones por completar o desarrollar. Use al Tutor Virtual y las guías de cada paso para avanzar.';
  }

  var listEl = document.getElementById('crit-list');
  listEl.innerHTML = result.criteria.map(function(c){
    var pct = Math.round((c.score / c.maxPoints) * 100);
    var parts = [];
    if(c.strong.length) parts.push('<li><span class="tag-ok">✔ Bien logrado:</span> ' + c.strong.join('; ') + '.</li>');
    if(c.mid.length) parts.push('<li><span class="tag-mid">◐ Puede mejorar:</span> ' + c.mid.join('; ') + '.</li>');
    if(c.weak.length) parts.push('<li><span class="tag-low">✖ Falta completar / profundizar:</span> ' + c.weak.join('; ') + '.</li>');
    return '<div class="crit">'+
      '<div class="crit-head"><strong>'+c.title+'</strong><span class="crit-score">'+c.score+' / '+c.maxPoints+' pts</span></div>'+
      '<div class="crit-track"><div class="crit-fill '+critFillClass(pct)+'" style="width:'+pct+'%;"></div></div>'+
      '<ul>'+parts.join('')+'</ul>'+
      '</div>';
  }).join('');

  document.getElementById('results').classList.add('show');
}

function gatherGradingPayload(localResult){
  var pasos = {};
  Object.keys(STEP_FIELDS).forEach(function(key, i){
    var respuestas = {};
    STEP_FIELDS[key].forEach(function(id){
      var v = val(id);
      if(filled(v)) respuestas[labelOf(id)] = v;
    });
    pasos[key] = { criterio: RUBRICA[i].criterio, max: RUBRICA[i].pts, respuestas: respuestas };
  });
  return {
    estudiante: { nombre: val('grp_nombre') || '', correo: val('grp_correo') || '', integrantes: val('grp_integrantes') || '' },
    institucion: val('p1_nombre') || '',
    curso: 'planificacion-estrategica',
    unidad: 'nivel-1',
    pasos: pasos,
    local: localResult ? {
      total: localResult.total,
      criterios: localResult.criteria.map(function(c){ return { titulo: c.title, puntaje: c.score, max: c.maxPoints }; })
    } : null
  };
}

function renderAIReview(data){
  var box = document.getElementById('ai-review');
  box.className = 'alert success';
  var rows = data.criterios.map(function(c, i){
    var nombre = RUBRICA[i] ? RUBRICA[i].criterio : ('Criterio ' + (i+1));
    return '<li><strong>' + escapeHtml(nombre) + ':</strong> ' + c.puntaje + '/' + c.max + ' pts — ' + escapeHtml(c.comentario) + '</li>';
  }).join('');
  box.innerHTML = '<strong>🤖 Evaluación del Tutor IA (Ollama):</strong> ' + data.total + ' / 100 pts.<br>' +
    (data.comentario_general ? '<p style="margin:.5rem 0;">' + escapeHtml(data.comentario_general) + '</p>' : '') +
    '<ul style="margin:.5rem 0 0; padding-left:1.2rem; font-size:.85rem;">' + rows + '</ul>' +
    '<p style="margin:.6rem 0 0; font-size:.72rem; color:var(--muted);">Esta evaluación la genera un modelo de IA leyendo el contenido real de sus respuestas; es orientativa y no reemplaza la nota oficial de su facilitador.</p>';
}

function requestAIGrading(localResult){
  var box = document.getElementById('ai-review');
  box.style.display = 'block';
  box.className = 'alert info';
  box.innerHTML = '<strong>🤖 Tutor IA:</strong> analizando el contenido de sus respuestas con inteligencia artificial (puede tardar hasta 10 minutos en este servidor, más si hay varios envíos a la vez) y notificando a su facilitador por correo. No necesita quedarse en esta pantalla — su nota automática ya quedó registrada arriba y el correo se enviará de todas formas…';
  fetchWithTimeout(AI_GRADE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gatherGradingPayload(localResult))
  }, AI_GRADE_TIMEOUT).then(function(res){
    if(!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }).then(function(data){
    if(!data || !data.ok || !Array.isArray(data.criterios)) throw new Error((data && data.error) || 'respuesta inválida');
    renderAIReview(data);
  }).catch(function(){
    box.className = 'alert warn';
    box.innerHTML = '<strong>🤖 Tutor IA:</strong> no se pudo contactar el servicio de evaluación por IA en este momento (puede estar desconectado o sin internet). Se muestra únicamente la evaluación automática local de esta página, que sigue siendo válida.';
  });
}

document.getElementById('btn-submit').addEventListener('click', function(){
  saveAll();
  if(!filled(val('grp_nombre'))){
    alert('Antes de enviar, escriba el nombre del equipo en "Datos del equipo" (arriba de la portada) para que su facilitador pueda identificar la entrega.');
    document.getElementById('grp_nombre').focus();
    document.getElementById('portada').scrollIntoView({ behavior:'smooth' });
    return;
  }
  var result = runGrading();
  renderResults(result);
  document.getElementById('results').scrollIntoView({ behavior:'smooth', block:'start' });
  requestAIGrading(result);
});
document.getElementById('btn-recheck').addEventListener('click', function(){
  document.getElementById('paso1').scrollIntoView({ behavior:'smooth' });
});

/* ---------- EXPORT / PRINT / CLEAR ---------- */
function exportTxt(){
  var lines = ['TALLER INTRODUCTORIO EN EQUIPO — Primeros Pasos en Planificación Estratégica', 'Equipo: ' + (val('grp_nombre') || '(sin especificar)'), 'Organización analizada: ' + (val('p1_nombre') || '(sin especificar)'), '======================================================', ''];
  allFieldIds().forEach(function(id){
    var v = val(id);
    if(!filled(v)) return;
    lines.push('- ' + labelOf(id) + ': ' + v);
  });
  var blob = new Blob([lines.join('\n')], { type:'text/plain;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  var name = (val('grp_nombre') || val('p1_nombre') || 'planificacion-nivel-1').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  a.download = (name || 'planificacion-nivel-1') + '.txt';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
document.getElementById('btn-export').addEventListener('click', exportTxt);
document.getElementById('btn-export-2').addEventListener('click', exportTxt);
document.getElementById('btn-print').addEventListener('click', function(){ window.print(); });
document.getElementById('btn-print-2').addEventListener('click', function(){ window.print(); });
document.getElementById('btn-clear').addEventListener('click', function(){
  if(!confirm('¿Seguro que desea borrar TODAS sus respuestas guardadas en este navegador? Esta acción no se puede deshacer.')) return;
  try{ localStorage.removeItem(STORE_KEY); }catch(e){}
  allFieldIds().forEach(function(id){ var el = document.getElementById(id); if(el) el.value = ''; });
  document.querySelectorAll('.wc[data-for]').forEach(function(span){ var t = document.getElementById(span.getAttribute('data-for')); if(t) t.dispatchEvent(new Event('input')); });
  updateProgress();
  document.getElementById('results').classList.remove('show');
  var aiBox = document.getElementById('ai-review');
  aiBox.style.display = 'none';
  aiBox.innerHTML = '';
  resetWorkTimer();
});

/* ---------- CONTADOR DE TIEMPO TRABAJADO (acumulado entre sesiones) ---------- */
var TIMER_KEY = 'tp_nivel1_tiempo_total_ms';
var timerAccumulated = 0;
try{ timerAccumulated = parseInt(localStorage.getItem(TIMER_KEY) || '0', 10) || 0; }catch(e){}
var timerLastTick = Date.now();
var timerDisplayEl = document.getElementById('timer-display');
function formatWorkTime(ms){
  var totalMin = Math.floor(ms / 60000);
  var h = Math.floor(totalMin / 60);
  var m = totalMin % 60;
  return h + 'h ' + (m < 10 ? '0' : '') + m + 'min';
}
function renderWorkTimer(){
  if(timerDisplayEl) timerDisplayEl.textContent = formatWorkTime(timerAccumulated);
}
function saveWorkTimer(){
  try{ localStorage.setItem(TIMER_KEY, String(Math.round(timerAccumulated))); }catch(e){}
}
function resetWorkTimer(){
  timerAccumulated = 0;
  timerLastTick = Date.now();
  saveWorkTimer();
  renderWorkTimer();
}
function tickWorkTimer(){
  var now = Date.now();
  if(document.visibilityState === 'visible'){
    timerAccumulated += (now - timerLastTick);
    renderWorkTimer();
  }
  timerLastTick = now;
}
renderWorkTimer();
setInterval(tickWorkTimer, 1000);
setInterval(saveWorkTimer, 10000);
document.addEventListener('visibilitychange', function(){ timerLastTick = Date.now(); });
window.addEventListener('beforeunload', saveWorkTimer);

/* ---------- TUTOR VIRTUAL (reglas, sin costo) ---------- */
var advisorToggle = document.getElementById('advisor-toggle');
var advisorPanel = document.getElementById('advisor-panel');
var advisorClose = document.getElementById('advisor-close');
var advisorBody = document.getElementById('advisor-body');
var advisorForm = document.getElementById('advisor-form');
var advisorInput = document.getElementById('advisor-input');

function openAdvisor(){ advisorPanel.classList.add('open'); advisorToggle.setAttribute('aria-expanded','true'); advisorInput.focus(); }
function closeAdvisor(){ advisorPanel.classList.remove('open'); advisorToggle.setAttribute('aria-expanded','false'); }
advisorToggle.addEventListener('click', function(){ advisorPanel.classList.contains('open') ? closeAdvisor() : openAdvisor(); });
advisorClose.addEventListener('click', closeAdvisor);

function addMsg(text, who){
  var div = document.createElement('div');
  div.className = 'advisor-msg advisor-msg-' + (who === 'user' ? 'user' : 'bot');
  div.textContent = text;
  advisorBody.appendChild(div);
  advisorBody.scrollTop = advisorBody.scrollHeight;
  return div;
}
function addTyping(){
  var div = addMsg('Escribiendo…', 'bot');
  div.style.opacity = '.6';
  return div;
}
function askTutorAI(q){
  return fetchWithTimeout(AI_CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: q })
  }, AI_CHAT_TIMEOUT).then(function(res){
    if(!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }).then(function(data){
    if(!data || !filled(data.response)) throw new Error('respuesta vacía');
    return data.response;
  });
}
function askTutor(q){
  return askTutorAI(q).catch(function(){ return answerFor(q); });
}

var QA = [
  { kw:['calific','nota','puntaje','rubrica','aprobar','minimo'], a:'La nota va de 0 a 100. Se compone de 5 pasos que valen 20 puntos cada uno. La aprobación mínima es 70%. El sistema revisa si las respuestas están completas y bien desarrolladas. Su facilitador revisa el contenido real para la nota oficial.' },
  { kw:['mision', 'misión'], a:'La misión responde: ¿qué hace nuestra organización?, ¿cómo lo hace?, y ¿para qué (qué logramos con eso)? En el Paso 2 van completando esas tres preguntas como frases, y al final las unen en un solo párrafo.' },
  { kw:['vision', 'visión'], a:'La visión es cómo se imaginan a su organización dentro de algunos años, si las cosas salen bien. No es una meta pequeña de este mes, es una imagen más grande a futuro.' },
  { kw:['foda', 'fortaleza', 'debilidad', 'oportunidad', 'amenaza'], a:'FODA son 4 letras: Fortalezas y Debilidades son cosas de ADENTRO de la organización (lo que hacemos bien, lo que nos falta). Oportunidades y Amenazas son cosas de AFUERA que no controlamos pero nos afectan (algo bueno que pasa alrededor, o algo que nos podría complicar).' },
  { kw:['meta', 'metas'], a:'Una meta simple tiene 4 partes: qué queremos lograr, cómo vamos a saber que lo logramos, quién del equipo va a estar pendiente, y para cuándo. En el Paso 4 piden 3 metas así.' },
  { kw:['guardar', 'se guarda', 'perder mis respuestas', 'autoguardado'], a:'Las respuestas se guardan automáticamente en este navegador mientras escriben. Si cambian de computadora o celular, se pierden — por eso conviene usar "⬇️ Descargar mis respuestas" de vez en cuando.' },
  { kw:['enviar', 'como envio', 'entregar'], a:'Cuando terminen los 5 pasos, bajen hasta "Enviar y Calificar" y presionen el botón. El sistema les da la nota al instante. Luego pueden usar "Descargar mis respuestas" o "Imprimir" para entregarlo a su facilitador.' },
  { kw:['nota de voz', 'voz', 'grabar', 'hablar', 'microfono', 'micrófono'], a:'Al lado de las preguntas más largas hay un botón "🎤 Grabar nota de voz". Lo presionan, hablan su respuesta, y el sistema la convierte en texto automáticamente dentro del cuadro de respuesta. Después pueden leerlo y corregir algo si hace falta.' },
  { kw:['paso 1', 'conozcamos'], a:'El Paso 1 pide elegir una organización que el equipo conozca bien, y describir qué hace y para quién trabaja. Vale 20 puntos.' },
  { kw:['paso 2'], a:'El Paso 2 pide construir la misión completando tres frases guía y uniéndolas en un párrafo, más una reflexión. Vale 20 puntos.' },
  { kw:['paso 3'], a:'El Paso 3 pide la visión de futuro y un FODA simple con 2 fortalezas, 2 debilidades, 2 oportunidades y 2 amenazas. Vale 20 puntos.' },
  { kw:['paso 4'], a:'El Paso 4 pide definir 3 metas simples para la organización, cada una con qué, cómo lo sabremos, responsable y plazo. Vale 20 puntos.' },
  { kw:['paso 5', 'reflexion', 'reflexión'], a:'El Paso 5 son 4 preguntas de reflexión en equipo; cada una necesita mínimo 4 oraciones para tener el crédito completo. Pueden usar la nota de voz para conversarlo primero. Vale 20 puntos.' },
  { kw:['que organizacion', 'cual organizacion', 'que institucion elijo'], a:'Elijan cualquier organización que TODOS en el equipo conozcan bien: su escuela, una iglesia, un club deportivo, una junta de vecinos, un negocio familiar, una cooperativa. No tiene que ser del gobierno, y no hace falta investigar nada por internet.' },
  { kw:['hola', 'ayuda', 'que puedes hacer', 'quien eres'], a:'Soy el Tutor Virtual de este taller. Puedo explicarte qué es misión, visión, FODA o una meta, orientarte sobre qué pide cada paso, y explicarte cómo funciona la calificación. No te voy a dar la respuesta ya hecha para tu organización — eso lo construyen ustedes en equipo.' }
];
function normQ(s){ return stripAccents(s); }
function answerFor(q){
  var nq = normQ(q);
  var best = null, bestScore = 0;
  QA.forEach(function(entry){
    var score = 0;
    entry.kw.forEach(function(k){ if(nq.indexOf(normQ(k)) !== -1) score++; });
    if(score > bestScore){ bestScore = score; best = entry; }
  });
  if(best) return best.a;
  return 'No tengo una respuesta preparada para eso. Prueba preguntar por un concepto (PEI, GbR, marco lógico, cadena de valor, END 2030), por un paso específico ("¿qué pide el paso 3?") o por la calificación. Para dudas sobre tu institución específica, consulta a tu facilitador.';
}
advisorForm.addEventListener('submit', function(e){
  e.preventDefault();
  var q = norm(advisorInput.value);
  if(!q) return;
  addMsg(q, 'user');
  advisorInput.value = '';
  var typingEl = addTyping();
  askTutor(q).then(function(answer){
    typingEl.remove();
    addMsg(answer, 'bot');
  });
});
document.querySelectorAll('.advisor-suggest button').forEach(function(btn){
  btn.addEventListener('click', function(){
    var q = btn.getAttribute('data-q');
    openAdvisor();
    addMsg(q, 'user');
    var typingEl = addTyping();
    askTutor(q).then(function(answer){
      typingEl.remove();
      addMsg(answer, 'bot');
    });
  });
});

wireVoiceButtons();
wireSpeakButtons();

})();
