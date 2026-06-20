# 🌸 Stilla — build your APK in the cloud (no Android Studio)

Stilla is a daily wellness app for women: mood check-ins, affirmations,
a gratitude journal, an activity suggester, cortisol-calming tips, and a
guided breathing reset — with a PIN lock and a daily reminder.

This folder is the **complete app**. You don't need Android Studio or any
coding tools. GitHub will build the installable **.apk** for you, for free.
Follow the steps below — it takes about 15 minutes, most of it waiting.

---

## ✅ What you need
- A free **GitHub account** → https://github.com/signup
- Your **Android phone**
- This folder, unzipped on your computer

---

## Step 1 — Create a new repository
1. Go to https://github.com/new
2. **Repository name:** `stilla`
3. Choose **Private** (only you can see it) — optional
4. Leave everything else unticked. Click **Create repository**.

## Step 2 — Upload the project files
1. On the new empty repo page, click the link **“uploading an existing file”**
   (or the **Add file → Upload files** button).
2. Open this `stilla-android` folder on your computer, select **everything
   inside it** (package.json, src, index.html, the `.github` folder, etc.)
   and **drag it all** into the GitHub upload box.
   - ⚠️ Make sure the **`.github`** folder gets uploaded — that's what runs
     the build. If you don't see it, enable “show hidden files” in your file
     explorer.
3. Scroll down and click **Commit changes**.

## Step 3 — Let GitHub build the app
- Uploading automatically starts the build.
- Click the **Actions** tab at the top of your repo.
- You'll see **“Build Stilla APK”** running with a spinning yellow dot.
- Wait ~5–10 minutes for a green ✓. (First build is the slowest.)
- If it goes red ✗, open it, click the failed step, copy the error, and send
  it to me — I'll tell you the one-line fix.

## Step 4 — Download your APK
1. Click the finished (green ✓) build.
2. Scroll to the bottom to the **Artifacts** section.
3. Download **`Stilla-app-apk`** — it saves as a `.zip`.
4. Unzip it → inside is **`app-debug.apk`**. That's your app. 🎉

## Step 5 — Install it on your phone
1. Get `app-debug.apk` onto your phone — email it to yourself, upload to
   Google Drive, or copy via USB.
2. Tap the file on your phone.
3. Android will ask to **allow installing from this source** → allow it.
4. Install, open **Stilla**, and tap **Allow** for notifications so your
   daily reminder works. Done!

---

## 🔁 Want to change something later?
Edit the files in your repo (or re-upload), commit, and GitHub rebuilds a
fresh APK automatically. Just download the new one from **Actions → Artifacts**.

## 📲 What's inside Stilla
- **Today** — mood check-in + 7-day trend, daily affirmation, a tiny
  self-care act, “Calm your cortisol” tips, and a wins/gratitude journal
- **Move (Keep Moving)** — log workouts across yoga, pilates, strength (full
  gym + home exercise library), HIIT, Hyrox, CrossFit, running, walking,
  hiking, cycling, swimming, dance, boxing, barre and mobility — with a
  tracker and a copy-from-a-previous-date button
- **Lift** — pick a vibe (Move, Treat, Create, Connect, Rest, Explore, Calm)
  and get an activity idea: walk, shop, watch a movie, call a friend, read…
- **Breathing reset** — animated 4-7-8 and box breathing
- **You** — streak + your stats
- **Settings (⚙)** — set a PIN lock and a daily reminder time

## Good to know (honest notes)
- This is a **debug APK** — perfect for using yourself and sharing with
  friends. For the **Google Play Store** you'd need a signed *release* build
  (I can set that up for you — just ask).
- **Fingerprint/Face unlock** isn't bundled in this version to keep the build
  rock-solid; the **PIN lock works fully**. I can add biometric on request.
- The PIN is a convenience lock, not encryption.
- Your data is stored **only on your phone**.
- Before publishing publicly, change the app id `com.stilla.app` in
  `capacitor.config.json`.

## Prefer to build on your own PC instead?
You can, if you have Node + Android Studio:
```
npm install
npm run build
npx cap add android
npx cap sync
npx cap open android      # then press Run, or Build → Build APK(s)
```
But the GitHub steps above need none of that.

---
*Stilla shares general wellbeing ideas, not medical advice. If stress or low
mood is ongoing, please reach out to a doctor or mental-health professional.*
