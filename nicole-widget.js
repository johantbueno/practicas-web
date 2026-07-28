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
    '@keyframes tv-breathe{0%,100%{transform:scale(1) rotate(0deg);}50%{transform:scale(1.05) rotate(-2deg);}}' +
    '@keyframes tv-wag{0%,100%{transform:rotate(-8deg);}50%{transform:rotate(8deg);}}' +
    '@keyframes tv-blink{0%,90%,100%{transform:scaleY(1);}95%{transform:scaleY(0.1);}}' +
    '#tutor-virtual-btn{animation:tv-breathe 2.6s ease-in-out infinite;}' +
    '#tutor-virtual-btn:hover{animation-play-state:paused;transform:scale(1.1);}' +
    '#tv-eye-l,#tv-eye-r{animation:tv-blink 4.5s infinite;}' +
    '#tv-tongue{animation:tv-wag 1.2s ease-in-out infinite;transform-origin:top center;}';
  document.head.appendChild(styleTag);

  var btn = el('div', 'position:fixed;bottom:20px;left:20px;width:66px;height:66px;cursor:pointer;box-shadow:0px 4px 14px rgba(0,0,0,0.4);z-index:999999;border-radius:50%;background:radial-gradient(circle at 35% 30%, #3a3a3a, #0d0d0d);', document.body);
  btn.id = 'tutor-virtual-btn';

  el('div', 'position:absolute;top:-10px;left:2px;width:20px;height:26px;background:#0d0d0d;border-radius:60% 40% 50% 50% / 70% 70% 30% 30%;transform:rotate(-18deg);', btn);
  el('div', 'position:absolute;top:-10px;right:2px;width:20px;height:26px;background:#0d0d0d;border-radius:40% 60% 50% 50% / 70% 70% 30% 30%;transform:rotate(18deg);', btn);
  el('div', 'position:absolute;top:14px;left:0;right:0;margin:auto;width:56px;height:46px;background:radial-gradient(circle at 35% 30%, #3a3a3a, #141414);border-radius:50%;', btn);
  el('div', 'position:absolute;top:23px;left:14px;width:9px;height:5px;background:#C98B4F;border-radius:50%;', btn);
  el('div', 'position:absolute;top:23px;right:14px;width:9px;height:5px;background:#C98B4F;border-radius:50%;', btn);
  el('div', 'position:absolute;top:32px;left:4px;width:14px;height:12px;background:#C98B4F;border-radius:50%;opacity:0.85;', btn);
  el('div', 'position:absolute;top:32px;right:4px;width:14px;height:12px;background:#C98B4F;border-radius:50%;opacity:0.85;', btn);
  var eyeL = el('div', 'position:absolute;top:28px;left:16px;width:7px;height:9px;background:#000;border-radius:50%;', btn);
  eyeL.id = 'tv-eye-l';
  var eyeR = el('div', 'position:absolute;top:28px;right:16px;width:7px;height:9px;background:#000;border-radius:50%;', btn);
  eyeR.id = 'tv-eye-r';
  el('div', 'position:absolute;top:36px;left:0;right:0;margin:auto;width:26px;height:18px;background:#D19B60;border-radius:50% 50% 45% 45%;', btn);
  el('div', 'position:absolute;top:38px;left:0;right:0;margin:auto;width:11px;height:8px;background:#000;border-radius:40%;', btn);
  var tongue = el('div', 'position:absolute;top:46px;left:0;right:0;margin:auto;width:9px;height:12px;background:#e8768a;border-radius:0 0 8px 8px;', btn);
  tongue.id = 'tv-tongue';

  var container = el('div', 'display:none;position:fixed;bottom:96px;left:20px;width:380px;height:600px;max-height:80vh;background:#FFFBF5;border-radius:16px;box-shadow:0px 4px 20px rgba(0,0,0,0.25);z-index:999999;overflow:hidden;border:1px solid #E8C39E;flex-direction:column;', document.body);

  var header = el('div', 'background:linear-gradient(135deg,#C98B4F,#8B5A2B);color:white;padding:0 15px;font-family:Arial,sans-serif;font-weight:bold;display:flex;justify-content:space-between;align-items:center;height:50px;box-sizing:border-box;flex-shrink:0;', container);
  var headerTitle = el('span', '', header);
  headerTitle.textContent = '🐶 Nicole - Tutor Virtual';
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
      if(!tv_opened){
        tv_opened = true;
        tvAppend('¡Guau! 🐶 Soy Nicole, tu asistente virtual. Pregúntame lo que quieras sobre el curso.', false);
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
