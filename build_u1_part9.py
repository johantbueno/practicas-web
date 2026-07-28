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

# Medal theme -- tema propio para este curso (CAPGEFI): navy/dorado institucional
rep('''/* Tema visual de la medalla -- relacionado con el TEMA del curso, no con
   la institucion (ver skill inap-practica-autocalificable, registro de
   temas por curso). Transformacion Digital (generico, U1/U2): paleta
   azul/tech. */
var TEMA_MEDALLA = {
  icono: '💠',
  fondo1: '#0f2a4a', fondo2: '#081326',
  medalClaro: '#cfe4fb', medalMedio: '#5b9bd8', medalOscuro: '#2a5f8f',
  laurel: '#5b9bd8',
  eyebrow: 'CERTIFICADO DE FINALIZACIÓN'
};''',
'''/* Tema visual de la medalla -- relacionado con el TEMA del curso, no con
   la institucion (ver skill inap-practica-autocalificable, registro de
   temas por curso). Fundamentos de Planificacion y Gestion de la
   Inversion Publica (CAPGEFI): paleta navy/dorado institucional. */
var TEMA_MEDALLA = {
  icono: '🏛️',
  fondo1: '#003877', fondo2: '#001d3f',
  medalClaro: '#f6e4bd', medalMedio: '#c9982f', medalOscuro: '#8a6a1f',
  laurel: '#c9982f',
  eyebrow: 'CERTIFICADO DE FINALIZACIÓN'
};''', label="TEMA_MEDALLA")

rep("  drawMedal(nombreIdentificacion(), 'Herramientas de Transformación Digital', 'Unidad I · Transformación Digital en la Gestión Pública');",
    "  drawMedal(nombreIdentificacion(), 'Fundamentos de Planificación y Gestión de la Inversión Pública', 'Unidad I · El Sistema Nacional de Planificación e Inversión Pública');",
    label="drawMedal call")

rep("  a.download = 'medalla-' + (name || 'participante') + '-unidad1-htd.png';",
    "  a.download = 'medalla-' + (name || 'participante') + '-unidad1-snpip.png';", label="medal download name")

rep('''  canvas.toBlob(function(blob){
    var file = new File([blob], 'medalla-unidad1-htd.png', { type:'image/png' });
    if(navigator.canShare && navigator.canShare({ files:[file] })){
      navigator.share({ files:[file], title:'¡Completé mi práctica!', text:'Completé la Práctica de la Unidad I del curso Herramientas de Transformación Digital — INAP.' }).catch(function(){});
    } else {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'medalla-unidad1-htd.png';''',
'''  canvas.toBlob(function(blob){
    var file = new File([blob], 'medalla-unidad1-snpip.png', { type:'image/png' });
    if(navigator.canShare && navigator.canShare({ files:[file] })){
      navigator.share({ files:[file], title:'¡Completé mi práctica!', text:'Completé la Práctica de la Unidad I del Diplomado en Hacienda e Inversión Pública — CAPGEFI.' }).catch(function(){});
    } else {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'medalla-unidad1-snpip.png';''', label="medal share")

# exportTxt
rep("  var lines = ['PRÁCTICA — UNIDAD I: Transformación Digital en la Gestión Pública (INAP)', (modoSelect.value === 'grupo' ? 'Equipo' : 'Nombre') + ': ' + (nombreIdentificacion() || '(sin especificar)'), 'Institución: ' + (val('p1_institucion') || '(sin especificar)'), '======================================================', ''];",
    "  var lines = ['PRÁCTICA — UNIDAD I: El Sistema Nacional de Planificación e Inversión Pública (CAPGEFI)', (modoSelect.value === 'grupo' ? 'Equipo' : 'Nombre') + ': ' + (nombreIdentificacion() || '(sin especificar)'), 'Institución: ' + (val('p1_institucion') || '(sin especificar)'), '======================================================', ''];",
    label="exportTxt header")

rep("  var name = (nombreIdentificacion() || 'practica-transformacion-digital-u1').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');\n  a.download = (name || 'practica-transformacion-digital-u1') + '.txt';",
    "  var name = (nombreIdentificacion() || 'practica-hacienda-inversion-u1').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');\n  a.download = (name || 'practica-hacienda-inversion-u1') + '.txt';",
    label="exportTxt filename")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("PARTE 9 OK, len=", len(html))
