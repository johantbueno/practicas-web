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

rep('''function gradeStep1(){
  var items = [
    { label:'Institución y proceso/trámite identificados con claridad', points:4, frac:ratioFilledFrac(['p1_institucion','p1_tramite']) },
    { label:'Descripción real del funcionamiento actual del proceso', points:6, frac:singleWordFrac('p1_descripcion',40) },
    { label:'Herramientas físicas o digitales utilizadas', points:4, frac:singleWordFrac('p1_herramientas',15) },
    { label:'Fricciones concretas identificadas', points:6, frac:singleWordFrac('p1_friccion',30) }
  ];
  return buildCriterion(RUBRICA[0].criterio, 20, items);
}
function gradeStep2(){
  var items = [
    { label:'Nivel de madurez digital seleccionado', points:5, frac:filled(val('p2_nivel'))?1:0 },
    { label:'Explicación de por qué eligió esa opción', points:10, frac:singleWordFrac('p2_justificacion',25) }
  ];
  return buildCriterion(RUBRICA[1].criterio, 15, items);
}
function gradeStep3(){
  var items = [
    { label:'Herramienta de IA Generativa identificada', points:3, frac:filled(val('p3_herramienta'))?1:0 },
    { label:'Prompt efectivo transcrito', points:9, frac:singleWordFrac('p3_prompt',30) },
    { label:'Cuellos de botella identificados por la IA', points:6, frac:singleWordFrac('p3_cuellos',20) },
    { label:'Propuesta de automatización obtenida', points:6, frac:singleWordFrac('p3_automatizacion',30) },
    { label:'Guion para la dirección institucional', points:6, frac:singleWordFrac('p3_guion',30) }
  ];
  return buildCriterion(RUBRICA[2].criterio, 30, items);
}
function gradeStep4(){
  var items = [
    { label:'Normativa dominicana identificada', points:5, frac:filled(val('p4_normativa'))?1:0 },
    { label:'Justificación de cómo respalda la mejora propuesta', points:10, frac:singleWordFrac('p4_justificacion',35) }
  ];
  return buildCriterion(RUBRICA[3].criterio, 15, items);
}
function gradeStep5(){
  var items = [
    { label:'Riesgos de sesgo o privacidad identificados', points:10, frac:singleWordFrac('p5_riesgos',40) },
    { label:'Mitigación bajo los principios UNESCO', points:10, frac:singleWordFrac('p5_mitigacion',40) }
  ];
  return buildCriterion(RUBRICA[4].criterio, 20, items);
}''',
'''function gradeStep1(){
  var items = [
    { label:'Institución y proyecto de inversión identificados con claridad', points:4, frac:ratioFilledFrac(['p1_institucion','p1_proyecto']) },
    { label:'Contraste con el sistema anterior a 2006', points:8, frac:singleWordFrac('p1_antes',35) },
    { label:'Exigencias del marco legal vigente (Ley 498-06 / Ley 45-25)', points:8, frac:singleWordFrac('p1_reforma',35) }
  ];
  return buildCriterion(RUBRICA[0].criterio, 20, items);
}
function gradeStep2(){
  var items = [
    { label:'Dos principios rectores seleccionados', points:6, frac:ratioFilledFrac(['p2_principio1','p2_principio2']) },
    { label:'Aplicación coherente de ambos principios al proyecto', points:14, frac:singleWordFrac('p2_aplicacion',50) }
  ];
  return buildCriterion(RUBRICA[1].criterio, 20, items);
}
function gradeStep3(){
  var items = [
    { label:'Ámbito de aplicación y proceso del SNPIP seleccionados', points:8, frac:ratioFilledFrac(['p3_ambito','p3_proceso']) },
    { label:'Justificación de ambas elecciones con el proyecto concreto', points:17, frac:singleWordFrac('p3_justificacion',50) }
  ];
  return buildCriterion(RUBRICA[2].criterio, 25, items);
}
function gradeStep4(){
  var items = [
    { label:'Instrumento de planificación identificado', points:5, frac:filled(val('p4_instrumento'))?1:0 },
    { label:'Vínculo explicado entre el proyecto y ese instrumento', points:10, frac:singleWordFrac('p4_vinculo',35) }
  ];
  return buildCriterion(RUBRICA[3].criterio, 15, items);
}
function gradeStep5(){
  var items = [
    { label:'Indicador SMART bien formulado (cantidad, lugar, plazo)', points:10, frac:singleWordFrac('p5_indicador',25) },
    { label:'Tipo de evaluación identificado y justificado', points:10, frac:singleWordFrac('p5_tipo_evaluacion',30) }
  ];
  return buildCriterion(RUBRICA[4].criterio, 20, items);
}''', label="gradeStepN")

rep("    curso: 'transformacion-digital',\n    unidad: 'u1',",
    "    curso: 'hacienda-inversion-publica',\n    unidad: 'u1',", label="gatherGradingPayload curso/unidad")

rep("    institucion: val('p1_institucion') || '',",
    "    institucion: val('p1_institucion') || '',", n=1, label="institucion noop")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("PARTE 8 OK, len=", len(html))
