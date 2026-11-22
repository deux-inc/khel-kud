import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { PositionPoint } from '../../types/session';
import { SportConfig } from '../../types/sport';

interface CourtVisualizerProps {
  sport: SportConfig;
  trajectory: PositionPoint[];
}

const SCREEN_WIDTH = Dimensions.get('window').width - 32;

export const CourtVisualizer: React.FC<CourtVisualizerProps> = ({ sport, trajectory }) => {
  const [displayMode, setDisplayMode] = useState<'both' | 'heatmap' | 'path'>('both');

  const svgWidth = SCREEN_WIDTH;
  const courtAspectRatio = sport.courtWidth / sport.courtLength;
  const svgHeight = Math.max(180, Math.round(svgWidth * courtAspectRatio));

  // Coordinate mapper from court meters to SVG pixels
  const scaleX = (xMeters: number) => (xMeters / sport.courtLength) * svgWidth;
  const scaleY = (yMeters: number) => (yMeters / sport.courtWidth) * svgHeight;

  // Build SVG path string for trajectory
  const pathData =
    trajectory.length > 1
      ? trajectory.reduce((acc, pt, idx) => {
          const px = scaleX(pt.x);
          const py = scaleY(pt.y);
          return idx === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
        }, '')
      : '';

  // Render sport-specific court markings
  const renderCourtLines = () => {
    const strokeColor = '#334155';
    const strokeWidth = 1.5;

    switch (sport.id) {
      case 'basketball': {
        const midX = svgWidth / 2;
        const keyWidth = scaleX(4.9);
        const keyHeight = scaleY(5.8);
        const threePtRadius = scaleY(6.75);

        return (
          <G stroke={strokeColor} strokeWidth={strokeWidth} fill="none">
            {/* Center Line & Center Circle */}
            <Line x1={midX} y1={0} x2={midX} y2={svgHeight} />
            <Circle cx={midX} cy={svgHeight / 2} r={scaleY(1.8)} />

            {/* Left Key & 3pt Arc */}
            <Rect x={0} y={(svgHeight - keyHeight) / 2} width={keyWidth} height={keyHeight} />
            <Path
              d={`M 0 ${(svgHeight - threePtRadius * 2) / 2} A ${threePtRadius} ${threePtRadius} 0 0 1 0 ${(svgHeight + threePtRadius * 2) / 2}`}
            />

            {/* Right Key & 3pt Arc */}
            <Rect x={svgWidth - keyWidth} y={(svgHeight - keyHeight) / 2} width={keyWidth} height={keyHeight} />
            <Path
              d={`M ${svgWidth} ${(svgHeight - threePtRadius * 2) / 2} A ${threePtRadius} ${threePtRadius} 0 0 0 ${svgWidth} ${(svgHeight + threePtRadius * 2) / 2}`}
            />
          </G>
        );
      }
      case 'pickleball': {
        const midX = svgWidth / 2;
        const kitchenDist = scaleX(2.13); // 7ft non-volley zone from net

        return (
          <G stroke={strokeColor} strokeWidth={strokeWidth} fill="none">
            {/* Net / Halfway Line */}
            <Line x1={midX} y1={0} x2={midX} y2={svgHeight} stroke="#94A3B8" strokeWidth={2} />

            {/* Non-Volley Kitchen Lines */}
            <Line x1={midX - kitchenDist} y1={0} x2={midX - kitchenDist} y2={svgHeight} strokeDasharray="3,3" />
            <Line x1={midX + kitchenDist} y1={0} x2={midX + kitchenDist} y2={svgHeight} strokeDasharray="3,3" />

            {/* Center Service Lines */}
            <Line x1={0} y1={svgHeight / 2} x2={midX - kitchenDist} y2={svgHeight / 2} />
            <Line x1={midX + kitchenDist} y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} />
          </G>
        );
      }
      case 'football': {
        const midX = svgWidth / 2;
        const boxWidth = scaleX(16.5);
        const boxHeight = scaleY(40.3);

        return (
          <G stroke={strokeColor} strokeWidth={strokeWidth} fill="none">
            {/* Halfway Line & Center Circle */}
            <Line x1={midX} y1={0} x2={midX} y2={svgHeight} />
            <Circle cx={midX} cy={svgHeight / 2} r={scaleY(9.15)} />

            {/* Left Penalty Box */}
            <Rect x={0} y={(svgHeight - boxHeight) / 2} width={boxWidth} height={boxHeight} />

            {/* Right Penalty Box */}
            <Rect x={svgWidth - boxWidth} y={(svgHeight - boxHeight) / 2} width={boxWidth} height={boxHeight} />
          </G>
        );
      }
      case 'futsal':
      default: {
        const midX = svgWidth / 2;
        const penaltyRadius = scaleY(6.0); // 6m penalty arc

        return (
          <G stroke={strokeColor} strokeWidth={strokeWidth} fill="none">
            {/* Halfway Line & Center Circle */}
            <Line x1={midX} y1={0} x2={midX} y2={svgHeight} />
            <Circle cx={midX} cy={svgHeight / 2} r={scaleY(3.0)} />

            {/* Left Penalty Arc */}
            <Path
              d={`M 0 ${(svgHeight - penaltyRadius * 2) / 2} A ${penaltyRadius} ${penaltyRadius} 0 0 1 0 ${(svgHeight + penaltyRadius * 2) / 2}`}
            />

            {/* Right Penalty Arc */}
            <Path
              d={`M ${svgWidth} ${(svgHeight - penaltyRadius * 2) / 2} A ${penaltyRadius} ${penaltyRadius} 0 0 0 ${svgWidth} ${(svgHeight + penaltyRadius * 2) / 2}`}
            />
          </G>
        );
      }
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Visualizer Header with View Controls */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Court Spatial Coverage</Text>
          <Text style={styles.dimensions}>
            {sport.courtLength}m × {sport.courtWidth}m ({sport.name})
          </Text>
        </View>

        <View style={styles.toggleGroup}>
          <TouchableOpacity
            onPress={() => setDisplayMode('both')}
            style={[styles.toggleBtn, displayMode === 'both' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, displayMode === 'both' && styles.toggleTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDisplayMode('heatmap')}
            style={[styles.toggleBtn, displayMode === 'heatmap' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, displayMode === 'heatmap' && styles.toggleTextActive]}>
              Heat
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDisplayMode('path')}
            style={[styles.toggleBtn, displayMode === 'path' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, displayMode === 'path' && styles.toggleTextActive]}>
              Path
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SVG Pitch Canvas */}
      <View style={[styles.courtContainer, { height: svgHeight }]}>
        <Svg width={svgWidth} height={svgHeight}>
          <Defs>
            <RadialGradient id="heatGradient" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.75" />
              <Stop offset="50%" stopColor="#F59E0B" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Court Floor */}
          <Rect x={0} y={0} width={svgWidth} height={svgHeight} fill="#090E17" rx={6} />

          {/* Court Boundary Lines */}
          <Rect
            x={1}
            y={1}
            width={svgWidth - 2}
            height={svgHeight - 2}
            stroke="#334155"
            strokeWidth={1.5}
            fill="none"
            rx={6}
          />

          {/* Sport Standard Markings */}
          {renderCourtLines()}

          {/* Heatmap Layer */}
          {(displayMode === 'both' || displayMode === 'heatmap') && (
            <G>
              {trajectory.map((pt, i) => {
                const px = scaleX(pt.x);
                const py = scaleY(pt.y);
                const radius = pt.intensity === 'sprinting' ? 24 : pt.intensity === 'jogging' ? 18 : 12;

                return (
                  <Circle
                    key={`heat-${i}`}
                    cx={px}
                    cy={py}
                    r={radius}
                    fill="url(#heatGradient)"
                  />
                );
              })}
            </G>
          )}

          {/* Trajectory Path Line Layer */}
          {(displayMode === 'both' || displayMode === 'path') && pathData.length > 0 && (
            <Path
              d={pathData}
              fill="none"
              stroke={sport.accentColor}
              strokeWidth={2}
              strokeOpacity={0.85}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Start and End Markers */}
          {trajectory.length > 0 && (
            <G>
              {/* Start Point */}
              <Circle
                cx={scaleX(trajectory[0].x)}
                cy={scaleY(trajectory[0].y)}
                r={5}
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth={1.5}
              />
              {/* Finish Point */}
              <Circle
                cx={scaleX(trajectory[trajectory.length - 1].x)}
                cy={scaleY(trajectory[trajectory.length - 1].y)}
                r={6}
                fill="#EF4444"
                stroke="#FFFFFF"
                strokeWidth={1.5}
              />
            </G>
          )}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Start</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>End</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.lineSample, { backgroundColor: sport.accentColor }]} />
          <Text style={styles.legendText}>Trajectory</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>High Intensity</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  dimensions: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#3B82F6',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  courtContainer: {
    width: SCREEN_WIDTH,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#090E17',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lineSample: {
    width: 14,
    height: 3,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
