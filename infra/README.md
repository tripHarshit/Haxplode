# Infra
# Haxplode - Infra Guidelines

## Repo Structure
- `frontend/` → React + Vite app (Person A)
- `backend/` → Node + Express API (Person B)
- `infra/` → Azure + CI/CD configs (Harshit)

## How to Work
- Create feature branches → PR into `main`
- Never push `.env` (use repo secrets)
- Frontend will be auto-deployed to Azure Static Web Apps
- Backend will be auto-deployed to Azure App Service
