# 🚀 Cloud Deployment Guide

## Two Deployment Options

You have **two options** for deploying to Google Cloud Run:

---

## Option 1: GitHub Actions (Automated CI/CD)

### Setup Steps

1. **Create a GCP Service Account**
   - Go to [GCP Console → IAM → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - Create a new service account: `github-deployer`
   - Grant these roles:
     - `Cloud Run Admin`
     - `Storage Admin`
     - `Cloud Build Editor`
     - `Service Account User`
     - `Eventarc Admin`

2. **Create & Download JSON Key**
   - Click on the service account → Keys → Add Key → JSON
   - Download the JSON file

3. **Add GitHub Secrets**
   Go to your repository → Settings → Secrets and variables → Actions → New repository secret
   
   | Secret Name | Value |
   |-------------|-------|
   | `GCP_PROJECT_ID` | `locale-by-achievemor` |
   | `GCP_SA_KEY` | Paste the entire JSON key content |

4. **Deploy**
   - Push changes to `main` branch → Triggers automatically
   - Or go to Actions tab → Select workflow → Run workflow

### Workflows Created

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `deploy-cloud-run.yml` | Push to `backend/**` | Builds & deploys Flask backend |
| `terraform-infra.yml` | Push to `terraform/**` | Provisions GCP infrastructure |

---

## Option 2: Local Deployment (Manual)

### Prerequisites

Install the required tools (PowerShell as Admin):

```powershell
# Install Google Cloud SDK
winget install Google.CloudSDK

# Install Terraform  
winget install Hashicorp.Terraform

# Restart your terminal after installation
```

### Authentication

```powershell
# Login to GCP
gcloud auth login

# Set project
gcloud config set project locale-by-achievemor

# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com storage.googleapis.com eventarc.googleapis.com aiplatform.googleapis.com
```

### Deploy Infrastructure (Terraform)

```powershell
cd terraform
terraform init
terraform plan -var="project_id=locale-by-achievemor"
terraform apply -var="project_id=locale-by-achievemor"
```

### Deploy Backend (Cloud Run)

```powershell
# From project root
.\deploy_to_cloud_run.ps1
```

Or manually:

```powershell
$PROJECT_ID = "locale-by-achievemor"
$SERVICE_NAME = "locale-backend"
$REGION = "us-central1"

# Build and push
gcloud builds submit ./backend --tag="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Deploy
gcloud run deploy $SERVICE_NAME `
    --image="gcr.io/$PROJECT_ID/$SERVICE_NAME" `
    --region=$REGION `
    --platform=managed `
    --allow-unauthenticated `
    --set-env-vars="GCP_PROJECT_ID=$PROJECT_ID"
```

---

## Verification

After deployment, verify your backend is running:

```powershell
# Get the service URL
$URL = gcloud run services describe locale-backend --region=us-central1 --format="value(status.url)"

# Test health endpoint
Invoke-RestMethod "$URL/health"
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Locale Backend API",
  "version": "1.0.0"
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  backend/   │    │  terraform/ │    │  frontend/  │     │
│  └──────┬──────┘    └──────┬──────┘    └─────────────┘     │
└─────────┼──────────────────┼───────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│ deploy-cloud-   │  │ terraform-      │
│ run.yml         │  │ infra.yml       │
└────────┬────────┘  └────────┬────────┘
         │                    │
         ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                 Google Cloud Platform                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Cloud Run  │  │  Eventarc   │  │    GCS      │          │
│  │  (Backend)  │◄─┤  (Triggers) │◄─┤  (Storage)  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```
