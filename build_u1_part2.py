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

# ---------- COVER ----------
rep('''      <p class="eyebrow">Curso Herramientas de Transformación Digital · INAP · AC-INAP-2026-HTD</p>
      <h1>Práctica — Unidad I</h1>
      <p class="sub">Transformación Digital en la Gestión Pública: diagnóstico de madurez digital y laboratorio de Inteligencia Artificial aplicada</p>
      <div class="cover-chips">
        <span class="cover-chip">Aplicable a cualquier institución pública</span>
        <span class="cover-chip">Individual o en equipo</span>
        <span class="cover-chip">100 pts · aprueba al completarla</span>
        <span class="cover-chip">Dura aproximadamente 2 horas</span>
        <span class="cover-chip">Después de revisar el material de estudio de la Unidad I</span>
        <span class="cover-chip">Gana una medalla digital al terminar</span>
      </div>''',
    '''      <p class="eyebrow">Diplomado en Hacienda e Inversión Pública · Módulo: Fundamentos de Planificación y Gestión de la Inversión Pública del Estado · CAPGEFI</p>
      <h1>Práctica — Unidad I</h1>
      <p class="sub">El Sistema Nacional de Planificación e Inversión Pública (SNPIP) en la República Dominicana: origen, principios rectores, ámbitos, procesos y monitoreo, aplicados a un proyecto real</p>
      <div class="cover-chips">
        <span class="cover-chip">Aplicable a cualquier institución pública</span>
        <span class="cover-chip">Individual o en equipo</span>
        <span class="cover-chip">100 pts · aprueba al completarla</span>
        <span class="cover-chip">Dura aproximadamente 1 hora</span>
        <span class="cover-chip">Después de revisar el material de estudio de la Unidad I</span>
        <span class="cover-chip">Gana una medalla digital al terminar</span>
      </div>''', label="cover")

# ---------- TABLA "use el proceso de su institución" ----------
rep('''      <span class="step-badge">Ejemplos por tipo de institución</span>
      <h1 style="font-size:1.35rem;">Use el proceso de SU propia institución</h1>
      <div class="alert info">
        Esta práctica aplica a cualquier institución del Estado dominicano. Para que le resulte más fácil pensar en un ejemplo concreto, aquí tiene procesos típicos según el tipo de institución en la que usted trabaje — elija el que se parezca más a su realidad, o use cualquier otro proceso real de su área.
      </div>
      <div class="tbl-wrap"><table class="tp-table">
        <thead><tr><th>Tipo de institución</th><th>Ejemplo de proceso o trámite</th></tr></thead>
        <tbody>
          <tr><td class="label-cell">INAPA (agua y saneamiento)</td><td>Solicitud de nuevo servicio de agua potable, reporte de una avería, lectura de medidores, reconexión por falta de pago.</td></tr>
          <tr><td class="label-cell">Hospital o centro de salud público</td><td>Agendamiento de una cita médica, entrega de resultados de laboratorio, referimiento a otro centro, solicitud de expediente clínico.</td></tr>
          <tr><td class="label-cell">Ayuntamiento o municipio</td><td>Solicitud de permiso de construcción, pago de arbitrios municipales, denuncia de un bache o de basura acumulada.</td></tr>
          <tr><td class="label-cell">Ministerio o dirección general</td><td>Solicitud de licencia médica de un empleado, trámite de un certificado o constancia, gestión de correspondencia interna.</td></tr>
          <tr><td class="label-cell">Institución educativa pública</td><td>Inscripción de un estudiante, solicitud de récord de notas, trámite de una beca.</td></tr>
        </tbody>
      </table></div>
      <p>Puede usar cualquier proceso real de su área específica: una oficina comercial o regional, facturación y cobro, una cuadrilla de operaciones, un laboratorio, recursos humanos, o cualquier otra dependencia. No hace falta que sea exactamente uno de los ejemplos de la tabla — use el proceso que usted conozca mejor.</p>''',
    '''      <span class="step-badge">Ejemplos por tipo de institución</span>
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
      <p>Puede usar cualquier proyecto real de su área específica: infraestructura vial, salud, educación, agua y saneamiento, seguridad ciudadana, o cualquier otro sector de inversión pública. No hace falta que sea exactamente uno de los ejemplos de la tabla — use el proyecto que usted conozca mejor.</p>''', label="tabla institucion")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("PARTE 2 OK, len=", len(html))
