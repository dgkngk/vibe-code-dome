# Deployment Plan: Vibe Code Dome on Firebase & Cloud Run with Supabase

This plan outlines the steps to deploy the "Vibe Code Dome" application using Google Cloud Run for the backend, Firebase Hosting for the frontend, and Supabase for the database.

## Architecture Overview

*   **Frontend**: Hosted on **Firebase Hosting**.
*   **Backend**: Docker container running on **Cloud Run** (serverless container platform).
*   **Database**: **Supabase** (PostgreSQL).
*   **Integration**: Firebase Hosting rewrites will route API traffic to Cloud Run and serve static assets for the frontend.

---

## Step 1: Prerequisites & Setup

1.  **Create a Firebase Project**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Create a new project (e.g., `vibe-code-dome`).
    *   Upgrade the project to the **Blaze (Pay as you go)** plan (required for Cloud Run).

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

## Step 2: Database Configuration (Supabase)

The application will continue to use Supabase as the primary database.

1.  **Retrieve Connection Details**:
    *   Go to your Supabase project settings.
    *   Copy the **Connection String** (URI format). It should look like:
        `postgresql://postgres:[PASSWORD]@db.project.supabase.co:5432/postgres`

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

3.  **Build and Submit Image**:
    *   Submit the build to Cloud Build:
        ```bash
        gcloud builds submit --tag us-central1-docker.pkg.dev/<PROJECT_ID>/docker-repo/vibe-app
        ```

4.  **Deploy to Cloud Run**:
    *   Deploy the container. **Crucially**, set the `SUPABASE_URL` environment variable.
        ```bash
        gcloud run deploy vibe-api \
          --image us-central1-docker.pkg.dev/<PROJECT_ID>/docker-repo/dome-app \
          --region us-central1 \
          --allow-unauthenticated \
          --set-env-vars "SUPABASE_URL=<YOUR_SUPABASE_CONNECTION_STRING>"
        ```

---

## Step 4: Frontend & Hosting Configuration

1.  **Initialize Firebase**:
    *   Run `firebase init` in the project root.
    *   Select **Hosting**.
    *   Use the existing project created in Step 1.
    *   **Public directory**: `frontend/build`.
    *   **Configure as a single-page app**: **Yes**.

2.  **Configure `firebase.json`**:
    *   Ensure `firebase.json` rewrites `/api` calls to the Cloud Run service:
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
    *   Run `npm install` and `npm run build`.

4.  **Deploy**:
    *   From the root directory:
        ```bash
        firebase deploy
        ```

---

## Summary

*   **Database**: Retained on **Supabase**.
*   **Compute**: Hosted on **Cloud Run**.
*   **Frontend**: Served via **Firebase Hosting**.
*   **Cost**: Cloud SQL costs avoided; standard Supabase pricing applies.
