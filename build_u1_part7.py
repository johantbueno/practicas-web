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
rep('''var STEP_FIELDS = {
  paso1: ['p1_institucion','p1_tramite','p1_descripcion','p1_herramientas','p1_friccion'],
  paso2: ['p2_nivel','p2_justificacion'],
  paso3: ['p3_herramienta','p3_prompt','p3_cuellos','p3_automatizacion','p3_guion'],
  paso4: ['p4_normativa','p4_justificacion'],
  paso5: ['p5_riesgos','p5_mitigacion']
};''',
'''var STEP_FIELDS = {
  paso1: ['p1_institucion','p1_proyecto','p1_antes','p1_reforma'],
  paso2: ['p2_principio1','p2_principio2','p2_aplicacion'],
  paso3: ['p3_ambito','p3_proceso','p3_justificacion'],
  paso4: ['p4_instrumento','p4_vinculo'],
  paso5: ['p5_indicador','p5_tipo_evaluacion']
};''', label="STEP_FIELDS")

# STORE_KEY / TIMER_KEY / SOUND_MUTE_KEY / theme key / fontsize key
rep("var STORE_KEY = 'tp_tdu1_respuestas_v1';", "var STORE_KEY = 'tp_hiu1_respuestas_v1';", label="STORE_KEY")
rep("var TIMER_KEY = 'tp_tdu1_deadline';", "var TIMER_KEY = 'tp_hiu1_deadline';", label="TIMER_KEY")
rep("var SOUND_MUTE_KEY = 'tp_htd_sound_muted';", "var SOUND_MUTE_KEY = 'tp_hi_sound_muted';", label="SOUND_MUTE_KEY")
rep("var TIMER_MINUTES = 120;", "var TIMER_MINUTES = 60;", label="TIMER_MINUTES")
rep("localStorage.setItem('tp_tdu1_fontsize', level);", "localStorage.setItem('tp_hiu1_fontsize', level);", label="fontsize set")
rep("applyFontSize(localStorage.getItem('tp_tdu1_fontsize') || 'normal');", "applyFontSize(localStorage.getItem('tp_hiu1_fontsize') || 'normal');", label="fontsize get")
rep("localStorage.setItem('tp_tdu1_theme', t);", "localStorage.setItem('tp_hiu1_theme', t);", label="theme set")
rep("applyTheme(localStorage.getItem('tp_tdu1_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));",
    "applyTheme(localStorage.getItem('tp_hiu1_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));", label="theme get")
rep("a.download = 'qr-practica-unidad1-htd.png';", "a.download = 'qr-practica-unidad1-hacienda-inversion.png';", label="qr filename")

# RUBRICA array
rep('''var RUBRICA = [
  {n:1, criterio:'Diagnóstico de Proceso (Paso 1)', indicador:'Proceso identificado, descripción real del funcionamiento actual, herramientas utilizadas y fricciones concretas.', pts:20},
  {n:2, criterio:'Clasificación de Madurez Digital (Paso 2)', indicador:'Nivel de madurez seleccionado con justificación basada en las características técnicas de la etapa.', pts:15},
  {n:3, criterio:'Laboratorio de Inteligencia Artificial (Paso 3)', indicador:'Prompt efectivo, cuellos de botella, propuesta de automatización y guion para la dirección, evidenciados.', pts:30},
  {n:4, criterio:'Análisis Normativo (Paso 4)', indicador:'Normativa dominicana identificada y justificación de cómo respalda la mejora propuesta.', pts:15},
  {n:5, criterio:'Reflexión Ética (Paso 5)', indicador:'Riesgos de sesgo/privacidad identificados y mitigación bajo los principios UNESCO.', pts:20}
];''',
'''var RUBRICA = [
  {n:1, criterio:'Origen del Sistema y Proyecto de Referencia (Paso 1)', indicador:'Proyecto identificado, contraste real entre el sistema anterior a 2006 y las exigencias vigentes (Ley 498-06 / Ley 45-25).', pts:20},
  {n:2, criterio:'Principios Rectores Aplicados (Paso 2)', indicador:'Dos principios seleccionados y aplicados con coherencia al proyecto concreto.', pts:20},
  {n:3, criterio:'Ámbitos y Procesos de Planificación (Paso 3)', indicador:'Ámbito y proceso del SNPIP identificados y justificados correctamente para el proyecto.', pts:25},
  {n:4, criterio:'Vínculo con Instrumentos de Planificación (Paso 4)', indicador:'Instrumento de planificación identificado y vínculo explicado con el proyecto.', pts:15},
  {n:5, criterio:'Monitoreo y Evaluación (Paso 5)', indicador:'Indicador SMART bien formulado y tipo de evaluación justificado.', pts:20}
];''', label="RUBRICA")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("PARTE 7 OK, len=", len(html))
