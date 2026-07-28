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

# ---------- 1) Reemplazar la seccion de "eleccion libre de institucion" por presentacion de los 4 casos ----------
rep('''      <span class="step-badge">Ejemplos por tipo de institución</span>
      <h1 style="font-size:1.35rem;">Use un proyecto de inversión real de SU institución</h1>
      <div class="alert info">
        Esta práctica aplica a cualquier institución del Estado dominicano comprendida en el ámbito del SNPIP. Para que le resulte más fácil pensar en un ejemplo concreto, aquí tiene proyectos típicos de inversión pública según el tipo de institución en la que usted trabaje — elija el que se parezca más a su realidad, o use cualquier otro proyecto real de su área.
      </div>
      <div class="tbl-wrap"><table class="tp-table">
        <thead><tr><th>Tipo de institución</th><th>Ejemplo de proyecto de inversión pública</th></tr></thead>
        <tbody>
          <tr><td class="label-cell">INAPA (agua y saneamiento)</td><td>Construcción de un acueducto rural, rehabilitación de redes de distribución de agua potable, planta de tratamiento de aguas residuales.</td></tr>
          <tr><td class="label-cell">Hospital o centro de salud público</td><td>Remozamiento de una sala de maternidad, adquisición de equipos médicos, construcción de un centro de atención primaria.</td></tr>
          <tr><td class="label-cell">Ayuntamiento o municipio</td><td>Rehabilitación de caminos vecinales, construcción de un mercado municipal, sistema de drenaje pluvial urbano.</td></tr>
          <tr><td class="label-cell">Ministerio o dirección general</td><td>Modernización de un sistema de información institucional, construcción de una sede regional, programa de capacitación de personal.</td></tr>
          <tr><td class="label-cell">Institución educativa pública</td><td>Construcción o rehabilitación de una escuela, dotación de mobiliario y equipos tecnológicos, programa de becas.</td></tr>
        </tbody>
      </table></div>
      <p>Puede usar cualquier proyecto real de su área específica: infraestructura vial, salud, educación, agua y saneamiento, seguridad ciudadana, o cualquier otro sector de inversión pública. No hace falta que sea exactamente uno de los ejemplos de la tabla — use el proyecto que usted conozca mejor.</p>''',
    '''      <span class="step-badge">Elija su caso</span>
      <h1 style="font-size:1.35rem;">Esta práctica se resuelve sobre UN caso, ya preparado para usted</h1>
      <div class="alert info">
        Para que pueda enfocarse en aplicar los conceptos del SNPIP (y no en inventar un ejemplo desde cero), esta práctica le presenta <strong>4 casos reales ya redactados</strong>. En el Paso 1 va a elegir uno y trabajar sobre ese mismo caso durante los 5 pasos.
      </div>
      <div class="tbl-wrap"><table class="tp-table">
        <thead><tr><th>Caso</th><th>Resumen</th></tr></thead>
        <tbody>
          <tr><td class="label-cell">1. INAPA — Acueducto rural</td><td>Comunidad rural con enfermedades gastrointestinales por agua sin tratar.</td></tr>
          <tr><td class="label-cell">2. Hospital público — Maternidad</td><td>Sala de maternidad con equipos obsoletos y alta demanda de partos.</td></tr>
          <tr><td class="label-cell">3. Ayuntamiento — Caminos vecinales</td><td>Caminos rurales intransitables en época de lluvia, aislando varias comunidades.</td></tr>
          <tr><td class="label-cell">4. Ministerio — Modernización institucional</td><td>Trámites internos manuales, lentos y sin seguimiento, entre varias direcciones.</td></tr>
        </tbody>
      </table></div>
      <p>No hace falta pensar en su propia institución ni inventar datos — el caso que elija ya trae toda la información necesaria para responder los 5 pasos.</p>''', label="tabla casos")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("CASOS PARTE 1 OK, len=", len(html))
