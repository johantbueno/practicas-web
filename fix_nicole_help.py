# -*- coding: utf-8 -*-
import io, glob

old = '''          <strong>¿Tiene dudas mientras trabaja?</strong><br>
          Puede escribirle a Nicole, la asistente virtual del Dr. Johan Tapia, en
          <a href="https://prof.johan.plataforma.cfd/" target="_blank" rel="noopener">prof.johan.plataforma.cfd</a>,
          o usar el botón "🎓 Nicole" de esta misma página.'''

new = '''          <strong>¿Tiene dudas mientras trabaja?</strong><br>
          Puede preguntarle a <strong>Nicole</strong>, el asistente de esta misma página (botón "🎓 Nicole" abajo a la izquierda), o escribirle al
          <strong>Prof. Johan Tapia</strong>, un asistente aparte, en
          <a href="https://prof.johan.plataforma.cfd/" target="_blank" rel="noopener">prof.johan.plataforma.cfd</a>.'''

files = glob.glob(r"D:\Temp\claude\scratch_practicas\practicas-web\*\index.html")
changed = []
for path in files:
    with io.open(path, encoding="utf-8") as f:
        html = f.read()
    if old in html:
        html = html.replace(old, new)
        with io.open(path, "w", encoding="utf-8") as f:
            f.write(html)
        changed.append(path)

print("Changed files:", len(changed))
for p in changed:
    print(" -", p)
