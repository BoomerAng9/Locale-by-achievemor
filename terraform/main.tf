terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = ">= 4.34.0"
    }
  }
}
provider "google" {
  project = var.project_id
  region  = var.region
}
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "eventarc.googleapis.com",
    "aiplatform.googleapis.com",
    "storage.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudaicompanion.googleapis.com"
  ])
  service            = each.key
  disable_on_destroy = false
}
resource "google_storage_bucket" "data_lake" {
  name          = "${var.project_id}-data-lake"
  location      = var.region
  force_destroy = true
  uniform_bucket_level_access = true
}
resource "google_eventarc_trigger" "storage_upload" {
  name     = "trigger-storage-upload"
  location = var.region
  matching_criteria {
    attribute = "type"
    value     = "google.cloud.storage.object.v1.finalized"
  }
  matching_criteria {
    attribute = "bucket"
    value     = google_storage_bucket.data_lake.name
  }
  destination {
    cloud_run_service {
      service = var.service_name
      path    = "/webhook/storage"
      region  = var.region
    }
  }
  # Note: Requires Service Account creation (omitted for brevity, Terraform handles default or specify one)
}
