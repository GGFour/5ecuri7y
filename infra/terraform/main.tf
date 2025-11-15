terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_sql_database_instance" "default" {
  name             = var.cloudsql_instance
  database_version = "POSTGRES_15"
  settings {
    tier = "db-custom-1-3840"
  }
}

resource "google_cloud_run_service" "backend" {
  name     = "n8n-backend"
  location = var.region

  template {
    spec {
      containers {
        image = var.backend_image
        env {
          name  = "DATABASE_URL"
          value = var.database_url
        }
      }
    }
  }
}

resource "google_cloud_run_service" "frontend" {
  name     = "n8n-frontend"
  location = var.region

  template {
    spec {
      containers {
        image = var.frontend_image
        env {
          name  = "VITE_API_BASE_URL"
          value = var.backend_url
        }
      }
    }
  }
}
