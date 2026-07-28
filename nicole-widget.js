(function(){
  var TV_WEBHOOK = "https://n8n-inap.167.88.36.13.sslip.io/webhook/inap-tutor-chat";
  var TV_TRANSCRIBE = "https://n8n-inap.167.88.36.13.sslip.io/webhook/prof-johan-tapia-transcribir";
  var TV_LOG_CONV = "https://n8n-inap.167.88.36.13.sslip.io/webhook/niko-registrar-conversacion";
  var TV_LOG_FEEDBACK = "https://n8n-inap.167.88.36.13.sslip.io/webhook/niko-registrar-feedback";
  var tv_opened = false;
  var cursoActual = document.title.split(':')[0].split('|')[0].trim() || 'General';
  var historyKey = 'niko_history_' + cursoActual.replace(/[^a-zA-Z0-9]/g, '_');
  var QUICK_REPLIES = [
    '¿Cuándo entrego la tarea?',
    '¿Qué contenido tiene esta unidad?',
    '¿Cómo funciona la calificación?'
  ];

  function el(tag, styleText, parent){
    var e = document.createElement(tag);
    if(styleText) e.style.cssText = styleText;
    if(parent) parent.appendChild(e);
    return e;
  }

  var styleTag = document.createElement('style');
  styleTag.textContent =
    '@keyframes tv-breathe{0%,100%{transform:scale(1) rotate(0deg);}50%{transform:scale(1.06) rotate(-2deg);}}' +
    '@keyframes tv-sniff{0%,100%{transform:translateY(0) rotate(0deg);}25%{transform:translateY(-3px) rotate(-4deg);}75%{transform:translateY(-1px) rotate(3deg);}}' +
    '@keyframes tv-pop{0%{transform:scale(0.85);opacity:0;}60%{transform:scale(1.04);opacity:1;}100%{transform:scale(1);opacity:1;}}' +
    '#tutor-virtual-btn{animation:tv-breathe 3s ease-in-out 4;}' +
    '#tutor-virtual-btn:hover{animation:tv-sniff 0.6s ease-in-out infinite;}' +
    '#tutor-virtual-container.tv-visible{animation:tv-pop 0.28s cubic-bezier(.34,1.56,.64,1);}' +
    '@keyframes tv-tooltip-in{0%{opacity:0;transform:translateY(6px) scale(0.95);}100%{opacity:1;transform:translateY(0) scale(1);}}' +
    '#tv-tooltip{animation:tv-tooltip-in 0.3s ease-out;}' +
    '@keyframes tv-badge-pulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5);}50%{box-shadow:0 0 0 5px rgba(34,197,94,0);}}' +
    '#tv-online-badge{animation:tv-badge-pulse 2s ease-in-out infinite;}' +
    '@keyframes tv-typing-dot{0%,60%,100%{opacity:0.3;transform:translateY(0);}30%{opacity:1;transform:translateY(-3px);}}' +
    '.tv-typing-dot{animation:tv-typing-dot 1.1s infinite;}' +
    '.tv-typing-dot:nth-child(2){animation-delay:0.15s;}' +
    '.tv-typing-dot:nth-child(3){animation-delay:0.3s;}' +
    '@keyframes tv-rec-pulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.5);}50%{box-shadow:0 0 0 6px rgba(220,38,38,0);}}' +
    '.tv-recording{animation:tv-rec-pulse 1s infinite;background:#DC2626 !important;}' +
    '.tv-chip{transition:background 0.15s ease, transform 0.1s ease;}' +
    '.tv-chip:hover{background:#F0DCC0 !important;transform:translateY(-1px);}' +
    '.tv-icon-btn{transition:opacity 0.15s ease;}' +
    '.tv-icon-btn:hover{opacity:0.7;}';
  document.head.appendChild(styleTag);

  // ---------- Botón flotante ----------
  var btn = el('div', 'position:fixed;bottom:20px;right:20px;width:70px;height:70px;cursor:pointer;box-shadow:0px 5px 16px rgba(0,0,0,0.4);z-index:999999;border-radius:50%;background:#FFFBF5;', document.body);
  btn.id = 'tutor-virtual-btn';
  btn.innerHTML =
    '<svg viewBox="0 0 36 36" width="52" height="52" style="display:block;margin:9px;">' +
      '<path fill="#DD2E44" d="M15 27v6s0 3 3 3 3-3 3-3v-6h-6z"/>' +
      '<path fill="#BE1931" d="M15 33l.001.037c1.041-.035 2.016-.274 2.632-1.286.171-.281.563-.281.735 0 .616 1.011 1.591 1.251 2.632 1.286V27h-6v6z"/>' +
      '<path fill="#D99E82" d="M31.954 21.619c0 6.276-5 6.276-5 6.276h-18s-5 0-5-6.276c0-6.724 5-18.619 14-18.619s14 12.895 14 18.619z"/>' +
      '<path fill="#F4C7B5" d="M18 20c-7 0-10 3.527-10 6.395 0 3.037 2.462 5.5 5.5 5.5 1.605 0 3.042-.664 4.049-2.767.185-.386.716-.386.901 0 1.007 2.103 2.445 2.767 4.049 2.767 3.038 0 5.5-2.463 5.5-5.5C28 23.527 25 20 18 20z"/>' +
      '<path fill="#292F33" d="M15 22.895c-1 1 2 4 3 4s4-3 3-4-5-1-6 0zM13 19c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2zm10 0c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2z"/>' +
      '<path fill="#662113" d="M15 3.608C13.941 2.199 11.681.881 2.828 4.2-1.316 5.754.708 17.804 3.935 18.585c1.106 0 4.426 0 4.426-8.852 0-.22-.002-.423-.005-.625C10.35 6.298 12.5 4.857 15 3.608zm18.172.592C24.319.881 22.059 2.199 21 3.608c2.5 1.25 4.65 2.691 6.644 5.501-.003.201-.005.404-.005.625 0 8.852 3.319 8.852 4.426 8.852 3.227-.782 5.251-12.832 1.107-14.386z"/>' +
      '<circle fill="#D99E82" cx="23.5" cy="25.5" r=".5"/><circle fill="#D99E82" cx="11.5" cy="25.5" r=".5"/>' +
      '<circle fill="#D99E82" cx="25.5" cy="27.5" r=".5"/><circle fill="#D99E82" cx="10.5" cy="27.5" r=".5"/>' +
      '<circle fill="#D99E82" cx="23" cy="28" r="1"/><circle fill="#D99E82" cx="13" cy="28" r="1"/>' +
      '<path fill="#380F09" d="M9.883 7.232c-.259-.673-.634-1.397-1.176-1.939-.391-.391-1.023-.391-1.414 0s-.391 1.023 0 1.414c.57.57 1.066 1.934 1.068 2.346.145-.404.839-1.15 1.522-1.821zm16.217 0c.259-.672.634-1.397 1.176-1.939.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414c-.57.57-1.066 1.934-1.068 2.346-.145-.404-.839-1.15-1.522-1.821z"/>' +
    '</svg>';

  var badge = el('div', 'position:absolute;top:2px;right:2px;width:14px;height:14px;background:#22C55E;border:2px solid #FFFBF5;border-radius:50%;', btn);
  badge.id = 'tv-online-badge';

  var tooltip = el('div', 'display:none;position:fixed;bottom:96px;right:20px;background:white;color:#3a2a18;padding:8px 14px;border-radius:12px;box-shadow:0px 3px 12px rgba(0,0,0,0.2);font-family:Arial,sans-serif;font-size:13px;font-weight:bold;z-index:999998;white-space:nowrap;', document.body);
  tooltip.id = 'tv-tooltip';
  tooltip.textContent = '¿Necesitas ayuda? 🐶';
  setTimeout(function(){
    if(tv_opened) return;
    tooltip.style.display = 'block';
    setTimeout(function(){ tooltip.style.display = 'none'; }, 4000);
  }, 2500);

  // ---------- Panel de chat ----------
  var container = el('div', 'display:none;position:fixed;bottom:98px;right:20px;width:380px;height:600px;max-height:80vh;background:#FFFBF5;border-radius:16px;box-shadow:0px 4px 20px rgba(0,0,0,0.25);z-index:999999;overflow:hidden;border:1px solid #E8C39E;flex-direction:column;', document.body);
  container.id = 'tutor-virtual-container';

  var header = el('div', 'background:linear-gradient(135deg,#C98B4F,#8B5A2B);color:white;padding:0 15px;font-family:Arial,sans-serif;font-weight:bold;display:flex;justify-content:space-between;align-items:center;height:50px;box-sizing:border-box;flex-shrink:0;', container);
  var headerTitle = el('span', '', header);
  headerTitle.textContent = '🐶 NIKO - Tutor Virtual';
  var closeBtn = el('span', 'cursor:pointer;font-size:18px;color:#ffe1cc;font-weight:bold;', header);
  closeBtn.textContent = '✖';
  closeBtn.onclick = toggleTutorVirtual;

  var messages = el('div', 'flex:1;overflow-y:auto;padding:12px;background:#FFF6E9;font-family:Arial,sans-serif;font-size:13px;', container);

  var chipsBar = el('div', 'display:flex;flex-wrap:wrap;gap:6px;padding:8px 10px;border-top:1px solid #F0DCC0;background:white;flex-shrink:0;', container);
  chipsBar.id = 'tv-chips';
  QUICK_REPLIES.forEach(function(q){
    var chip = el('span', 'cursor:pointer;background:#FFF6E9;border:1px solid #E8C39E;border-radius:14px;padding:5px 10px;font-size:11.5px;color:#6b4a1e;', chipsBar);
    chip.className = 'tv-chip';
    chip.textContent = q;
    chip.onclick = function(){ input.value = q; tvSend(); };
  });

  var inputBar = el('div', 'display:flex;gap:6px;padding:10px;border-top:1px solid #F0DCC0;background:white;flex-shrink:0;align-items:center;', container);
  var micBtn = el('button', 'background:#F0DCC0;color:#8B5A2B;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:15px;flex-shrink:0;', inputBar);
  micBtn.id = 'tv-mic-btn';
  micBtn.textContent = '🎤';
  micBtn.title = 'Grabar pregunta por voz';

  var input = el('input', 'flex:1;border:1px solid #E8C39E;border-radius:20px;padding:8px 12px;font-size:13px;font-family:Arial,sans-serif;min-width:0;', inputBar);
  input.type = 'text';
  input.placeholder = 'Escribe tu pregunta...';
  input.addEventListener('keypress', function(e){ if(e.key === 'Enter'){ tvSend(); } });

  var sendBtn = el('button', 'background:linear-gradient(135deg,#C98B4F,#8B5A2B);color:white;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:16px;flex-shrink:0;', inputBar);
  sendBtn.textContent = '➤';
  sendBtn.onclick = tvSend;

  btn.onclick = toggleTutorVirtual;

  function toggleTutorVirtual(){
    tooltip.style.display = 'none';
    if(container.style.display === 'none' || container.style.display === ''){
      container.style.display = 'flex';
      container.classList.remove('tv-visible');
      void container.offsetWidth;
      container.classList.add('tv-visible');
      if(!tv_opened){
        tv_opened = true;
        loadHistory();
      }
    } else {
      container.style.display = 'none';
    }
  }

  // ---------- Historial persistente ----------
  function getHistory(){
    try { return JSON.parse(localStorage.getItem(historyKey)) || []; } catch(e){ return []; }
  }
  function saveHistoryEntry(role, text){
    var h = getHistory();
    h.push({ role: role, text: text, t: Date.now() });
    if(h.length > 40) h = h.slice(h.length - 40);
    try { localStorage.setItem(historyKey, JSON.stringify(h)); } catch(e){}
  }
  function loadHistory(){
    var h = getHistory();
    if(h.length === 0){
      tvAppend('¡Guau! 🐶 Soy NIKO, tu asistente virtual. Pregúntame lo que quieras sobre el curso.', false, false);
      return;
    }
    h.forEach(function(m){ tvAppend(m.text, m.role === 'user', false); });
  }

  // ---------- Mensajes ----------
  function tvAppend(text, isUser, persist){
    if(persist !== false) saveHistoryEntry(isUser ? 'user' : 'bot', text);

    var wrap = el('div', 'margin:6px 0;display:flex;flex-direction:column;' + (isUser ? 'align-items:flex-end;' : 'align-items:flex-start;'), messages);

    var bubble = el('div', 'padding:8px 12px;border-radius:14px;max-width:80%;line-height:1.4;white-space:pre-wrap;' +
      (isUser
        ? 'background:linear-gradient(135deg,#C98B4F,#8B5A2B);color:white;border-bottom-right-radius:4px;'
        : 'background:white;border:1px solid #E8C39E;color:#3a2a18;border-bottom-left-radius:4px;'), wrap);
    bubble.textContent = text;

    if(!isUser){
      var actions = el('div', 'display:flex;gap:8px;margin-top:3px;padding-left:2px;', wrap);
      var speakBtn = el('span', 'cursor:pointer;font-size:13px;', actions);
      speakBtn.className = 'tv-icon-btn';
      speakBtn.title = 'Escuchar';
      speakBtn.textContent = '🔊';
      speakBtn.onclick = function(){ tvSpeak(text); };

      var upBtn = el('span', 'cursor:pointer;font-size:13px;', actions);
      upBtn.className = 'tv-icon-btn';
      upBtn.title = 'Respuesta útil';
      upBtn.textContent = '👍';
      var downBtn = el('span', 'cursor:pointer;font-size:13px;', actions);
      downBtn.className = 'tv-icon-btn';
      downBtn.title = 'Respuesta no útil';
      downBtn.textContent = '👎';

      var lastQuestion = tv_lastQuestion;
      upBtn.onclick = function(){ tvSendFeedback(lastQuestion, text, true, upBtn, downBtn); };
      downBtn.onclick = function(){ tvSendFeedback(lastQuestion, text, false, upBtn, downBtn); };
    }

    messages.scrollTop = messages.scrollHeight;
  }

  var tv_lastQuestion = '';

  function tvSendFeedback(pregunta, respuesta, util, upBtn, downBtn){
    upBtn.style.opacity = (util ? '1' : '0.35');
    downBtn.style.opacity = (util ? '0.35' : '1');
    fetch(TV_LOG_FEEDBACK, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ curso: cursoActual, pregunta: pregunta, respuesta: respuesta, util: util })
    }).catch(function(){});
  }

  function tvTypingShow(){
    var wrap = el('div', 'margin:6px 0;display:flex;', messages);
    wrap.id = 'tv-typing-wrap';
    var bubble = el('div', 'padding:10px 14px;border-radius:14px;background:white;border:1px solid #E8C39E;border-bottom-left-radius:4px;display:flex;gap:4px;align-items:center;', wrap);
    for(var i=0;i<3;i++){
      var dot = el('span', 'width:6px;height:6px;border-radius:50%;background:#C98B4F;display:inline-block;', bubble);
      dot.className = 'tv-typing-dot';
    }
    messages.scrollTop = messages.scrollHeight;
  }
  function tvTypingHide(){
    var w = document.getElementById('tv-typing-wrap');
    if(w) w.remove();
  }

  function tvSpeak(text){
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    var voices = window.speechSynthesis.getVoices();
    var esVoice = voices.find(function(v){ return v.lang && v.lang.toLowerCase().indexOf('es') === 0; });
    if(esVoice) u.voice = esVoice;
    window.speechSynthesis.speak(u);
  }

  function tvSend(){
    var text = input.value.trim();
    if(!text) return;
    tvAppend(text, true);
    tv_lastQuestion = text;
    input.value = '';
    sendBtn.disabled = true;
    tvTypingShow();

    fetch(TV_WEBHOOK, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: text, curso: cursoActual})
    })
    .then(function(res){ return res.json(); })
    .then(function(data){
      tvTypingHide();
      var respuesta = (data && data.response) ? data.response : null;
      if(respuesta){
        tvAppend(respuesta, false);
        fetch(TV_LOG_CONV, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ curso: cursoActual, pregunta: text, respuesta: respuesta })
        }).catch(function(){});
      } else {
        tvAppend('No pude generar una respuesta. Si el problema continúa, contacta a tu facilitador directamente (correo o grupo del curso).', false);
      }
    })
    .catch(function(){
      tvTypingHide();
      tvAppend('No pude conectarme en este momento. Si es urgente, contacta a tu facilitador directamente (correo o grupo del curso).', false);
    })
    .finally(function(){ sendBtn.disabled = false; });
  }

  // ---------- Grabación de voz ----------
  var mediaRecorder = null;
  var audioChunks = [];
  var isRecording = false;

  micBtn.onclick = function(){
    if(isRecording){
      if(mediaRecorder) mediaRecorder.stop();
      return;
    }
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      tvAppend('Tu navegador no soporta grabación de audio.', false, false);
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream){
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = function(e){ audioChunks.push(e.data); };
      mediaRecorder.onstop = function(){
        isRecording = false;
        micBtn.classList.remove('tv-recording');
        stream.getTracks().forEach(function(t){ t.stop(); });
        var blob = new Blob(audioChunks, { type: 'audio/webm' });
        transcribirAudio(blob);
      };
      mediaRecorder.start();
      isRecording = true;
      micBtn.classList.add('tv-recording');
    }).catch(function(){
      tvAppend('No pude acceder al micrófono. Verifica los permisos del navegador.', false, false);
    });
  };

  function transcribirAudio(blob){
    input.placeholder = 'Transcribiendo...';
    var fd = new FormData();
    fd.append('data', blob, 'audio.webm');
    fetch(TV_TRANSCRIBE, { method: 'POST', body: fd })
      .then(function(res){ return res.json(); })
      .then(function(data){
        input.placeholder = 'Escribe tu pregunta...';
        if(data && data.ok && data.texto){
          input.value = data.texto;
        } else {
          tvAppend('No logré entender el audio, intenta escribir tu pregunta.', false, false);
        }
      })
      .catch(function(){
        input.placeholder = 'Escribe tu pregunta...';
        tvAppend('No pude transcribir el audio en este momento.', false, false);
      });
  }
})();
