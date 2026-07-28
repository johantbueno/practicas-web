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
    '#tutor-virtual-btn{animation:tv-breathe 3s ease-in-out infinite;}' +
    '#tutor-virtual-btn:hover{animation:tv-sniff 0.6s ease-in-out infinite;}' +
    '#tv-eye-l,#tv-eye-r{animation:tv-blink 4.2s infinite;transform-origin:center;}' +
    '#tv-ear-l{animation:tv-ear-l 3.4s ease-in-out infinite;transform-origin:bottom center;}' +
    '#tv-ear-r{animation:tv-ear-r 3.4s ease-in-out infinite;transform-origin:bottom center;}' +
    '#tv-tongue{animation:tv-tongue-pant 1s ease-in-out infinite;transform-origin:top center;}' +
    '#tutor-virtual-container.tv-visible{animation:tv-pop 0.28s cubic-bezier(.34,1.56,.64,1);}';
  document.head.appendChild(styleTag);

  var btn = el('div', 'position:fixed;bottom:20px;right:20px;width:70px;height:70px;cursor:pointer;box-shadow:0px 5px 16px rgba(0,0,0,0.4);z-index:999999;border-radius:50%;background:#FFFBF5;', document.body);
  btn.id = 'tutor-virtual-btn';
  btn.innerHTML =
    '<svg viewBox="0 0 100 100" width="70" height="70" style="display:block;">' +
      '<defs>' +
        '<radialGradient id="tvFur" cx="40%" cy="30%" r="75%">' +
          '<stop offset="0%" stop-color="#3d3d3d"/>' +
          '<stop offset="100%" stop-color="#0a0a0a"/>' +
        '</radialGradient>' +
        '<radialGradient id="tvFace" cx="40%" cy="25%" r="75%">' +
          '<stop offset="0%" stop-color="#454545"/>' +
          '<stop offset="100%" stop-color="#161616"/>' +
        '</radialGradient>' +
        '<linearGradient id="tvTan" x1="0%" y1="0%" x2="0%" y2="100%">' +
          '<stop offset="0%" stop-color="#E3A868"/>' +
          '<stop offset="100%" stop-color="#B97A3E"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<circle cx="50" cy="50" r="48" fill="url(#tvFur)"/>' +
      '<g id="tv-ear-l">' +
        '<path d="M 28 26 C 20 10, 12 8, 14 22 C 15 32, 22 38, 30 34 Z" fill="#0a0a0a"/>' +
        '<path d="M 27 26 C 22 15, 17 14, 18 23 C 19 29, 23 32, 28 30 Z" fill="#2b2b2b"/>' +
      '</g>' +
      '<g id="tv-ear-r">' +
        '<path d="M 72 26 C 80 10, 88 8, 86 22 C 85 32, 78 38, 70 34 Z" fill="#0a0a0a"/>' +
        '<path d="M 73 26 C 78 15, 83 14, 82 23 C 81 29, 77 32, 72 30 Z" fill="#2b2b2b"/>' +
      '</g>' +
      '<ellipse cx="50" cy="56" rx="34" ry="30" fill="url(#tvFace)"/>' +
      '<path d="M 24 44 Q 30 38 38 42 Q 32 46 28 52 Z" fill="url(#tvTan)" opacity="0.9"/>' +
      '<path d="M 76 44 Q 70 38 62 42 Q 68 46 72 52 Z" fill="url(#tvTan)" opacity="0.9"/>' +
      '<ellipse cx="27" cy="58" rx="9" ry="8" fill="url(#tvTan)" opacity="0.85"/>' +
      '<ellipse cx="73" cy="58" rx="9" ry="8" fill="url(#tvTan)" opacity="0.85"/>' +
      '<g id="tv-eye-l"><circle cx="38" cy="52" r="6.5" fill="#000"/><circle cx="40" cy="50" r="1.8" fill="#fff"/></g>' +
      '<g id="tv-eye-r"><circle cx="62" cy="52" r="6.5" fill="#000"/><circle cx="64" cy="50" r="1.8" fill="#fff"/></g>' +
      '<path d="M 30 46 Q 38 42 44 46" stroke="#000" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.5"/>' +
      '<path d="M 70 46 Q 62 42 56 46" stroke="#000" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.5"/>' +
      '<ellipse cx="50" cy="68" rx="16" ry="12" fill="url(#tvTan)"/>' +
      '<path d="M 44 62 Q 50 58 56 62" stroke="#8a5a2e" stroke-width="1.2" fill="none" opacity="0.6"/>' +
      '<ellipse cx="50" cy="65" rx="7" ry="5" fill="#0a0a0a"/>' +
      '<ellipse cx="47" cy="63.5" rx="1.1" ry="0.8" fill="#3a3a3a"/>' +
      '<ellipse cx="53" cy="63.5" rx="1.1" ry="0.8" fill="#3a3a3a"/>' +
      '<path d="M 50 70 Q 44 74 42 79 Q 50 77 50 70" stroke="#5a3a1e" stroke-width="1" fill="none" opacity="0.5"/>' +
      '<path d="M 50 70 Q 56 74 58 79 Q 50 77 50 70" stroke="#5a3a1e" stroke-width="1" fill="none" opacity="0.5"/>' +
      '<path id="tv-tongue" d="M 46 76 Q 50 90 54 76 Q 50 80 46 76 Z" fill="#e8768a"/>' +
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

  btn.onclick = toggleTutorVirtual;

  function toggleTutorVirtual(){
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
