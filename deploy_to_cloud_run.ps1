# Deploy Backend to Google Cloud Run
# Requires: gcloud CLI authenticated

$PROJECT_ID = "locale-by-achievemor"  # REPLACE THIS
$SERVICE_NAME = "locale-backend"
$REGION = "us-central1"

Write-Host "--- Deploying to Cloud Run ---"
Write-Host "Project: $PROJECT_ID"
Write-Host "Service: $SERVICE_NAME"
Write-Host "Region: $REGION"

# Build and deploy using Cloud Build
Write-Host "`n1. Submitting build to Cloud Build..."
gcloud builds submit ./backend `
    --project=$PROJECT_ID `
    --tag="gcr.io/$PROJECT_ID/$SERVICE_NAME"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME `
    --project=$PROJECT_ID `
    --image="gcr.io/$PROJECT_ID/$SERVICE_NAME" `
    --region=$REGION `
    --platform=managed `
    --allow-unauthenticated `
    --set-env-vars="GCP_PROJECT_ID=$PROJECT_ID"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n--- Deployment Successful ---" -ForegroundColor Green
    Write-Host "Service URL:"
    gcloud run services describe $SERVICE_NAME --project=$PROJECT_ID --region=$REGION --format="value(status.url)"
} else {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}
