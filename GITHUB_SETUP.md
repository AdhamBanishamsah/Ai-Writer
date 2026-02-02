# Publish Ai Writer to GitHub (for Chrome Web Store links)

The Chrome Web Store needs **reachable** URLs for Privacy policy, Support, and Website. I did **not** publish anything to Git — you need to push this project to GitHub yourself. Follow these steps.

---

## 1. Create the repo on GitHub

1. Go to [github.com/new](https://github.com/new).
2. **Repository name:** `Ai-Writer` (or `ai-writer`).
3. **Public**, no need to add README (you already have files).
4. Click **Create repository**.

---

## 2. Push your project from your machine

Open a terminal in the **Ai Writer** project folder (the one that contains `manifest.json`, `PRIVACY_POLICY.md`, `docs/`, etc.) and run:

```bash
cd "/Users/adhambanishamsah/Library/CloudStorage/OneDrive-Lillestrømkommune/Adham/RN/Ai Writer/Ai Writer"

# Initialize git if not already
git init

# Add everything
git add .

# Commit
git commit -m "Ai Writer Chrome extension - initial commit"

# Add your repo (replace YOUR_USERNAME with your GitHub username, e.g. AdhamBanishamsah)
git remote add origin https://github.com/YOUR_USERNAME/Ai-Writer.git

# Push (use main branch)
git branch -M main
git push -u origin main
```

If the repo already exists on GitHub and you use SSH:

```bash
git remote add origin git@github.com:AdhamBanishamsah/Ai-Writer.git
git branch -M main
git push -u origin main
```

---

## 3. Enable GitHub Pages (for Privacy policy URL)

1. On GitHub, open your repo **Ai-Writer**.
2. Go to **Settings** → **Pages** (left sidebar).
3. Under **Source**, choose **Deploy from a branch**.
4. **Branch:** `main`, folder: **/docs**.
5. Click **Save**.
6. Wait 1–2 minutes. Your privacy policy will be at:
   - **https://AdhamBanishamsah.github.io/Ai-Writer/**  
   (Replace `AdhamBanishamsah` with your GitHub username; use lowercase in the URL if your username is lowercase.)

---

## 4. URLs to use in Chrome Web Store

After the repo is public and Pages is enabled, use these in the Chrome Web Store dashboard:

| Field | URL |
|--------|-----|
| **Privacy policy** | `https://AdhamBanishamsah.github.io/Ai-Writer/` |
| **Website** | `https://github.com/AdhamBanishamsah/Ai-Writer` |
| **Support** | `https://github.com/AdhamBanishamsah/Ai-Writer/issues` |

Replace `AdhamBanishamsah` with your real GitHub username.  
If your Pages URL is different (e.g. lowercase repo), use the URL GitHub shows under **Settings → Pages** after it’s deployed.

---

## 5. Check that links work

- **Privacy:** Open the Privacy policy URL in a browser (incognito is fine). You should see the “Privacy Policy — Ai Writer” page.
- **Website:** Open the repo URL. You should see the project on GitHub.
- **Support:** Open the issues URL. You should see the repo’s Issues page (empty is fine).

Then save your draft again in the Chrome Web Store; the “not reachable” errors should clear once the URLs are live.
