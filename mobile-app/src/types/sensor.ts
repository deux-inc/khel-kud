import { SportType } from './sport';

export type SessionState = 'idle' | 'recording' | 'paused' | 'completed';

export type MovementIntensity = 'stationary' | 'walking' | 'jogging' | 'sprinting';

export interface AccelReading {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  timestamp: number;
}

export interface LiveTrackingMetrics {
  durationSeconds: number;
  hardwareSteps: number;
  accelSteps: number;
  activeSteps: number; // resolved best step count
  cadence: number; // steps per minute
  distanceMeters: number;
  currentSpeedKmH: number;
  topSpeedKmH: number;
  sprintCount: number;
  intensity: MovementIntensity;
  headingDegrees: number;
  samplingRateHz: number;
  isHardwarePedometerActive: boolean;
}

export interface StepCalibrationResult {
  hardwareSteps: number;
  accelSteps: number;
  targetSteps: number;
  hardwareErrorPercent: number;
  accelErrorPercent: number;
}
