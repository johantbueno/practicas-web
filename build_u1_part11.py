# -*- coding: utf-8 -*-
import io

path = r"D:\Temp\claude\scratch_practicas\practicas-web\hacienda-inversion-u1\index.html"
with io.open(path, encoding="utf-8") as f:
    html = f.read()

start = "var QA = [\n  { kw:['calific','nota','puntaje','rubrica','aprobar','minimo','aprobacion'],"
end_anchor = "{ kw:['hola', 'ayuda', 'que puedes hacer', 'quien eres'],"
idx1 = html.index(start)
idx2 = html.index(end_anchor, idx1)
idx2_end = html.index("];\n", idx2)
full_old = html[idx1: idx2_end+2]

new_qa = '''var QA = [
  { kw:['calific','nota','puntaje','rubrica','aprobar','minimo','aprobacion'], a:'La nota de calidad va de 0 a 100, entre los 5 pasos (20+20+25+15+20). Pero la APROBACIÓN de esta práctica no depende de esa nota: se aprueba por completar los 5 pasos en su totalidad. La nota es solo retroalimentación para que usted mismo vea qué reforzar.' },
  { kw:['snpip', 'que es el snpip', 'sistema nacional de planificacion'], a:'El SNPIP (Sistema Nacional de Planificación e Inversión Pública) es el conjunto de principios, normas, órganos y procesos por los que el Estado fija políticas, objetivos, metas y prioridades del desarrollo, y evalúa su cumplimiento. Lo creó la Ley 498-06 del 28 de diciembre de 2006.' },
  { kw:['ley 45-25', '45-25', 'que cambio la ley', 'mhe', 'ministerio de hacienda y economia'], a:'La Ley 45-25 (2025) fusionó el Ministerio de Hacienda con el MEPyD, creando el Ministerio de Hacienda y Economía (MHE), que hoy es el órgano rector tanto de las finanzas públicas como del Sistema Nacional de Planificación e Inversión Pública. Derogó la Ley 496-06 que había creado el MEPyD.' },
  { kw:['ley 498', '498-06', 'ley de planificacion'], a:'La Ley 498-06, del 28 de diciembre de 2006, crea el SNPIP: establece sus principios, órganos, procesos e instrumentos. Su artículo 1 lo define como el conjunto de principios, normas, órganos y procesos por los que se fijan las políticas, objetivos, metas y prioridades del desarrollo.' },
  { kw:['ley 55', '1965', 'antes de la reforma', 'sistema anterior'], a:'Antes de 2006 regía la Ley 55 de 1965, que creó el antiguo Sistema Nacional de Planificación Económica, Social y Administrativa. Operaba con enfoque de corto plazo, desarticulado del presupuesto, con escasa participación ciudadana y débil seguimiento. Fue derogada por el Art. 54 de la Ley 498-06.' },
  { kw:['principio', 'jerarquia', 'complementariedad', 'coherencia', 'consistencia', 'participacion', 'transparencia', 'flexibilidad', 'sostenibilidad'], a:'Los 8 principios rectores del SNPIP son: jerarquía, complementariedad, coherencia, consistencia, participación, transparencia, flexibilidad y sostenibilidad. Para el Paso 2, elija dos y explique cómo se aplicarían a SU proyecto concreto, con un ejemplo real.' },
  { kw:['ambito', 'ámbitos', 'global', 'institucional', 'sectorial', 'territorial'], a:'Los 4 ámbitos de aplicación del SNPIP son: Global (visión país, END/PNPSP), Institucional (PEI de cada institución), Sectorial (coordinación de instituciones afines) y Territorial (Consejos Regionales/Provinciales/Municipales). Para el Paso 3, ubique en cuál se decide inicialmente priorizar su proyecto.' },
  { kw:['proceso', 'direccionamiento estrategico', 'planificacion institucional', 'inversion publica', 'planificacion territorial'], a:'Los 4 procesos del SNPIP son: Direccionamiento estratégico del Estado (END), Planificación institucional y presupuesto (PEI), Proceso de inversión pública (ciclo perfil-ejecución-operación) y Planificación territorial. Para el Paso 3, identifique cuál corresponde a formular y ejecutar SU proyecto.' },
  { kw:['instrumento', 'end', 'pnpsp', 'pei', 'plan sectorial', 'plan territorial'], a:'Los instrumentos de planificación son: la Estrategia Nacional de Desarrollo (END), el Plan Nacional Plurianual del Sector Público (PNPSP), los Planes Estratégicos Sectoriales, los Planes Estratégicos Institucionales (PEI) y los Planes Estratégicos Territoriales. Profundizaremos en cada uno en la Unidad III.' },
  { kw:['indicador smart', 'smart', 'monitoreo', 'evaluacion', 'evaluación'], a:'Un indicador SMART debe ser Específico, Mensurable, Alcanzable, Relevante y Temporal (con cantidad, lugar y plazo). Existen 3 tipos de evaluación: de procesos (mide eficiencia), de resultados (mide eficacia) y de impacto (mide efectividad real en la población).' },
  { kw:['gprd', 'gestion para resultados'], a:'La Gestión para Resultados en el Desarrollo (GpRD) es el enfoque bajo el cual opera el SNPIP: la inversión pública debe demostrar, con evidencia, que mejora las condiciones de vida de la población, no solo que ejecutó el gasto disponible.' },
  { kw:['nota de voz', 'voz', 'grabar', 'hablar', 'microfono', 'micrófono'], a:'Al lado de cada pregunta hay un botón "🎤 Mantenga presionado para grabar". Manténgalo presionado mientras habla su respuesta, y suéltelo al terminar — el sistema la convierte en texto automáticamente, como una nota de voz de WhatsApp.' },
  { kw:['paso 1'], a:'El Paso 1 pide elegir un proyecto de inversión pública real y contrastar cómo se habría manejado antes de 2006 frente a lo que exige el marco legal vigente (Ley 498-06 y la reforma de la Ley 45-25). Vale 20 puntos.' },
  { kw:['paso 2'], a:'El Paso 2 pide elegir DOS principios rectores del SNPIP y explicar cómo se aplicarían a su proyecto. Vale 20 puntos.' },
  { kw:['paso 3'], a:'El Paso 3 pide ubicar su proyecto en uno de los 4 ámbitos de aplicación y en uno de los 4 procesos de planificación del SNPIP, con justificación. Vale 25 puntos — es el criterio de mayor peso.' },
  { kw:['paso 4'], a:'El Paso 4 pide identificar con qué instrumento de planificación (END, PNPSP, PEI, plan sectorial o territorial) debería alinearse su proyecto. Vale 15 puntos.' },
  { kw:['paso 5'], a:'El Paso 5 pide redactar un indicador SMART para su proyecto y justificar qué tipo de evaluación (procesos, resultados o impacto) mediría mejor su efecto real. Vale 20 puntos.' },
  { kw:['guardar', 'se guarda', 'perder mis respuestas', 'autoguardado'], a:'Sus respuestas se guardan automáticamente en este navegador (localStorage) mientras escribe. Si cambia de computadora o borra el caché, se perderán — por eso le recomiendo usar "⬇️ Descargar mis respuestas" cuando avance.' },
  { kw:['ejemplo', 'que institucion', 'que proyecto elijo', 'cual proyecto'], a:'Puede usar el proyecto de cualquier institución pública: en el INAPA, un acueducto rural; en un hospital, el remozamiento de una maternidad; en un ayuntamiento, la rehabilitación de caminos vecinales; en un ministerio, la modernización de un sistema. Use el que usted conozca mejor de su propio trabajo.' },
  { kw:['hola', 'ayuda', 'que puedes hacer', 'quien eres'], a:'Soy Nicole, la asistente virtual del Dr. Johan Tapia. Puedo explicarte conceptos de la Unidad I (el SNPIP, su origen, la Ley 498-06, la reforma de la Ley 45-25, los principios rectores, los ámbitos y procesos, monitoreo y evaluación), con ejemplos de distintas instituciones, orientarte sobre qué pide cada paso, o cómo funciona la calificación. Recuerda: se aprueba por completar la práctica, no por la nota.' }
];
'''

html = html.replace(full_old, new_qa)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("PARTE 11 OK, len=", len(html))
