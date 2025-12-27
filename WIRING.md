# System Wiring: "Locale by: ACHIEVEMOR" Data Platform

This document visualizes the active **Event-Driven Architecture** of the platform on Google Cloud.

## 1. The Circuit Board (Event-Driven Flow)

```mermaid
graph TD
    User([User / System]) -->|Upload File| GCS[Google Cloud Storage <br/> (Data Lake)]
    GCS -->|Object Finalized| Eventarc[GCP Eventarc <br/> (The Trigger)]
    Eventarc -->|POST Request| CloudRun[Locale Backend <br/> (Cloud Run / Flask)]
    
    subgraph "Locale Backend (Flask)"
        CloudRun -->|/webhook/storage| StorageHandler[Storage Processor]
        CloudRun -->|/api/ai/chat| Gemini[Vertex AI / Gemini <br/> (Code Companion)]
        CloudRun -->|/api/harvest| Harvester[Business Harvester <br/> (Mock)]
    end
    
    Frontend([Frontend / Manus UI]) -->|Direct API| CloudRun
```

## 2. Active Configuration (The Hotwire)

| Component | Status | Source Code |
| :--- | :--- | :--- |
| **Frontend** | Live (Local) | `App.tsx` (Vite) |
| **Backend API** | ✅ Live (Cloud Run) | `backend/main.py` |
| **Task Engine** | Simulated (Manus) | `TaskWorkspace.tsx` |
| **Infrastructure** | Terraform | `terraform/*.tf` |

## 3. Key Endpoints (The Switchboard)

- **Storage Event**: `POST /webhook/storage` -> Triggered by GCS uploads.
- **AI Chat**: `POST /api/ai/chat` -> Gemini Code Assist integration.
- **Business Harvest**: `POST /api/harvest/trigger` -> Initiates lead generation.
- **Health Check**: `GET /health` -> Cloud Run status.

## 4. Deployment Status
- **Service URL**: https://locale-backend-6vy2c3elqq-uc.a.run.app
- **CI/CD**: Active (GitHub Actions)

