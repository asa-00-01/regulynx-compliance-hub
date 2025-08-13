# Deployment Guides

This document provides deployment guides for various platforms.

## Lovable Deployment

When deploying through Lovable:

1. Click the "Publish" button in the top right
2. Configure your custom domain in Project > Settings > Domains
3. Environment variables are managed through the deployment interface

## Vercel Deployment

1. Add environment variables in the Vercel dashboard under "Environment Variables"
2. Set the build command: `npm run build`
3. Set the output directory: `dist`

## Netlify Deployment

1. Add environment variables in Site settings > Environment variables
2. Set the build command: `npm run build`
3. Set the publish directory: `dist`

## Docker Deployment

This project includes a `Dockerfile` and `nginx.conf` for creating a production-ready Docker image.

### Building the Image

To build the Docker image, use the `docker build` command. You can pass environment variables required by the application at build time using `--build-arg`. All variables defined in `src/config/environment.ts` can be configured this way.

**Example Production Build Command:**
```bash
docker build -t regulynx . \
  --build-arg VITE_ENVIRONMENT="production" \
  --build-arg VITE_APP_NAME="Regulynx Compliance Hub" \
  --build-arg VITE_APP_DOMAIN="regulynx.nordmandi.com" \
  --build-arg VITE_SUPPORT_EMAIL="support@regulynx.com" \
  --build-arg VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="<your-supabase-anon-key>" \
  --build-arg VITE_LOG_LEVEL="error" \
  --build-arg VITE_DEBUG_MODE="false" \
  --build-arg VITE_ENABLE_ERROR_REPORTING="true"
```

Refer to the `Dockerfile` and `docs/environment-variables.md` for a complete list of all available build arguments.

### Running the Container

Once the image is built, you can run it as a container:

```bash
docker run -p 8080:80 your-app-name
```

The application will be accessible at `http://localhost:8080`.

The `Dockerfile` uses a multi-stage build process to create a small and secure Nginx image for serving the built React application.
