# Cloud Run deployment notes

1. Build and push images using Cloud Build or GitHub Actions.
2. Deploy Cloud SQL using `gcloud sql instances create` and grant access to Cloud Run service accounts.
3. Replace placeholders in `backend.yaml` and `frontend.yaml` with the pushed image names, Cloud SQL instance ID, and backend URL.
4. Deploy with `gcloud run services replace`.
