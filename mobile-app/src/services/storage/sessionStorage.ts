import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { MatchSession } from '../../types/session';

class SessionStorageService {
  private db: SQLite.SQLiteDatabase | null = null;
  private memoryFallback: Map<string, MatchSession> = new Map();
  private isInitialized = false;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      if (Platform.OS !== 'web') {
        this.db = SQLite.openDatabaseSync('khel_kud.db');
        this.db.execSync(`
          CREATE TABLE IF NOT EXISTS match_sessions (
            id TEXT PRIMARY KEY NOT NULL,
            sport TEXT NOT NULL,
            start_time INTEGER NOT NULL,
            end_time INTEGER NOT NULL,
            duration_seconds INTEGER NOT NULL,
            total_steps INTEGER NOT NULL,
            distance_meters REAL NOT NULL,
            top_speed_kmh REAL NOT NULL,
            avg_speed_kmh REAL NOT NULL,
            sprint_count INTEGER NOT NULL,
            avg_cadence INTEGER NOT NULL,
            calories_burned INTEGER NOT NULL,
            data_json TEXT NOT NULL
          );
        `);
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn('SQLite init warning (using in-memory fallback):', err);
      this.db = null;
      this.isInitialized = true;
    }
  }

  public async saveSession(session: MatchSession): Promise<void> {
    this.memoryFallback.set(session.id, session);

    if (this.db) {
      try {
        const stmt = this.db.prepareSync(`
          INSERT OR REPLACE INTO match_sessions (
            id, sport, start_time, end_time, duration_seconds,
            total_steps, distance_meters, top_speed_kmh, avg_speed_kmh,
            sprint_count, avg_cadence, calories_burned, data_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.executeSync([
          session.id,
          session.sport,
          session.startTime,
          session.endTime,
          session.durationSeconds,
          session.metrics.totalSteps,
          session.metrics.distanceMeters,
          session.metrics.topSpeedKmH,
          session.metrics.avgSpeedKmH,
          session.metrics.sprintCount,
          session.metrics.avgCadence,
          session.metrics.caloriesBurned,
          JSON.stringify(session),
        ]);
        stmt.finalizeSync();
      } catch (err) {
        console.warn('Failed to persist session to SQLite:', err);
      }
    }
  }

  public async getSessionById(id: string): Promise<MatchSession | null> {
    if (this.db) {
      try {
        const row = this.db.getFirstSync<{ data_json: string }>(
          'SELECT data_json FROM match_sessions WHERE id = ?',
          [id]
        );
        if (row && row.data_json) {
          return JSON.parse(row.data_json) as MatchSession;
        }
      } catch (err) {
        console.warn('Failed to query session from SQLite:', err);
      }
    }

    return this.memoryFallback.get(id) || null;
  }

  public async getAllSessions(): Promise<MatchSession[]> {
    if (this.db) {
      try {
        const rows = this.db.getAllSync<{ data_json: string }>(
          'SELECT data_json FROM match_sessions ORDER BY start_time DESC'
        );
        if (rows && rows.length > 0) {
          return rows.map((r) => JSON.parse(r.data_json) as MatchSession);
        }
      } catch (err) {
        console.warn('Failed to query all sessions from SQLite:', err);
      }
    }

    return Array.from(this.memoryFallback.values()).sort((a, b) => b.startTime - a.startTime);
  }

  public async deleteSession(id: string): Promise<void> {
    this.memoryFallback.delete(id);
    if (this.db) {
      try {
        this.db.runSync('DELETE FROM match_sessions WHERE id = ?', [id]);
      } catch (err) {
        console.warn('Failed to delete session from SQLite:', err);
      }
    }
  }
}

export const sessionStorage = new SessionStorageService();
