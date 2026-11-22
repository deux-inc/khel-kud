# Mobile App Agent Guidelines

> Refer to root [AGENTS.md](../AGENTS.md) and [SKILLS.md](../SKILLS.md) for overarching architecture, sports dimensions, and kinematics algorithms.

## Expo Version & Standards
- Read the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.
- Current project runs React Native 0.86+ and Expo SDK 57+.
- All screens use Expo Router under `src/app/`.
- UI components live under `src/components/ui/` and feature logic under `src/features/`.

## Sensor & Prototyping Packages
When adding tracking capabilities, install the official Expo packages:
```bash
npx expo install expo-sensors expo-location expo-sqlite react-native-svg expo-keep-awake
```

## Performance Rule
Never set React component state directly at 50Hz sensor intervals. Ingest high-frequency ticks into an in-memory accumulator and update React state at 1Hz or 2Hz for display.
