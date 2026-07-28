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

old_contexto = "askTutorAI = function(q){\n  return fetchWithTimeout(AI_CHAT_URL, {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ message: q, contexto:"
# Grab exact original function via anchor on its start signature (function, not var)
old_start = "function askTutorAI(q){\n  return fetchWithTimeout(AI_CHAT_URL, {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ message: q, contexto: '"
idx = html.index(old_start)
# find end of this statement: it ends with "', curso: 'Herramientas de Transformación Digital (INAP)' })"
end_anchor = "', curso: 'Herramientas de Transformación Digital (INAP)' })\n  }, AI_CHAT_TIMEOUT).then(function(res){"
idx_end = html.index(end_anchor, idx)
full_old = html[idx: idx_end + len(end_anchor)]

new_contexto = (
"function askTutorAI(q){\n"
"  return fetchWithTimeout(AI_CHAT_URL, {\n"
"    method: 'POST',\n"
"    headers: { 'Content-Type': 'application/json' },\n"
"    body: JSON.stringify({ message: q, contexto: "
"'MARCO CONCEPTUAL (Unidad I - El Sistema Nacional de Planificacion e Inversion Publica en la Republica Dominicana, curso Fundamentos de Planificacion y Gestion de la Inversion Publica del Estado, CAPGEFI):\\\\n"
"Esta practica aplica a cualquier institucion publica dominicana. Cuando des ejemplos, ofrece varios segun el tipo de institucion: INAPA/agua (acueducto rural, planta de tratamiento), hospital publico (remozamiento de maternidad, equipos medicos), ayuntamiento (rehabilitacion vial, drenaje pluvial), ministerio (modernizacion de sistemas, sede regional), institucion educativa (construccion de escuela, becas).\\\\n"
"SNPIP: Sistema Nacional de Planificacion e Inversion Publica, creado por la Ley 498-06 del 28 de diciembre de 2006 (Art. 1): conjunto de principios, normas, organos y procesos por los que se fijan politicas, objetivos, metas y prioridades del desarrollo economico y social, evaluando su cumplimiento.\\\\n"
"Contexto historico: antes de 2006 regia la Ley 55 de 1965 (Sistema Nacional de Planificacion Economica, Social y Administrativa, Consejo Nacional de Desarrollo), con planificacion centrada en el corto plazo, desarticulada del presupuesto, con escasa participacion ciudadana y debil seguimiento. Fue derogada por el Art. 54 de la Ley 498-06.\\\\n"
"Reforma de 2006: paquete de leyes de modernizacion -- Ley 496-06 (crea la Secretaria de Estado de Economia, Planificacion y Desarrollo, luego MEPyD), Ley 498-06 (crea el SNPIP), Ley 494-06 (crea la Secretaria de Estado de Hacienda). Objetivo: Gestion para Resultados en el Desarrollo (GpRD).\\\\n"
"ACTUALIZACION CLAVE 2025: la Ley 45-25 fusiono el Ministerio de Hacienda con el MEPyD, creando el Ministerio de Hacienda y Economia (MHE), que hoy es el organo rector tanto de las finanzas publicas como del SNPIP (deroga la Ley 496-06). Las funciones de cooperacion internacional y ordenamiento territorial del MEPyD pasaron al Ministerio de la Presidencia.\\\\n"
"Planificar (Carlos Matus): pensar antes de actuar de forma sistematica; lo contrario de improvisar. Definicion operativa: definir metas, estrategia general y planes para integrar y coordinar el trabajo.\\\\n"
"Elementos de la planificacion: mision, vision, objetivos, planes, politicas, procedimientos, programas/proyectos, presupuestos.\\\\n"
"Principios rectores del SNPIP (sintesis didactica de los 11 literales del Art. 3 de la Ley 498-06): jerarquia, complementariedad, coherencia, consistencia, participacion, transparencia, flexibilidad, sostenibilidad.\\\\n"
"Ambitos de aplicacion: Global (END, PNPSP), Institucional (PEI), Sectorial (coordinacion de instituciones afines), Territorial (Consejos Regionales/Provinciales/Municipales, con 10 regiones unicas de planificacion segun la Ley 345-22, 32 provincias + Distrito Nacional, 158 municipios).\\\\n"
"Procesos de planificacion: 1) Direccionamiento estrategico del Estado (END, horizonte 20+ anios), 2) Planificacion institucional y presupuesto (PEI, horizonte 3-4 anios), 3) Proceso de inversion publica (SNIP, ciclo perfil-ejecucion-operacion, horizonte 4 anios), 4) Planificacion territorial.\\\\n"
"Monitoreo y evaluacion: evaluacion de procesos (eficiencia), de resultados (eficacia), de impacto (efectividad). Indicadores SMART: especificos, mensurables, alcanzables, relevantes, temporales.' , curso: 'Fundamentos de Planificacion y Gestion de la Inversion Publica (CAPGEFI)' })\n"
"  }, AI_CHAT_TIMEOUT).then(function(res){"
)

html = html.replace(full_old, new_contexto)
assert new_contexto in html

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("PARTE 10 OK, len=", len(html))
