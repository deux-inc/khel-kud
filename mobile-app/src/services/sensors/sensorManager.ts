import { Accelerometer, Magnetometer, Pedometer } from 'expo-sensors';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { LiveTrackingMetrics, MovementIntensity, SessionState } from '../../types/sensor';
import { MatchSession, PositionPoint } from '../../types/session';
import { SportConfig } from '../../types/sport';
import { DynamicStepDetector } from '../processing/stepDetector';

export class SensorManager {
  private sessionState: SessionState = 'idle';
  private sportConfig: SportConfig | null = null;
  private stepDetector = new DynamicStepDetector();

  // Subscriptions
  private accelSub: any = null;
  private pedometerSub: any = null;
  private magnetometerSub: any = null;

  // Timers
  private sessionStartTime = 0;
  private totalElapsedSeconds = 0;
  private tickerInterval: any = null;
  private uiPublishInterval: any = null;

  // Step metrics
  private hardwareStepBaseline: number | null = null;
  private currentHardwareSteps = 0;
  private isHardwarePedometerAvailable = false;

  // Running distance & speed metrics
  private totalDistanceMeters = 0;
  private topSpeedKmH = 0;
  private sprintCount = 0;
  private wasSprinting = false;
  private currentHeadingDegrees = 0;

  // Cadence tracking for average
  private cadenceSum = 0;
  private cadenceSamples = 0;

  // Intensity duration breakdown
  private stationarySeconds = 0;
  private walkingSeconds = 0;
  private joggingSeconds = 0;
  private sprintingSeconds = 0;
  private currentIntensity: MovementIntensity = 'stationary';

  // Kinematics PDR Trajectory (GPS-denied 2D dead reckoning)
  private currentPosX = 0;
  private currentPosY = 0;
  private trajectory: PositionPoint[] = [];

  // Sampling rate metrics
  private sampleCountInWindow = 0;
  private currentSamplingRateHz = 0;
  private lastRateCheckTime = Date.now();

  // Completed session cache
  private lastCompletedSession: MatchSession | null = null;

  // Listeners
  private onMetricsUpdate: ((metrics: LiveTrackingMetrics) => void) | null = null;

  constructor() {
    Accelerometer.setUpdateInterval(25); // 40Hz
    Magnetometer.setUpdateInterval(100); // 10Hz
  }

  public setMetricsListener(listener: (metrics: LiveTrackingMetrics) => void): void {
    this.onMetricsUpdate = listener;
  }

  public getSessionState(): SessionState {
    return this.sessionState;
  }

  public getSportConfig(): SportConfig | null {
    return this.sportConfig;
  }

  public getLastCompletedSession(): MatchSession | null {
    return this.lastCompletedSession;
  }

