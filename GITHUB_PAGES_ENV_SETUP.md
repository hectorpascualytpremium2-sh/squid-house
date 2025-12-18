# Setting Up Environment Variables for GitHub Pages

## Important Limitation

**GitHub Pages is a static hosting service** - it only serves pre-built HTML/CSS/JS files. It does **not**:
- Run build processes
- Support runtime environment variables
- Execute server-side code

## How Vite Environment Variables Work

Vite embeds environment variables **at build time** into your JavaScript bundle. The variables become part of the compiled code.

## Your Options

### Option 1: Build Locally with `.env` (Current Setup - Recommended)

**How it works:**
- You build the app locally on your machine
- Vite reads from your `.env` file during build
- The built files (with env vars embedded) are deployed to GitHub Pages

**Steps:**

1. **Create `.env` file locally** (already in `.gitignore`):
   ```bash
   VITE_FIREBASE_API_KEY=your-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-domain-here
   VITE_FIREBASE_DATABASE_URL=your-url-here
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-bucket-here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

2. **Build and deploy:**
   ```bash
   npm run deploy
   ```

3. **The built files** (with Firebase config embedded) are pushed to the `gh-pages` branch

**Pros:**
- ✅ Simple, no GitHub Actions needed
- ✅ Works with your current `gh-pages` setup
- ✅ Full control over the build process

**Cons:**
- ❌ You must build on your local machine
- ❌ Can't automate deployments from GitHub
- ❌ Others can't deploy without your `.env` file

---

### Option 2: Use GitHub Actions with Secrets (Automated)

**How it works:**
- GitHub Actions runs the build process on GitHub's servers
- Uses GitHub Secrets to inject environment variables
- Automatically deploys to GitHub Pages

**Steps:**

1. **Add GitHub Secrets:**
   - Go to your repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret** for each variable:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_DATABASE_URL`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

2. **Create GitHub Actions workflow** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build with environment variables
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_DATABASE_URL: ${{ secrets.VITE_FIREBASE_DATABASE_URL }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. **Enable GitHub Pages:**
   - Go to **Settings** → **Pages**
   - **Source**: Select **GitHub Actions** (not "Deploy from a branch")

4. **Deploy:**
   - Push to `main` branch, or
   - Go to **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**

**Pros:**
- ✅ Automated deployments
- ✅ Secrets stored securely in GitHub
- ✅ Anyone can trigger deployment (secrets are hidden)
- ✅ Builds run on GitHub's servers

**Cons:**
- ❌ Requires GitHub Actions (you mentioned you don't want this)
- ❌ More complex setup

---

### Option 3: Use a Different Hosting Service

If you want runtime environment variables, consider:
- **Vercel** - Supports environment variables, automatic deployments
- **Netlify** - Supports build-time and runtime env vars
- **Cloudflare Pages** - Supports environment variables

These services can build your app and inject environment variables during the build process.

---

## Recommendation

Since you're using `gh-pages` and want to avoid GitHub Actions:

**Stick with Option 1** - Build locally with `.env`:

1. Keep your `.env` file local (never commit it)
2. Run `npm run deploy` when you want to update the site
3. The built files will have Firebase config embedded

**Security Note:**
Remember that Firebase client config values will be visible in the built JavaScript bundle. This is normal and expected. Real security comes from Firebase Security Rules.

---

## Quick Reference

**Current workflow (Option 1):**
```bash
# 1. Make sure .env exists with your Firebase credentials
# 2. Build and deploy
npm run deploy
```

**If switching to GitHub Actions (Option 2):**
1. Add secrets to GitHub
2. Create `.github/workflows/deploy.yml`
3. Enable GitHub Pages → GitHub Actions
4. Push to main branch

