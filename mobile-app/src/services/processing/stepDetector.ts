import { AccelReading, MovementIntensity } from '../../types/sensor';

export class DynamicStepDetector {
  private stepCount = 0;
  private lastStepTime = 0;
  private minStepIntervalMs = 240; // Max ~4.1 steps/sec (sprint frequency)

  // Sliding window for adaptive threshold
  private windowSize = 40;
  private magnitudeHistory: number[] = [];
  private recentStepTimes: number[] = [];

  // Gravity low-pass filter state
  private gravity = { x: 0, y: 0, z: 1.0 };
  private alpha = 0.8;

  // Stride calibration factor (Weinberg model)
  private strideFactor: number;

  constructor(strideFactor = 0.43) {
    this.strideFactor = strideFactor;
  }

  public setStrideFactor(factor: number): void {
    this.strideFactor = factor;
  }

  public reset(): void {
    this.stepCount = 0;
    this.lastStepTime = 0;
    this.magnitudeHistory = [];
    this.recentStepTimes = [];
    this.gravity = { x: 0, y: 0, z: 1.0 };
  }

  public getStepCount(): number {
    return this.stepCount;
  }

  /**
   * Process a single high-frequency accelerometer sample (in Gs: 1g ≈ earth gravity)
   * Returns estimated step length (in meters) if a step was detected, otherwise null.
   */
  public processSample(x: number, y: number, z: number, timestamp: number): {
    isStep: boolean;
    stepLengthMeters: number;
    magnitude: number;
    cadence: number;
    intensity: MovementIntensity;
  } {
    // 1. Filter out gravity
    this.gravity.x = this.alpha * this.gravity.x + (1 - this.alpha) * x;
    this.gravity.y = this.alpha * this.gravity.y + (1 - this.alpha) * y;
    this.gravity.z = this.alpha * this.gravity.z + (1 - this.alpha) * z;

    // Linear acceleration magnitude
    const linX = x - this.gravity.x;
    const linY = y - this.gravity.y;
    const linZ = z - this.gravity.z;
    const rawMagnitude = Math.sqrt(x * x + y * y + z * z);
    const dynamicMagnitude = Math.sqrt(linX * linX + linY * linY + linZ * linZ);

    // 2. Sliding window buffer
    this.magnitudeHistory.push(dynamicMagnitude);
    if (this.magnitudeHistory.length > this.windowSize) {
      this.magnitudeHistory.shift();
    }

    // 3. Adaptive threshold calculation
    let maxMag = -Infinity;
    let minMag = Infinity;
    for (const val of this.magnitudeHistory) {
      if (val > maxMag) maxMag = val;
      if (val < minMag) minMag = val;
    }

    const peakToPeak = maxMag - minMag;
    const adaptiveThreshold = (maxMag + minMag) / 2;

    let isStep = false;
    let stepLengthMeters = 0;

    // 4. Peak detection with refractory window
    const timeSinceLastStep = timestamp - this.lastStepTime;
    const isPeak =
      dynamicMagnitude > adaptiveThreshold + 0.12 &&
      peakToPeak > 0.28 && // Minimum acceleration swing to prevent false positives while stationary
      timeSinceLastStep >= this.minStepIntervalMs;

    if (isPeak) {
      this.stepCount += 1;
      this.lastStepTime = timestamp;
      isStep = true;

      // Track recent step timestamps for cadence calculation
      this.recentStepTimes.push(timestamp);
      if (this.recentStepTimes.length > 8) {
        this.recentStepTimes.shift();
      }

      // 5. Weinberg Step Length Model: L = K * (A_max - A_min)^(1/4)
      // Clamped between 0.45m (shuffling/walking) and 2.0m (sprinting stride)
      const estimatedStride = this.strideFactor * Math.pow(Math.max(0.1, peakToPeak * 9.81), 0.25);
      stepLengthMeters = Math.max(0.45, Math.min(2.0, estimatedStride));
    }

    // 6. Cadence calculation (steps per minute)
    const cadence = this.calculateCadence(timestamp);

    // 7. Movement intensity estimation
    const intensity = this.classifyIntensity(cadence, dynamicMagnitude);

    return {
      isStep,
      stepLengthMeters,
      magnitude: rawMagnitude,
      cadence,
      intensity,
    };
  }

  public calculateCadence(now: number): number {
    // Purge timestamps older than 5 seconds
    this.recentStepTimes = this.recentStepTimes.filter((t) => now - t <= 5000);

    if (this.recentStepTimes.length < 2) {
      return 0;
    }

    const timeSpanSec = (now - this.recentStepTimes[0]) / 1000;
    if (timeSpanSec <= 0.5) return 0;

    const stepsInWindow = this.recentStepTimes.length - 1;
    const stepsPerSecond = stepsInWindow / timeSpanSec;
    return Math.round(stepsPerSecond * 60);
  }

  private classifyIntensity(cadence: number, dynamicMagnitude: number): MovementIntensity {
    if (cadence === 0 && dynamicMagnitude < 0.18) {
      return 'stationary';
    }
    if (cadence > 175 || dynamicMagnitude > 1.4) {
      return 'sprinting';
    }
    if (cadence >= 120 || dynamicMagnitude > 0.6) {
      return 'jogging';
    }
    return 'walking';
  }
}
