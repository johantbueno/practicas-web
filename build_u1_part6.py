# -*- coding: utf-8 -*-
import io

path = r"D:\Temp\claude\scratch_practicas\practicas-web\hacienda-inversion-u1\index.html"
with io.open(path, encoding="utf-8") as f:
    html = f.read()

def rep(old, new, n=1, label=""):
    global html
    count = html.count(old)
    if count != n:
        raise AssertionError("anchor mismatch (%s): expected %d, found %d" % (label, n, count))
    html = html.replace(old, new)

rep('''      Práctica — Unidad I: Transformación Digital en la Gestión Pública · Curso Herramientas de Transformación Digital · INAP · AC-INAP-2026-HTD.<br>''',
    '''      Práctica — Unidad I: El Sistema Nacional de Planificación e Inversión Pública · Diplomado en Hacienda e Inversión Pública · CAPGEFI.<br>''', label="footer")

rep('''    <div class="advisor-msg advisor-msg-bot">¡Hola! Soy Nicole, la asistente virtual del Dr. Johan Tapia. Pregúntame sobre digitalización, informatización, transformación digital, la Agenda Digital 2030, IA Generativa, la Ley 172-13, o cómo funciona la calificación de esta práctica.</div>
  </div>
  <div class="advisor-suggest">
    <button type="button" data-q="¿cómo se califica esta práctica?">¿Cómo se califica?</button>
    <button type="button" data-q="diferencia entre digitalizacion informatizacion y transformacion digital">Digitalización vs. transformación digital</button>
    <button type="button" data-q="que es la agenda digital 2030">Agenda Digital 2030</button>
  </div>''',
    '''    <div class="advisor-msg advisor-msg-bot">¡Hola! Soy Nicole, la asistente virtual del Dr. Johan Tapia. Pregúntame sobre el SNPIP, la Ley 498-06, los principios rectores, los ámbitos de aplicación, la reforma de la Ley 45-25, o cómo funciona la calificación de esta práctica.</div>
  </div>
  <div class="advisor-suggest">
    <button type="button" data-q="¿cómo se califica esta práctica?">¿Cómo se califica?</button>
    <button type="button" data-q="que es el snpip">¿Qué es el SNPIP?</button>
    <button type="button" data-q="que cambio la ley 45-25">¿Qué cambió la Ley 45-25?</button>
  </div>''', label="advisor panel")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("PARTE 6 OK, len=", len(html))
