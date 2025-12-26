# Setup GCP/Cloud Run Infrastructure
$PROJECT_ID = "locale-by-achievemor" # REPLACE THIS
Write-Host "--- Configuring GCP Infrastructure ---"
Write-Host "Project: $PROJECT_ID"
Write-Host "1. Initializing Terraform..."
cd terraform
terraform init
Write-Host "2. Planning Resources..."
terraform plan -var="project_id=$PROJECT_ID" -out=tfplan
$confirmation = Read-Host "Deploy these resources? (y/n)"
if ($confirmation -eq 'y') {
    Write-Host "3. Applying Configuration..."
    terraform apply tfplan
    Write-Host "--- Infrastructure Wired ---"
} else {
    Write-Host "Deployment cancelled."
}
cd ..
