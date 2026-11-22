# AGENTS.md — Khel-Kud (खेल-कूद) Sports Movement Tracker

## 1. Project Overview & Mission

**Khel-Kud** is a mobile-first athletic movement and spatial tracking system designed for team and court sports:
- **Indoor Court Sports:** Futsal, Basketball, Pickleball (GPS-denied environments relying on inertial sensors).
- **Outdoor Field Sports:** Football / Soccer (Hybrid GPS + inertial tracking).

The goal is to deliver a **Strava-like experience for court and field sports**:
1. Place phone in a pocket, sports arm band, or vest during gameplay.
2. Track steps, active game time, sprint bursts, cadence, distance, and field coverage.
3. Generate 2D positional trajectories and pitch/court heatmaps overlaid on accurate sport court dimensions.
4. Work **offline-first** on-device with lightweight processing, with eventual cloud backup and analytics.

---

## 2. Immediate Focus: Phone Prototyping MVP

The priority is **rapid prototyping directly on a physical smartphone** (via Expo Go / Expo Dev Client):
- High-frequency sensor ingestion (Accelerometer, Gyroscope, Magnetometer, Step Counter / Pedometer).
- Calibration mode to log real game movements and verify step-counting accuracy.
- Sport court selector (Futsal, Basketball, Pickleball, Football) with standardized dimensions.
- Real-time session controls (Start, Pause, Resume, Finish) with battery-safe background or foreground service.
- Immediate post-match analytics: Steps, distance covered, top speed, sprint count, and a 2D court heatmap.
- Raw session data export (JSON/CSV) to calibrate algorithms against ground truth.

---

## 3. Technology Stack & Planned Evolution

### Mobile Application (Current Focus)
- **Framework:** React Native (`0.86+`) with Expo (`SDK 57+` / Expo Router `v6+`).
- **Target OS:** iOS (14+) and Android (API 29+ / Android 10+).
- **Language:** TypeScript (`strict: true`).
- **Navigation:** Expo Router (file-based routing: `app/(tabs)`).
- **Cross-Platform Sensor Ingestion:**
  - `expo-sensors`: `Pedometer`, `Accelerometer`, `Gyroscope`, `DeviceMotion`, `Magnetometer`.
    - *iOS:* Uses Apple CoreMotion (`CMPedometer`); requires `NSMotionUsageDescription`.
    - *Android:* Uses Hardware Step Counter; requires `android.permission.ACTIVITY_RECOGNITION`. Includes automatic Accelerometer-peak fallback if device lacks hardware pedometer.
  - `expo-location`: High-accuracy GPS for outdoor football (`NSLocationWhenInUseUsageDescription` / `ACCESS_FINE_LOCATION`).
  - `expo-keep-awake`: Keeps phone awake during match tracking to prevent OS-level sensor sleep when in pocket.
- **Persistence (Local First):**
  - High-frequency sensor buffers: In-memory ring buffer flushed in batches to `expo-sqlite` or fast file logs.
  - Session aggregates: Local SQLite or `@react-native-async-storage/async-storage`.
- **Visualization:** `react-native-svg` for rendering 2D court diagrams, trajectories, and density heatmaps.

### Future Backend Boundary (Phase 2)
- **API & Compute:** Python (FastAPI, NumPy, SciPy) for complex Kalman filtering, step-and-heading kinematics, and ML-based trajectory reconstruction.
- **Database:** PostgreSQL with PostGIS for spatial queries and session histories.
- **Sync:** REST / WebSocket sync from mobile client to backend.

---

## 4. Agent Personas & Responsibilities

When collaborating or delegating tasks, adopt or assign the following specialist roles:

