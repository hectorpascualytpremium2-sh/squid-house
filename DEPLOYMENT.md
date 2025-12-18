# Deployment Guide for GitHub Pages

This guide explains how to securely deploy the Squid House app to GitHub Pages using `gh-pages` without exposing Firebase credentials in your source code.

## Important Security Note

**Firebase client-side configuration values (apiKey, etc.) are designed to be public.** They will appear in your built JavaScript bundle, which is normal and expected. The real security comes from:

1. **Firebase Security Rules** - Configure these in Firebase Console (see below)
2. **Keeping credentials out of source code** - Use `.env` files (never committed)
3. **Not exposing server-side secrets** - Never commit service account keys

## Setup Instructions

### 1. Local Development Setup

1. Create a `.env` file in the project root:
   ```bash
   touch .env
   ```

2. Add your Firebase credentials to `.env`:
   ```
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.region.firebasedatabase.app/
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

### 2. GitHub Pages Deployment

#### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Select branch: `gh-pages` and folder: `/ (root)`
5. Click **Save**

#### Step 2: Deploy

**Important:** Make sure your `.env` file is set up with your Firebase credentials before deploying.

**Note:** GitHub Pages is static hosting and doesn't support runtime environment variables. Vite embeds environment variables at build time, so you must build locally with your `.env` file.

1. Build and deploy:
   ```bash
   npm run deploy
   ```

   This command will:
   - Build your app with environment variables from `.env` (read at build time)
   - Embed Firebase config into the JavaScript bundle
   - Deploy the `dist` folder to the `gh-pages` branch

2. Your app will be available at: `https://yourusername.github.io/squid-house/`

**Alternative: Using GitHub Actions with Secrets**

If you want automated deployments with GitHub Secrets (instead of building locally), see **[GITHUB_PAGES_ENV_SETUP.md](./GITHUB_PAGES_ENV_SETUP.md)** for detailed instructions.

#### Step 3: Verify Deployment

1. Wait a few minutes for GitHub Pages to update
2. Visit your GitHub Pages URL
3. Check the browser console for any errors

### 3. Firebase Security Rules (IMPORTANT!)

**This is the real security layer!** Configure Firebase Realtime Database rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → **Realtime Database** → **Rules**
3. See **[FIREBASE_SECURITY_RULES.md](./FIREBASE_SECURITY_RULES.md)** for comprehensive security rule options

**Quick Start - Basic Security (Recommended for your weekend event):**

```json
{
  "rules": {
    "quiz": {
      "gameState": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['gameStarted', 'currentRound', 'currentQuestion', 'questionState', 'teams', 'answers'])",
        "gameStarted": { ".validate": "newData.isBoolean()" },
        "currentRound": { ".validate": "newData.isNumber() && newData.val() > 0 && newData.val() <= 10" },
        "currentQuestion": { ".validate": "newData.isNumber() && newData.val() >= 0" },
        "teams": {
          ".validate": "newData.hasChildren() && newData.numChildren() <= 20",
          "$teamId": {
            ".validate": "newData.hasChildren(['id', 'name', 'memberIds', 'color'])",
            "name": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 50" }
          }
        },
        "answers": {
          "$teamId": {
            "$questionId": {
              ".validate": "newData.hasChildren(['answer', 'timestamp'])",
              "answer": { ".validate": "newData.isNumber() && newData.val() >= 0" },
              "timestamp": { ".validate": "newData.isNumber() && newData.val() > 0" }
            }
          }
        }
      }
    }
  }
}
```

**For more advanced security options** (rate limiting, authentication-based), see the full guide in `FIREBASE_SECURITY_RULES.md`.

## Alternative: Deploy with Environment Variables in Command

If you prefer not to use a `.env` file, you can set environment variables inline:

```bash
# Build and deploy with inline environment variables
VITE_FIREBASE_API_KEY="your-key" \
VITE_FIREBASE_AUTH_DOMAIN="your-domain" \
VITE_FIREBASE_DATABASE_URL="your-url" \
VITE_FIREBASE_PROJECT_ID="your-project" \
VITE_FIREBASE_STORAGE_BUCKET="your-bucket" \
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id" \
VITE_FIREBASE_APP_ID="your-app-id" \
npm run deploy
```

## Troubleshooting

### Build fails with "Missing required Firebase environment variables"
- Ensure your `.env` file exists in the project root
- Check that all 7 environment variables are set in `.env`
- Verify variable names start with `VITE_` (required for Vite)
- Make sure `.env` is not in `.gitignore` exclusion (it should be ignored)

### App works locally but not on GitHub Pages
- Check that GitHub Pages is using the `gh-pages` branch
- Verify the `base` path in `vite.config.ts` matches your repository name
- Check browser console for errors
- Ensure you ran `npm run deploy` (not just `npm run build`)

### Firebase connection issues
- Verify Firebase Security Rules allow read/write
- Check that your Firebase project is active
- Ensure database URL is correct
- Check that environment variables were loaded during build

### Deployment not updating
- GitHub Pages can take a few minutes to update
- Check the `gh-pages` branch was updated: `git ls-remote origin gh-pages`
- Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

## Security Notes

1. **Firebase config values are public by design** - They're visible in the built JavaScript bundle on GitHub Pages. This is normal and expected.

2. **Real security = Firebase Security Rules** - Always configure proper rules in Firebase Console. This is where you control who can read/write data.

3. **Never commit `.env` files** - They're in `.gitignore` for a reason. Always keep credentials out of source code.

4. **The built bundle contains config** - When you deploy, the Firebase config values are embedded in the JavaScript. This is how Firebase client SDK works - it's not a security issue.

5. **What to protect**:
   - ✅ Keep `.env` out of git (already done)
   - ✅ Configure Firebase Security Rules
   - ✅ Never expose service account keys or admin SDK credentials
   - ❌ Don't worry about apiKey being in the bundle - it's meant to be there

