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

rep('''    <section id="paso1" class="card">
      <span class="step-badge">Paso 1 · 15 min</span><span class="step-points">Vale 20 pts</span>
      <h1>Origen del Sistema y su Proyecto de Referencia</h1>
      <p><strong>Concepto:</strong> antes de 2006, la planificación dominicana (Ley 55 de 1965) operaba desarticulada del presupuesto, centralizada y con débil seguimiento. La Ley 498-06 creó el SNPIP para ordenar la inversión pública con dirección estratégica.</p>
      <div class="alert info"><strong>Guía:</strong> elija un proyecto de inversión pública real de su institución. Va a usarlo como referencia en los 5 pasos de esta práctica.</div>

      <div class="field-grid">
        <div class="field"><label for="p1_institucion">Institución o dependencia</label><input type="text" id="p1_institucion" placeholder="Ej: INAPA regional, un hospital público, un ayuntamiento, un ministerio..."></div>
        <div class="field"><label for="p1_proyecto">Proyecto de inversión pública seleccionado</label><input type="text" id="p1_proyecto" placeholder="Ej: acueducto rural, remozamiento de maternidad, rehabilitación vial, construcción de una escuela..."></div>
      </div>
      <div class="hint">Otros ejemplos si no sabe por dónde empezar: planta de tratamiento, sistema de drenaje pluvial, mercado municipal, sede regional, programa de becas.</div>

      <div class="field">
        <label for="p1_antes">Si este proyecto se hubiera decidido bajo el sistema ANTERIOR a 2006 (Ley 55 de 1965), ¿qué problemas concretos podría haber tenido? <span class="wc" data-for="p1_antes">0 palabras</span></label>
        <textarea class="tall" id="p1_antes" placeholder="Bajo el sistema anterior, este proyecto podría haberse decidido por presión política, sin estar amarrado a un plan, sin indicadores..."></textarea>
        <div class="voice-row"><button type="button" class="voice-btn" data-target="p1_antes">🎤 Mantenga presionado para grabar</button><span class="voice-status" data-target-status="p1_antes"></span></div>
      </div>

      <div class="field">
        <label for="p1_reforma">¿Qué exige HOY el marco legal vigente (Ley 498-06 y la reforma de la Ley 45-25) antes de aprobar este mismo proyecto? <span class="wc" data-for="p1_reforma">0 palabras</span></label>
        <textarea class="tall" id="p1_reforma" placeholder="Hoy el proyecto debe justificarse con evidencia, alinearse a los planes vigentes, pasar por el órgano rector (Ministerio de Hacienda y Economía)..."></textarea>
        <div class="voice-row"><button type="button" class="voice-btn" data-target="p1_reforma">🎤 Mantenga presionado para grabar</button><span class="voice-status" data-target-status="p1_reforma"></span></div>
      </div>
    </section>''',
'''    <section id="paso1" class="card">
      <span class="step-badge">Paso 1 · 10 min</span><span class="step-points">Vale 20 pts</span>
      <h1>Elija su Caso y el Origen del Sistema</h1>
      <p><strong>Concepto:</strong> antes de 2006, la planificación dominicana (Ley 55 de 1965) operaba desarticulada del presupuesto, centralizada y con débil seguimiento. La Ley 498-06 creó el SNPIP para ordenar la inversión pública con dirección estratégica.</p>
      <div class="alert info"><strong>Guía:</strong> elija UNO de los 4 casos. Léalo con calma — con este mismo caso va a trabajar los 5 pasos de la práctica, no hace falta que use datos de su propia institución.</div>

      <div class="field">
        <label for="p1_caso">Caso elegido</label>
        <select id="p1_caso">
          <option value="">Seleccione un caso…</option>
          <option value="inapa">Caso 1 — INAPA: Acueducto rural</option>
          <option value="hospital">Caso 2 — Hospital público: Maternidad</option>
          <option value="ayuntamiento">Caso 3 — Ayuntamiento: Caminos vecinales</option>
          <option value="ministerio">Caso 4 — Ministerio: Modernización institucional</option>
        </select>
      </div>
      <div class="alert gold" id="p1_caso_desc">Seleccione un caso arriba para ver su descripción completa aquí.</div>

      <div class="field">
        <label for="p1_antes">Si el proyecto de su caso se hubiera decidido bajo el sistema ANTERIOR a 2006 (Ley 55 de 1965), ¿qué problemas concretos podría haber tenido? <span class="wc" data-for="p1_antes">0 palabras</span></label>
        <textarea class="tall" id="p1_antes" placeholder="Bajo el sistema anterior, este proyecto podría haberse decidido por presión política, sin estar amarrado a un plan, sin indicadores..."></textarea>
        <div class="voice-row"><button type="button" class="voice-btn" data-target="p1_antes">🎤 Mantenga presionado para grabar</button><span class="voice-status" data-target-status="p1_antes"></span></div>
      </div>

      <div class="field">
        <label for="p1_reforma">¿Qué exige HOY el marco legal vigente (Ley 498-06 y la reforma de la Ley 45-25) antes de aprobar este mismo proyecto? <span class="wc" data-for="p1_reforma">0 palabras</span></label>
        <textarea class="tall" id="p1_reforma" placeholder="Hoy el proyecto debe justificarse con evidencia, alinearse a los planes vigentes, pasar por el órgano rector (Ministerio de Hacienda y Economía)..."></textarea>
        <div class="voice-row"><button type="button" class="voice-btn" data-target="p1_reforma">🎤 Mantenga presionado para grabar</button><span class="voice-status" data-target-status="p1_reforma"></span></div>
      </div>
    </section>''', label="paso1 rewrite")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("CASOS PARTE 2 OK, len=", len(html))
