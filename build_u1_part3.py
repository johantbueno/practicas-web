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

# ---------- TUTORIAL ----------
rep('<p><strong>Concepto:</strong> esta práctica se realiza <strong>después de revisar el material de estudio de la Unidad I</strong>. Tiene 5 pasos, cada uno con su concepto, una guía de llenado y espacio para sus respuestas — puede escribir directamente o grabar una nota de voz.</p>',
    '<p><strong>Concepto:</strong> esta práctica se realiza <strong>después de revisar el material de estudio de la Unidad I: El Sistema Nacional de Planificación e Inversión Pública</strong>. Tiene 5 pasos, cada uno con su concepto, una guía de llenado y espacio para sus respuestas — puede escribir directamente o grabar una nota de voz.</p>',
    label="tutorial concepto")

# ---------- ANTES DE EMPEZAR ----------
rep('''      <div class="alert info">
        <strong>Objetivo de la actividad:</strong> realizar un diagnóstico preliminar del estado de madurez digital de un proceso administrativo de su institución, y explorar la aplicación de Inteligencia Artificial Generativa para su optimización, aplicando los conceptos vistos en el material de estudio de la Unidad I.
      </div>
      <div class="alert gold">
        <strong>Fundamento normativo:</strong> Decreto No. 230-18 (Gobierno Electrónico y Estrategia Nacional de Ciberseguridad), Agenda Digital 2030, Ley No. 172-13 (Protección de Datos Personales), Ley No. 167-21 (Mejora Regulatoria y Simplificación de Trámites), Ley No. 200-04 (Libre Acceso a la Información Pública) y la Recomendación UNESCO 2021 sobre la Ética de la Inteligencia Artificial.
      </div>''',
    '''      <div class="alert info">
        <strong>Objetivo de la actividad:</strong> aplicar los conceptos de origen, principios rectores, ámbitos de aplicación, procesos y monitoreo del Sistema Nacional de Planificación e Inversión Pública (SNPIP) a un proyecto de inversión pública real de su institución, aplicando los conceptos vistos en el material de estudio de la Unidad I.
      </div>
      <div class="alert gold">
        <strong>Fundamento normativo:</strong> Ley No. 498-06 (crea el SNPIP), Ley No. 496-06 (creó el MEPyD, derogada por la Ley 45-25), Ley No. 45-25 de 2025 (fusiona Hacienda y el MEPyD en el actual Ministerio de Hacienda y Economía), y las Normas Técnicas del Sistema Nacional de Inversión Pública (2017).
      </div>''', label="antes de empezar")

rep('''        <li>Revise el <strong>material de estudio de la Unidad I: Transformación Digital en la Gestión Pública</strong> antes de responder — esta práctica retoma directamente sus conceptos.</li>
        <li>Elija si van a trabajar <strong>individual o en equipo</strong>, arriba, y luego seleccionen un <strong>proceso administrativo o trámite real</strong> de su institución para mantenerlo como referencia durante los 5 pasos.</li>
        <li>Completen los <strong>5 pasos</strong> en el orden indicado, por escrito o por nota de voz — si trabajan en equipo, decidan entre todos qué escribir en cada campo.</li>
        <li>En el Paso 3, usen efectivamente una herramienta de IA Generativa (ChatGPT, Copilot o Gemini) y describan el prompt y la respuesta obtenida.</li>
        <li>Al finalizar, presionen <strong>Enviar y Calificar</strong>: el sistema revisará el trabajo y dará una nota preliminar orientativa y retroalimentación inmediata.</li>''',
    '''        <li>Revise el <strong>material de estudio de la Unidad I: El Sistema Nacional de Planificación e Inversión Pública</strong> (video o sesión presencial) antes de responder — esta práctica retoma directamente sus conceptos.</li>
        <li>Elija si van a trabajar <strong>individual o en equipo</strong>, arriba, y luego seleccionen un <strong>proyecto de inversión pública real</strong> de su institución para mantenerlo como referencia durante los 5 pasos.</li>
        <li>Completen los <strong>5 pasos</strong> en el orden indicado, por escrito o por nota de voz — si trabajan en equipo, decidan entre todos qué escribir en cada campo.</li>
        <li>En el Paso 3, ubiquen su proyecto en los cuatro ámbitos de aplicación del SNPIP y en el proceso correspondiente.</li>
        <li>Al finalizar, presionen <strong>Enviar y Calificar</strong>: el sistema revisará el trabajo y dará una nota preliminar orientativa y retroalimentación inmediata.</li>''', label="instrucciones generales")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("PARTE 3 OK, len=", len(html))
