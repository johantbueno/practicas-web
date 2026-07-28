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

# ---------- Tabla de presentacion de casos: 4 -> 5 (agrega Educacion) ----------
rep('''      <div class="alert info">
        Para que pueda enfocarse en aplicar los conceptos del SNPIP (y no en inventar un ejemplo desde cero), esta práctica le presenta <strong>4 casos reales ya redactados</strong>. En el Paso 1 va a elegir uno y trabajar sobre ese mismo caso durante los 5 pasos.
      </div>
      <div class="tbl-wrap"><table class="tp-table">
        <thead><tr><th>Caso</th><th>Resumen</th></tr></thead>
        <tbody>
          <tr><td class="label-cell">1. INAPA — Acueducto rural</td><td>Comunidad rural con enfermedades gastrointestinales por agua sin tratar.</td></tr>
          <tr><td class="label-cell">2. Hospital público — Maternidad</td><td>Sala de maternidad con equipos obsoletos y alta demanda de partos.</td></tr>
          <tr><td class="label-cell">3. Ayuntamiento — Caminos vecinales</td><td>Caminos rurales intransitables en época de lluvia, aislando varias comunidades.</td></tr>
          <tr><td class="label-cell">4. Ministerio — Modernización institucional</td><td>Trámites internos manuales, lentos y sin seguimiento, entre varias direcciones.</td></tr>
        </tbody>
      </table></div>
      <p>No hace falta pensar en su propia institución ni inventar datos — el caso que elija ya trae toda la información necesaria para responder los 5 pasos.</p>''',
    '''      <div class="alert info">
        Para que pueda enfocarse en aplicar los conceptos del SNPIP (y no en inventar un ejemplo desde cero), esta práctica le presenta <strong>5 casos reales ya redactados</strong>, de distintos sectores. En el Paso 1 va a elegir uno y trabajar sobre ese mismo caso durante los 5 pasos.
      </div>
      <div class="tbl-wrap"><table class="tp-table">
        <thead><tr><th>Sector</th><th>Caso</th><th>Resumen</th></tr></thead>
        <tbody>
          <tr><td class="label-cell">Agua y Saneamiento</td><td>INAPA — Acueducto rural</td><td>Comunidad rural con enfermedades gastrointestinales por agua sin tratar.</td></tr>
          <tr><td class="label-cell">Salud</td><td>Hospital público — Maternidad</td><td>Sala de maternidad con equipos obsoletos y alta demanda de partos.</td></tr>
          <tr><td class="label-cell">Educación</td><td>Escuela rural</td><td>Escuela con aulas en mal estado y sobrecupo, sin espacio para todos los estudiantes de la zona.</td></tr>
          <tr><td class="label-cell">Construcción / Infraestructura</td><td>Ayuntamiento — Caminos vecinales</td><td>Caminos rurales intransitables en época de lluvia, aislando varias comunidades.</td></tr>
          <tr><td class="label-cell">Tecnología</td><td>Ministerio — Modernización institucional</td><td>Trámites internos manuales, lentos y sin seguimiento, entre varias direcciones.</td></tr>
        </tbody>
      </table></div>
      <p>No hace falta pensar en su propia institución ni inventar datos — el caso que elija ya trae toda la información necesaria para responder los 5 pasos.</p>''', label="tabla 5 casos")

# ---------- Paso 1: select + alert text (4 -> 5 casos) ----------
rep('<div class="alert info"><strong>Guía:</strong> elija UNO de los 4 casos. Léalo con calma — con este mismo caso va a trabajar los 5 pasos de la práctica, no hace falta que use datos de su propia institución.</div>',
    '<div class="alert info"><strong>Guía:</strong> elija UNO de los 5 casos, del sector que prefiera. Léalo con calma — con este mismo caso va a trabajar los 5 pasos de la práctica, no hace falta que use datos de su propia institución.</div>',
    label="paso1 alert 5 casos")

rep('''        <select id="p1_caso">
          <option value="">Seleccione un caso…</option>
          <option value="inapa">Caso 1 — INAPA: Acueducto rural</option>
          <option value="hospital">Caso 2 — Hospital público: Maternidad</option>
          <option value="ayuntamiento">Caso 3 — Ayuntamiento: Caminos vecinales</option>
          <option value="ministerio">Caso 4 — Ministerio: Modernización institucional</option>
        </select>''',
    '''        <select id="p1_caso">
          <option value="">Seleccione un caso…</option>
          <option value="inapa">Agua y Saneamiento — INAPA: Acueducto rural</option>
          <option value="hospital">Salud — Hospital público: Maternidad</option>
          <option value="escuela">Educación — Escuela rural</option>
          <option value="ayuntamiento">Construcción — Ayuntamiento: Caminos vecinales</option>
          <option value="ministerio">Tecnología — Ministerio: Modernización institucional</option>
        </select>''', label="select 5 casos")

# ---------- CASOS object: agregar caso "escuela" ----------
rep('''  ministerio: {
    institucion: 'Ministerio o dirección general',
    proyecto: 'Modernización de un sistema de información institucional',
    texto: 'Una dirección general dentro de un ministerio gestiona sus trámites internos (licencias, certificados, correspondencia) de forma manual, en papel, repartidos entre varias oficinas que no comparten información entre sí. Esto genera demoras de semanas en trámites que deberían resolverse en días, y dificulta cualquier seguimiento o rendición de cuentas sobre el estado de cada expediente.'
  }
};''',
    '''  ministerio: {
    institucion: 'Ministerio o dirección general',
    proyecto: 'Modernización de un sistema de información institucional',
    texto: 'Una dirección general dentro de un ministerio gestiona sus trámites internos (licencias, certificados, correspondencia) de forma manual, en papel, repartidos entre varias oficinas que no comparten información entre sí. Esto genera demoras de semanas en trámites que deberían resolverse en días, y dificulta cualquier seguimiento o rendición de cuentas sobre el estado de cada expediente.'
  },
  escuela: {
    institucion: 'Institución educativa pública (Ministerio de Educación)',
    proyecto: 'Construcción y rehabilitación de una escuela rural',
    texto: 'Una escuela rural fue construida hace más de 25 años y hoy tiene aulas en mal estado estructural, sin electricidad estable ni baños suficientes. Con el crecimiento de la población escolar de la zona, la escuela ya no tiene capacidad para todos los estudiantes, y varios niños deben caminar más de una hora hacia el centro educativo más cercano con espacio disponible.'
  }
};''', label="CASOS agregar escuela")

with io.open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("CASOS PARTE 4 OK, len=", len(html))
