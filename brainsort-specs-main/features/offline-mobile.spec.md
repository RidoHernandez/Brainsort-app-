# Offline & Mobile Specification

## 1. Context & Motivation
BrainSort targets students who may not always have reliable internet access — especially on mobile devices during commutes, in areas with poor connectivity, or in classrooms with restricted WiFi. An offline-capable platform ensures uninterrupted learning. The platform is built as a cross-platform application (`brainsort-app`) using React Native + Expo, targeting Web (PWA), iOS (Apple App Store), and Android (Google Play Store). La arquitectura documenta un enfoque **Offline-First** con persistencia local (SQLite en móvil, IndexedDB + Service Workers en web).

## 2. User Experience (UX)
- **Offline Manager**: Users browse a list of available algorithm modules and selectively download them for offline use. A progress indicator shows download status.
- **Offline Simulation**: Once downloaded, users can run simulations for that algorithm without internet. Steps are generated locally via the `packages/core` Visualizer Engine.
- **Sync on Reconnect**: When the device regains connectivity, progress (points, completed exercises, streak data) syncs automatically to the backend.
- **PWA Mode (Web)**: On supported browsers, BrainSort can be installed as a Progressive Web App with Service Worker caching for static assets and algorithm data.
- **Mobile Native**: iOS and Android apps are distributed via their respective stores (Apple App Store, Google Play Store) with Expo EAS Build.

## 3. Core Requirements
**In-Scope:**
- Selective download of algorithm modules for offline simulation.
- Local step generation using `packages/core` (pure algorithm logic, no network dependency).
- Service Workers for web offline caching of static assets and algorithm data.
- expo-sqlite for mobile offline data persistence.
- IndexedDB for web offline data persistence.
- OTA (Over-the-Air) updates via Expo EAS for mobile.
- APK size constraint: < 50 MB.
- Optional WASM modules (20–50 MB each) served on demand from the project's own infrastructure for enhanced performance on Android. Excluded from iOS (Apple App Store restrictions on downloaded executable code, per Feature Toggling architecture decision).

**Out-of-Scope:**
- Full offline access to all platform features (leaderboard, ranking require connectivity).
- Offline exercise submission — exercises require server-side validation for point assignment.
- Background sync via Push Notifications.

## 4. Edge Cases & Error Handling
- Download interrupted mid-transfer: Resume capability or re-download with clear user feedback.
- Storage full on device: Alert user with estimated space requirement before download.
- Stale offline data: Show timestamp of last sync; prompt user to update when connectivity is available.
- WASM not supported: Fallback to JavaScript-based algorithm execution transparently.

---
*Note: This document defines "What" the feature is. For technical implementation details, see the corresponding `.plan.md` file.*
