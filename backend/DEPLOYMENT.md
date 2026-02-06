# Backend Deployment Guide (Vercel)

This guide outlines the steps to deploy the AfriFarmers Backend to Vercel.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **Vercel CLI** (Optional but recommended): Install via `npm i -g vercel`.
3.  **MongoDB Database**: Use a cloud provider like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
    *   *Note*: Ensure you whitelist IP address `0.0.0.0/0` in MongoDB Atlas Network Access, as Vercel uses dynamic IPs.

## specific Project File Changes (Already Applied)

*   **`src/server.ts`**: Updated to export the Express app and only listen on a port when not running in Vercel.
*   **`vercel.json`**: Created to configure Vercel builds and routing.

## Step-by-Step Deployment

### Option A: Using Vercel CLI (Recommended for first time)

1.  Open a terminal in the `backend` folder:
    ```bash
    cd backend
    ```

2.  Run the deploy command:
    ```bash
    vercel
    ```

3.  Follow the prompts:
    *   **Set up and deploy?**: `y`
    *   **Which scope?**: (Select your account)
    *   **Link to existing project?**: `n`
    *   **Project Name**: `afrifarmers-backend`
    *   **In which directory is your code located?**: `./` (Leave default if you are in backend folder)
    *   **Want to modify these settings?**: `n` (We have `vercel.json` already)

4.  **Environment Variables**:
    *   Go to the Vercel Dashboard for your new project.
    *   Navigate to **Settings** > **Environment Variables**.
    *   Add the following variables:
        *   `MONGODB_URI`: Your MongoDB Atlas connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/dbname`).
        *   `JWT_SECRET`: A strong secret key for authentication.
        *   `CORS_ORIGIN`: The URL of your deployed Frontend (e.g., `https://afrifarmers-admin.vercel.app`). You can update this later after deploying the frontend.

5.  **Redeploy**:
    If you added environment variables after the initial deployment, you might need to redeploy:
    ```bash
    vercel --prod
    ```

### Option B: deployment via Git Integration

1.  Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2.  Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** > **"Project"**.
3.  Import your repository.
4.  **Important**: In the "Root Directory" section, click "Edit" and select `backend`.
5.  **Environment Variables**: Add `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGIN` in the deployment setup screen.
6.  Click **Deploy**.

## Post-Deployment

1.  **Get the URL**: Vercel will provide a URL (e.g., `https://afrifarmers-backend.vercel.app`).
2.  **Update Frontend**:
    *   Go to your `Frontend` folder.
    *   Update `.env` (locally) or your Frontend deployment settings to point to this new Backend URL:
        ```env
        VITE_API_BASE_URL=https://afrifarmers-backend.vercel.app/api
        ```

## Troubleshooting

*   **500 Errors**: Check the "Logs" tab in Vercel dashboard.
*   **Database Connection Failed**: Double-check MongoDB Atlas IP Whitelist (`0.0.0.0/0`) and connection string credentials.
*   **CORS Errors**: Ensure `CORS_ORIGIN` matches your frontend URL exactly (no trailing slash usually).
