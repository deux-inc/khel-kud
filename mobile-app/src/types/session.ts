import { MovementIntensity } from './sensor';
import { SportType } from './sport';

export interface PositionPoint {
  x: number; // meters from court left (0 to courtLength)
  y: number; // meters from court bottom (0 to courtWidth)
  timestamp: number;
  intensity: MovementIntensity;
}

export interface IntensityBreakdown {
  stationarySeconds: number;
  walkingSeconds: number;
  joggingSeconds: number;
  sprintingSeconds: number;
}

export interface MatchSessionMetrics {
  totalSteps: number;
  hardwareSteps: number;
  accelSteps: number;
  distanceMeters: number;
  avgSpeedKmH: number;
  topSpeedKmH: number;
  sprintCount: number;
  avgCadence: number;
  caloriesBurned: number;
  intensityBreakdown: IntensityBreakdown;
}

export interface MatchSession {
  id: string;
  sport: SportType;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  metrics: MatchSessionMetrics;
  trajectory: PositionPoint[];
}
