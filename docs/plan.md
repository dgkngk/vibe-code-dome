# Migration Plan: Vibe Code Dome to Firebase/GCP

This plan outlines the steps to migrate the "Vibe Code Dome" application from Render/Supabase to the Firebase ecosystem (backed by Google Cloud Platform).

## Architecture Overview

*   **Frontend**: Hosted on **Firebase Hosting**.
*   **Backend**: Docker container running on **Cloud Run** (serverless container platform).
*   **Database**: Migrated from Supabase (Postgres) to **Cloud SQL for PostgreSQL**.
*   **Integration**: Firebase Hosting rewrites will route API traffic to Cloud Run and serve static assets for the frontend.

---

## Step 1: Prerequisites & Setup

1.  **Create a Firebase Project**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Create a new project (e.g., `vibe-code-dome-migration`).
    *   Upgrade the project to the **Blaze (Pay as you go)** plan (required for Cloud Run and Cloud SQL).

2.  **Install CLIs**:
    *   Ensure you have the Firebase CLI installed: `npm install -g firebase-tools`
    *   Ensure you have the Google Cloud CLI (`gcloud`) installed and authenticated.
    *   Log in:
        ```bash
        firebase login
        gcloud auth login
        gcloud config set project <YOUR_PROJECT_ID>
        ```

---

## Step 2: Database Migration (Supabase -> Cloud SQL)

Since your application uses SQLAlchemy (Relational), **Cloud SQL for PostgreSQL** is the compatible destination.

1.  **Create Cloud SQL Instance**:
    *   Go to the Google Cloud Console > SQL.
    *   Create a new PostgreSQL instance (match the version used in Supabase, likely 14 or 15).
    *   Create a database (e.g., `dome`) and a user

2.  **Export Data from Supabase**:
    *   Get your Supabase connection string.
    *   Run `pg_dump` to export your data:
        ```bash
        pg_dump "postgres://user:pass@host:port/db" --clean --if-exists --no-owner --no-privileges > backup.sql
        ```

3.  **Import to Cloud SQL**:
    *   Connect to your Cloud SQL instance using the Cloud SQL Proxy or by allowing your IP.
    *   Import the dump:
        ```bash
        psql "postgres://cloud_user:cloud_pass@cloud_host/dome" < backup.sql
        ```

---

## Step 3: Backend Deployment (Cloud Run)

We will deploy your Dockerized FastAPI app to Cloud Run.

1.  **Enable APIs**:
    ```bash
    gcloud services enable run.googleapis.com artifactregistry.googleapis.com
    ```

2.  **Create Artifact Registry**:
    ```bash
    gcloud artifacts repositories create docker-repo --repository-format=docker --location=us-central1 --description="Docker repository"
    ```

3.  **Build and Push Image**:
    *   Build the image specifically for the backend (or use the existing multi-stage Dockerfile, but ideally, we serve static files via Firebase Hosting, so the backend only needs to serve the API).
    *   *Recommendation*: Modify `entrypoint.sh` or the run command to ensure it binds to the correct port (Cloud Run sets `$PORT`).
    *   Submit build to Cloud Build (simplest method):
        ```bash
        gcloud builds submit --tag us-central1-docker.pkg.dev/<PROJECT_ID>/docker-repo/vibe-app
        ```

4.  **Deploy to Cloud Run**:
    *   Deploy the container. Replace `<DB_CONNECTION_STRING>` with your new Cloud SQL connection string.
        ```bash
        gcloud run deploy vibe-api \
          --image us-central1-docker.pkg.dev/<PROJECT_ID>/docker-repo/vibe-app \
          --region us-central1 \
          --allow-unauthenticated \
          --set-env-vars "SUPABASE_URL=postgresql+psycopg2://<USER>:<PASS>@<HOST>/<DB_NAME>"
        ```
    *   *Note*: For better security, consider using Cloud SQL Auth Proxy or Unix sockets for connection, but standard TCP is easier for the initial migration.

---

## Step 4: Frontend & Hosting Configuration

1.  **Initialize Firebase**:
    *   Run `firebase init` in the project root.
    *   Select **Hosting**.
    *   Use an existing project (select the one created in Step 1).
    *   **Public directory**: `frontend/build` (React's build output).
    *   **Configure as a single-page app**: **Yes**.
    *   **Set up automatic builds and deploys with GitHub**: Optional.

2.  **Configure `firebase.json`**:
    *   Update the file to rewrite `/api` calls to your Cloud Run service.
    ```json
    {
      "hosting": {
        "public": "frontend/build",
        "ignore": [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        "rewrites": [
          {
            "source": "/api/**",
            "run": {
              "serviceId": "vibe-api",
              "region": "us-central1"
            }
          },
          {
            "source": "**",
            "destination": "/index.html"
          }
        ]
      }
    }
    ```

3.  **Build Frontend**:
    *   Navigate to `frontend/`.
    *   Run `npm install` (if not done).
    *   Run `npm run build`.

4.  **Deploy**:
    *   From the root directory:
        ```bash
        firebase deploy
        ```

---

## Summary of Changes

*   **Data**: Moved from Supabase to Google Cloud SQL.
*   **Compute**: Moved from Render to Cloud Run.
*   **Static Assets**: Served via global CDN (Firebase Hosting).
*   **Routing**: Unified under one Firebase Hosting domain.
