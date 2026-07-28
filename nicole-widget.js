(function(){
  var TV_WEBHOOK = "https://n8n-inap.167.88.36.13.sslip.io/webhook/inap-tutor-chat";
  var tv_opened = false;

  function el(tag, styleText, parent){
    var e = document.createElement(tag);
    if(styleText) e.style.cssText = styleText;
    if(parent) parent.appendChild(e);
    return e;
  }

  var styleTag = document.createElement('style');
  styleTag.textContent =
    '@keyframes tv-breathe{0%,100%{transform:scale(1) rotate(0deg);}50%{transform:scale(1.04) rotate(-1.5deg);}}' +
    '@keyframes tv-blink{0%,88%,100%{transform:scaleY(1);}92%{transform:scaleY(0.08);}}' +
    '@keyframes tv-ear-l{0%,100%{transform:rotate(-14deg);}50%{transform:rotate(-20deg);}}' +
    '@keyframes tv-ear-r{0%,100%{transform:rotate(14deg);}50%{transform:rotate(20deg);}}' +
    '@keyframes tv-tongue-pant{0%,100%{transform:scaleY(1) translateY(0);}50%{transform:scaleY(1.15) translateY(1px);}}' +
    '@keyframes tv-sniff{0%,100%{transform:translateY(0) rotate(0deg);}25%{transform:translateY(-3px) rotate(-4deg);}75%{transform:translateY(-1px) rotate(3deg);}}' +
    '@keyframes tv-pop{0%{transform:scale(0.85);opacity:0;}60%{transform:scale(1.04);opacity:1;}100%{transform:scale(1);opacity:1;}}' +
    '#tutor-virtual-btn{animation:tv-breathe 3s ease-in-out 4;}' +
    '#tutor-virtual-btn:hover{animation:tv-sniff 0.6s ease-in-out infinite;}' +
    '#tv-eye-l,#tv-eye-r{animation:tv-blink 4.2s infinite;transform-origin:center;}' +
    '#tv-ear-l{animation:tv-ear-l 3.4s ease-in-out infinite;transform-origin:bottom center;}' +
    '#tv-ear-r{animation:tv-ear-r 3.4s ease-in-out infinite;transform-origin:bottom center;}' +
    '#tv-tongue{animation:tv-tongue-pant 1s ease-in-out infinite;transform-origin:top center;}' +
    '#tutor-virtual-container.tv-visible{animation:tv-pop 0.28s cubic-bezier(.34,1.56,.64,1);}' +
    '@keyframes tv-tooltip-in{0%{opacity:0;transform:translateY(6px) scale(0.95);}100%{opacity:1;transform:translateY(0) scale(1);}}' +
    '#tv-tooltip{animation:tv-tooltip-in 0.3s ease-out;}' +
    '@keyframes tv-badge-pulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5);}50%{box-shadow:0 0 0 5px rgba(34,197,94,0);}}' +
    '#tv-online-badge{animation:tv-badge-pulse 2s ease-in-out infinite;}';
  document.head.appendChild(styleTag);

  var btn = el('div', 'position:fixed;bottom:20px;right:20px;width:70px;height:70px;cursor:pointer;box-shadow:0px 5px 16px rgba(0,0,0,0.4);z-index:999999;border-radius:50%;background:#FFFBF5;', document.body);
  btn.id = 'tutor-virtual-btn';
  btn.innerHTML =
    '<svg viewBox="0 0 100 100" width="70" height="70" style="display:block;">' +
      '<defs>' +
        '<radialGradient id="tvFur" cx="40%" cy="25%" r="80%">' +
          '<stop offset="0%" stop-color="#8b95a8"/>' +
          '<stop offset="100%" stop-color="#4a5266"/>' +
        '</radialGradient>' +
        '<linearGradient id="tvTan" x1="0%" y1="0%" x2="0%" y2="100%">' +
          '<stop offset="0%" stop-color="#E8B870"/>' +
          '<stop offset="100%" stop-color="#C9924A"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<circle cx="50" cy="58" r="40" fill="url(#tvTan)"/>' +
      '<g id="tv-ear-l">' +
        '<path d="M 34 34 C 26 20, 22 6, 30 4 C 38 4, 42 18, 42 32 Z" fill="url(#tvFur)" stroke="#3a4152" stroke-width="1"/>' +
      '</g>' +
      '<g id="tv-ear-r">' +
        '<path d="M 66 34 C 74 20, 78 6, 70 4 C 62 4, 58 18, 58 32 Z" fill="url(#tvFur)" stroke="#3a4152" stroke-width="1"/>' +
      '</g>' +
      '<path d="M 16 44 C 12 30, 20 16, 34 14 C 30 24, 27 34, 28 46 Z" fill="url(#tvFur)"/>' +
      '<path d="M 84 44 C 88 30, 80 16, 66 14 C 70 24, 73 34, 72 46 Z" fill="url(#tvFur)"/>' +
      '<path d="M 22 20 C 32 8, 68 8, 78 20 C 82 28, 80 38, 74 42 C 68 30, 60 24, 50 24 C 40 24, 32 30, 26 42 C 20 38, 18 28, 22 20 Z" fill="url(#tvFur)"/>' +
      '<ellipse cx="50" cy="62" rx="26" ry="24" fill="url(#tvTan)"/>' +
      '<g id="tv-eye-l"><circle cx="40" cy="56" r="6" fill="#1a1208"/><circle cx="42" cy="54" r="1.6" fill="#fff"/></g>' +
      '<g id="tv-eye-r"><circle cx="60" cy="56" r="6" fill="#1a1208"/><circle cx="62" cy="54" r="1.6" fill="#fff"/></g>' +
      '<path d="M 30 50 Q 38 44 46 49" stroke="#6b4a1e" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.55"/>' +
      '<path d="M 70 50 Q 62 44 54 49" stroke="#6b4a1e" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.55"/>' +
      '<path d="M 40 66 C 38 78, 42 88, 50 90 C 58 88, 62 78, 60 66 C 56 72, 44 72, 40 66 Z" fill="#F6E3C6"/>' +
      '<ellipse cx="50" cy="70" rx="6" ry="4.5" fill="#0a0a0a"/>' +
      '<path d="M 50 74 L 50 80" stroke="#5a3a1e" stroke-width="1.2" opacity="0.6"/>' +
      '<path d="M 50 80 Q 45 84 42 88" stroke="#5a3a1e" stroke-width="1" fill="none" opacity="0.5"/>' +
      '<path d="M 50 80 Q 55 84 58 88" stroke="#5a3a1e" stroke-width="1" fill="none" opacity="0.5"/>' +
      '<path id="tv-tongue" d="M 46 84 Q 50 96 54 84 Q 50 88 46 84 Z" fill="#e8768a"/>' +
      '<path d="M 44 10 C 44 4, 56 4, 56 10 C 56 15, 51 15, 50 12 C 49 15, 44 15, 44 10 Z" fill="#C41E3A"/>' +
      '<circle cx="50" cy="11" r="2.2" fill="#8f1428"/>' +
    '</svg>';

  var container = el('div', 'display:none;position:fixed;bottom:98px;right:20px;width:380px;height:600px;max-height:80vh;background:#FFFBF5;border-radius:16px;box-shadow:0px 4px 20px rgba(0,0,0,0.25);z-index:999999;overflow:hidden;border:1px solid #E8C39E;flex-direction:column;', document.body);
  container.id = 'tutor-virtual-container';

  var header = el('div', 'background:linear-gradient(135deg,#C98B4F,#8B5A2B);color:white;padding:0 15px;font-family:Arial,sans-serif;font-weight:bold;display:flex;justify-content:space-between;align-items:center;height:50px;box-sizing:border-box;flex-shrink:0;', container);
  var headerTitle = el('span', '', header);
  headerTitle.textContent = '🐶 NIKO - Tutor Virtual';
  var closeBtn = el('span', 'cursor:pointer;font-size:18px;color:#ffe1cc;font-weight:bold;', header);
  closeBtn.textContent = '✖';
  closeBtn.onclick = toggleTutorVirtual;

  var messages = el('div', 'flex:1;overflow-y:auto;padding:12px;background:#FFF6E9;font-family:Arial,sans-serif;font-size:13px;', container);

  var inputBar = el('div', 'display:flex;gap:6px;padding:10px;border-top:1px solid #F0DCC0;background:white;flex-shrink:0;', container);
  var input = el('input', 'flex:1;border:1px solid #E8C39E;border-radius:20px;padding:8px 12px;font-size:13px;font-family:Arial,sans-serif;', inputBar);
  input.type = 'text';
  input.placeholder = 'Escribe tu pregunta...';
  input.addEventListener('keypress', function(e){ if(e.key === 'Enter'){ tvSend(); } });
  var sendBtn = el('button', 'background:linear-gradient(135deg,#C98B4F,#8B5A2B);color:white;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:16px;', inputBar);
  sendBtn.textContent = '➤';
  sendBtn.onclick = tvSend;

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
        tvAppend('¡Guau! 🐶 Soy NIKO, tu asistente virtual. Pregúntame lo que quieras sobre el curso.', false);
      }
    } else {
      container.style.display = 'none';
    }
  }

  function tvAppend(text, isUser){
    var div = document.createElement('div');
    div.style.margin = '6px 0';
    div.style.padding = '8px 12px';
    div.style.borderRadius = '14px';
    div.style.maxWidth = '80%';
    div.style.lineHeight = '1.4';
    div.style.whiteSpace = 'pre-wrap';
    if(isUser){
      div.style.background = 'linear-gradient(135deg,#C98B4F,#8B5A2B)';
      div.style.color = 'white';
      div.style.marginLeft = 'auto';
    } else {
      div.style.background = 'white';
      div.style.border = '1px solid #E8C39E';
      div.style.color = '#3a2a18';
    }
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function tvSend(){
    var text = input.value.trim();
    if(!text) return;
    tvAppend(text, true);
    input.value = '';

    var cursoActual = document.title.split(':')[0].split('|')[0].trim();

    fetch(TV_WEBHOOK, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: text, curso: cursoActual})
    })
    .then(function(res){ return res.json(); })
    .then(function(data){
      tvAppend((data && data.response) ? data.response : 'No pude generar una respuesta, intenta de nuevo.', false);
    })
    .catch(function(){
      tvAppend('No pude conectarme en este momento. Intenta de nuevo en unos segundos.', false);
    });
  }
})();
