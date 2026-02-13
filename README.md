# SportIntel AI

Estructura base de una aplicación full-stack con:

- Backend: FastAPI (Python)
- Frontend: React + Vite + Tailwind CSS
- Orquestación: Docker Compose

## Estructura

```text
sportintel-ai/
├── backend/
│   ├── main.py
│   ├── services/
│   ├── storage/
│   ├── schemas/
│   ├── explain/
│   ├── ml_models/
│   └── utils/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
├── docker-compose.yml
├── .env
└── README.md
```

## Backend

- Endpoint de prueba: `GET /ping`
- Respuesta:

```json
{"status": "ok"}
```

## Levantar con Docker

Desde la carpeta raíz del repo:

```bash
cd sportintel-ai
docker compose up --build
```

Servicios:

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:8000/ping>
