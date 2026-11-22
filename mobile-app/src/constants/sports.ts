import { SportConfig, SportType } from '../types/sport';

export const SPORTS_CONFIG: Record<SportType, SportConfig> = {
  futsal: {
    id: 'futsal',
    name: 'Futsal',
    category: 'indoor',
    courtLength: 40.0,
    courtWidth: 20.0,
    defaultStrideFactor: 0.43,
    accentColor: '#10B981', // emerald
    iconName: 'soccer-court',
  },
  basketball: {
    id: 'basketball',
    name: 'Basketball',
    category: 'indoor',
    courtLength: 28.0,
    courtWidth: 15.0,
    defaultStrideFactor: 0.44,
    accentColor: '#F59E0B', // amber
    iconName: 'basketball',
  },
  pickleball: {
    id: 'pickleball',
    name: 'Pickleball',
    category: 'indoor',
    courtLength: 13.41,
    courtWidth: 6.10,
    defaultStrideFactor: 0.40,
    accentColor: '#8B5CF6', // purple
    iconName: 'tennis-ball',
  },
  football: {
    id: 'football',
    name: 'Football (11v11)',
    category: 'outdoor',
    courtLength: 105.0,
    courtWidth: 68.0,
    defaultStrideFactor: 0.45,
    accentColor: '#3B82F6', // blue
    iconName: 'soccer',
  },
};

export const DEFAULT_SPORT: SportType = 'futsal';
