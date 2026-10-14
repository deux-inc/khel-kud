# SKILLS.md — Khel-Kud (खेल-कूद) Developer & Agent Skills

This document defines actionable procedures, domain algorithms, and implementation recipes for building and testing the sports movement tracking engine.

---

## Skill 1: Physical Phone Prototyping & Live Sensor Validation

### Objective
Quickly establish a live debugging loop on a physical phone without building native binaries, ensuring device sensor access is functional and calibrated.

### Implementation Checklist
1. **Dependency Verification:**
   Install required Expo sensor, storage, and wake-lock modules:
   ```bash
   cd mobile-app
   npx expo install expo-sensors expo-location expo-sqlite react-native-svg expo-keep-awake
   ```
2. **Cross-Platform Permission & Hardware Availability Guard:**
   - **iOS:** Requires `NSMotionUsageDescription` in `app.json`. CoreMotion permissions are requested on first subscription.
   - **Android:** Requires `android.permission.ACTIVITY_RECOGNITION`.
   - **Fallback Guard:** Not all Android devices feature a physical hardware step detector. Always check availability and fall back to the Accelerometer peak detector:
   ```typescript
   import { Pedometer } from 'expo-sensors';

   const { granted } = await Pedometer.requestPermissionsAsync();
   const isAvailable = await Pedometer.isAvailableAsync();
   if (!isAvailable || !granted) {
     // Seamless fallback to raw Accelerometer-based step peak detection (Skill 2)
   }
   ```
3. **Screen Wakelock During Matches:**
   When testing with the phone in your pocket, activate `useKeepAwake()` while session tracking is active so iOS and Android do not sleep and pause sensor sampling.
4. **Sensor Frequency Calibration:**
   - For live sports tracking: Set accelerometer & gyroscope update interval to **20ms - 50ms** (20Hz - 50Hz).
   - Too fast (<10ms): Causes UI frame drops on older phones and rapid battery drain.
   - Too slow (>100ms): Misses rapid foot-strike shock peaks and sharp pivots in basketball/futsal.
5. **Live Diagnostic Screen:**
   Maintain a debug HUD showing:
   - Current sampling frequency (Hz).
   - Current 3-axis accelerometer vector $(a_x, a_y, a_z)$ and magnitude $\|a\| = \sqrt{a_x^2 + a_y^2 + a_z^2}$.
   - Compass heading / azimuth in degrees ($0^\circ - 360^\circ$).
   - Raw step count vs calculated cadence (steps/min).

---

## Skill 2: Indoor Kinematics & Pedestrian Dead Reckoning (PDR)

### Objective
Track movement, steps, speed, and trajectory in indoor sports halls where GPS signals are blocked or jitter excessively.

### Procedure & Formulas
1. **Acceleration Filtering:**
   Apply a low-pass or moving-average filter to strip gravity ($9.81 \, m/s^2$) and sensor noise:
   ```typescript
   // Gravity low-pass filter
   gravity.x = alpha * gravity.x + (1 - alpha) * raw.x;
   linearAcc.x = raw.x - gravity.x;
   ```
2. **Dynamic Step Detection (Peak Detection with Adaptive Threshold):**
   - Compute total acceleration magnitude: $A = \sqrt{a_x^2 + a_y^2 + a_z^2}$.
   - Identify local maximums where $A > T_{dynamic}$ and minimum time between steps $\Delta t \ge 250\text{ms}$ (max 4 steps/sec sprint cadence).
   - Update $T_{dynamic}$ based on moving standard deviation of $A$.
3. **Step Length Estimation ($L$):**
   Use the Weinberg formula or Kim model based on vertical bounce intensity:
   $$L = K \times \sqrt[4]{A_{max} - A_{min}}$$
   - Typical calibration factor $K \approx 0.40 - 0.45$ for running/sprinting.
   - Walking step length: $\sim 0.65\text{m} - 0.75\text{m}$.
   - Sprinting stride length: $\sim 1.20\text{m} - 1.80\text{m}$.
4. **Heading & Heading Drift Fusion:**
   - Combine Magnetometer (absolute north reference) with Gyroscope integration (high-rate angular change).
   - Calculate user movement direction $\theta_t$.
5. **Position Update Step:**
   $$x_t = x_{t-1} + L \cdot \cos(\theta_t)$$
   $$y_t = y_{t-1} + L \cdot \sin(\theta_t)$$

---

## Skill 3: Sport Court Geometry & Boundary Bounding

### Objective
Model standard physical dimensions for target sports, translate dead-reckoning vectors into court coordinate space, and clamp position within the playing field.