  public async checkPermissions(): Promise<{
    pedometerGranted: boolean;
    pedometerAvailable: boolean;
  }> {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      this.isHardwarePedometerAvailable = isAvailable;
      if (!isAvailable) {
        return { pedometerGranted: false, pedometerAvailable: false };
      }
      const perm = await Pedometer.requestPermissionsAsync();
      return {
        pedometerGranted: perm.granted,
        pedometerAvailable: isAvailable,
      };
    } catch {
      return { pedometerGranted: false, pedometerAvailable: false };
    }
  }

  public async startSession(sport: SportConfig): Promise<void> {
    this.sportConfig = sport;
    this.stepDetector.setStrideFactor(sport.defaultStrideFactor);
    this.resetMetrics();

    // Start position at center of court
    this.currentPosX = sport.courtLength / 2;
    this.currentPosY = sport.courtWidth / 2;
    this.trajectory = [
      {
        x: this.currentPosX,
        y: this.currentPosY,
        timestamp: Date.now(),
        intensity: 'stationary',
      },
    ];

    this.sessionState = 'recording';
    this.sessionStartTime = Date.now();

    // Keep phone awake during match tracking in pocket
    try {
      await activateKeepAwakeAsync('match-tracking');
    } catch {
      // Ignored in dev / unsupported environments
    }

    // 1. Subscribe to Accelerometer (Core sensor for dynamic step detection & kinematics)
    this.accelSub = Accelerometer.addListener((data) => {
      if (this.sessionState !== 'recording') return;

      const now = Date.now();
      this.sampleCountInWindow += 1;

      const result = this.stepDetector.processSample(data.x, data.y, data.z, now);
      this.currentIntensity = result.intensity;

      if (result.isStep) {
        this.totalDistanceMeters += result.stepLengthMeters;

        // PDR Step-and-Heading dead reckoning
        const headingRad = (this.currentHeadingDegrees * Math.PI) / 180;
        let nextX = this.currentPosX + result.stepLengthMeters * Math.sin(headingRad);
        let nextY = this.currentPosY + result.stepLengthMeters * Math.cos(headingRad);

        // Clamping to court bounds
        const pad = 0.5;
        if (nextX < pad) nextX = pad;
        if (nextX > sport.courtLength - pad) nextX = sport.courtLength - pad;
        if (nextY < pad) nextY = pad;
        if (nextY > sport.courtWidth - pad) nextY = sport.courtWidth - pad;

        this.currentPosX = nextX;
        this.currentPosY = nextY;

        if (this.trajectory.length < 1000) {
          this.trajectory.push({
            x: Math.round(nextX * 100) / 100,
            y: Math.round(nextY * 100) / 100,
            timestamp: now,
            intensity: result.intensity,
          });
        }
      }

      // Check sprint transitions
      if (result.intensity === 'sprinting') {
        if (!this.wasSprinting) {
          this.sprintCount += 1;
          this.wasSprinting = true;
        }
      } else {
        this.wasSprinting = false;
      }
    });

    // 2. Subscribe to Hardware Pedometer if supported
    try {
      const isAvail = await Pedometer.isAvailableAsync();
      if (isAvail) {
        this.isHardwarePedometerAvailable = true;
        this.pedometerSub = Pedometer.watchStepCount((result) => {
          if (this.sessionState !== 'recording') return;
          if (this.hardwareStepBaseline === null) {
            this.hardwareStepBaseline = result.steps;
            this.currentHardwareSteps = 0;
          } else {
            this.currentHardwareSteps = Math.max(0, result.steps - this.hardwareStepBaseline);
          }
        });
      }
    } catch {
      this.isHardwarePedometerAvailable = false;
    }

    // 3. Subscribe to Magnetometer (for compass heading)
    this.magnetometerSub = Magnetometer.addListener((data) => {
      let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      if (angle < 0) {
        angle += 360;
      }
      this.currentHeadingDegrees = Math.round(angle);
    });

    // 4. Timer ticker: 1-second session duration & intensity tracking
    this.tickerInterval = setInterval(() => {
      if (this.sessionState === 'recording') {
        this.totalElapsedSeconds += 1;

        // Intensity accumulation
        switch (this.currentIntensity) {
          case 'sprinting':
            this.sprintingSeconds += 1;
            break;
          case 'jogging':
            this.joggingSeconds += 1;
            break;
          case 'walking':
            this.walkingSeconds += 1;
            break;
          default:
            this.stationarySeconds += 1;
            break;
        }

        // Cadence sample accumulation
        const currentCadence = this.stepDetector.calculateCadence(Date.now());
        if (currentCadence > 0) {
          this.cadenceSum += currentCadence;
          this.cadenceSamples += 1;
        }
      }
    }, 1000);

    // 5. Throttled UI publisher: 500ms (2Hz) to maintain buttery smooth 60fps UI
    this.uiPublishInterval = setInterval(() => {
      this.publishMetricsSnapshot();
    }, 500);
  }

  public pauseSession(): void {
    if (this.sessionState !== 'recording') return;
    this.sessionState = 'paused';
    this.publishMetricsSnapshot();
  }

  public resumeSession(): void {
    if (this.sessionState !== 'paused') return;
    this.sessionState = 'recording';
    this.publishMetricsSnapshot();
  }

  public async stopSession(): Promise<MatchSession> {
    this.sessionState = 'completed';
    this.teardownSubscriptions();

    try {
      await deactivateKeepAwake('match-tracking');
    } catch {
      // Ignored
    }

    const liveSnapshot = this.buildMetricsSnapshot();
    if (this.onMetricsUpdate) {
      this.onMetricsUpdate(liveSnapshot);
    }

    const endTime = Date.now();
    const duration = Math.max(1, this.totalElapsedSeconds);
    const avgSpeedKmH = Math.round(((this.totalDistanceMeters / duration) * 3.6) * 10) / 10;
    const avgCadence = this.cadenceSamples > 0 ? Math.round(this.cadenceSum / this.cadenceSamples) : 0;

    // MET estimation (default 70kg player): Futsal/Basketball/Football ~8.5 METs, Pickleball ~7.0 METs
    const met = this.sportConfig?.id === 'pickleball' ? 7.0 : 8.5;
    const caloriesBurned = Math.round(((met * 3.5 * 70) / 200) * (duration / 60));

    const session: MatchSession = {
      id: `session_${this.sessionStartTime}_${Math.random().toString(36).substring(2, 7)}`,
      sport: this.sportConfig ? this.sportConfig.id : 'futsal',
      startTime: this.sessionStartTime,
      endTime,
      durationSeconds: this.totalElapsedSeconds,
      metrics: {
        totalSteps: liveSnapshot.activeSteps,
        hardwareSteps: this.currentHardwareSteps,
        accelSteps: liveSnapshot.accelSteps,
        distanceMeters: Math.round(this.totalDistanceMeters),
        avgSpeedKmH,
        topSpeedKmH: this.topSpeedKmH,
        sprintCount: this.sprintCount,
        avgCadence,
        caloriesBurned,
        intensityBreakdown: {
          stationarySeconds: this.stationarySeconds,
          walkingSeconds: this.walkingSeconds,
          joggingSeconds: this.joggingSeconds,
          sprintingSeconds: this.sprintingSeconds,
        },
      },
      trajectory: this.trajectory,
    };

    this.lastCompletedSession = session;
    return session;
  }

  public resetSession(): void {
    this.teardownSubscriptions();
    this.sessionState = 'idle';
    this.resetMetrics();
    try {
      deactivateKeepAwake('match-tracking');
    } catch {
      // Ignored
    }
    if (this.onMetricsUpdate) {
      this.onMetricsUpdate(this.buildMetricsSnapshot());
    }
  }

  private resetMetrics(): void {
    this.totalElapsedSeconds = 0;
    this.totalDistanceMeters = 0;
    this.topSpeedKmH = 0;
    this.sprintCount = 0;
    this.wasSprinting = false;
    this.hardwareStepBaseline = null;
    this.currentHardwareSteps = 0;
    this.stepDetector.reset();
    this.sampleCountInWindow = 0;
    this.currentSamplingRateHz = 0;
    this.lastRateCheckTime = Date.now();
    this.cadenceSum = 0;
    this.cadenceSamples = 0;
    this.stationarySeconds = 0;
    this.walkingSeconds = 0;
    this.joggingSeconds = 0;
    this.sprintingSeconds = 0;
    this.currentIntensity = 'stationary';
    this.trajectory = [];
  }

  private teardownSubscriptions(): void {
    if (this.accelSub) {
      this.accelSub.remove();
      this.accelSub = null;
    }
    if (this.pedometerSub) {
      this.pedometerSub.remove();
      this.pedometerSub = null;
    }
    if (this.magnetometerSub) {
      this.magnetometerSub.remove();
      this.magnetometerSub = null;
    }
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
    if (this.uiPublishInterval) {
      clearInterval(this.uiPublishInterval);
      this.uiPublishInterval = null;
    }
  }

  private publishMetricsSnapshot(): void {
    if (!this.onMetricsUpdate) return;
    this.onMetricsUpdate(this.buildMetricsSnapshot());
  }

  private buildMetricsSnapshot(): LiveTrackingMetrics {
    const accelSteps = this.stepDetector.getStepCount();

    // Calculate current sampling rate in Hz
    const now = Date.now();
    const dt = (now - this.lastRateCheckTime) / 1000;
    if (dt >= 1.0) {
      this.currentSamplingRateHz = Math.round(this.sampleCountInWindow / dt);
      this.sampleCountInWindow = 0;
      this.lastRateCheckTime = now;
    }

    // Determine active steps: prefer hardware pedometer if active and non-zero, else accelerometer
    const activeSteps =
      this.isHardwarePedometerAvailable && this.currentHardwareSteps > 0
        ? this.currentHardwareSteps
        : accelSteps;

    // Instantaneous speed calculation (km/h) based on cadence and stride factor
    const cadence = this.stepDetector.calculateCadence(now);
    const strideLength = this.sportConfig ? this.sportConfig.defaultStrideFactor * 1.6 : 0.75;
    const currentSpeedMps = (cadence / 60) * strideLength;
    const currentSpeedKmH = Math.round(currentSpeedMps * 3.6 * 10) / 10;

    if (currentSpeedKmH > this.topSpeedKmH) {
      this.topSpeedKmH = currentSpeedKmH;
    }

    // Classify current movement intensity
    let intensity: LiveTrackingMetrics['intensity'] = 'stationary';
    if (cadence > 170 || currentSpeedKmH > 15) {
      intensity = 'sprinting';
    } else if (cadence >= 120 || currentSpeedKmH > 8) {
      intensity = 'jogging';
    } else if (cadence > 20 || currentSpeedKmH > 2) {
      intensity = 'walking';
    }

    return {
      durationSeconds: this.totalElapsedSeconds,
      hardwareSteps: this.currentHardwareSteps,
      accelSteps,
      activeSteps,
      cadence,
      distanceMeters: Math.round(this.totalDistanceMeters),
      currentSpeedKmH,
      topSpeedKmH: this.topSpeedKmH,
      sprintCount: this.sprintCount,
      intensity,
      headingDegrees: this.currentHeadingDegrees,
      samplingRateHz: this.currentSamplingRateHz,
      isHardwarePedometerActive: this.isHardwarePedometerAvailable,
    };
  }
}

// Singleton instance
export const sensorManager = new SensorManager();
