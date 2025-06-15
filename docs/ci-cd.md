
# CI/CD with GitHub Actions

This section explains how to set up a Continuous Integration and Continuous Deployment (CI/CD) pipeline using GitHub Actions. This allows you to automate testing and deployment whenever you push changes to your repository.

To use this, your project must be connected to a GitHub repository. You can do this from the Lovable editor by clicking the GitHub icon in the top right.

## 1. Create the Workflow File

In your GitHub repository, create a new file at the following path: `.github/workflows/ci.yml`.

## 2. Add Workflow Content

Paste the following content into the `ci.yml` file. This workflow will test your application and then build and publish a Docker image to the GitHub Container Registry.

```yaml
name: Regulynx CI/CD

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build_and_test:
    name: Build and Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run tests
        run: bun test

      - name: Build application
        run: bun run build

  build_and_push_docker:
    name: Build and Push Docker Image
    needs: build_and_test
    # Only run on push to the main branch
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: 'Get repo owner and name'
        uses: ASzc/slug-action@v2.2.0
        id: slug

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ghcr.io/${{ steps.slug.outputs.owner_slug }}/${{ steps.slug.outputs.repo_slug }}:latest
          build-args: |
            VITE_APP_NAME=${{ vars.VITE_APP_NAME || 'Regulynx' }}
            VITE_APP_DOMAIN=${{ vars.VITE_APP_DOMAIN || 'app.example.com' }}
            VITE_SUPPORT_EMAIL=${{ vars.VITE_SUPPORT_EMAIL || 'support@example.com' }}
            VITE_SUPABASE_URL=${{ vars.VITE_SUPABASE_URL }}
            VITE_SUPABASE_ANON_KEY=${{ secrets.VITE_SUPABASE_ANON_KEY }}
            VITE_ENVIRONMENT=production
```

## 3. Configure Repository Secrets and Variables

This workflow requires you to configure secrets and variables in your GitHub repository settings. Go to `Settings > Secrets and variables > Actions`.

**Secrets (for sensitive data):**
-   `VITE_SUPABASE_ANON_KEY`: Your Supabase public anon key.

**Variables (for non-sensitive data):**
-   `VITE_SUPABASE_URL`: Your Supabase project URL.
-   `VITE_APP_NAME`: The name of your application.
-   `VITE_APP_DOMAIN`: The domain where your app is hosted.
-   `VITE_SUPPORT_EMAIL`: Your support email address.

## How it Works

-   **`on`**: This workflow triggers on any push or pull request to the `main` branch.
-   **`build_and_test` job**: This job checks out your code, installs dependencies, runs your Vitest tests, and builds the React application. This ensures your code is always in a working state.
-   **`build_and_push_docker` job**: This job only runs after `build_and_test` succeeds on a push to `main`. It builds a Docker image using your `Dockerfile` and pushes it to the GitHub Container Registry (GHCR). From there, you can deploy it to any hosting service that supports Docker containers.

The `GITHUB_TOKEN` is automatically provided by GitHub Actions and has the necessary permissions to push to your repository's container registry.
