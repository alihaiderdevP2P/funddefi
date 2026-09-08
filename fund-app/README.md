# FundFlow — Flutter Mobile App

FundFlow is the **Android + iOS** client for the FundFlow crowdfunding platform. It talks **directly** to [`fund-server`](../fund-server) at **`/api/v1`** — the same REST API used by the Next.js web app (`fund-client`).

This document covers **everything**: first run, daily development, production API, Android / iOS builds, **Google Play**, **Apple App Store**, and **free** ways to share the app without paying store fees.

---

## Table of contents

1. [What this app does](#1-what-this-app-does)
2. [Architecture](#2-architecture)
3. [Prerequisites](#3-prerequisites)
4. [One-time project setup](#4-one-time-project-setup)
5. [Local development](#5-local-development)
6. [API base URL](#6-api-base-url)
7. [App screens & features](#7-app-screens--features)
8. [Project structure](#8-project-structure)
9. [Build for production](#9-build-for-production)
10. [Where to deploy what](#10-where-to-deploy-what)
11. [Production API (fund-server)](#11-production-api-fund-server)
12. [Android — APK / AAB](#12-android--apk--aab)
13. [Google Play Store (paid, official)](#13-google-play-store-paid-official)
14. [Android — free distribution (no Play fee)](#14-android--free-distribution-no-play-fee)
15. [iOS — IPA / Xcode](#15-ios--ipa--xcode)
16. [Apple App Store + TestFlight (paid, official)](#16-apple-app-store--testflight-paid-official)
17. [iOS — free / low-cost alternatives](#17-ios--free--low-cost-alternatives)
18. [How users install after you publish](#18-how-users-install-after-you-publish)
19. [CI/CD (optional)](#19-cicd-optional)
20. [Signing, icons, version, CORS](#20-signing-icons-version-cors)
21. [Checklist: development → production](#21-checklist-development--production)
22. [Troubleshooting](#22-troubleshooting)
23. [Official links](#23-official-links)

---

## 1. What this app does

The mobile app covers the same user journey as the web client:

| Area | What users can do |
|------|-------------------|
| Home | Hero, featured campaigns, platform stats |
| Explore | Search, filter by category/status |
| Campaign detail | Story, rewards, updates, backers, save/unsave |
| Back a project | Pledge amount + optional reward (recorded via `POST /funding`) |
| Create | Multi-step wizard + image upload (`POST /upload/image`) |
| Auth | Login, register, JWT in secure storage |
| Dashboard | Created campaigns, backed pledges, analytics |
| Profile / Settings | Name, bio, wallet, avatar, password, theme, API URL |
| Notifications | Inbox + preferences |
| Admin | Stats, campaigns, users, moderation (`admin` / `superadmin` only) |
| More | Support, contact, blog, careers, about, how-it-works, docs |

Package name (after `flutter create`): **`com.fundflow.fund_app`**  
App display name: **FundFlow**  
Version in `pubspec.yaml`: **`1.0.0+1`** (`1.0.0` = user-facing, `+1` = build number)

---

## 2. Architecture

```
┌─────────────────────┐         HTTPS / HTTP          ┌─────────────────────┐
│  FundFlow Flutter   │  ──────────────────────────►  │  fund-server        │
│  Android / iOS      │   GET/POST/PATCH /api/v1/*    │  NestJS :3001       │
│  Windows / Chrome   │                               │  JWT + PostgreSQL   │
└─────────────────────┘                               └──────────┬──────────┘
                                                                 │
                                                                 ▼
                                                      PostgreSQL + Supabase Storage
```

- **This app is not a website.** You do not “deploy Flutter” to Vercel. You **build installable files**: `.apk` / `.aab` (Android) and `.ipa` (iOS).
- The **backend** (`fund-server`) **must** be deployed separately. The phone then points at that public URL.
- Default API prefix: **`/api/v1`** (see `fund-server` `GLOBAL_PREFIX`).

---

## 3. Prerequisites

### Required for all development

| Tool | Why | Link |
|------|-----|------|
| **Flutter SDK 3.22+** (Dart 3.4+) | Build the app | [Install Flutter](https://docs.flutter.dev/get-started/install) |
| **Git** | Clone / version control | [git-scm.com](https://git-scm.com/downloads) |
| **VS Code or Android Studio** | Editor | [Flutter tools](https://docs.flutter.dev/tools) |
| **Running fund-server** | Real data (login, campaigns, upload) | `../fund-server` |

Check Flutter:

```powershell
flutter doctor -v
```

Fix anything marked `[!]` before you continue. Official doctor guide: [Flutter doctor](https://docs.flutter.dev/install/troubleshoot).

### Android development

| Tool | Notes | Link |
|------|-------|------|
| **Android Studio** | SDK, emulator, platform tools | [developer.android.com/studio](https://developer.android.com/studio) |
| Android SDK + **API 34+** | Installed from Android Studio SDK Manager | [SDK setup](https://docs.flutter.dev/platform-integration/android/setup) |
| An **emulator** or USB phone | Enable USB debugging on a real device | [Run on Android](https://docs.flutter.dev/get-started/test-drive) |

### iOS development (macOS only)

Apple does **not** allow building iOS apps on Windows. You need a **Mac** (or a cloud Mac — see [§17](#17-ios--free--low-cost-alternatives)).

| Tool | Notes | Link |
|------|-------|------|
| **macOS** | Required for Xcode | — |
| **Xcode** (latest stable) | Simulator + archive for App Store | [Xcode](https://developer.apple.com/xcode/) |
| **CocoaPods** | iOS plugin pods | [CocoaPods](https://cocoapods.org/) |
| **Apple ID** | Free Apple ID can run on *your* device for 7 days | [appleid.apple.com](https://appleid.apple.com/) |
| **Apple Developer Program ($99/year)** | TestFlight + App Store | [developer.apple.com/programs](https://developer.apple.com/programs/) |

```bash
sudo gem install cocoapods
cd ios && pod install && cd ..
```

---

## 4. One-time project setup

Platform folders (`android/`, `ios/`, `windows/`, `web/`) are generated once. Dart source already lives in `lib/`.

```powershell
cd d:\CODE\funddefi\fund-app

flutter create . --project-name fund_app --org com.fundflow --platforms android,ios,windows,web

flutter pub get
```

### 4.1 Android — allow HTTP to local fund-server

Debug builds talk to `http://10.0.2.2:3001`. Android blocks cleartext HTTP unless you allow it.

Open `android/app/src/main/AndroidManifest.xml`. On the `<application>` tag add:

```xml
android:usesCleartextTraffic="true"
```

Also keep the internet permission (Flutter usually adds it):

```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

Docs: [Network security config](https://developer.android.com/privacy-and-security/security-config).

For **production**, use **HTTPS** and you can remove `usesCleartextTraffic` (or keep it only in `android/app/src/debug/AndroidManifest.xml`).

### 4.2 iOS — photos + local HTTP

In `ios/Runner/Info.plist`:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Upload campaign and profile images</string>
<key>NSCameraUsageDescription</key>
<string>Take a campaign or profile photo</string>
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

For **production**, prefer HTTPS and tighten App Transport Security. Guide: [ATS](https://developer.apple.com/documentation/security/preventing-insecure-network-connections).

---

## 5. Local development

### 5.1 Start fund-server first

The app will show network errors if the API is down.

```powershell
cd d:\CODE\funddefi\fund-server
npm run start:dev
```

| Check | URL |
|-------|-----|
| API root | http://localhost:3001/api/v1 |
| Health | http://localhost:3001/api/v1/health |
| Swagger | http://localhost:3001/docs |

### 5.2 List devices, then run

```powershell
cd d:\CODE\funddefi\fund-app
flutter devices
```

```powershell
# Windows desktop
flutter run -d windows

# Chrome (web)
flutter run -d chrome

# Android emulator (name from `flutter devices`)
flutter run -d emulator-5554

# Attached Android phone
flutter run -d android
```

**Hot reload:** press `r` in the terminal. **Hot restart:** `R`. **Quit:** `q`.

### 5.3 Physical Android phone on the same Wi‑Fi

`localhost` on the phone is the **phone**, not your PC.

1. Find your PC LAN IP (PowerShell): `ipconfig` → IPv4, e.g. `192.168.1.10`
2. Allow port **3001** in Windows Firewall
3. Run:

```powershell
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:3001/api/v1
```

Or open the app → **More → Settings → API URL** and save the same address.

### 5.4 iOS Simulator (Mac)

```bash
open -a Simulator
cd fund-app
flutter run -d iphone
```

Simulator can use `http://localhost:3001/api/v1`. A **physical iPhone** needs your Mac’s LAN IP, same idea as Android.

---

## 6. API base URL

Configured in `lib/core/config/app_config.dart`.

| Where the app runs | Default API |
|--------------------|-------------|
| Android emulator | `http://10.0.2.2:3001/api/v1` |
| Windows / iOS simulator / Chrome | `http://localhost:3001/api/v1` |
| Physical device | Set LAN IP or production HTTPS URL |
| Production build | Pass `--dart-define=API_BASE_URL=https://YOUR-API/api/v1` |

Build-time override (recommended for release):

```powershell
flutter build apk --dart-define=API_BASE_URL=https://api.yourdomain.com/api/v1
```

Runtime override: **More → Settings → fund-server base URL**.

Auth: `POST /auth/login` returns JWT. Token is stored with `flutter_secure_storage` and sent as `Authorization: Bearer <token>`.

---

## 7. App screens & features

Bottom tabs: **Home · Explore · Create · Dashboard · More**

| Route | Screen | Auth |
|-------|--------|------|
| `/` | Home | No |
| `/campaigns` | Browse | No |
| `/campaigns/:id` | Detail | No |
| `/campaigns/:id/back` | Pledge | Yes |
| `/create` | Create campaign | Yes |
| `/dashboard` | Dashboard | Yes |
| `/login` `/register` | Auth | No |
| `/profile` `/settings` | Account | Yes |
| `/notifications` `/saved` | Inbox / saved | Yes |
| `/admin` | Admin panel | Admin / superadmin |
| `/support` `/contact` `/blog` `/careers` | Content | No |
| `/about` `/how-it-works` `/docs` | Info | No |

Create, dashboard, and admin require login. Admin tab is hidden unless `user.role` is `admin` or `superadmin`.

Mobile pledges call `POST /api/v1/funding` with a client-generated `transactionHash` (`mobile-…`). MetaMask is a **browser** wallet; on-device Ethereum wallets are not wired in this version.

---

## 8. Project structure

```
fund-app/
├── lib/
│   ├── main.dart                 # Entry
│   ├── app.dart                  # MaterialApp + providers
│   ├── core/                     # API client, theme, storage, config
│   ├── models/                   # Campaign, User, Funding, …
│   ├── services/                 # fund-server REST wrappers
│   ├── providers/                # Auth, theme, AppScope
│   ├── router/                   # go_router
│   ├── widgets/                  # Cards, images, empty/error UI
│   └── screens/                  # All pages
├── test/
├── pubspec.yaml
└── README.md                     # this file
```

After `flutter create .` you also get `android/`, `ios/`, `web/`, `windows/`.

---

## 9. Build for production

Always set the **public HTTPS API** at build time.

```powershell
$API = "https://api.yourdomain.com/api/v1"
```

```powershell
# Android installable APK (easy sharing / sideload)
flutter build apk --release --dart-define=API_BASE_URL=$API

# Android App Bundle (required by Google Play)
flutter build appbundle --release --dart-define=API_BASE_URL=$API

# iOS (Mac only) — then archive in Xcode
flutter build ios --release --dart-define=API_BASE_URL=$API

# Web (optional PWA / browser)
flutter build web --release --dart-define=API_BASE_URL=$API
```

Outputs:

| Command | File |
|---------|------|
| `flutter build apk` | `build/app/outputs/flutter-apk/app-release.apk` |
| `flutter build appbundle` | `build/app/outputs/bundle/release/app-release.aab` |
| `flutter build ios` | Xcode archive → IPA via Organizer |
| `flutter build web` | `build/web/` (host on any static host) |

Split-per-ABI APKs (smaller downloads):

```powershell
flutter build apk --split-per-abi --release --dart-define=API_BASE_URL=$API
```

Official build docs: [Flutter release builds](https://docs.flutter.dev/deployment).

---

## 10. Where to deploy what

The **phone app** and the **API** are two different products.

| Piece | What you ship | Where it lives |
|-------|----------------|----------------|
| **This Flutter app** | APK / AAB / IPA | Play Store, App Store, or a download link |
| **fund-server** | NestJS Node process | Render, Railway, Fly.io, a VPS, … |
| **Database** | PostgreSQL | [Supabase](https://supabase.com/) (free tier) or the same host |
| **Images** | Supabase Storage | Already used by fund-server |

### Recommended production layout

```
Users' phones
    │  HTTPS
    ▼
Google Play / App Store / APK link     ← you publish FundFlow here
    │
    ▼
https://api.yourdomain.com/api/v1      ← fund-server (HTTPS + CORS)
    │
    ├── PostgreSQL (Supabase)
    └── Storage bucket (campaign images)
```

### Backend hosts (pick one)

| Host | Cost | Good for | Link |
|------|------|----------|------|
| **Render** | **Free** web service (spins down when idle) | Student / FYP | [render.com](https://render.com/) |
| **Railway** | Free trial, then usage | Simple Node deploy | [railway.app](https://railway.app/) |
| **Fly.io** | Free allowance | Docker / global | [fly.io](https://fly.io/) |
| **Koyeb** | Free instance | Docker | [koyeb.com](https://www.koyeb.com/) |
| **Oracle Cloud** | Always-free VM | You manage Linux | [oracle.com/cloud/free](https://www.oracle.com/cloud/free/) |
| **A paid VPS** | ~$4–6/mo | Always-on API | DigitalOcean, Hetzner, Contabo |

**Best free combo for an FYP:**

1. Database + images → **Supabase free** — [supabase.com](https://supabase.com/)
2. API → **Render free** (or Oracle always-free VM if Render sleeps too often)
3. Android testers → **Firebase App Distribution** (free) — see [§14](#14-android--free-distribution-no-play-fee)
4. iOS testers without $99 → run on **your** iPhone with a free Apple ID, or share **Flutter web**

Update CORS in `fund-server/src/main.ts` / `CORS_ORIGINS` for production. Mobile apps usually do not send a browser Origin, but **Flutter web** does.

---

## 11. Production API (fund-server)

Before any store build:

1. Deploy `fund-server` with `NODE_ENV=production`, strong `JWT_SECRET`, HTTPS.
2. Point `DB_*` / `DATABASE_URL` at production Postgres.
3. Set `SUPABASE_*` so image upload works.
4. Confirm: `https://YOUR-API/api/v1/health`
5. Create a superadmin: `npm run create-superadmin` against production DB.
6. Build the Flutter app with `--dart-define=API_BASE_URL=https://YOUR-API/api/v1`

Never ship a release that still points at `localhost` or `10.0.2.2`.

---

## 12. Android — APK / AAB

### 12.1 Application ID

After `flutter create`, the ID is `com.fundflow.fund_app`.  
It lives in `android/app/build.gradle` (or `.kts`) as `applicationId`. **Do not change it after you publish** — stores treat a new ID as a new app.

### 12.2 Release signing (required for Play and for a trustworthy APK)

Debug APKs are signed with a debug key. Production needs **your** keystore.

```powershell
cd android
keytool -genkey -v -keystore fundflow-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias fundflow
```

Create `android/key.properties` (do **not** commit this file):

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=fundflow
storeFile=../fundflow-upload.jks
```

Wire it in `android/app/build.gradle` as described here:  
[Sign the app](https://docs.flutter.dev/deployment/android#signing-the-app)

**Back up the `.jks` and passwords.** If you lose them, you cannot update the Play listing (unless you use Play App Signing and still have upload-key reset).

### 12.3 Version

In `pubspec.yaml`:

```yaml
version: 1.0.0+1
```

- `1.0.0` → `versionName` (what users see)
- `+1` → `versionCode` (must **increase** every Play upload)

Each new store release: e.g. `1.0.1+2`, then `1.0.2+3`.

### 12.4 Build

```powershell
flutter build appbundle --release --dart-define=API_BASE_URL=https://YOUR-API/api/v1
flutter build apk --release --dart-define=API_BASE_URL=https://YOUR-API/api/v1
```

Install the APK on a phone:

```powershell
adb install build\app\outputs\flutter-apk\app-release.apk
```

Or copy the APK to the phone and open it (enable **Install unknown apps**).

---

## 13. Google Play Store (paid, official)

This is the **official** Android store. Users install from the Play app.

| Item | Detail |
|------|--------|
| Console | [play.google.com/console](https://play.google.com/console) |
| Sign up | [Play Console signup](https://play.google.com/console/signup) |
| Fee | **USD $25 one-time** (Google account) |
| Package | `com.fundflow.fund_app` (must stay unique worldwide) |
| Artifact | **AAB** only for new apps ([App Bundle](https://developer.android.com/guide/app-bundle)) |
| Policy | [Play policies](https://play.google.com/console/about/policycenter/) |
| Payments / crowdfunding | Read financial / crypto rules if you process real money in-app |

### Step-by-step

1. Pay the **$25** and complete identity verification.
2. **Create app** → name **FundFlow**, language, type **App**, free or paid.
3. Fill **Store listing**:
   - Short description, full description
   - App icon **512×512** PNG
   - Feature graphic **1024×500**
   - Phone screenshots (at least 2; 16:9 or 9:16)
   - Privacy policy **URL** (required) — host a simple page (GitHub Pages is free)
4. **App content**: questionnaire, target age, ads declaration.
5. **Data safety**: JWT login, email, wallet address, photos — declare accurately. Form: [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
6. **Release → Production** (or start with **Internal testing** / **Closed testing** — recommended first).
7. Upload `app-release.aab`.
8. Roll out. Review often takes **hours to a few days**.

Internal testing (up to 100 testers, fast):  
[Set up an internal test](https://support.google.com/googleplay/android-developer/answer/9845334)

Closed testing (email lists / Google Groups):  
[Closed testing](https://support.google.com/googleplay/android-developer/answer/9845334)

After approval, the public link looks like:

`https://play.google.com/store/apps/details?id=com.fundflow.fund_app`

Users install: **Play Store → search “FundFlow” → Install**.

---

## 14. Android — free distribution (no Play fee)

Use these for **FYP demos**, teachers, and testers. No $25 required.

### Option A — Firebase App Distribution (**recommended free**)

- Docs: [Firebase App Distribution](https://firebase.google.com/docs/app-distribution)
- Flutter: [Distribute Android builds](https://firebase.google.com/docs/app-distribution/android/distribute-console)
- You upload an APK/AAB, invite testers by email. They get a link and install (need to allow unknown sources once).
- **Cost: free** on Spark plan for this use.

### Option B — GitHub Releases (**fully free**)

1. `flutter build apk --release --dart-define=...`
2. Create a release: [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
3. Attach `app-release.apk`
4. Share the release URL. Testers download and install.

### Option C — Google Drive / Mega / WhatsApp

Upload the APK, share the link. Simple for a class demo. Less professional than A or B.

### Option D — Direct HTTPS download on your site

Host the APK next to a privacy policy page (GitHub Pages / Cloudflare Pages — **free**).

### Option E — Other Android stores (usually free to list)

| Store | Link | Notes |
|-------|------|--------|
| Amazon Appstore | [developer.amazon.com](https://developer.amazon.com/apps-and-games) | Free registration |
| Samsung Galaxy Store | [seller.samsungapps.com](https://seller.samsungapps.com/) | Free |
| Huawei AppGallery | [developer.huawei.com](https://developer.huawei.com/consumer/en/huawei-appgallery/) | Useful in some regions |

### Option F — F-Droid

[f-droid.org](https://f-droid.org/) — only if the app is **open source** and meets their inclusion rules. Not a quick FYP path.

**Install experience (APK):** Android Settings → allow install from that app (Chrome / Drive / Firebase) → Open APK → Install.

---

## 15. iOS — IPA / Xcode

**You cannot produce an App Store IPA on Windows.** Use a Mac, or a cloud Mac ([§17](#17-ios--free--low-cost-alternatives)).

```bash
cd fund-app
flutter pub get
cd ios && pod install && cd ..
flutter build ios --release --dart-define=API_BASE_URL=https://YOUR-API/api/v1
```

Then:

1. Open `ios/Runner.xcworkspace` in **Xcode** (not `.xcodeproj`).
2. Select **Runner** → **Signing & Capabilities**.
3. Choose your Team (Apple ID).
4. Product → **Archive**.
5. Window → **Organizer** → Distribute.

Bundle ID (must be unique): `com.fundflow.fund_app`  
Increase **version** + **build** for every TestFlight / App Store upload (same `pubspec.yaml` version scheme).

Guides:

- [Flutter iOS deployment](https://docs.flutter.dev/deployment/ios)
- [Xcode cloud / archive](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)

---

## 16. Apple App Store + TestFlight (paid, official)

| Item | Detail |
|------|--------|
| Program | [Apple Developer Program](https://developer.apple.com/programs/) — **USD $99 / year** |
| Enroll | [Enroll](https://developer.apple.com/programs/enroll/) |
| App Store Connect | [appstoreconnect.apple.com](https://appstoreconnect.apple.com/) |
| TestFlight (beta) | [TestFlight](https://developer.apple.com/testflight/) |
| Review rules | [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) |
| Privacy | [Privacy nutrition labels](https://developer.apple.com/app-store/app-privacy-details/) |

### Why $99 is required

A **free Apple ID** can install the app on **phones you own** for **7 days**, then the signature expires. **TestFlight** and the **public App Store** need the paid program.

### TestFlight (best way to beta on iOS)

1. Enroll in the Developer Program.
2. App Store Connect → **My Apps** → **+** → bundle ID `com.fundflow.fund_app`.
3. Archive in Xcode → **Distribute** → **App Store Connect**.
4. Wait for processing, then add the build to **TestFlight**.
5. Internal testers (up to 100, same team) — almost immediate.
6. External testers — Apple does a **Beta App Review** first.
7. Testers install the **TestFlight** app from the App Store, then redeem your invite.

TestFlight install guide for testers: [TestFlight help](https://testflight.apple.com/)

### Public App Store

1. Complete listing: name, subtitle, description, keywords, support URL, **privacy policy URL**.
2. Screenshots for the device sizes Apple asks for (use Simulator screenshots).
3. Age rating, encryption question (HTTPS-only usually “standard encryption”).
4. Submit for review. Typical wait: **24–48 hours**, sometimes longer.
5. After **Ready for Sale**, users install from the **App Store** app.

Public URL looks like:

`https://apps.apple.com/app/idXXXXXXXX`

(You get the numeric id in App Store Connect.)

**Crowdfunding / crypto:** Apple is strict about wallets, real-money funding, and financial features. Read guideline **3.1 Payments** and **3.2.1** before submitting a live-money product. For an FYP demo, describe it as a **student project / testnet** if that is accurate.

---

## 17. iOS — free / low-cost alternatives

Apple does not offer a free public store like sideloading on Android. Realistic options:

| Option | Cost | Who can install | Link |
|--------|------|-----------------|------|
| **Free Apple ID on your iPhone** | $0 | Only devices you plug into Xcode, **7-day** cert | [Run on a device](https://docs.flutter.dev/deployment/ios#create-a-provisioning-profile) |
| **TestFlight** | $99/year | Up to 10,000 external testers | [TestFlight](https://developer.apple.com/testflight/) |
| **Flutter web** (PWA) | $0 | Anyone with the URL (Safari / Chrome) | [Flutter web](https://docs.flutter.dev/platform-integration/web) |
| **Cloud Mac to build** | Often a free trial, then paid | You still need signing | [MacStadium](https://www.macstadium.com/), [Codemagic](https://codemagic.io/), [GitHub macOS runners](https://docs.github.com/en/actions/using-github-hosted-runners) |
| **AltStore / sideload** | $0 | Complicated, 7-day limit, not for class distribution | Community tools — not recommended for FYP grading |

### Best **free** iOS story for an FYP

1. Develop Android + Windows/Chrome on your PC.
2. On iOS: record a **Simulator video** on a friend’s Mac, **or**
3. Host **`flutter build web`** on [GitHub Pages](https://pages.github.com/) / [Cloudflare Pages](https://pages.cloudflare.com/) (**free**) and open it on iPhone Safari (“Add to Home Screen”).
4. If the university requires a real iPhone install, borrow a Mac for one afternoon and use a **free Apple ID** on that device.

### Codemagic (CI that can sign iOS)

[codemagic.io](https://codemagic.io/start/) — free minutes each month. You still need an Apple Developer account to ship TestFlight / App Store. Docs: [Codemagic Flutter](https://docs.codemagic.io/yaml-quick-start/building-a-flutter-app/).

---

## 18. How users install after you publish

### Android — Play Store (paid route)

1. Open **Google Play** on the phone.
2. Search **FundFlow** or open `https://play.google.com/store/apps/details?id=com.fundflow.fund_app`
3. Tap **Install**.

### Android — APK / Firebase / GitHub (free route)

1. Open the link you sent (Firebase email, GitHub Release, Drive).
2. Download the `.apk`.
3. If Android blocks it: **Settings → Apps → Special access → Install unknown apps →** allow Chrome / Drive / Firebase App Tester.
4. Open the file → **Install**.
5. First launch: if you used a production API, they are done. If not, **More → Settings** and paste the API URL.

### iOS — App Store (paid route)

1. Open the **App Store** app.
2. Search **FundFlow** or open your `apps.apple.com` link.
3. Tap **Get**.

### iOS — TestFlight (paid developer, free for testers)

1. Install **TestFlight** from the App Store.
2. Open the invite email / public TestFlight link.
3. Tap **Accept** → **Install**.

### iOS — Xcode cable (free Apple ID)

1. Connect iPhone to Mac.
2. Trust the computer on the phone.
3. Xcode → run **Runner** on the device.
4. iPhone → **Settings → General → VPN & Device Management** → Trust the developer certificate.
5. Re-install every **7 days**.

---

## 19. CI/CD (optional)

Automate APK/AAB on every git tag.

| Service | Free tier | Link |
|---------|-----------|------|
| **GitHub Actions** | Generous free minutes (Linux Android builds) | [Flutter action](https://github.com/marketplace/actions/flutter-action) |
| **Codemagic** | Free Mac minutes for iOS | [codemagic.io](https://codemagic.io/) |
| **Firebase App Distribution** | Free tester delivery | [docs](https://firebase.google.com/docs/app-distribution) |

Example idea: on tag `v1.0.1`, GitHub Actions runs `flutter build apk`, uploads the APK to GitHub Releases.

---

## 20. Signing, icons, version, CORS

### Icons & splash

Use [flutter_launcher_icons](https://pub.dev/packages/flutter_launcher_icons) and [flutter_native_splash](https://pub.dev/packages/flutter_native_splash). Play requires a 512×512 icon; Apple requires 1024×1024.

### Privacy policy (both stores)

You need a public URL. Free hosts:

- [GitHub Pages](https://pages.github.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

Mention: accounts (email, name), JWT, optional wallet address, uploaded images (Supabase), no sale of personal data (if true).

### CORS / HTTPS

- Production API **must be HTTPS** or iOS ATS and Android will fight you.
- Add Flutter web origin to `CORS_ORIGINS` if you ship web.
- Native Android/iOS HTTP clients typically do not need CORS.

### Security reminders

- Never commit `*.jks`, `key.properties`, or Apple `.p12` / profiles.
- Rotate `JWT_SECRET` in production.
- Increase `version` / `versionCode` / iOS build number on every store upload.

---

## 21. Checklist: development → production

Use this in order.

### Development (now)

- [ ] Install Flutter, run `flutter doctor`
- [ ] `flutter create . --project-name fund_app --org com.fundflow --platforms android,ios,windows,web`
- [ ] `flutter pub get`
- [ ] Android cleartext + iOS Info.plist (local HTTP / photos)
- [ ] Start `fund-server` on port 3001
- [ ] `flutter run` on emulator or Windows
- [ ] Register a user, browse campaigns, create, back, dashboard

### Pre-production

- [ ] Deploy fund-server + Postgres + Supabase (HTTPS)
- [ ] Hit `/api/v1/health` from a phone browser
- [ ] Create production superadmin
- [ ] Set privacy policy page (free GitHub Pages is enough)
- [ ] App icon + screenshots
- [ ] Release keystore (Android) + Apple Team (iOS)

### Android release

- [ ] `version: x.y.z+N` bumped
- [ ] `flutter build appbundle --release --dart-define=API_BASE_URL=https://...`
- [ ] **Free testers:** Firebase App Distribution or GitHub Release APK
- [ ] **Store:** Play Console $25 → Internal test → Production

### iOS release

- [ ] Mac + Xcode + `pod install`
- [ ] `flutter build ios --release --dart-define=API_BASE_URL=https://...`
- [ ] **Free:** your device, 7-day cert, **or** Flutter web PWA
- [ ] **Store:** Apple Developer $99 → TestFlight → App Store Review

### After go-live

- [ ] Share Play / App Store / APK / TestFlight links
- [ ] Watch crash reports (Play Vitals / Xcode Organizer / [Firebase Crashlytics](https://firebase.google.com/docs/crashlytics) — free)
- [ ] Every update: bump build number, rebuild with the same API URL, upload again

---

## 22. Troubleshooting

| Problem | Fix |
|---------|-----|
| `flutter: command not found` | Add Flutter `bin` to PATH; restart the terminal. [PATH](https://docs.flutter.dev/install/manual) |
| `flutter doctor` Android licenses | `flutter doctor --android-licenses` |
| Cannot reach API on emulator | Use `http://10.0.2.2:3001/api/v1` + `usesCleartextTraffic` |
| Cannot reach API on real phone | Use PC LAN IP, same Wi‑Fi, firewall allows 3001 |
| `401` after login | Token expired or server JWT secret changed — log in again |
| Image upload fails | fund-server Supabase env + `storage:setup` |
| Play rejects AAB | Wrong signing, `versionCode` not increased, missing privacy policy |
| iOS archive no signing team | Log into Xcode with Apple ID; enable **Automatically manage signing** |
| iOS “Untrusted Developer” | Settings → VPN & Device Management → Trust |
| App Store crypto questions | If you only use HTTPS, that is standard encryption — answer the export form honestly |
| Render API “asleep” | First request is slow; upgrade or use a VM that stays up |

---

## 23. Official links

### Flutter

- Install: https://docs.flutter.dev/get-started/install
- Android deploy: https://docs.flutter.dev/deployment/android
- iOS deploy: https://docs.flutter.dev/deployment/ios
- Web deploy: https://docs.flutter.dev/deployment/web
- Dart defines (`--dart-define`): https://docs.flutter.dev/deployment/flavors

### Android / Play

- Android Studio: https://developer.android.com/studio
- Play Console: https://play.google.com/console
- Play signup ($25): https://play.google.com/console/signup
- App Bundles: https://developer.android.com/guide/app-bundle
- Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Internal testing: https://support.google.com/googleplay/android-developer/answer/9845334

### Apple / App Store

- Developer Program ($99/year): https://developer.apple.com/programs/
- Enroll: https://developer.apple.com/programs/enroll/
- App Store Connect: https://appstoreconnect.apple.com/
- TestFlight: https://developer.apple.com/testflight/
- Review guidelines: https://developer.apple.com/app-store/review/guidelines/
- Xcode: https://developer.apple.com/xcode/

### Free sharing & hosting

- Firebase App Distribution: https://firebase.google.com/docs/app-distribution
- GitHub Releases: https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository
- GitHub Pages: https://pages.github.com/
- Cloudflare Pages: https://pages.cloudflare.com/
- Render (free API): https://render.com/
- Supabase (free DB + storage): https://supabase.com/
- Codemagic: https://codemagic.io/

---

## Quick start (copy-paste)

```powershell
cd d:\CODE\funddefi\fund-app
flutter create . --project-name fund_app --org com.fundflow --platforms android,ios,windows,web
flutter pub get
# then edit AndroidManifest (cleartext) as in §4.1

cd ..\fund-server
npm run start:dev

cd ..\fund-app
flutter run -d windows
```

**Short recommendation**

- **Class demo / FYP (free):** Android APK via Firebase App Distribution or GitHub Releases + API on Render/Supabase.
- **Real public users on Android:** Google Play ($25 once).
- **Real public users on iPhone:** Apple Developer ($99/year) + TestFlight then App Store.
- **Need iPhone without $99:** Flutter web (free) or a 7-day Xcode install on one device.



cd D:\CODE\funddefi\fund-app
flutter run -d web-server --web-hostname=127.0.0.1 --web-port=8080 --no-web-resources-cdn

flutter run -d chrome --release --web-hostname=127.0.0.1 --no-web-resources-cdn