### Standard Dimensions (Length $\times$ Width in meters)
| Sport | Length ($L$) | Width ($W$) | Standard Orientation |
| :--- | :--- | :--- | :--- |
| **Futsal** | 40.0 m | 20.0 m | Centered $(0,0)$ to $(40,20)$ |
| **Basketball (FIBA / NBA)** | 28.0 m | 15.0 m | Centered $(0,0)$ to $(28,15)$ |
| **Pickleball** | 13.41 m | 6.10 m | Centered $(0,0)$ to $(13.41, 6.1)$ |
| **Football (11v11 Pitch)**| 105.0 m | 68.0 m | Centered $(0,0)$ to $(105,68)$ |

### Elastic Boundary Clamping
In an indoor court, a player cannot physically run outside the hall walls:
```typescript
export function clampToCourt(x: number, y: number, courtLength: number, courtWidth: number) {
  return {
    x: Math.max(0, Math.min(courtLength, x)),
    y: Math.max(0, Math.min(courtWidth, y)),
  };
}
```
*Note on drift recovery:* If consecutive steps push against the boundary, apply a dampening factor to heading momentum to prevent artificial wall hugging.

---

## Skill 4: Heatmap Generation & Field Coverage

### Objective
Calculate 2D field density from discrete position trajectories and render an SVG heatmap over the court diagram.

### Algorithm
1. **Spatial Binning (Grid Discretization):**
   - Subdivide court into an $N \times M$ grid (e.g. $40 \times 20$ bins for Futsal, each cell $1\text{m} \times 1\text{m}$).
   - For every sampled position $(x_i, y_i)$, increment the corresponding grid cell count.
2. **Kernel Smoothing (Gaussian Blur):**
   - Apply a $3 \times 3$ or $5 \times 5$ Gaussian kernel over the grid matrix to turn discrete points into a smooth presence cloud.
3. **Normalization:**
   - Normalize cell intensity from $0.0$ to $1.0$: $\text{norm}_c = \frac{\text{count}_c}{\text{max\_count}}$.
4. **Color Mapping:**
   - Map normalized values to heatmap colors:
     - $0.0 - 0.2$: Transparent / Dark Blue (Minimal presence).
     - $0.2 - 0.5$: Cyan / Green (Moderate movement).
     - $0.5 - 0.8$: Yellow / Orange (High activity).
     - $0.8 - 1.0$: Red (Hotspot / Primary zone of play).
5. **Field Coverage Metric:**
   $$\text{Coverage \%} = \frac{\text{Count of visited cells (intensity > threshold)}}{\text{Total active court cells}} \times 100\%$$

---

## Skill 5: High-Performance Data Ingestion & Batch Storage

### Objective
Safely record 50-90 minute matches without memory overflows, UI frame stutter, or data loss if the phone screen locks.

### Storage Architecture
1. **In-Memory Ring Buffer:**
   - Keep last 100 raw sensor samples in memory for instantaneous cadence/filtering calculations.
2. **Aggregated Metrics Buffer (1Hz):**
   - Every 1 second, compute:
     - Cumulative steps, delta distance, instantaneous speed.
     - Position $(x, y)$, heading $\theta$.
     - Intensity score (e.g., stationary, jogging, sprint).
3. **Asynchronous Batch Flusher:**
   - Flush 1-second records into local SQLite database in batches of 10 or 30 seconds inside an SQLite transaction:
   ```sql
   BEGIN TRANSACTION;
   INSERT INTO session_points (session_id, timestamp, x, y, speed, cadence, steps)
   VALUES (?, ?, ?, ?, ?, ?, ?);
   COMMIT;
   ```
4. **Session Exporter (Calibration & Data Science):**
   - Build a 1-tap "Export Session as JSON/CSV" feature.
   - Allows sharing session files via mobile share sheet (AirDrop, WhatsApp, Google Drive) for algorithm tuning on laptop.

---

## Skill 6: Calibration & Ground-Truth Benchmarking Playbook

### Testing Protocol on Real Phone
When verifying step counting and movement algorithms on your phone:
1. **The 100-Step Test:**
   - Start session, manually count exactly 100 walking steps, stop session.
   - *Target Accuracy:* $\pm 3\%$ (97 to 103 reported steps).
2. **The 20-Meter Sprint Test:**
   - Measure 20 meters, sprint across, check peak speed and stride detection.
   - *Target:* Verify sprint trigger flags and stride length scales appropriately.
3. **The Court Boundary Test:**
   - Walk the perimeter of a basketball or futsal court.
   - *Target:* Verify that court coordinates stay bounded and reflect the four corners.
