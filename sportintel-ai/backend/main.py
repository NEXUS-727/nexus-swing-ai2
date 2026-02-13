import random
import statistics

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel

from explain.feature_importance import calcular_importancia
from schemas.simulation import SimulationRequest
from services.exporter import exportar_csv, exportar_pdf

app = FastAPI(title="SportIntel AI API", version="0.1.0")

MONTE_CARLO_ITERATIONS = 10_000


class CompareRequest(BaseModel):
    estrategia_1: SimulationRequest
    estrategia_2: SimulationRequest


class ExportRequest(BaseModel):
    formato: str
    resultados: dict


def _simulate_strategy(payload: SimulationRequest) -> tuple[float, float, float]:
    final_capitals: list[float] = []

    for _ in range(MONTE_CARLO_ITERATIONS):
        capital = payload.capital_inicial

        for _ in range(payload.num_jugadas):
            stake = capital * payload.riesgo
            won = random.random() < payload.tasa_acierto

            if won:
                capital += stake * (payload.cuota - 1)
            else:
                capital -= stake

            if capital <= 0:
                capital = 0
                break

        final_capitals.append(capital)

    capital_promedio = statistics.fmean(final_capitals)
    capital_mediano = statistics.median(final_capitals)
    prob_ganancia = sum(value > payload.capital_inicial for value in final_capitals) / len(final_capitals)

    return capital_promedio, capital_mediano, prob_ganancia


@app.get("/ping")
def ping() -> dict[str, str]:
    return {"status": "ok", "message": "Backend SportIntel AI activo"}


@app.post("/simulate")
def simulate(payload: SimulationRequest) -> dict[str, float | dict[str, float]]:
    capital_promedio, capital_mediano, prob_ganancia = _simulate_strategy(payload)
    importancia_variables = calcular_importancia(payload.model_dump())

    return {
        "capital_promedio": round(capital_promedio, 2),
        "capital_mediano": round(capital_mediano, 2),
        "prob_ganancia": round(prob_ganancia, 4),
        "importancia_variables": importancia_variables,
    }


@app.post("/compare")
def compare(payload: CompareRequest) -> dict[str, dict[str, float] | str]:
    capital_promedio_1, _, prob_ganancia_1 = _simulate_strategy(payload.estrategia_1)
    capital_promedio_2, _, prob_ganancia_2 = _simulate_strategy(payload.estrategia_2)

    estrategia_1 = {
        "capital_promedio": round(capital_promedio_1, 2),
        "prob_ganancia": round(prob_ganancia_1, 4),
    }
    estrategia_2 = {
        "capital_promedio": round(capital_promedio_2, 2),
        "prob_ganancia": round(prob_ganancia_2, 4),
    }

    mejor_estrategia = "1" if capital_promedio_1 >= capital_promedio_2 else "2"

    return {
        "estrategia_1": estrategia_1,
        "estrategia_2": estrategia_2,
        "mejor_estrategia": mejor_estrategia,
    }


@app.post("/export")
def export(payload: ExportRequest) -> Response:
    formato = payload.formato.lower()

    if formato == "csv":
        file_path = exportar_csv(payload.resultados)
        return FileResponse(file_path, media_type="text/csv", filename="reporte_sportintel.csv")

    if formato == "pdf":
        pdf_bytes = exportar_pdf(payload.resultados)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="reporte_sportintel.pdf"'},
        )

    raise HTTPException(status_code=400, detail="Formato inválido. Usa 'pdf' o 'csv'.")


@app.get("/sports")
def sports() -> list[dict[str, str]]:
    return [
        {"nombre": "Tenis (VIP)", "precision": "75–82%"},
        {"nombre": "Béisbol (MLB)", "precision": "70–78%"},
        {"nombre": "Baloncesto (NBA)", "precision": "65–72%"},
        {"nombre": "Fútbol Americano (NFL)", "precision": "60–68%"},
        {"nombre": "Fútbol (Soccer)", "precision": "52–60%"},
    ]
