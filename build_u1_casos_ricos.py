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

# ---------- CASOS: reemplazar los 5 objetos completos con version enriquecida (contexto + diagnostico + localidades reales) ----------
old_casos = '''var CASOS = {
  inapa: {
    institucion: 'INAPA (Instituto Nacional de Aguas Potables y Alcantarillados)',
    proyecto: 'Acueducto rural',
    texto: 'Una comunidad rural de unas 800 familias presenta desde hace años una alta incidencia de enfermedades gastrointestinales, sobre todo en niños. La causa identificada es que el agua que consumen proviene de pozos y cañadas sin ningún tratamiento. La comunidad ha pedido, por años, la construcción de un acueducto con planta de tratamiento, pero el proyecto nunca se ha priorizado formalmente dentro del sistema.'
  },
  hospital: {
    institucion: 'Hospital público regional',
    proyecto: 'Remozamiento de la sala de maternidad',
    texto: 'Un hospital público regional atiende un promedio de 40 partos mensuales en una sala de maternidad construida hace 30 años, con equipos médicos obsoletos y capacidad insuficiente para la demanda actual. El personal médico reporta que la infraestructura limita la calidad de la atención y aumenta el riesgo en partos complicados.'
  },
  ayuntamiento: {
    institucion: 'Ayuntamiento municipal',
    proyecto: 'Rehabilitación de caminos vecinales',
    texto: 'Un municipio tiene 15 kilómetros de caminos vecinales que se vuelven intransitables en la temporada de lluvias, aislando a varias comunidades rurales de la cabecera municipal. Esto afecta el traslado de estudiantes a la escuela, el acceso a atención médica de emergencia, y la salida de la producción agrícola local hacia el mercado.'
  },
  ministerio: {
    institucion: 'Ministerio o dirección general',
    proyecto: 'Modernización de un sistema de información institucional',
    texto: 'Una dirección general dentro de un ministerio gestiona sus trámites internos (licencias, certificados, correspondencia) de forma manual, en papel, repartidos entre varias oficinas que no comparten información entre sí. Esto genera demoras de semanas en trámites que deberían resolverse en días, y dificulta cualquier seguimiento o rendición de cuentas sobre el estado de cada expediente.'
  },
  escuela: {
    institucion: 'Institución educativa pública (Ministerio de Educación)',
    proyecto: 'Construcción y rehabilitación de una escuela rural',
    texto: 'Una escuela rural fue construida hace más de 25 años y hoy tiene aulas en mal estado estructural, sin electricidad estable ni baños suficientes. Con el crecimiento de la población escolar de la zona, la escuela ya no tiene capacidad para todos los estudiantes, y varios niños deben caminar más de una hora hacia el centro educativo más cercano con espacio disponible.'
  }
};'''

