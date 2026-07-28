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

rep('''      <p>Consulte estos conceptos, ya vistos en el material de estudio de la Unidad I, mientras completa la actividad. También puede preguntarle a Nicole sobre cualquiera de ellos.</p>
      <dl class="glossary-grid">
        <div class="gloss-item"><dt>Digitalización</dt><dd>Transposición de datos y registros analógicos a formato binario. El proceso se mantiene idéntico; solo cambia el soporte (ej. escanear legajos en PDF).</dd></div>
        <div class="gloss-item"><dt>Informatización</dt><dd>Uso de sistemas informáticos para automatizar tareas ya estructuradas. El flujo se acelera, pero las reglas de la burocracia permanecen fijas.</dd></div>
        <div class="gloss-item"><dt>Transformación digital pura</dt><dd>Reconfiguración profunda de la cultura, los procesos y el valor entregado al ciudadano, posibilitada por tecnologías disruptivas (OCDE, 2020).</dd></div>
        <div class="gloss-item"><dt>Informatización Básica</dt><dd>Etapa 1 de madurez (1990s-2000s): computadoras de escritorio, procesadores de texto, silos de datos descentralizados.</dd></div>
        <div class="gloss-item"><dt>Digitalización de Trámites</dt><dd>Etapa 2: portales institucionales informativos, formularios PDF descargables, correo corporativo básico.</dd></div>
        <div class="gloss-item"><dt>Gobierno Electrónico (e-Gov)</dt><dd>Etapa 3: plataformas transaccionales de extremo a extremo, firma digital, interoperabilidad vía GOB.DO.</dd></div>
        <div class="gloss-item"><dt>Gobierno Inteligente</dt><dd>Etapa 4: datos abiertos, Big Data estatal, automatización con IA, servicios proactivos y predictivos.</dd></div>
        <div class="gloss-item"><dt>Agenda Digital 2030</dt><dd>Hoja de ruta nacional (OGTIC / Gabinete de Transformación Digital) con 5 ejes: Conectividad, Gobierno Digital, Economía Digital, Educación y Confianza Digital.</dd></div>
        <div class="gloss-item"><dt>Decreto No. 230-18</dt><dd>Obliga la interoperabilidad entre ministerios, prohíbe nuevos silos aislados y designa a la OGTIC como ente rector (NORTIC).</dd></div>
        <div class="gloss-item"><dt>IA Generativa</dt><dd>Sistemas (ChatGPT, Copilot, Gemini) que generan contenido original a partir de instrucciones en lenguaje natural (prompts).</dd></div>
        <div class="gloss-item"><dt>Prompt efectivo</dt><dd>Instrucción clara y específica dada a una IA Generativa para obtener un resultado útil y accionable.</dd></div>
        <div class="gloss-item"><dt>Ley No. 172-13</dt><dd>Protección Integral de los Datos Personales: prohíbe introducir datos nominales, cédulas o expedientes confidenciales en plataformas abiertas de terceros.</dd></div>
        <div class="gloss-item"><dt>Ley No. 167-21</dt><dd>Mejora Regulatoria y Simplificación de Trámites ("Burocracia Cero"): elimina requisitos redundantes que el Estado ya posee.</dd></div>
        <div class="gloss-item"><dt>Automatización inteligente (RPA + IA)</dt><dd>Convergencia de robótica de software con IA para ejecutar tareas administrativas repetitivas de forma desatendida.</dd></div>
        <div class="gloss-item"><dt>Principios UNESCO 2021</dt><dd>Proporcionalidad, supervisión humana ineludible, equidad algorítmica y confidencialidad, para cualquier herramienta de IA que use el sector público.</dd></div>
        <div class="gloss-item"><dt>GOB.DO / Portal Ciudadano / SISMAP</dt><dd>Casos de éxito dominicanos: portal único de trámites, identidad digital federada, y monitoreo del cumplimiento de la Ley 41-08.</dd></div>
      </dl>

      <h2>🏛️ Las 4 etapas de madurez digital, con ejemplos de varias instituciones</h2>
      <p>Estos ejemplos son solo una guía — su propio proceso puede parecerse a uno de ellos o ser distinto, y eso está bien.</p>
      <div class="tbl-wrap"><table class="tp-table">
        <thead><tr><th>Etapa</th><th>Ejemplo INAPA (agua)</th><th>Ejemplo hospital público</th><th>Ejemplo ayuntamiento</th></tr></thead>
        <tbody>
          <tr><td class="label-cell">1. Informatización Básica</td><td>Las lecturas de medidores se anotan en una libreta o en una hoja de Excel local, sin conexión entre oficinas.</td><td>Las citas se anotan en un libro de citas de papel en cada consultorio.</td><td>Los permisos se archivan en carpetas físicas por año, sin ningún registro digital.</td></tr>
          <tr><td class="label-cell">2. Digitalización de Trámites</td><td>El formulario para solicitar un nuevo servicio se descarga en PDF, pero se entrega en persona.</td><td>La página web informa los horarios y requisitos, pero la cita se agenda solo llamando o yendo en persona.</td><td>El ayuntamiento publica en línea los requisitos del permiso, pero el trámite se sigue haciendo presencial.</td></tr>
          <tr><td class="label-cell">3. Gobierno Electrónico (e-Gov)</td><td>El usuario solicita el servicio, paga su factura y da seguimiento a una avería completamente en línea.</td><td>El paciente agenda su cita, ve sus resultados de laboratorio y recibe recordatorios por un portal en línea.</td><td>El ciudadano solicita y paga su permiso completo en línea, sin ir a la oficina.</td></tr>
          <tr><td class="label-cell">4. Gobierno Inteligente</td><td>Un sensor detecta una fuga y genera automáticamente una orden de trabajo antes de que el usuario la reporte.</td><td>El sistema predice la demanda de camas o citas según el historial, y reorganiza los turnos automáticamente.</td><td>Un sistema detecta patrones de reincidencia en quejas de una zona y prioriza esa área automáticamente.</td></tr>
        </tbody>
      </table></div>''',
    '''      <p>Consulte estos conceptos, ya vistos en el material de estudio de la Unidad I, mientras completa la actividad. También puede preguntarle a Nicole sobre cualquiera de ellos.</p>
      <dl class="glossary-grid">
        <div class="gloss-item"><dt>SNPIP</dt><dd>Sistema Nacional de Planificación e Inversión Pública: conjunto de principios, normas, órganos y procesos por los que el Estado fija políticas, objetivos, metas y prioridades del desarrollo, y evalúa su cumplimiento (Art. 1, Ley 498-06).</dd></div>
        <div class="gloss-item"><dt>Ley 55 de 1965</dt><dd>Creó el antiguo Sistema Nacional de Planificación Económica, Social y Administrativa. Derogada por el Art. 54 de la Ley 498-06 el 28 de diciembre de 2006.</dd></div>
        <div class="gloss-item"><dt>Ley 498-06</dt><dd>Ley de Planificación e Inversión Pública, del 28 de diciembre de 2006. Crea el SNPIP: sus principios, órganos, procesos e instrumentos.</dd></div>
        <div class="gloss-item"><dt>Ley 45-25 (2025)</dt><dd>Fusiona el Ministerio de Hacienda con el MEPyD, creando el Ministerio de Hacienda y Economía (MHE), órgano rector de las finanzas públicas y del SNPIP. Deroga la Ley 496-06.</dd></div>
        <div class="gloss-item"><dt>Planificar</dt><dd>Pensar antes de actuar de forma sistemática; definir metas, estrategia y planes para integrar y coordinar el trabajo (Carlos Matus).</dd></div>
        <div class="gloss-item"><dt>Principios rectores del SNPIP</dt><dd>Jerarquía, complementariedad, coherencia, consistencia, participación, transparencia, flexibilidad y sostenibilidad (Art. 3, Ley 498-06).</dd></div>
        <div class="gloss-item"><dt>Ámbito global</dt><dd>Nivel estratégico del Estado: visión de país a largo plazo (END, PNPSP).</dd></div>
        <div class="gloss-item"><dt>Ámbito institucional</dt><dd>Cada institución define su contribución mediante su Plan Estratégico Institucional (PEI).</dd></div>
        <div class="gloss-item"><dt>Ámbito sectorial</dt><dd>Agrupa instituciones de funciones similares (salud, educación) para coordinar políticas.</dd></div>
        <div class="gloss-item"><dt>Ámbito territorial</dt><dd>Adapta las políticas nacionales a la realidad regional, provincial y municipal.</dd></div>
        <div class="gloss-item"><dt>GpRD</dt><dd>Gestión para Resultados en el Desarrollo: orientar la inversión pública a la mejora real de las condiciones de vida de la población.</dd></div>
        <div class="gloss-item"><dt>Indicador SMART</dt><dd>Específico, Mensurable, Alcanzable, Relevante y Temporal — la base de un buen indicador de monitoreo y evaluación.</dd></div>
        <div class="gloss-item"><dt>Evaluación de procesos / resultados / impacto</dt><dd>Miden, respectivamente, eficiencia (uso de recursos), eficacia (productos logrados) y efectividad (efecto real en la población).</dd></div>
      </dl>

      <h2>🏛️ Los cuatro ámbitos de aplicación del SNPIP, con ejemplos de varias instituciones</h2>
      <p>Estos ejemplos son solo una guía — su propio proyecto puede parecerse a uno de ellos o ser distinto, y eso está bien.</p>
      <div class="tbl-wrap"><table class="tp-table">
        <thead><tr><th>Ámbito</th><th>Ejemplo INAPA (agua)</th><th>Ejemplo hospital público</th><th>Ejemplo ayuntamiento</th></tr></thead>
        <tbody>
          <tr><td class="label-cell">1. Global</td><td>La END fija como meta nacional reducir enfermedades hídricas.</td><td>La END fija como meta nacional mejorar la cobertura de salud primaria.</td><td>La END fija como meta nacional el desarrollo territorial equilibrado.</td></tr>
          <tr><td class="label-cell">2. Institucional</td><td>El PEI de la institución prioriza la cartera de acueductos rurales.</td><td>El PEI del hospital prioriza equipamiento y personal de maternidad.</td><td>El PEI del ayuntamiento prioriza rehabilitación vial.</td></tr>
          <tr><td class="label-cell">3. Sectorial</td><td>El sector agua y saneamiento coordina inversión con salud y medio ambiente.</td><td>El sector salud coordina atención primaria, hospitales y medicamentos.</td><td>El sector obras públicas coordina infraestructura vial y drenaje.</td></tr>
          <tr><td class="label-cell">4. Territorial</td><td>El Consejo Provincial prioriza qué comunidad recibe el acueducto primero.</td><td>El Consejo Provincial prioriza en qué provincia se remoza la maternidad.</td><td>El Consejo Municipal prioriza qué calle se rehabilita primero.</td></tr>
        </tbody>
      </table></div>''', label="marco conceptual")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("PARTE 4 OK, len=", len(html))
