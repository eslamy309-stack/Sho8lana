# Sho8lana — Deployment Guide

## Make it live in 15 minutes (free)

The fastest path is Vercel + GitHub. Both are free for this project size.

---

## Step 1 — Push to GitHub

1. Go to https://github.com and create a free account (or sign in).
2. Click **New repository**, name it `sho8lana`, set it to **Private**, click **Create**.
3. Open PowerShell in your project folder and run:

```powershell
cd "C:\Users\Doaa Eladly\OneDrive\Desktop\sho8lana"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sho8lana.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2 — Deploy to Vercel

1. Go to https://vercel.com and sign in with your GitHub account.
2. Click **Add New Project**.
3. Find and import your `sho8lana` repository.
4. Vercel detects Next.js automatically — no configuration needed.
5. Before clicking **Deploy**, expand **Environment Variables** and add each variable from `.env.local` (see below).
6. Click **Deploy**. Your app will be live at `https://sho8lana.vercel.app` (or similar) in about 2 minutes.

Every time you `git push`, Vercel automatically redeploys.

---

## Step 3 — Environment Variables on Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

| Name | Value | Required? |
|------|-------|-----------|
| `NEXT_PUBLIC_GEMINI_KEY` | Your Gemini AI key | Yes (already set) |
| `NEXT_PUBLIC_JSEARCH_KEY` | Your RapidAPI JSearch key | No — app works without it |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase config value | No — app works without it |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase config value | No |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase config value | No |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase config value | No |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase config value | No |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase config value | No |

The app runs fully without Firebase (uses browser localStorage) and fully without JSearch (shows mock LinkedIn jobs). Add them later when you are ready to scale.

---

## Optional: Add Real LinkedIn Jobs (JSearch API)

This gives you live, real job listings pulled from LinkedIn and Indeed — filtered to Egypt.

1. Go to https://rapidapi.com and create a free account.
2. Search for **JSearch** by letscrape.
3. Click **Subscribe** on the Basic (free) plan — 200 requests/month.
4. Copy your API key from the **Header** section (`X-RapidAPI-Key`).
5. Paste it into `NEXT_PUBLIC_JSEARCH_KEY` in `.env.local` (local) and in Vercel (live).

---

## Optional: Add Firebase (Real Database + Auth + File Storage)

Firebase lets students create accounts, upload documents permanently, and apply across sessions. Without it, all data is stored in the browser only.

### Create Firebase Project

1. Go to https://console.firebase.google.com and sign in.
2. Click **Add project**, name it `sho8lana`, disable Google Analytics (not needed), click **Create**.

### Enable Authentication

1. In your project, go to **Build** → **Authentication** → **Get started**.
2. Enable **Email/Password** and **Google** sign-in providers.

### Enable Firestore Database

1. Go to **Build** → **Firestore Database** → **Create database**.
2. Choose **Start in test mode** (allows all reads/writes for 30 days — fine for now).
3. Select a region close to Egypt (e.g., `europe-west1`).

### Enable Storage

1. Go to **Build** → **Storage** → **Get started**.
2. Accept defaults and choose the same region.

### Get Your Config Keys

1. Go to **Project Settings** (gear icon) → **General** → scroll to **Your apps**.
2. Click **Web** (the `</>` icon) → register your app → copy the config object.
3. It looks like this:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "sho8lana.firebaseapp.com",
  projectId: "sho8lana",
  storageBucket: "sho8lana.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

4. Copy each value into `.env.local` and into Vercel's Environment Variables.

---

## Custom Domain (Optional)

In Vercel → **Settings** → **Domains**, add your own domain (e.g., `sho8lana.com`). Vercel handles HTTPS automatically. Domain registration costs about $10-15/year from Namecheap or Google Domains.

---

## Local Development

```powershell
cd "C:\Users\Doaa Eladly\OneDrive\Desktop\sho8lana"
npm run dev
```

Open http://localhost:3000 in your browser.

---

## What's Free, What Costs Money

| Service | Free Tier | When You'd Pay |
|---------|-----------|----------------|
| Vercel | Unlimited deployments, 100GB bandwidth/month | Never, for this scale |
| Firebase Auth | 10,000 users/month | When you hit 10k users |
| Firestore | 1GB storage, 50k reads/day | At serious scale |
| Firebase Storage | 5GB | After 5GB of uploaded documents |
| JSearch API | 200 requests/month | At $10/month for more |
| Gemini AI | Free tier included | At high usage volume |

For a university project or early launch, everything is free.
