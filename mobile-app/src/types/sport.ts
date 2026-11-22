export type SportType = 'futsal' | 'basketball' | 'pickleball' | 'football';

export interface SportConfig {
  id: SportType;
  name: string;
  category: 'indoor' | 'outdoor';
  courtLength: number; // meters
  courtWidth: number;  // meters
  defaultStrideFactor: number; // calibration factor K
  accentColor: string;
  iconName: string;
}
