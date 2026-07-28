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

# STEP_FIELDS
rep("  paso1: ['p1_institucion','p1_proyecto','p1_antes','p1_reforma'],",
    "  paso1: ['p1_caso','p1_antes','p1_reforma'],", label="STEP_FIELDS paso1")

# gradeStep1
rep('''function gradeStep1(){
  var items = [
    { label:'Institución y proyecto de inversión identificados con claridad', points:4, frac:ratioFilledFrac(['p1_institucion','p1_proyecto']) },
    { label:'Contraste con el sistema anterior a 2006', points:8, frac:singleWordFrac('p1_antes',35) },
    { label:'Exigencias del marco legal vigente (Ley 498-06 / Ley 45-25)', points:8, frac:singleWordFrac('p1_reforma',35) }
  ];
  return buildCriterion(RUBRICA[0].criterio, 20, items);
}''',
'''function gradeStep1(){
  var items = [
    { label:'Caso elegido', points:4, frac:filled(val('p1_caso'))?1:0 },
    { label:'Contraste con el sistema anterior a 2006', points:8, frac:singleWordFrac('p1_antes',35) },
    { label:'Exigencias del marco legal vigente (Ley 498-06 / Ley 45-25)', points:8, frac:singleWordFrac('p1_reforma',35) }
  ];
  return buildCriterion(RUBRICA[0].criterio, 20, items);
}''', label="gradeStep1")

# gatherGradingPayload: institucion ahora se deriva del caso elegido
rep("    institucion: val('p1_institucion') || '',",
    "    institucion: (CASOS[val('p1_caso')] ? CASOS[val('p1_caso')].institucion : '') || '',", label="gatherGradingPayload institucion")

# Agregar CASOS + listener justo antes de "/* ---------- MODALIDAD" (asi ya esta disponible antes de usarse)
anchor = "/* ---------- MODALIDAD: INDIVIDUAL O EN EQUIPO ---------- */"
casos_block = '''/* ---------- CASOS PRECARGADOS (para no obligar a inventar un ejemplo propio) ---------- */
var CASOS = {
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
  }
};
document.getElementById('p1_caso').addEventListener('change', function(){
  var c = CASOS[this.value];
  var box = document.getElementById('p1_caso_desc');
  if(!c){ box.textContent = 'Seleccione un caso arriba para ver su descripción completa aquí.'; return; }
  box.innerHTML = '<strong>' + c.institucion + ' — ' + c.proyecto + '.</strong> ' + c.texto;
  saveAll();
});

'''
idx = html.index(anchor)
html = html[:idx] + casos_block + html[idx:]

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("CASOS PARTE 3 OK, len=", len(html))
