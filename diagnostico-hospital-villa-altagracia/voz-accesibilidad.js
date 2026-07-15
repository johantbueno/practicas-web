(function(){
"use strict";

var VOICE_TRANSCRIBE_URL = 'https://n8n-inap.167.88.36.13.sslip.io/webhook/prof-johan-tapia-transcribir';
var hasSTT = !!(navigator.mediaDevices && window.MediaRecorder);
var hasTTS = 'speechSynthesis' in window;

function fetchWithTimeout(url, options, timeoutMs){
  var controller = new AbortController();
  var timer = setTimeout(function(){ controller.abort(); }, timeoutMs);
  return fetch(url, Object.assign({}, options, { signal: controller.signal }))
    .finally(function(){ clearTimeout(timer); });
}

function pickRecorderMime(){
  var candidates = ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus'];
  for(var i=0;i<candidates.length;i++){
    if(MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
  }
  return '';
}

function beepVoz(freq, dur){
  try{
    var Ctx = window.AudioContext || window.webkitAudioContext;
    var ctx = new Ctx();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
    osc.onended = function(){ ctx.close(); };
  }catch(e){}
}
var VOZ_MIN_MS = 400;
var VOZ_MAX_MS = 120000;
var VOZ_LABEL_DEFAULT = '🎤 Mantenga presionado para grabar';

var estiloVoz = document.createElement('style');
estiloVoz.textContent = [
  '.voz-controles{display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;align-items:center;}',
  '.voz-status{font-size:.75rem;color:var(--muted,#64748b);flex-basis:100%;}',
  '.voz-status.err{color:#b91c1c;}',
  '.voz-status.ok{color:#16a34a;}',
  '.btn-voz{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;border:1px solid var(--border-dark,#cbd5e1);background:var(--bg-body,#f4f7fb);color:var(--primary,#0f172a);font-size:.85rem;font-weight:600;cursor:pointer;min-height:42px;}',
  '.btn-voz:hover{filter:brightness(0.97);}',
  '.btn-voz.grabando{background:#fef2f2;border-color:#ef4444;color:#b91c1c;animation:pulso-voz 1s infinite;}',
  '.btn-voz.busy{opacity:.7;cursor:wait;}',
  '@keyframes pulso-voz{0%,100%{opacity:1;}50%{opacity:.6;}}',
  '.btn-leer-pregunta{background:none;border:none;cursor:pointer;font-size:1rem;margin-left:6px;vertical-align:middle;padding:2px 4px;}',
  '[data-theme="dark"] .btn-voz{background:#0f1830;border-color:#3a4666;color:#f1f5f9;}'
].join('\n');
document.head.appendChild(estiloVoz);

function agregarBotonesRespuesta(textarea){
  if(textarea.dataset.vozAplicada) return;
  textarea.dataset.vozAplicada = '1';

  var wrap = document.createElement('div');
  wrap.className = 'voz-controles';

  if(hasSTT){
    var btnMic = document.createElement('button');
    btnMic.type = 'button';
    btnMic.className = 'btn-voz btn-dictar';
    btnMic.innerHTML = VOZ_LABEL_DEFAULT;
    btnMic.setAttribute('aria-label', 'Mantener presionado para grabar la respuesta por voz');

    var statusEl = document.createElement('span');
    statusEl.className = 'voz-status';

    var mediaRecorder = null, chunks = [], stream = null, recording = false, pressActive = false;
    var startedAt = 0, maxTimer = null, tickTimer = null;

    function setStatus(msg, cls){
      statusEl.textContent = msg || '';
      statusEl.className = 'voz-status' + (cls ? ' ' + cls : '');
    }

    function stopStream(){
      if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream = null; }
    }

    function tick(){
      var secs = Math.floor((Date.now() - startedAt) / 1000);
      var m = Math.floor(secs / 60), s = secs % 60;
      btnMic.innerHTML = '🔴 Grabando ' + m + ':' + (s < 10 ? '0' : '') + s + ' — suelte para enviar';
    }

    function startRecording(){
      if(pressActive) return;
      pressActive = true;
      navigator.mediaDevices.getUserMedia({ audio:true }).then(function(s){
        if(!pressActive){ s.getTracks().forEach(function(t){ t.stop(); }); return; }
        stream = s;
        chunks = [];
        var mime = pickRecorderMime();
        try{ mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); }
        catch(e){ mediaRecorder = new MediaRecorder(stream); }
        mediaRecorder.addEventListener('dataavailable', function(e){ if(e.data && e.data.size > 0) chunks.push(e.data); });
        mediaRecorder.addEventListener('stop', function(){
          stopStream();
          clearTimeout(maxTimer); clearInterval(tickTimer);
          btnMic.classList.remove('grabando');
          var duracion = Date.now() - startedAt;
          if(duracion < VOZ_MIN_MS){
            btnMic.innerHTML = VOZ_LABEL_DEFAULT;
            setStatus('Grabación muy corta — mantenga presionado el botón mientras habla.', 'err');
            return;
          }
          var blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
          uploadForTranscription(blob);
        });
        mediaRecorder.start();
        recording = true;
        startedAt = Date.now();
        btnMic.classList.add('grabando');
        beepVoz(880, 0.1);
        tick();
        tickTimer = setInterval(tick, 500);
        setStatus('Grabando… hable su respuesta y suelte el botón al terminar.', '');
        maxTimer = setTimeout(function(){ if(recording) stopRecording(); }, VOZ_MAX_MS);
      }).catch(function(){
        pressActive = false;
        setStatus('No se pudo acceder al micrófono. Revise los permisos del navegador, o simplemente escriba la respuesta.', 'err');
      });
    }

    function stopRecording(){
      if(!pressActive) return;
      pressActive = false;
      if(mediaRecorder && recording){
        recording = false;
        beepVoz(440, 0.12);
        mediaRecorder.stop();
      }
    }

    function uploadForTranscription(blob){
      btnMic.disabled = true;
      btnMic.classList.add('busy');
      btnMic.innerHTML = '⏳ Transcribiendo…';
      setStatus('Transcribiendo la nota de voz, un momento…', '');
      var fd = new FormData();
      var ext = (blob.type.indexOf('mp4') !== -1) ? 'm4a' : (blob.type.indexOf('ogg') !== -1 ? 'ogg' : 'webm');
      fd.append('data', blob, 'nota-voz.' + ext);
      fetchWithTimeout(VOICE_TRANSCRIBE_URL, { method:'POST', body: fd }, 60000).then(function(res){
        if(!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function(data){
        if(!data || !data.ok || !data.texto){ throw new Error('SIN_TEXTO'); }
        var existing = textarea.value.trim();
        textarea.value = existing ? (existing + ' ' + data.texto) : data.texto;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        setStatus('✔ Nota de voz agregada. Puede revisarla y corregirla si hace falta.', 'ok');
      }).catch(function(err){
        var msg = (err && err.message === 'SIN_TEXTO')
          ? 'No se logró entender el audio (el servicio de voz no reconoció ninguna palabra). Intente grabar de nuevo hablando más cerca del micrófono, o escriba la respuesta directamente.'
          : 'No se pudo conectar con el servicio de transcripción. Revise su conexión a internet, o escriba la respuesta directamente.';
        setStatus(msg, 'err');
      }).finally(function(){
        btnMic.disabled = false;
        btnMic.classList.remove('busy');
        btnMic.innerHTML = VOZ_LABEL_DEFAULT;
      });
    }

    btnMic.addEventListener('mousedown', function(e){ e.preventDefault(); startRecording(); });
    btnMic.addEventListener('touchstart', function(e){ e.preventDefault(); startRecording(); }, { passive:false });
    ['mouseup','mouseleave','touchend','touchcancel'].forEach(function(evt){
      btnMic.addEventListener(evt, stopRecording);
    });

    wrap.appendChild(btnMic);
    wrap.appendChild(statusEl);
  }

  if(hasTTS){
    var btnEscuchar = document.createElement('button');
    btnEscuchar.type = 'button';
    btnEscuchar.className = 'btn-voz btn-escuchar';
    btnEscuchar.innerHTML = '🔊 Escuchar lo que escribí';
    btnEscuchar.setAttribute('aria-label', 'Escuchar en voz alta lo que escribio en esta respuesta');
    btnEscuchar.addEventListener('click', function(){
      if(!textarea.value.trim()) return;
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(textarea.value);
      utter.lang = 'es-ES';
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    });
    wrap.appendChild(btnEscuchar);
  }

  if(wrap.children.length){
    textarea.insertAdjacentElement('afterend', wrap);
  }
}

function agregarBotonLeerPregunta(label){
  if(!hasTTS) return;
  if(label.dataset.vozAplicada) return;
  label.dataset.vozAplicada = '1';

  var textoPregunta = label.textContent.trim();
  if(!textoPregunta) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-leer-pregunta';
  btn.innerHTML = '🔊';
  btn.title = 'Escuchar esta pregunta';
  btn.setAttribute('aria-label', 'Escuchar esta pregunta en voz alta');
  btn.addEventListener('click', function(e){
    e.preventDefault();
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(textoPregunta);
    utter.lang = 'es-ES';
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  });
  label.appendChild(btn);
}

function inicializar(){
  if(!hasSTT && !hasTTS) return;
  document.querySelectorAll('textarea').forEach(agregarBotonesRespuesta);
  document.querySelectorAll('.field > label[for]').forEach(agregarBotonLeerPregunta);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}

// Por si el formulario genera preguntas dinamicamente despues de cargar
// (patron visto en diagnostico-u2: html += '<textarea id="...">'), reintenta
// varias veces en los primeros segundos para atrapar campos añadidos tarde.
var intentos = 0;
var reintento = setInterval(function(){
  intentos++;
  inicializar();
  if(intentos >= 6) clearInterval(reintento);
}, 800);

})();
