import random
from typing import Any


def _capital_esperado(params: dict[str, Any], iterations: int = 5000, seed: int = 42) -> float:
    capital_inicial = float(params["capital_inicial"])
    riesgo = float(params["riesgo"])
    cuota = float(params["cuota"])
    tasa_acierto = float(params["tasa_acierto"])
    num_jugadas = int(params["num_jugadas"])

    riesgo = max(0.0, min(riesgo, 1.0))
    tasa_acierto = max(0.0, min(tasa_acierto, 1.0))
    cuota = max(1.01, cuota)
    num_jugadas = max(1, num_jugadas)

    rng = random.Random(seed)
    capitales_finales: list[float] = []

    for _ in range(iterations):
        capital = capital_inicial
        for _ in range(num_jugadas):
            stake = capital * riesgo
            if rng.random() < tasa_acierto:
                capital += stake * (cuota - 1)
            else:
                capital -= stake

            if capital <= 0:
                capital = 0.0
                break

        capitales_finales.append(capital)

    return sum(capitales_finales) / len(capitales_finales)


def calcular_importancia(params: dict) -> dict:
    base = _capital_esperado(params)

    factores = {
        "tasa_acierto": float(params["tasa_acierto"]),
        "riesgo": float(params["riesgo"]),
        "cuota": float(params["cuota"]),
        "num_jugadas": int(params["num_jugadas"]),
    }

    influencias: dict[str, float] = {}

    for variable, valor in factores.items():
        params_menos = dict(params)
        params_mas = dict(params)

        if variable == "num_jugadas":
            params_menos[variable] = max(1, int(round(valor * 0.9)))
            params_mas[variable] = max(1, int(round(valor * 1.1)))
        elif variable == "riesgo":
            params_menos[variable] = max(0.0, min(1.0, valor * 0.9))
            params_mas[variable] = max(0.0, min(1.0, valor * 1.1))
        elif variable == "tasa_acierto":
            params_menos[variable] = max(0.0, min(1.0, valor * 0.9))
            params_mas[variable] = max(0.0, min(1.0, valor * 1.1))
        elif variable == "cuota":
            params_menos[variable] = max(1.01, valor * 0.9)
            params_mas[variable] = max(1.01, valor * 1.1)

        esperado_menos = _capital_esperado(params_menos)
        esperado_mas = _capital_esperado(params_mas)

        diferencia_promedio = (abs(esperado_menos - base) + abs(esperado_mas - base)) / 2
        influencias[variable] = diferencia_promedio

    total = sum(influencias.values())
    if total == 0:
        return {clave: 0.25 for clave in influencias}

    return {clave: valor / total for clave, valor in influencias.items()}
