import csv
import tempfile
from typing import Any


def exportar_csv(data: dict) -> str:
    """Genera un CSV temporal con métricas principales e importancia de variables."""
    importancia = data.get("importancia_variables", {}) or {}

    rows = [
        ["metrica", "valor"],
        ["capital_promedio", data.get("capital_promedio", "")],
        ["capital_mediano", data.get("capital_mediano", "")],
        ["prob_ganancia", data.get("prob_ganancia", "")],
    ]

    for key in ("tasa_acierto", "riesgo", "cuota", "num_jugadas"):
        rows.append([f"importancia_{key}", importancia.get(key, "")])

    with tempfile.NamedTemporaryFile(mode="w", newline="", suffix=".csv", prefix="sportintel_", delete=False, encoding="utf-8") as tmp:
        writer = csv.writer(tmp)
        writer.writerows(rows)
        return tmp.name


def exportar_pdf(data: dict) -> bytes:
    """Genera un PDF en memoria con un reporte resumido de resultados."""
    try:
        from fpdf import FPDF
    except ImportError as exc:
        raise ImportError("Para exportar PDF, instala fpdf2: pip install fpdf2") from exc

    importancia: dict[str, Any] = data.get("importancia_variables", {}) or {}

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "Reporte SportIntel AI", ln=True)

    pdf.set_font("Helvetica", size=11)
    pdf.multi_cell(
        0,
        7,
        "Resumen: Este reporte presenta las métricas principales de la simulación "
        "Monte Carlo y la importancia relativa de las variables de entrada.",
    )
    pdf.ln(2)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Resultados principales", ln=True)

    pdf.set_font("Helvetica", size=11)
    table_rows = [
        ("Capital promedio", data.get("capital_promedio", "N/D")),
        ("Capital mediano", data.get("capital_mediano", "N/D")),
        ("Prob. ganancia", data.get("prob_ganancia", "N/D")),
    ]

    for label, value in table_rows:
        pdf.cell(70, 8, str(label), border=1)
        pdf.cell(0, 8, str(value), border=1, ln=True)

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Importancia de variables", ln=True)
    pdf.set_font("Helvetica", size=11)

    for key in ("tasa_acierto", "riesgo", "cuota", "num_jugadas"):
        value = importancia.get(key, "N/D")
        pdf.cell(70, 8, key, border=1)
        pdf.cell(0, 8, str(value), border=1, ln=True)

    output = pdf.output(dest="S")
    if isinstance(output, (bytes, bytearray)):
        return bytes(output)
    return output.encode("latin-1")
