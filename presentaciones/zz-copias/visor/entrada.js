(function () {
  window.Motor = window.Motor || {};

  window.Motor.entrada = function (el) {
    if (!el) return null;

    var prefersReduced = false;
    if (typeof window.matchMedia === 'function') {
      prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    var hasGsap = typeof window.gsap !== 'undefined' && window.gsap !== null;

    if (!hasGsap || prefersReduced) {
      if (hasGsap) {
        var targets = el.querySelectorAll('[data-anim]');
        if (targets.length) {
          window.gsap.killTweensOf(targets);
          window.gsap.set(targets, { clearProps: 'all', opacity: 1, visibility: 'visible' });
        }
        var decos = el.querySelectorAll('.deco');
        if (decos.length) {
          window.gsap.killTweensOf(decos);
          window.gsap.set(decos, { clearProps: 'all' });
        }
        var circs = el.querySelectorAll('.circulo-numero');
        if (circs.length) {
          window.gsap.killTweensOf(circs);
          window.gsap.set(circs, { clearProps: 'all' });
        }
        window.gsap.killTweensOf(el);
        window.gsap.set(el, { clearProps: 'all', opacity: 1, visibility: 'visible' });
      }
      return null;
    }

    var todosAnim = document.querySelectorAll('[data-anim]');
    if (todosAnim.length) {
      window.gsap.killTweensOf(todosAnim);
    }
    var todosSlides = document.querySelectorAll('.slide');
    if (todosSlides.length) {
      window.gsap.killTweensOf(todosSlides);
    }

    var animados = el.querySelectorAll('[data-anim]');
    if (animados.length) {
      window.gsap.set(animados, { clearProps: 'all' });
    }

    var decosLocales = el.querySelectorAll('.deco');
    if (decosLocales.length) {
      window.gsap.killTweensOf(decosLocales);
      decosLocales.forEach(function (d, idx) {
        var dy = idx % 2 === 0 ? 25 : -25;
        var dx = idx % 3 === 0 ? 15 : -15;
        var dur = 5 + idx * 1.5;
        window.gsap.to(d, {
          x: '+=' + dx,
          y: '+=' + dy,
          duration: dur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      });
    }

    var tl = window.gsap.timeline({
      onComplete: function () {
        var targets = el.querySelectorAll('[data-anim]');
        if (targets.length) {
          window.gsap.set(targets, { opacity: 1, visibility: 'visible' });
        }
      }
    });

    tl.fromTo(el,
      { autoAlpha: 0, x: 40 },
      { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power2.out', clearProps: 'transform' }
    );

    var titulos = el.querySelectorAll('[data-anim="titulo"]');
    if (titulos.length) {
      tl.from(titulos, { y: 35, autoAlpha: 0, duration: 0.5, ease: 'power3.out' }, '-=0.25');
    }

    var circulo = el.querySelector('.circulo-numero');
    if (circulo) {
      tl.fromTo(circulo,
        { scale: 0.4, autoAlpha: 0 },
        { scale: 1.15, autoAlpha: 1, duration: 0.35, ease: 'back.out(2)' },
        '-=0.3'
      );
      tl.to(circulo, { scale: 1, duration: 0.2, ease: 'power1.out' });
    }

    var items = el.querySelectorAll('[data-anim="item"]');
    var itemsFiltrados = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i] !== circulo) {
        itemsFiltrados.push(items[i]);
      }
    }
    if (itemsFiltrados.length) {
      tl.from(itemsFiltrados, { y: 22, autoAlpha: 0, duration: 0.4, ease: 'power2.out', stagger: 0.08 }, '-=0.25');
    }

    var medias = el.querySelectorAll('[data-anim="media"]');
    if (medias.length) {
      tl.from(medias, { x: 50, autoAlpha: 0, scale: 0.96, duration: 0.5, ease: 'power3.out' }, '-=0.35');
    }

    tl.add(function () {
      var targets = el.querySelectorAll('[data-anim]');
      if (targets.length) {
        window.gsap.set(targets, { opacity: 1, visibility: 'visible' });
      }
    });

    return tl;
  };
})();