new_casos = '''var CASOS = {
  inapa: {
    institucion: 'INAPA — Oficina Regional Sur (Barahona)',
    proyecto: 'Acueducto rural para La Ciénaga',
    texto: 'Contexto: La Ciénaga es una comunidad rural de la provincia Barahona, en la región Sur, con cerca de 800 familias dedicadas principalmente a la agricultura de subsistencia. Antecedentes: desde hace más de una década, el abastecimiento de agua depende de pozos artesanales y de una cañada cercana, sin ningún tipo de tratamiento ni cloración. Diagnóstico: el centro de salud local reporta que las enfermedades gastrointestinales, sobre todo en niños menores de cinco años, se mantienen entre las tres primeras causas de consulta durante todo el año, y se agravan en la temporada de lluvias por la contaminación de las fuentes superficiales. Actores clave: la comunidad, organizada en una junta de vecinos, ha solicitado en reiteradas ocasiones ante el ayuntamiento y ante INAPA la construcción de un acueducto con planta de tratamiento, pero el proyecto nunca ha sido formalmente priorizado ni incorporado a un instrumento de planificación.'
  },
  hospital: {
    institucion: 'Hospital Municipal de El Cercado (San Juan)',
    proyecto: 'Remozamiento de la sala de maternidad',
    texto: 'Contexto: El Cercado es un municipio de la provincia San Juan, en la región Sur, cuyo hospital municipal es el único centro de referencia para varias secciones rurales de los alrededores. Antecedentes: la sala de maternidad fue construida hace 30 años y no ha recibido una intervención mayor desde entonces. Diagnóstico: el centro atiende un promedio de 40 partos mensuales, con equipos médicos obsoletos, capacidad física insuficiente para la demanda actual, y sin un área separada para atender complicaciones obstétricas. Actores clave: el personal médico y de enfermería reporta que las condiciones de infraestructura limitan la calidad de la atención y aumentan el riesgo en partos complicados, mientras que las autoridades de salud regionales han señalado este centro como prioritario en sus diagnósticos internos, sin que hasta ahora se haya formulado un proyecto de inversión pública formal.'
  },
  ayuntamiento: {
    institucion: 'Ayuntamiento Municipal de Vallejuelo (San Juan)',
    proyecto: 'Rehabilitación de los caminos vecinales de Cutupú, Jarumucú y El Puñal',
    texto: 'Contexto: Cutupú, Jarumucú y El Puñal son tres secciones rurales del municipio de Vallejuelo, provincia San Juan, en la Sierra de Neiba, dedicadas principalmente al cultivo de habichuela y guandul. Antecedentes: los aproximadamente 15 kilómetros de caminos vecinales que conectan estas comunidades con la carretera principal nunca han recibido una intervención formal de pavimentación o drenaje. Diagnóstico: en la temporada de lluvias, los caminos se vuelven intransitables durante semanas, lo que aísla a cerca de 1,200 habitantes de la cabecera municipal. Esto afecta directamente el traslado diario de los estudiantes a la escuela, el acceso oportuno a atención médica de emergencia, y la salida de la producción agrícola local hacia los mercados de San Juan de la Maguana. Actores clave: los munícipes, a través de sus juntas de vecinos, han planteado esta necesidad en los presupuestos participativos municipales de los últimos años, sin que el ayuntamiento haya logrado priorizarla dentro de su cartera de inversión.'
  },
  ministerio: {
    institucion: 'Dirección Regional Sur de un Ministerio (sede en San Juan de la Maguana)',
    proyecto: 'Modernización del sistema de información institucional',
    texto: 'Contexto: la Dirección Regional Sur de un ministerio, con sede en San Juan de la Maguana, atiende trámites de varias provincias vecinas (San Juan, Elías Piña, Azua). Antecedentes: desde su creación, la dirección ha gestionado sus trámites internos (licencias, certificados, correspondencia) de forma manual y en papel, repartidos entre varias oficinas que no comparten información entre sí. Diagnóstico: un trámite que en teoría debería resolverse en 5 días hábiles toma, en la práctica, entre 3 y 6 semanas, según reportes de los propios usuarios y de auditorías internas recientes. Actores clave: el personal técnico de la dirección reconoce que la falta de un sistema de información integrado dificulta cualquier seguimiento o rendición de cuentas sobre el estado real de cada expediente, y ha solicitado en varias ocasiones a la sede central una modernización tecnológica de sus procesos.'
  },
  escuela: {
    institucion: 'Escuela Básica Rural de Guananico (Puerto Plata) — Ministerio de Educación',
    proyecto: 'Construcción y rehabilitación de la escuela rural',
    texto: 'Contexto: Guananico es un municipio de la provincia Puerto Plata, en la región Norte, cuya escuela básica rural es el único centro educativo disponible para varias comunidades de los alrededores. Antecedentes: la edificación fue construida hace más de 25 años y no ha recibido mantenimiento estructural mayor desde entonces. Diagnóstico: hoy presenta aulas con daños estructurales visibles, sin electricidad estable, y con baños insuficientes para la matrícula actual. Con el crecimiento de la población escolar de la zona en los últimos años, la escuela ya no tiene capacidad para todos los estudiantes en edad de asistir, y varios niños deben caminar más de una hora hacia el centro educativo más cercano con espacio disponible. Actores clave: la asociación de padres, madres y amigos de la escuela (APMAE) ha documentado esta situación ante el distrito educativo, que a su vez la ha remitido a la sede central del Ministerio de Educación como parte de su diagnóstico de infraestructura escolar pendiente.'
  }
};'''

rep(old_casos, new_casos, label="CASOS enriquecidos")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("CASOS RICOS OK, len=", len(html))