| Agent Persona | Focus Area | Key Responsibilities |
| :--- | :--- | :--- |
| **Mobile Expo Architect** | UI/UX & App Lifecycle | Expo Router setup, React Native performance, screen layout, tab navigation, battery & wakelock management, dark-mode styling. |
| **Sensor & Kinematics Specialist** | Signal Processing & IMU | Ingestion from `expo-sensors`, low-pass filtering, step detection algorithms, cadence, Weinberg/Kim step-length estimation, Pedestrian Dead Reckoning (PDR). |
| **Court Geometry & Heatmap Specialist** | Spatial Analytics & SVG | Standard court coordinate models (Basketball, Futsal, Pickleball, Football), 2D drift bounds, grid binning, Gaussian blur heatmaps, SVG rendering. |
| **Data Persistence & Export Specialist** | Storage & Benchmarking | SQLite schema, batch write pipelines, offline session sync, CSV/JSON session exporter for physical phone calibration. |

---

## 5. Architectural Principles & Guidelines

### 5.1 Decoupled Data Pipeline
Keep sensor acquisition, kinematics processing, and UI visualization strictly separated:
```text
[Device Sensors (IMU / Pedometer / GPS)]
                ↓
    [Sensor Manager Service]  <-- Throttling & batching (e.g., 20-50Hz)
                ↓
   [Kinematics / Filter Engine] <-- Step detection, heading, velocity, court clamp
                ↓
    [Local Storage (SQLite)]   <-- Persisted session points & metrics
                ↓
    [UI State / SVG Heatmap]   <-- Reactive presentation
```

### 5.2 Indoor Court Positioning Strategy (GPS-Denied)
- **Do not rely on double-integrating raw accelerometer values** (leads to exponential position drift within seconds).
- **Use Pedestrian Dead Reckoning (PDR):**
  1. Detect discrete step events from vertical/magnitude acceleration peaks.
  2. Estimate dynamic step length based on acceleration variance/bounce.
  3. Determine heading via Gyroscope + Magnetometer sensor fusion.
  4. Project position vector: $x_{t} = x_{t-1} + L \cos(\theta), \quad y_{t} = y_{t-1} + L \sin(\theta)$.
  5. Constrain displacement within the configured sport court bounds (elastic walls / bounding-box clamping).

### 5.3 Performance & Battery Safeguards
- Avoid setting state on every single accelerometer event (50Hz = 50 re-renders/sec will freeze React).
- Accumulate sensor ticks into an in-memory buffer; publish aggregated metrics to UI at 1Hz or 2Hz.
- Batch write high-frequency records to storage every 5-10 seconds.
- Provide user controls to switch between "High Accuracy" (higher battery drain) and "Battery Saver" modes.

---

## 6. Directory Layout Standard

Follow the project structure inside `mobile-app/`:
```text
mobile-app/
├── src/
│   ├── app/                      # Expo Router screens ((tabs), session/[id])
│   ├── features/                 # Domain features
│   │   ├── tracking/             # Active game recording, live timers, sensor controls
│   │   ├── analytics/            # Post-match stats, pace, speed graphs, heatmaps
│   │   └── courts/               # Sport-specific court visualizers (Futsal, Basketball, etc.)
│   ├── services/                 # Hardware & storage adapters
│   │   ├── sensors/              # Accelerometer, Pedometer, Gyroscope, Location managers
│   │   ├── processing/           # Step detection, filtering, PDR kinematics, heatmaps
│   │   └── storage/              # SQLite / AsyncStorage session repository
│   ├── components/               # Reusable UI library (Button, Card, Badge, ScreenWrapper)
│   ├── types/                    # Shared domain types (Session, SensorSample, SportConfig)
│   ├── constants/                # Court dimensions, colors, sensor frequencies
│   └── utils/                    # Math (Haversine, filters, vectors) and time formatters
```

---

## 7. Development & Prototyping Commands

Run from the `mobile-app/` directory:
- **Start bundler:** `npx expo start`
- **Run on physical phone:** Scan QR code using Expo Go app on iOS/Android or use tunnel `npx expo start --tunnel`.
- **Install recommended dependencies:**
  ```bash
  npx expo install expo-sensors expo-location expo-sqlite react-native-svg
  ```
- **Type check:** `npx tsc --noEmit`
