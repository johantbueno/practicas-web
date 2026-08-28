(function () {
  "use strict";

  var CAMPOS = [
    "direccionRegional", "empresa", "nombreCapacitacion", "objetivo",
    "poblacion", "contenido", "cargaHoraria", "perfilFacilitador", "recursos"
  ];
  var FECHAS = ["fechaContraparte", "fechaFacilitador", "fechaAsesor"];
  var FIRMAS = ["Contraparte", "Facilitador", "Asesor"];

  var EJEMPLO = {
    direccionRegional: "",
    empresa: "Amicus Realty, SRL — Programa TECI (Tiempo de Expansión y Crecimiento Integral)",
    nombreCapacitacion: "Capacitación Puntual CP 26-1538 - Inteligencia Artificial Aplicada Al Marketing Digital - 20261603660",
    objetivo: "Al finalizar la capacitación, los participantes estarán en capacidad de diseñar y operar una estrategia de marketing inmobiliario digital asistida por Inteligencia Artificial, produciendo contenido de alto impacto, automatizando la captación y el seguimiento de prospectos, y organizando su cartera comercial en un sistema de seguimiento medible, aplicable de inmediato a su gestión diaria en el mercado dominicano.",
    poblacion: "Asesores inmobiliarios de Amicus Realty, SRL, usuarios básicos de redes sociales y sin conocimientos técnicos previos en Inteligencia Artificial.",
    contenido:
      "Módulo I. Estrategia y marca personal: el nuevo comprador inmobiliario dominicano, recorrido digital del cliente, definición de nicho (matriz Zona x Tipo de propiedad x Cliente), promesa de valor, ficha de cliente ideal, ética en el uso de IA.\n" +
      "Módulo II. Inteligencia Artificial aplicada: contenido que capta y vende: anatomía del prompt profesional (Rol, Contexto, Tarea, Formato, Tono, Restricciones), comparativa ChatGPT/Gemini/Claude/Perplexity, descripciones de propiedad, guiones de video, calendario de contenido 30 días, diseño de piezas gráficas en Canva.\n" +
      "Módulo III. Producción de video y presencia digital: grabación con celular, edición en CapCut (cortes, música, subtítulos automáticos), generación de video de propiedad a partir de fotos sin cámara, ética del video generado con IA.\n" +
      "Módulo IV. Automatización, CRM y publicidad digital: programación de publicaciones (Meta Business Suite, Metricool), configuración de WhatsApp Business, CRM con embudo de 5 etapas, secuencias de seguimiento con IA, nociones de publicidad en Meta Ads.\n" +
      "Integración final: vitrina del Portafolio Comercial Digital, diagnóstico de fallos y Plan de Acción de 90 días.",
    cargaHoraria: "60 horas",
    perfilFacilitador: "Profesional del área de Marketing Digital y/o Tecnología, con especialización o experiencia comprobada en herramientas de Inteligencia Artificial aplicadas al sector inmobiliario. Experiencia laboral y docente mínima de un (1) año.",
    recursos: "Plataforma de videoconferencia con salas de grupo y grabación (Zoom/Teams), conexión a internet estable, teléfono inteligente con al menos 5 GB libres, cuenta de Google activa, presentaciones digitales, guías visuales descargables, plantillas de trabajo (Declaración de Marca, Calendario de Contenido, CRM en Google Sheets, Plan de Acción de 90 días) y herramientas de IA gratuitas (ChatGPT, Gemini, Claude, Perplexity, Canva, CapCut)."
  };

  var INSTRUCTIVO = [
    ["Dirección Regional", "Se escribe el nombre de la Dirección Regional que presta el servicio."],
    ["Nombre de la Empresa", "Se escribe el nombre de la empresa o institución."],
    ["Nombre de la Capacitación", "Se escribe el nombre de la acción de capacitación."],
    ["Objetivo de la Capacitación", "Se escribe el objetivo que se persigue lograr con la acción de capacitación."],
    ["Población Enfocada", "Se describe a quién(es) va dirigida la acción de capacitación."],
    ["Contenido de la Capacitación", "Se escriben los temas y subtemas que componen los módulos de la acción de capacitación."],
    ["Carga Horaria", "Se escribe la cantidad de horas que dura la acción de capacitación."],
    ["Perfil del Facilitador", "Se describen los requisitos de formación y/o experiencia laboral y experiencia docente, entre otras cualidades que se determine con la contraparte."],
    ["Recursos Didácticos y Logísticos", "Se describen los recursos que se requieran para la realización de la acción de capacitación."],
    ["Firma de la Contraparte de la Empresa y Fecha", "La Contraparte de la institución escribe firma y fecha para validar el diseño."],
    ["Firma del Facilitador y Fecha", "El facilitador escribe firma y fecha luego de verificar el diseño de la acción de capacitación."],
    ["Firma del Asesor y Fecha", "El asesor escribe firma y fecha luego de revisar el diseño de la acción de capacitación."]
  ];

  var firmas = { Contraparte: null, Facilitador: null, Asesor: null };

  function $(id) { return document.getElementById(id); }

  function fechaLegible(iso) {
    if (!iso) return "";
    var partes = iso.split("-");
    if (partes.length !== 3) return iso;
    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }

  function actualizarPreview() {
    CAMPOS.forEach(function (id) {
      var el = document.querySelector('[data-campo="' + id + '"]');
      var valor = $(id).value.trim();
      if (valor) {
        el.textContent = valor;
        el.classList.remove("vacio");
      } else {
        el.textContent = "—";
        el.classList.add("vacio");
      }
    });
    FECHAS.forEach(function (id) {
      var el = document.querySelector('[data-campo-fecha="' + id + '"]');
      var valor = $(id).value;
      el.textContent = "Fecha: " + (valor ? fechaLegible(valor) : "—");
    });
  }

  function cargarDatos(datos) {
    CAMPOS.forEach(function (id) { $(id).value = datos[id] || ""; });
    actualizarPreview();
  }

  function vaciarFormulario() {
    CAMPOS.forEach(function (id) { $(id).value = ""; });
    FECHAS.forEach(function (id) { $(id).value = ""; });
    FIRMAS.forEach(quitarFirma);
    actualizarPreview();
    estado("Formulario vacío.", false);
  }

  function estado(msg, esError) {
    var el = $("estado");
    el.textContent = msg;
    el.className = esError ? "err" : "ok";
  }

  function leerArchivoComoDataURL(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function base64ABytes(base64) {
    var binario = atob(base64);
    var bytes = new Uint8Array(binario.length);
    for (var i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    return bytes;
  }

  function quitarFirma(nombre) {
    firmas[nombre] = null;
    var input = $("firma" + nombre + "File");
    if (input) input.value = "";
    var previa = $("firma" + nombre + "Preview");
    if (previa) previa.style.display = "none";
    var quitarBtn = $("firma" + nombre + "Quitar");
    if (quitarBtn) quitarBtn.style.display = "none";
    var prevImg = $("prevFirma" + nombre);
    if (prevImg) prevImg.style.display = "none";
  }

  function inicializarFirma(nombre) {
    var input = $("firma" + nombre + "File");
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      leerArchivoComoDataURL(file).then(function (dataUrl) {
        var tipo = file.type.indexOf("png") !== -1 ? "png" : "jpg";
        var base64 = dataUrl.split(",")[1];
        firmas[nombre] = { dataUrl: dataUrl, bytes: base64ABytes(base64), tipo: tipo };

        var previa = $("firma" + nombre + "Preview");
        previa.querySelector("img").src = dataUrl;
        previa.style.display = "block";
        $("firma" + nombre + "Quitar").style.display = "inline";

        var prevImg = $("prevFirma" + nombre);
        prevImg.src = dataUrl;
        prevImg.style.display = "inline-block";
      });
    });
    $("firma" + nombre + "Quitar").addEventListener("click", function () { quitarFirma(nombre); });
  }

  function lineasNoVacias(texto) {
    return texto.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
  }

  async function generarDocx() {
    var D = window.DocxLib;
    var val = {};
    CAMPOS.forEach(function (id) { val[id] = $(id).value.trim(); });
    var fechas = {};
    FECHAS.forEach(function (id) { fechas[id] = $(id).value; });

    var logoBytes = base64ABytes(window.LOGO_BASE64);

    function tablaEncabezado() {
      return new D.Table({
        width: { size: 100, type: D.WidthType.PERCENTAGE },
        borders: {
          top: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideHorizontal: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideVertical: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" }
        },
        rows: [
          new D.TableRow({
            children: [
              new D.TableCell({
                width: { size: 50, type: D.WidthType.PERCENTAGE },
                verticalAlign: D.VerticalAlign.CENTER,
                children: [new D.Paragraph({
                  children: [new D.ImageRun({
                    data: logoBytes,
                    type: "jpg",
                    transformation: { width: 130, height: 86 }
                  })]
                })]
              }),
              new D.TableCell({
                width: { size: 50, type: D.WidthType.PERCENTAGE },
                verticalAlign: D.VerticalAlign.CENTER,
                children: [
                  new D.Paragraph({ alignment: D.AlignmentType.RIGHT, children: [new D.TextRun({ text: "RT-02-PT-ONA-040:2025", bold: true })] }),
                  new D.Paragraph({ alignment: D.AlignmentType.RIGHT, children: [new D.TextRun({ text: "Edición 9", bold: true })] })
                ]
              })
            ]
          })
        ]
      });
    }

    function campoParrafos(etiqueta, valor) {
      var parrafos = [new D.Paragraph({ spacing: { before: 200 }, children: [new D.TextRun({ text: etiqueta + ":", bold: true })] })];
      var lineas = valor ? lineasNoVacias(valor) : [];
      if (lineas.length === 0) {
        parrafos.push(new D.Paragraph({ children: [new D.TextRun({ text: " " })] }));
      } else {
        lineas.forEach(function (linea) {
          parrafos.push(new D.Paragraph({ children: [new D.TextRun({ text: linea })] }));
        });
      }
      return parrafos;
    }

    function campoLineaUnica(etiqueta, valor) {
      return new D.Paragraph({
        spacing: { before: 200 },
        children: [
          new D.TextRun({ text: etiqueta + ": ", bold: true }),
          new D.TextRun({ text: valor || "" })
        ]
      });
    }

    function bloqueFirma(nombre, etiqueta, fechaISO) {
      var hijos = [];
      var firma = firmas[nombre];
      if (firma) {
        hijos.push(new D.Paragraph({
          alignment: D.AlignmentType.CENTER,
          children: [new D.ImageRun({ data: firma.bytes, type: firma.tipo, transformation: { width: 140, height: 55 } })]
        }));
      } else {
        hijos.push(new D.Paragraph({ children: [new D.TextRun({ text: " " })] }));
      }
      hijos.push(new D.Paragraph({
        alignment: D.AlignmentType.CENTER,
        border: { top: { style: D.BorderStyle.SINGLE, size: 6, color: "333333" } },
        children: [new D.TextRun({ text: etiqueta, bold: true, size: 18 })]
      }));
      hijos.push(new D.Paragraph({
        alignment: D.AlignmentType.CENTER,
        children: [new D.TextRun({ text: "Fecha: " + (fechaISO ? fechaLegible(fechaISO) : "____________"), size: 16 })]
      }));
      return hijos;
    }

    var children = [];
    children.push(tablaEncabezado());
    children.push(new D.Paragraph({ text: "" }));
    children.push(new D.Paragraph({
      alignment: D.AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new D.TextRun({ text: "DISEÑO DE LA ACCIÓN DE CAPACITACIÓN PUNTUAL", bold: true, size: 28 })]
    }));

    children = children.concat(campoParrafos("Dirección Regional", val.direccionRegional));
    children = children.concat(campoParrafos("Nombre de la Empresa o Institución", val.empresa));
    children = children.concat(campoParrafos("Nombre de la Capacitación", val.nombreCapacitacion));
    children = children.concat(campoParrafos("Objetivo de la Capacitación", val.objetivo));
    children = children.concat(campoParrafos("Población Enfocada", val.poblacion));
    children = children.concat(campoParrafos("Contenido de la Capacitación", val.contenido));
    children.push(campoLineaUnica("Carga Horaria", val.cargaHoraria));
    children = children.concat(campoParrafos("Perfil del Facilitador", val.perfilFacilitador));
    children = children.concat(campoParrafos("Recursos Didácticos y Logísticos", val.recursos));

    children.push(new D.Paragraph({ text: "", spacing: { before: 400 } }));

    var tablaFirmas = new D.Table({
      width: { size: 100, type: D.WidthType.PERCENTAGE },
      borders: {
        top: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideHorizontal: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideVertical: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" }
      },
      rows: [
        new D.TableRow({
          children: [
            new D.TableCell({ width: { size: 50, type: D.WidthType.PERCENTAGE }, children: bloqueFirma("Contraparte", "Firma Contraparte de la Empresa y Fecha", fechas.fechaContraparte) }),
            new D.TableCell({ width: { size: 50, type: D.WidthType.PERCENTAGE }, children: bloqueFirma("Facilitador", "Firma Facilitador(es) y Fecha", fechas.fechaFacilitador) })
          ]
        })
      ]
    });
    children.push(tablaFirmas);
    children.push(new D.Paragraph({ text: "", spacing: { before: 300 } }));
    var bloqueAsesor = bloqueFirma("Asesor", "Firma Asesor y Fecha", fechas.fechaAsesor);
    children = children.concat(bloqueAsesor);

    // Página 2 — Instructivo de llenado
    children.push(new D.Paragraph({ children: [new D.PageBreak()] }));
    children.push(tablaEncabezado());
    children.push(new D.Paragraph({
      alignment: D.AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      children: [new D.TextRun({ text: "INSTRUCTIVO DE LLENADO", bold: true, size: 26 })]
    }));
    INSTRUCTIVO.forEach(function (par) {
      children.push(new D.Paragraph({
        spacing: { after: 160 },
        children: [
          new D.TextRun({ text: par[0] + ": ", bold: true }),
          new D.TextRun({ text: par[1] })
        ]
      }));
    });

    var doc = new D.Document({
      sections: [{ children: children }]
    });

    var blob = await D.Packer.toBlob(doc);
    var nombreArchivo = "RT-02-PT-ONA-040_" + (val.nombreCapacitacion || "Diseno_Capacitacion")
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 80) + ".docx";

    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);

    return nombreArchivo;
  }

  function nombreBase(val) {
    return (val.nombreCapacitacion || "Diseno_Capacitacion")
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 80);
  }

  async function generarPdf() {
    var jsPDFCtor = window.jsPDF;
    var val = {};
    CAMPOS.forEach(function (id) { val[id] = $(id).value.trim(); });
    var fechas = {};
    FECHAS.forEach(function (id) { fechas[id] = $(id).value; });

    var logoDataUrl = "data:image/jpeg;base64," + window.LOGO_BASE64;

    var doc = new jsPDFCtor({ unit: "pt", format: "letter" });
    var pageWidth = doc.internal.pageSize.getWidth();
    var pageHeight = doc.internal.pageSize.getHeight();
    var marginX = 54;
    var marginBottom = 60;
    var contentWidth = pageWidth - marginX * 2;
    var y = 0;

    function nuevaPagina() {
      doc.addPage();
      dibujarEncabezado();
      y = 130;
    }

    function asegurarEspacio(alto) {
      if (y + alto > pageHeight - marginBottom) nuevaPagina();
    }

    function dibujarEncabezado() {
      try { doc.addImage(logoDataUrl, "JPEG", marginX, 34, 92, 61); } catch (e) { /* logo opcional */ }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("RT-02-PT-ONA-040:2025", pageWidth - marginX, 46, { align: "right" });
      doc.text("Edición 9", pageWidth - marginX, 60, { align: "right" });
    }

    function campoPdf(etiqueta, valor) {
      asegurarEspacio(26);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(etiqueta + ":", marginX, y);
      y += 15;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      var lineas = valor ? lineasNoVacias(valor) : [];
      if (lineas.length === 0) lineas = [" "];
      lineas.forEach(function (linea) {
        var envueltas = doc.splitTextToSize(linea, contentWidth);
        envueltas.forEach(function (l) {
          asegurarEspacio(13);
          doc.text(l, marginX, y);
          y += 13;
        });
      });
      y += 8;
    }

    function campoLineaUnicaPdf(etiqueta, valor) {
      asegurarEspacio(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(etiqueta + ": ", marginX, y);
      var ancho = doc.getTextWidth(etiqueta + ": ");
      doc.setFont("helvetica", "normal");
      doc.text(valor || "", marginX + ancho, y);
      y += 22;
    }

    function bloqueFirmaPdf(x, ancho, etiqueta, fechaISO, firma) {
      var yy = y;
      if (firma) {
        try {
          var formato = firma.tipo === "png" ? "PNG" : "JPEG";
          var anchoImg = 120, altoImg = 46;
          doc.addImage(firma.dataUrl, formato, x + (ancho - anchoImg) / 2, yy, anchoImg, altoImg);
        } catch (e) { /* firma opcional */ }
      }
      yy += 52;
      doc.setDrawColor(60, 60, 60);
      doc.setLineWidth(0.75);
      doc.line(x, yy, x + ancho, yy);
      yy += 13;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(etiqueta, x + ancho / 2, yy, { align: "center" });
      yy += 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Fecha: " + (fechaISO ? fechaLegible(fechaISO) : "____________"), x + ancho / 2, yy, { align: "center" });
      return yy;
    }

    dibujarEncabezado();
    y = 130;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("DISEÑO DE LA ACCIÓN DE CAPACITACIÓN PUNTUAL", pageWidth / 2, y, { align: "center" });
    y += 26;

    campoPdf("Dirección Regional", val.direccionRegional);
    campoPdf("Nombre de la Empresa o Institución", val.empresa);
    campoPdf("Nombre de la Capacitación", val.nombreCapacitacion);
    campoPdf("Objetivo de la Capacitación", val.objetivo);
    campoPdf("Población Enfocada", val.poblacion);
    campoPdf("Contenido de la Capacitación", val.contenido);
    campoLineaUnicaPdf("Carga Horaria", val.cargaHoraria);
    campoPdf("Perfil del Facilitador", val.perfilFacilitador);
    campoPdf("Recursos Didácticos y Logísticos", val.recursos);

    asegurarEspacio(140);
    y += 20;
    var colAncho = contentWidth / 2 - 12;
    var finContraparte = bloqueFirmaPdf(marginX, colAncho, "Firma Contraparte de la Empresa y Fecha", fechas.fechaContraparte, firmas.Contraparte);
    var finFacilitador = bloqueFirmaPdf(marginX + contentWidth / 2 + 12, colAncho, "Firma Facilitador(es) y Fecha", fechas.fechaFacilitador, firmas.Facilitador);
    y = Math.max(finContraparte, finFacilitador) + 30;
    asegurarEspacio(70);
    bloqueFirmaPdf(marginX + contentWidth / 2 - 110, 220, "Firma Asesor y Fecha", fechas.fechaAsesor, firmas.Asesor);

    // Página 2 — Instructivo de llenado
    doc.addPage();
    dibujarEncabezado();
    y = 130;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("INSTRUCTIVO DE LLENADO", pageWidth / 2, y, { align: "center" });
    y += 26;

    INSTRUCTIVO.forEach(function (par) {
      asegurarEspacio(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(par[0] + ":", marginX, y);
      y += 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      var envueltas = doc.splitTextToSize(par[1], contentWidth);
      envueltas.forEach(function (l) {
        asegurarEspacio(12);
        doc.text(l, marginX, y);
        y += 12;
      });
      y += 8;
    });

    var nombreArchivo = "RT-02-PT-ONA-040_" + nombreBase(val) + ".pdf";
    doc.save(nombreArchivo);
    return nombreArchivo;
  }

  document.addEventListener("DOMContentLoaded", function () {
    CAMPOS.forEach(function (id) { $(id).addEventListener("input", actualizarPreview); });
    FECHAS.forEach(function (id) { $(id).addEventListener("input", actualizarPreview); });
    FIRMAS.forEach(inicializarFirma);

    actualizarPreview();

    $("btnEjemplo").addEventListener("click", function () { cargarDatos(EJEMPLO); estado("Ejemplo lleno cargado (curso IA Marketing Digital, Amicus Realty).", false); });
    $("btnLimpiar").addEventListener("click", function () {
      if (confirm("¿Vaciar todos los campos del formulario?")) vaciarFormulario();
    });

    function conectarGenerador(idBoton, generador, etiqueta, extension) {
      $(idBoton).addEventListener("click", function () {
        var boton = $(idBoton);
        boton.disabled = true;
        estado("Generando " + etiqueta + "...", false);
        generador().then(function (nombre) {
          estado("✔ Descargado: " + nombre, false);
        }).catch(function (err) {
          console.error(err);
          estado("Error al generar el " + extension + ": " + err.message, true);
        }).finally(function () {
          boton.disabled = false;
        });
      });
    }

    conectarGenerador("btnGenerarPdf", generarPdf, "PDF", "PDF");
    conectarGenerador("btnGenerarDocx", generarDocx, "Word", "documento Word");
  });
})();
