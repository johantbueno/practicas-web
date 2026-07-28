# -*- coding: utf-8 -*-
import io, re

path = r"D:\Temp\claude\scratch_practicas\practicas-web\hacienda-inversion-u1\index.html"
with io.open(path, encoding="utf-8") as f:
    html = f.read()

start_marker = '    <!-- ============ PASO 1 ============ -->'
end_marker = '    <!-- ============ ENVÍO / RESULTADO ============ -->'

i1 = html.index(start_marker)
i2 = html.index(end_marker)
assert i1 != -1 and i2 != -1 and i2 > i1

new_block = '''    <!-- ============ PASO 1 ============ -->
    <section id="paso1" class="card">
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
    </section>

    <!-- ============ PASO 2 ============ -->
    <section id="paso2" class="card">
      <span class="step-badge">Paso 2 · 15 min</span><span class="step-points">Vale 20 pts</span>
      <h1>Principios Rectores Aplicados</h1>
      <p><strong>Concepto, en palabras simples:</strong> los ocho principios rectores del SNPIP (jerarquía, complementariedad, coherencia, consistencia, participación, transparencia, flexibilidad, sostenibilidad) son el "checklist de calidad" que debe cumplir toda decisión de inversión pública.</p>
      <div class="alert info"><strong>Guía:</strong> elija DOS principios distintos y explique, con el proyecto del Paso 1, cómo se aplicaría cada uno en la práctica.</div>

      <div class="field-grid">
        <div class="field">
          <label for="p2_principio1">Primer principio elegido</label>
          <select id="p2_principio1">
            <option value="">Seleccione…</option>
            <option>Jerarquía</option><option>Complementariedad</option><option>Coherencia</option><option>Consistencia</option>
            <option>Participación</option><option>Transparencia</option><option>Flexibilidad</option><option>Sostenibilidad</option>
          </select>
        </div>
        <div class="field">
          <label for="p2_principio2">Segundo principio elegido</label>
          <select id="p2_principio2">
            <option value="">Seleccione…</option>
            <option>Jerarquía</option><option>Complementariedad</option><option>Coherencia</option><option>Consistencia</option>
            <option>Participación</option><option>Transparencia</option><option>Flexibilidad</option><option>Sostenibilidad</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label for="p2_aplicacion">Explique cómo se aplicaría CADA uno de los dos principios elegidos en su proyecto <span class="wc" data-for="p2_aplicacion">0 palabras</span></label>
        <textarea class="tall" id="p2_aplicacion" placeholder="El principio de participación se aplicaría porque... El principio de sostenibilidad se aplicaría porque..."></textarea>
        <div class="voice-row"><button type="button" class="voice-btn" data-target="p2_aplicacion">🎤 Mantenga presionado para grabar</button><span class="voice-status" data-target-status="p2_aplicacion"></span></div>
      </div>
    </section>

    <!-- ============ PASO 3 ============ -->
    <section id="paso3" class="card">
      <span class="step-badge">Paso 3 · 15 min</span><span class="step-points">Vale 25 pts</span>
      <h1>Ámbitos de Aplicación y Procesos de Planificación</h1>
      <p><strong>Concepto:</strong> el SNPIP opera en cuatro ámbitos (global, institucional, sectorial, territorial) mediante cuatro procesos encadenados (direccionamiento estratégico, planificación institucional y presupuesto, inversión pública, planificación territorial).</p>
      <div class="alert info"><strong>Guía:</strong> ubique su proyecto del Paso 1 en el ámbito y el proceso que mejor lo describan.</div>

      <div class="field-grid">
        <div class="field">
          <label for="p3_ambito">¿En qué ámbito se decide inicialmente priorizar este tipo de proyecto?</label>
          <select id="p3_ambito">
            <option value="">Seleccione…</option>
            <option value="Global">Global (visión de país, END/PNPSP)</option>
            <option value="Institucional">Institucional (PEI de la institución)</option>
            <option value="Sectorial">Sectorial (coordinación del sector: salud, agua, educación...)</option>
            <option value="Territorial">Territorial (Consejo Regional/Provincial/Municipal)</option>
          </select>
        </div>
        <div class="field">
          <label for="p3_proceso">¿Qué proceso del SNPIP corresponde a la etapa de formular y ejecutar ESTE proyecto específico?</label>
          <select id="p3_proceso">
            <option value="">Seleccione…</option>
            <option value="Direccionamiento estratégico">Direccionamiento estratégico del Estado</option>
            <option value="Planificación institucional y presupuesto">Planificación institucional y presupuesto</option>
            <option value="Inversión pública">Proceso de inversión pública (SNIP)</option>
            <option value="Planificación territorial">Planificación territorial</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label for="p3_justificacion">Justifique sus dos elecciones anteriores con el proyecto concreto <span class="wc" data-for="p3_justificacion">0 palabras</span></label>
        <textarea class="tall" id="p3_justificacion" placeholder="Elegí el ámbito institucional porque... Elegí el proceso de inversión pública porque este proyecto debe pasar por el ciclo perfil-ejecución-operación..."></textarea>
        <div class="voice-row"><button type="button" class="voice-btn" data-target="p3_justificacion">🎤 Mantenga presionado para grabar</button><span class="voice-status" data-target-status="p3_justificacion"></span></div>
      </div>
    </section>

    <!-- ============ PASO 4 ============ -->
    <section id="paso4" class="card">
      <span class="step-badge">Paso 4 · 10 min</span><span class="step-points">Vale 15 pts</span>
      <h1>Vínculo con los Instrumentos de Planificación</h1>
      <p><strong>Concepto:</strong> ningún proyecto de inversión pública nace aislado: debe conectarse con al menos un instrumento formal de planificación (END, PNPSP, plan sectorial, PEI institucional, plan territorial), tema que profundizaremos en la Unidad III.</p>
      <div class="alert info"><strong>Guía:</strong> identifique el instrumento con el que su proyecto debería estar alineado y explique el vínculo.</div>

      <div class="field">
        <label for="p4_instrumento">Instrumento de planificación con el que su proyecto debería alinearse</label>
        <select id="p4_instrumento">
          <option value="">Seleccione…</option>
          <option>Estrategia Nacional de Desarrollo (END)</option>
          <option>Plan Nacional Plurianual del Sector Público (PNPSP)</option>
          <option>Plan Estratégico Sectorial</option>
          <option>Plan Estratégico Institucional (PEI)</option>
          <option>Plan Estratégico Territorial</option>
        </select>
      </div>
      <div class="field">
        <label for="p4_vinculo">Explique el vínculo concreto entre su proyecto y ese instrumento <span class="wc" data-for="p4_vinculo">0 palabras</span></label>
        <textarea class="tall" id="p4_vinculo" placeholder="Este proyecto debe alinearse al PEI de mi institución porque uno de sus objetivos estratégicos es..."></textarea>
        <div class="voice-row"><button type="button" class="voice-btn" data-target="p4_vinculo">🎤 Mantenga presionado para grabar</button><span class="voice-status" data-target-status="p4_vinculo"></span></div>
      </div>
    </section>

    <!-- ============ PASO 5 ============ -->
    <section id="paso5" class="card">
      <span class="step-badge">Paso 5 · 15 min</span><span class="step-points">Vale 20 pts</span>
      <h1>Monitoreo y Evaluación</h1>
      <p><strong>Concepto:</strong> "lo que no se mide, no se puede mejorar". Todo proyecto necesita indicadores SMART (Específicos, Mensurables, Alcanzables, Relevantes, Temporales) y debe someterse a evaluación de procesos, de resultados y de impacto.</p>
      <div class="alert info"><strong>Guía:</strong> redacte un indicador SMART para su proyecto y clasifique qué tipo de evaluación mediría mejor su efecto real en la población.</div>

      <div class="field">
        <label for="p5_indicador">Redacte UN indicador SMART completo para su proyecto (con cantidad, lugar y plazo) <span class="wc" data-for="p5_indicador">0 palabras</span></label>
        <textarea class="tall" id="p5_indicador" placeholder="Reducir en un 30% los eventos de..., en el sector X, en un plazo de 24 meses."></textarea>
        <div class="voice-row"><button type="button" class="voice-btn" data-target="p5_indicador">🎤 Mantenga presionado para grabar</button><span class="voice-status" data-target-status="p5_indicador"></span></div>
      </div>
      <div class="field">
        <label for="p5_tipo_evaluacion">¿Qué tipo de evaluación (procesos, resultados o impacto) mediría mejor si su proyecto realmente mejoró la vida de la población, y por qué? <span class="wc" data-for="p5_tipo_evaluacion">0 palabras</span></label>
        <textarea class="tall" id="p5_tipo_evaluacion" placeholder="La evaluación de impacto sería la más adecuada porque..."></textarea>
        <div class="voice-row"><button type="button" class="voice-btn" data-target="p5_tipo_evaluacion">🎤 Mantenga presionado para grabar</button><span class="voice-status" data-target-status="p5_tipo_evaluacion"></span></div>
      </div>

      <div class="alert gold">
        <strong>Eje de cierre:</strong> un proyecto público no es solo una obra; es una decisión de política pública dentro de un sistema de planificación e inversión que exige justificación, evidencia y rendición de cuentas.
      </div>
    </section>

    <!-- ============ RÚBRICA ============ -->
    <section id="rubrica" class="card">
      <span class="step-badge">Referencia</span>
      <h1 style="font-size:1.35rem;">Rúbrica de evaluación</h1>
      <div class="tbl-wrap"><table class="tp-table">
        <thead><tr><th>N°</th><th>Criterio</th><th>Indicador</th><th>Puntos</th></tr></thead>
        <tbody id="rubrica-body"></tbody>
      </table></div>
      <div class="alert success" style="margin-top:1rem;">
        <strong>Recuerde:</strong> esta rúbrica califica la <em>calidad</em> de su trabajo como retroalimentación. La <strong>aprobación de la práctica</strong> se otorga por completar los 5 pasos, no por alcanzar un puntaje mínimo.
      </div>
      <h2>Referencias</h2>
      <ul style="font-size:.85rem; color:var(--muted);">
        <li>Congreso Nacional de la República Dominicana. (2006). <em>Ley No. 498-06</em>, de Planificación e Inversión Pública.</li>
        <li>Congreso Nacional de la República Dominicana. (2006). <em>Ley No. 496-06</em>, que crea la Secretaría de Estado de Economía, Planificación y Desarrollo (derogada por la Ley 45-25).</li>
        <li>Congreso Nacional de la República Dominicana. (2025). <em>Ley No. 45-25</em>, que dispone la fusión del Ministerio de Hacienda y el Ministerio de Economía, Planificación y Desarrollo.</li>
        <li>Ministerio de Economía, Planificación y Desarrollo. (2017). <em>Normas Técnicas del Sistema Nacional de Inversión Pública.</em></li>
        <li>Matus, C. <em>Planificación Estratégica Situacional.</em></li>
      </ul>
    </section>

'''

html = html[:i1] + new_block + html[i2:]

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("PARTE 5 OK, len=", len(html))
