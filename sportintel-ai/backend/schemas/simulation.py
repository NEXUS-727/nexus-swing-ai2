from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    capital_inicial: float = Field(..., gt=0, description="Capital inicial disponible")
    riesgo: float = Field(..., gt=0, le=1, description="Fracción del capital arriesgada por jugada (0-1)")
    cuota: float = Field(..., gt=1, description="Cuota decimal de la apuesta")
    tasa_acierto: float = Field(..., ge=0, le=1, description="Probabilidad de acierto por jugada (0-1)")
    num_jugadas: int = Field(..., gt=0, description="Cantidad de jugadas por simulación")
