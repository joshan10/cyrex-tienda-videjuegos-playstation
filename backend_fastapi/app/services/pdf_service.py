from io import BytesIO
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ACCENT = colors.HexColor("#C5A46D")
DARK = colors.HexColor("#171B24")


def _money(value: Any) -> str:
    return f"$ {float(value or 0):,.2f} COP"


def _document(title: str) -> tuple[BytesIO, list[Any], Any]:
    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
    )
    styles = getSampleStyleSheet()
    styles["Title"].textColor = DARK
    styles["Title"].fontSize = 18
    styles["Heading2"].textColor = DARK
    styles["BodyText"].fontSize = 9
    return buffer, [Paragraph("CYREX STORE", styles["Title"]), Paragraph(title, styles["Heading2"]), Spacer(1, 8)], styles


def _footer(canvas, document):
    canvas.saveState()
    canvas.setStrokeColor(ACCENT)
    canvas.line(16 * mm, 12 * mm, A4[0] - 16 * mm, 12 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.grey)
    canvas.drawString(16 * mm, 7 * mm, "Documento generado por Cyrex Store")
    canvas.drawRightString(A4[0] - 16 * mm, 7 * mm, f"Página {document.page}")
    canvas.restoreState()


def invoice_pdf(invoice: dict) -> BytesIO:
    buffer, story, styles = _document(f"Factura electrónica {invoice['numero_factura']}")
    story.extend([
        Paragraph(f"Fecha: {invoice.get('fecha_venta') or 'Sin fecha'}", styles["BodyText"]),
        Paragraph(
            f"Cliente: {invoice.get('usuario_nombre', '')} {invoice.get('usuario_apellido', '')} | "
            f"Documento: {invoice.get('usuario_documento', 'N/A')} | Correo: {invoice.get('usuario_correo', 'N/A')}",
            styles["BodyText"],
        ),
        Spacer(1, 12),
    ])
    rows = [["Descripción", "Cantidad", "Precio unitario", "Subtotal"]]
    for detail in invoice.get("detalles", []):
        name = detail.get("producto_nombre") or detail.get("servicio_nombre") or "Item"
        rows.append([name, str(detail.get("cantidad", 0)), _money(detail.get("precio_unitario")), _money(detail.get("subtotal"))])
    table = Table(rows, colWidths=[82 * mm, 22 * mm, 37 * mm, 37 * mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.lightgrey),
        ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 7),
        ("TOPPADDING", (0, 0), (-1, 0), 7),
    ]))
    story.append(table)
    story.extend([
        Spacer(1, 12),
        Paragraph(f"Subtotal: {_money(invoice.get('subtotal'))}", styles["BodyText"]),
        Paragraph(f"Impuestos ({invoice.get('impuesto_porcentaje', 0)}%): {_money(invoice.get('impuesto_valor'))}", styles["BodyText"]),
        Paragraph(f"Descuento ({invoice.get('descuento_porcentaje', 0)}%): {_money(invoice.get('descuento_valor'))}", styles["BodyText"]),
        Paragraph(f"TOTAL: {_money(invoice.get('total_neto'))}", styles["Heading2"]),
        Paragraph(f"Método de pago: {invoice.get('metodo_pago', 'N/A')} | Estado: {invoice.get('estado', 'N/A')}", styles["BodyText"]),
    ])
    document = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=16 * mm, leftMargin=16 * mm, topMargin=16 * mm, bottomMargin=16 * mm)
    document.build(story, onFirstPage=_footer, onLaterPages=_footer)
    buffer.seek(0)
    return buffer


def sales_report_pdf(rows: list[dict], fecha_inicio: str | None, fecha_fin: str | None) -> BytesIO:
    buffer, story, styles = _document("Reporte de ventas")
    story.append(Paragraph(f"Período: {fecha_inicio or 'Inicio'} al {fecha_fin or 'Fin'}", styles["BodyText"]))
    story.append(Spacer(1, 12))
    data = [["Factura", "Fecha", "Cliente", "Total", "Método"]]
    for row in rows:
        data.append([row["numero_factura"], row["fecha"], row["cliente"], _money(row["total_neto"]), row["metodo_pago"]])
    if len(data) == 1:
        data.append(["Sin ventas", "", "", _money(0), ""])
    table = Table(data, colWidths=[31 * mm, 25 * mm, 65 * mm, 35 * mm, 28 * mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.lightgrey),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ALIGN", (3, 1), (3, -1), "RIGHT"),
    ]))
    story.append(table)
    total = sum(float(row["total_neto"]) for row in rows)
    story.extend([Spacer(1, 12), Paragraph(f"Ventas: {len(rows)} | Total: {_money(total)}", styles["Heading2"])])
    document = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=16 * mm, leftMargin=16 * mm, topMargin=16 * mm, bottomMargin=16 * mm)
    document.build(story, onFirstPage=_footer, onLaterPages=_footer)
    buffer.seek(0)
    return buffer