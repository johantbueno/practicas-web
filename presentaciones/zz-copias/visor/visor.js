(function () {
  function crearBloquesDecorativos() {
    var cont = document.createElement('div');
    cont.className = 'bloques-decorativos';
    cont.setAttribute('aria-hidden', 'true');
    var colores = ['#FFD100', '#63B82E', '#176EE4'];
    for (var i = 0; i < colores.length; i++) {
      var b = document.createElement('span');
      b.className = 'bloque-color';
      b.style.backgroundColor = colores[i];
      cont.appendChild(b);
    }
    return cont;
  }

  function crearPanelLogo() {
    var cont = document.createElement('div');
    cont.className = 'panel-logo';
    cont.setAttribute('aria-hidden', 'true');
    var img = document.createElement('img');
    var elData = document.getElementById('logo-infotep');
    var src = elData && elData.textContent ? elData.textContent.trim() : '';
    img.src = src;
    img.alt = 'INFOTEP';
    cont.appendChild(img);
    return cont;
  }

  function crearGraficoBarras() {
    var cont = document.createElement('div');
    cont.className = 'grafico-barras';
    cont.setAttribute('aria-hidden', 'true');
    var alturas = [110, 170, 145, 230, 200, 290, 255, 360, 320, 410];
    for (var i = 0; i < alturas.length; i++) {
      var b = document.createElement('div');
      b.className = 'barra-deco';
      b.style.height = alturas[i] + 'px';
      b.style.backgroundColor = 'rgba(255, 255, 255, ' + (i % 2 ? 0.10 : 0.17) + ')';
      cont.appendChild(b);
    }
    return cont;
  }

  function crearFranjaColores() {
    var cont = document.createElement('div');
    cont.className = 'franja-colores';
    cont.setAttribute('aria-hidden', 'true');
    var segs = [
      { w: '63%', c: '#003B7A' },
      { w: '10%', c: '#176EE4' },
      { w: '14%', c: '#63B82E' },
      { w: '13%', c: '#FFD100' }
    ];
    for (var i = 0; i < segs.length; i++) {
      var s = document.createElement('div');
      s.className = 'franja-seg';
      s.style.width = segs[i].w;
      s.style.backgroundColor = segs[i].c;
      cont.appendChild(s);
    }
    return cont;
  }

  function crearLineaAmarilla() {
    var l = document.createElement('div');
    l.className = 'linea-amarilla';
    l.setAttribute('aria-hidden', 'true');
    return l;
  }

  function crearFormasDeco(seccion) {
    var d1 = document.createElement('div');
    d1.className = 'deco deco-1';
    d1.setAttribute('aria-hidden', 'true');
    var d2 = document.createElement('div');
    d2.className = 'deco deco-2';
    d2.setAttribute('aria-hidden', 'true');
    seccion.appendChild(d1);
    seccion.appendChild(d2);
  }

  function fit() {
    var lienzo = document.getElementById('lienzo');
    if (!lienzo) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (w < 600) {
      document.documentElement.classList.add('movil');
    } else {
      document.documentElement.classList.remove('movil');
    }
    var scale = Math.min(w / 1920, h / 1080);
    var x = (w - 1920 * scale) / 2;
    var y = (h - 1080 * scale) / 2;
    lienzo.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
  }

  function inicializar() {
    if (new URLSearchParams(window.location.search).get('embed') === '1') {
      document.documentElement.classList.add('embed');
    }

    var deckEl = document.getElementById('deck');
    var deck = {};
    if (deckEl && deckEl.textContent) {
      try {
        deck = JSON.parse(deckEl.textContent);
      } catch (e) {
        deck = {};
      }
    }

    var meta = deck.meta || {};
    var vivo = (meta.estilo === 'vivo' && window.Motor && window.Motor.vivo && window.Motor.icono) ? window.Motor.vivo : null;
    if (vivo) document.documentElement.classList.add('vivo');
    var slidesData = Array.isArray(deck.slides) ? deck.slides : [];
    var total = slidesData.length;
    var actualIndex = 1;

    function normalizar(n) {
      var num = Number(n);
      if (isNaN(num) || num < 1) return 1;
      if (num > total) return total;
      return Math.floor(num);
    }

    var notaEl = null;
    var host = (window.Motor && window.Motor.host) ? window.Motor.host.crear(deck, { alCambiar: alCambiar }) : null;
    var susp = (window.Motor && window.Motor.scorm) ? window.Motor.scorm.iniciar() : '';
    var restaurada = (host && susp) ? host.restaurar(susp) : null;

    function actualizarNota() {
      if (!host || !notaEl) return;
      var r = host.resumen();
      notaEl.textContent = 'Tu nota: ' + r.nota + ' / 100 — ' + (r.aprobado ? 'Aprobado' : 'No aprobado');
    }
    function alCambiar() {
      if (!host) return;
      actualizarNota();
      if (window.Motor.scorm) window.Motor.scorm.guardar(host.serializar(actualIndex), host.resumen(), actualIndex === total);
    }

    var lienzo = document.getElementById('lienzo');
    var slides = [];

    if (lienzo) {
      lienzo.replaceChildren();

      for (var i = 0; i < slidesData.length; i++) {
        var data = slidesData[i];
        var layout = data.layout || 'contenido';
        var section = document.createElement('section');
        section.className = 'slide layout-' + layout;
        section.setAttribute('aria-hidden', 'true');

        if (layout === 'portada') {
          section.appendChild(crearPanelLogo());
          section.appendChild(crearBloquesDecorativos());
          section.appendChild(crearGraficoBarras());
          section.appendChild(crearFranjaColores());
          crearFormasDeco(section);

          var contPortada = document.createElement('div');
          contPortada.className = 'portada-contenido';

          contPortada.appendChild(crearLineaAmarilla());

          var h1Portada = document.createElement('h1');
          h1Portada.className = 'portada-titulo';
          h1Portada.setAttribute('data-anim', 'titulo');
          h1Portada.textContent = data.titulo || '';
          contPortada.appendChild(h1Portada);

          if (data.subtitulo) {
            var subPortada = document.createElement('p');
            subPortada.className = 'portada-subtitulo';
            subPortada.setAttribute('data-anim', 'item');
            subPortada.textContent = data.subtitulo;
            contPortada.appendChild(subPortada);
          }
          section.appendChild(contPortada);
          if (vivo) {
            var envPortada = document.createElement('div');
            envPortada.className = 'vivo-portada-escena';
            envPortada.appendChild(vivo.escena((data.titulo || '') + ' ' + (data.subtitulo || ''), { oscura: true, paleta: 0 }));
            section.appendChild(envPortada);
            vivo.particulas(section, true);
          }

        } else if (layout === 'contenido') {
          section.appendChild(crearBloquesDecorativos());
          crearFormasDeco(section);

          var contContenido = document.createElement('div');
          contContenido.className = 'contenido-wrapper';

          var h2Contenido = document.createElement('h2');
          h2Contenido.className = 'slide-titulo';
          h2Contenido.setAttribute('data-anim', 'titulo');
          h2Contenido.textContent = data.titulo || '';
          contContenido.appendChild(h2Contenido);

          if (data.texto) {
            var txtContenido = document.createElement('p');
            txtContenido.className = 'slide-texto';
            txtContenido.setAttribute('data-anim', 'item');
            txtContenido.textContent = data.texto;
            contContenido.appendChild(txtContenido);
          }

          if (Array.isArray(data.puntos) && data.puntos.length > 0) {
            var contenedorPuntos = document.createElement('div');
            contenedorPuntos.className = 'tarjetas-puntos' + (data.puntos.length > 3 ? ' columnas-2' : '');
            for (var pIdx = 0; pIdx < data.puntos.length; pIdx++) {
              var tarjeta = document.createElement('div');
              tarjeta.className = 'tarjeta-punto tarjeta-color-' + (pIdx % 3);
              tarjeta.setAttribute('data-anim', 'item');

              var badge = document.createElement('span');
              badge.className = 'punto-badge';
              badge.textContent = String(pIdx + 1);
              tarjeta.appendChild(badge);

              var txtP = document.createElement('span');
              txtP.className = 'punto-texto';
              txtP.textContent = data.puntos[pIdx];
              tarjeta.appendChild(txtP);

              contenedorPuntos.appendChild(tarjeta);
            }
            contContenido.appendChild(contenedorPuntos);
          }
          if (host && Array.isArray(data.componentes) && data.componentes.length > 0) {
            var contComp = document.createElement('div');
            contComp.className = 'componentes';
            for (var cIdx = 0; cIdx < data.componentes.length; cIdx++) {
              var defC = data.componentes[cIdx];
              try {
                window.Motor.componentes[defC.tipo](contComp, defC, host.ctxPara(defC));
              } catch (errC) {
                var aviso = document.createElement('p');
                aviso.textContent = 'No se pudo mostrar esta actividad.';
                contComp.appendChild(aviso);
              }
            }
            contContenido.appendChild(contComp);
          }
          if (vivo) {
            var tieneComp = Array.isArray(data.componentes) && data.componentes.length > 0 && data.componentes[0].tipo === 'quiz';
            var lado = document.createElement('div');
            lado.className = 'vivo-lado';
            if (tieneComp) {
              var nico = vivo.mascota(data.componentes[0] && data.componentes[0].variante === 'vf' ? '¿Verdadero o falso? Piénsalo bien.' : '¡Tú puedes! Elige una respuesta.');
              lado.appendChild(nico.nodo);
              vivo.decorarQuiz(contContenido, nico);
            } else {
              lado.appendChild(vivo.escena((data.titulo || '') + ' ' + (data.texto || '')));
            }
            var split = document.createElement('div');
            split.className = 'vivo-split';
            split.appendChild(contContenido);
            split.appendChild(lado);
            section.appendChild(split);
            vivo.particulas(section, false);
          } else {
            section.appendChild(contContenido);
          }

        } else if (layout === 'paso') {
          section.appendChild(crearBloquesDecorativos());
          crearFormasDeco(section);

          var gridPaso = document.createElement('div');
          gridPaso.className = 'paso-grid';

          var colIzq = document.createElement('div');
          colIzq.className = 'paso-col-izq';

          var numPaso = data.numero != null ? data.numero : (i + 1);

          var circulo = document.createElement('div');
          circulo.className = 'circulo-numero';
          circulo.setAttribute('data-anim', 'item');
          circulo.textContent = String(numPaso);
          colIzq.appendChild(circulo);

          var h2Paso = document.createElement('h2');
          h2Paso.className = 'slide-titulo';
          h2Paso.setAttribute('data-anim', 'titulo');
          h2Paso.textContent = data.titulo || '';
          colIzq.appendChild(h2Paso);

          if (data.texto) {
            var txtPaso = document.createElement('p');
            txtPaso.className = 'slide-texto';
            txtPaso.setAttribute('data-anim', 'item');
            txtPaso.textContent = data.texto;
            colIzq.appendChild(txtPaso);
          }

          if (Array.isArray(data.puntos) && data.puntos.length > 0) {
            var ulPaso = document.createElement('ul');
            ulPaso.className = 'paso-lista-puntos';
            ulPaso.setAttribute('data-anim', 'item');
            for (var ptIdx = 0; ptIdx < data.puntos.length; ptIdx++) {
              var liPaso = document.createElement('li');
              liPaso.className = 'paso-punto-item paso-punto-color-' + (ptIdx % 3);

              var badgePt = document.createElement('span');
              badgePt.className = 'punto-badge';
              badgePt.textContent = String(ptIdx + 1);
              liPaso.appendChild(badgePt);

              var txtPt = document.createElement('span');
              txtPt.className = 'punto-texto';
              txtPt.textContent = data.puntos[ptIdx];
              liPaso.appendChild(txtPt);

              ulPaso.appendChild(liPaso);
            }
            colIzq.appendChild(ulPaso);
          }
          gridPaso.appendChild(colIzq);

          var colDer = document.createElement('div');
          colDer.className = 'paso-col-der';

          if (data.imagen) {
            var imgPaso = document.createElement('img');
            imgPaso.className = 'paso-imagen';
            imgPaso.src = data.imagen;
            imgPaso.alt = data.alt || '';
            imgPaso.setAttribute('data-anim', 'media');
            colDer.appendChild(imgPaso);
          } else if (vivo) {
            colDer.appendChild(vivo.escena((data.titulo || '') + ' ' + (data.texto || ''), { numero: numPaso }));
          } else {
            var panelDeco = document.createElement('div');
            panelDeco.className = 'paso-panel-decorativo';
            panelDeco.setAttribute('data-anim', 'media');

            var geomWrap = document.createElement('div');
            geomWrap.className = 'panel-geom-wrapper';

            var c1 = document.createElement('div');
            c1.className = 'panel-geom-circulo panel-geom-c1';
            geomWrap.appendChild(c1);

            var c2 = document.createElement('div');
            c2.className = 'panel-geom-circulo panel-geom-c2';
            geomWrap.appendChild(c2);

            var lin = document.createElement('div');
            lin.className = 'panel-geom-lineas';
            geomWrap.appendChild(lin);

            panelDeco.appendChild(geomWrap);

            var spanNum = document.createElement('span');
            spanNum.className = 'numero-grande';
            spanNum.textContent = String(numPaso);
            panelDeco.appendChild(spanNum);

            colDer.appendChild(panelDeco);
          }
          gridPaso.appendChild(colDer);

          section.appendChild(gridPaso);
          if (vivo) vivo.particulas(section, false);

        } else if (/^(trivia|ruleta|memoria|escape|detective|aula)$/.test(layout)) {
          section.appendChild(crearBloquesDecorativos());
          crearFormasDeco(section);

          var contJuego = document.createElement('div');
          contJuego.className = 'contenido-wrapper juego-wrapper layout-' + layout;

          if (data.titulo) {
            var h2Juego = document.createElement('h2');
            h2Juego.className = 'slide-titulo';
            h2Juego.setAttribute('data-anim', 'titulo');
            h2Juego.textContent = data.titulo;
            contJuego.appendChild(h2Juego);
          }

          if (data.texto) {
            var txtJuego = document.createElement('p');
            txtJuego.className = 'slide-texto';
            txtJuego.setAttribute('data-anim', 'item');
            txtJuego.textContent = data.texto;
            contJuego.appendChild(txtJuego);
          }

          var contCompJuego = document.createElement('div');
          contCompJuego.className = 'componentes comp-juego-host';
          if (host && window.Motor && window.Motor.componentes && window.Motor.componentes[layout]) {
            try {
              var defJuego = (Array.isArray(data.componentes) && data.componentes[0]) ? data.componentes[0] : data;
              if (!defJuego.id) defJuego.id = data.id || ('slide-' + (i + 1));
              window.Motor.componentes[layout](contCompJuego, defJuego, host.ctxPara(defJuego));
            } catch (errJ) {
              var avisoJ = document.createElement('p');
              avisoJ.textContent = 'No se pudo cargar la actividad.';
              contCompJuego.appendChild(avisoJ);
            }
          }
          contJuego.appendChild(contCompJuego);
          section.appendChild(contJuego);
          if (vivo) vivo.particulas(section, false);

        } else if (layout === 'cierre') {
          section.appendChild(crearPanelLogo());
          section.appendChild(crearBloquesDecorativos());
          section.appendChild(crearGraficoBarras());
          section.appendChild(crearFranjaColores());
          crearFormasDeco(section);

          var contCierre = document.createElement('div');
          contCierre.className = 'cierre-contenido';

          contCierre.appendChild(crearLineaAmarilla());

          var h1Cierre = document.createElement('h1');
          h1Cierre.className = 'cierre-titulo';
          h1Cierre.setAttribute('data-anim', 'titulo');
          h1Cierre.textContent = data.titulo || '';
          contCierre.appendChild(h1Cierre);

          if (data.texto) {
            var txtCierre = document.createElement('p');
            txtCierre.className = 'cierre-texto';
            txtCierre.setAttribute('data-anim', 'item');
            txtCierre.textContent = data.texto;
            contCierre.appendChild(txtCierre);
          }
          if (host && host.resumen().maximo > 0) {
            notaEl = document.createElement('p');
            notaEl.className = 'cierre-nota';
            contCierre.appendChild(notaEl);
            actualizarNota();
          }
          section.appendChild(contCierre);

          var autorCierre = meta.autor || 'Johan Tapia, PhD';
          var credito = document.createElement('div');
          credito.className = 'cierre-credito';
          credito.textContent = 'Desarrollado por ' + autorCierre;
          section.appendChild(credito);
          if (vivo) {
            var envCierre = document.createElement('div');
            envCierre.className = 'vivo-portada-escena';
            envCierre.appendChild(vivo.escena('', { oscura: true, paleta: 1, icono: 'trophy', satelites: ['star', 'confetti', 'certificate'], etiqueta: '¡Lo lograste!' }));
            section.appendChild(envCierre);
            vivo.particulas(section, true);
            vivo.alActivar(section, function () { vivo.confeti(section, 70); });
          }
        }

        lienzo.appendChild(section);
        slides.push(section);
      }
    }

    function actualizarUI() {
      var cuentaEl = document.getElementById('cuenta');
      if (cuentaEl) {
        cuentaEl.textContent = actualIndex + ' / ' + total;
      }
      var barraEl = document.getElementById('barra');
      if (barraEl) {
        var pct = total > 0 ? (actualIndex / total) * 100 : 0;
        barraEl.style.width = pct + '%';
      }
    }

    var inicializado = false;
    function ir(n) {
      if (total === 0) return;
      var target = normalizar(n);
      actualIndex = target;

      for (var sIdx = 0; sIdx < slides.length; sIdx++) {
        var s = slides[sIdx];
        if (sIdx === actualIndex - 1) {
          s.classList.add('activa');
          s.setAttribute('aria-hidden', 'false');
          if (vivo && vivo.ajustar) vivo.ajustar(s);
          if (window.Motor && window.Motor.efectos && slidesData[sIdx] && slidesData[sIdx].efecto) window.Motor.efectos.aplicar(s, slidesData[sIdx].efecto);
          if (window.Motor && typeof window.Motor.entrada === 'function') {
            window.Motor.entrada(s);
          }
        } else {
          s.classList.remove('activa');
          s.setAttribute('aria-hidden', 'true');
        }
      }
      actualizarUI();
      if (inicializado && host && window.Motor.scorm) {
        window.Motor.scorm.guardar(host.serializar(actualIndex), host.resumen(), actualIndex === total);
        window.Motor.scorm.commit();
      }
      inicializado = true;
    }

    window.Visor = {
      resumen: function () { return host ? host.resumen() : null; },
      total: total,
      ir: ir,
      actual: function () {
        return actualIndex;
      }
    };

    var antBtn = document.getElementById('ant');
    if (antBtn) {
      antBtn.addEventListener('click', function () {
        ir(actualIndex - 1);
      });
    }

    var sigBtn = document.getElementById('sig');
    if (sigBtn) {
      sigBtn.addEventListener('click', function () {
        ir(actualIndex + 1);
      });
    }

    var pantallaBtn = document.getElementById('pantalla');
    if (pantallaBtn) {
      pantallaBtn.addEventListener('click', function () {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(function () {});
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(function () {});
          }
        }
      });
    }

    var sonidoBtn = document.getElementById('sonido');
    if (sonidoBtn && window.Motor && window.Motor.sonido) {
      sonidoBtn.addEventListener('click', function () {
        var activo = window.Motor.sonido.toggle();
        sonidoBtn.textContent = activo ? '🔊' : '🔇';
        sonidoBtn.setAttribute('aria-label', activo ? 'Sonido activado' : 'Sonido silenciado');
      });
    }

    window.addEventListener('keydown', function (e) {
      // console.log('visor keydown:', e.key, 'target:', e.target && e.target.tagName, e.target && e.target.className, 'closest tablist:', e.target && e.target.closest && e.target.closest('[role=tablist]'));
      if (e.defaultPrevented) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.target && e.target.closest && (e.target.closest('[role=tablist]') || e.target.closest('.pestanas-lista') || e.target.closest('.comp-tarjetas'))) return;
      if ((e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') && e.target && e.target.closest && e.target.closest('.comp')) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          ir(actualIndex + 1);
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          ir(actualIndex - 1);
          break;
        case 'Home':
          e.preventDefault();
          ir(1);
          break;
        case 'End':
          e.preventDefault();
          ir(total);
          break;
      }
    });

    var touchStartX = 0;
    var touchStartY = 0;
    window.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', function (e) {
      if (e.changedTouches && e.changedTouches.length === 1) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) {
            ir(actualIndex + 1);
          } else {
            ir(actualIndex - 1);
          }
        }
      }
    }, { passive: true });

    window.addEventListener('hashchange', function () {
      var hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        ir(normalizar(hash));
      }
    });

    window.addEventListener('resize', fit);
    fit();

    function obtenerInicial() {
      var params = new URLSearchParams(window.location.search);
      if (params.has('slide')) {
        return normalizar(params.get('slide'));
      }
      var hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        return normalizar(hash);
      }
      return 1;
    }

    var pidio = new URLSearchParams(window.location.search).has('slide') || window.location.hash.replace(/^#/, '');
    ir(pidio ? obtenerInicial() : (restaurada || 1));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }
})();
