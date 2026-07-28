# -*- coding: utf-8 -*-
import re, io

path = r"D:\Temp\claude\scratch_practicas\practicas-web\hacienda-inversion-u1\index.html"
with io.open(path, encoding="utf-8") as f:
    html = f.read()

def rep(old, new, n=1, label=""):
    global html
    count = html.count(old)
    if count != n:
        raise AssertionError("anchor mismatch (%s): expected %d, found %d -> %r" % (label, n, count, old[:80]))
    html = html.replace(old, new)

# ---------- HEAD / META ----------
rep('<title>Práctica — Unidad I | Herramientas de Transformación Digital</title>',
    '<title>Práctica — Unidad I | Fundamentos de Planificación y Gestión de la Inversión Pública</title>', label="title")

rep('<meta name="description" content="Práctica autocalificable de la Unidad I: Transformación Digital en la Gestión Pública, curso Herramientas de Transformación Digital, INAP. Diagnóstico de proceso, madurez digital, laboratorio de IA, marco normativo y reflexión ética. Por escrito o por nota de voz. Incluye a Nicole y calificación automática preliminar.">',
    '<meta name="description" content="Práctica autocalificable de la Unidad I: El Sistema Nacional de Planificación e Inversión Pública en la República Dominicana, curso Fundamentos de Planificación y Gestión de la Inversión Pública del Estado, CAPGEFI. Origen del sistema, principios rectores, ámbitos de aplicación, procesos y monitoreo, aplicados a un proyecto real. Por escrito o por nota de voz. Incluye a Nicole y calificación automática preliminar.">',
    label="meta desc")

rep("<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%92%BB%3C/text%3E%3C/svg%3E\">",
    "<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8F%9B%EF%B8%8F%3C/text%3E%3C/svg%3E\">",
    label="favicon")

# ---------- SIDEBAR ----------
rep('<span style="font-size:1.4rem;">💻</span>\n      <p class="sidebar-title">Unidad I · HTD</p>',
    '<span style="font-size:1.4rem;">🏛️</span>\n      <p class="sidebar-title">Unidad I · SNPIP</p>', label="sidebar header")

rep('<span class="timer-label">⏱️ Tiempo sugerido</span>', '<span class="timer-label">⏱️ Tiempo sugerido</span>', label="timer label noop")
rep('<div class="timer-value" id="timer-value">120:00</div>', '<div class="timer-value" id="timer-value">60:00</div>', label="timer value")

rep('''        <ul>
          <li><a href="#portada">💻 Portada e instrucciones</a></li>
          <li><a href="#marco-conceptual">📚 Marco conceptual</a></li>
          <li><a href="#paso1" data-step="paso1">Paso 1 · Diagnóstico de proceso <span class="pct" data-pct="paso1">0%</span></a></li>
          <li><a href="#paso2" data-step="paso2">Paso 2 · Madurez digital <span class="pct" data-pct="paso2">0%</span></a></li>
          <li><a href="#paso3" data-step="paso3">Paso 3 · Laboratorio de IA <span class="pct" data-pct="paso3">0%</span></a></li>
          <li><a href="#paso4" data-step="paso4">Paso 4 · Análisis normativo <span class="pct" data-pct="paso4">0%</span></a></li>
          <li><a href="#paso5" data-step="paso5">Paso 5 · Reflexión ética <span class="pct" data-pct="paso5">0%</span></a></li>
          <li><a href="#rubrica">🧮 Rúbrica de evaluación</a></li>
          <li><a href="#resultado">📤 Enviar y calificar</a></li>
        </ul>''',
    '''        <ul>
          <li><a href="#portada">🏛️ Portada e instrucciones</a></li>
          <li><a href="#marco-conceptual">📚 Marco conceptual</a></li>
          <li><a href="#paso1" data-step="paso1">Paso 1 · Origen del sistema <span class="pct" data-pct="paso1">0%</span></a></li>
          <li><a href="#paso2" data-step="paso2">Paso 2 · Principios rectores <span class="pct" data-pct="paso2">0%</span></a></li>
          <li><a href="#paso3" data-step="paso3">Paso 3 · Ámbitos y proceso <span class="pct" data-pct="paso3">0%</span></a></li>
          <li><a href="#paso4" data-step="paso4">Paso 4 · Instrumentos vinculados <span class="pct" data-pct="paso4">0%</span></a></li>
          <li><a href="#paso5" data-step="paso5">Paso 5 · Monitoreo y evaluación <span class="pct" data-pct="paso5">0%</span></a></li>
          <li><a href="#rubrica">🧮 Rúbrica de evaluación</a></li>
          <li><a href="#resultado">📤 Enviar y calificar</a></li>
        </ul>''', label="nav")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("PARTE 1 OK, len=", len(html))
