# Team Sports Movement Tracker

An early-stage project for a Strava-like movement tracker for team sports, initially focused on basketball and indoor football.

The player will carry a phone while playing. The mobile app will eventually collect device sensor data, store game sessions, estimate movement, and display statistics such as distance, speed, steps, trajectories, and heatmaps.

This repository currently contains only the proposed project structure. No tracking algorithms, mobile application, or backend have been implemented yet.

## Planned technology

### Major languages

- **TypeScript** — the main language for the mobile application, including screens, domain types, sensor collection, session management, and local persistence.
- **Python** — the planned language for the future backend, data-processing pipeline, experiments, and possible machine-learning work.
- **SQL** — used later to define and query data stored in PostgreSQL.

Configuration files will also use **JSON**, while documentation will use **Markdown**.

### Mobile

- React Native
- Expo
- Expo Router
- Expo sensor and location APIs
- Expo-compatible local storage

### Future backend

- FastAPI
- PostgreSQL
- Python processing and experimentation tools

The backend is included in the structure as a future boundary only. It is not part of the initial mobile MVP.

## Proposed structure

```text
.
├── mobile/
│   ├── app/                       # Expo Router screens and navigation
│   ├── assets/                    # Images, icons, and fonts
│   └── src/
│       ├── components/            # Shared UI components
│       ├── features/
│       │   ├── games/             # Game history and summaries
│       │   ├── tracking/          # Active tracking feature
│       │   └── metrics/           # Metric presentation
│       ├── services/
│       │   ├── sensors/           # Device sensor abstraction
│       │   ├── tracking/          # Game-session lifecycle
│       │   ├── storage/           # Local persistence abstraction
│       │   └── processing/        # Future movement estimation
│       ├── types/                 # TypeScript domain models
│       └── utils/                 # Small shared utilities
├── backend/                       # Future Python/FastAPI application
│   └── app/
│       ├── api/                   # Future HTTP endpoints
│       ├── models/                # Future persistence models
│       ├── services/              # Future backend business logic
│       └── processing/            # Future processing/ML pipeline
└── README.md
```

Empty directories contain `.gitkeep` files so Git can retain the proposed layout.

## Intended architecture

```text
Mobile App
   ↓
Sensor Collection
   ↓
Raw Sensor Data
   ↓
Movement Processing
   ↓
Trajectory
   ↓
Metrics
   ↓
Heatmap
```

Sensor collection will remain separate from movement processing. This allows future positioning approaches to be tested or replaced without rewriting the data-collection layer or screens.

## Important limitation

GPS is unreliable for precise indoor court or field positioning. Accelerometer and gyroscope readings also accumulate error when used for long-term absolute positioning. Accurate distance, speed, trajectory, and heatmap generation therefore remain future engineering work rather than features of the initial scaffold.

## Planned phases

1. Build the Expo mobile app, game sessions, sensor collection, and local persistence.
2. Add step detection, movement detection, and sensor filtering.
3. Experiment with position estimation, sensor fusion, and indoor positioning.
4. Calculate distance, speed, acceleration, and heatmaps.
5. Add the FastAPI/PostgreSQL backend, accounts, synchronization, and teams.
6. Explore advanced positioning, ML, computer vision, or external positioning systems if useful.
