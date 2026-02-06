# Backend Deployment Guide (Vercel)

This backend has been refactored to support Vercel Serverless Functions while maintaining local development capabilities.

## Structure Changes
- **`src/app.ts`**: Contains the Express application logic (routes, middleware, DB connection). Exports the `app` instance.
- **`src/server.ts`**: Imports `app` and listens on a port. Used for **Local Development** (`npm run dev`).
- **`vercel.json`**: Configures Vercel to use `dist/app.js` as the serverless entry point.

## How to Deploy

1. **Push Changes**:
   Ensure you commit and push the new `src/app.ts`, `src/server.ts`, and `vercel.json` files.

   ```bash
   git add .
   git commit -m "Refactor backend for Vercel deployment"
   git push
   ```

2. **Vercel Dashboard**:
   - Go to your backend project on Vercel.
   - **Settings > General**:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist` (or leave default)
     - **Install Command**: `npm install`
   
   - **Environment Variables**:
     Ensure these are set in Vercel:
     - `MONGODB_URI`: Your MongoDB connection string.
     - `JWT_SECRET`: Your secret key.
     - `CORS_ORIGIN`: Your Frontend URL (e.g., `https://afri-farmers-admin-ui.vercel.app`).

3. **Deploy**:
   Use the Vercel CLI or just push to Git.
   ```bash
   cd backend
   vercel --prod
   ```

## Troubleshooting
- If Vercel shows "404 Not Found" for backend routes, ensure `vercel.json` is being picked up and pointing to `dist/app.js`.
- If you see "Runtime.ImportModuleError", ensure `npm run build` is actually creating `dist/app.js`.
