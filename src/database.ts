import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabaseSync('lifelog.db')

export function initDatabase() {
    db.execSync(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS capture_event (
            id TEXT PRIMARY KEY NOT NULL,
            started_at TEXT NOT NULL,
            ended_at TEXT NOT NULL,
            motion_state TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS footage_item (
            id TEXT PRIMARY KEY NOT NULL,
            capture_event_id TEXT NOT NULL,
            sequence_index INTEGER NOT NULL,
            type TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT NOT NULL,
            file_uri TEXT NOT NULL,
            size_bytes INTEGER NOT NULL,
            state TEXT NOT NULL,
            duration_s INTEGER,
            acked_at TEXT,

            imported_at TEXT NOT NULL,
            day_key TEXT,
            is_favorite INTEGER NOT NULL DEFAULT 0,
            notes TEXT,
            tags_json TEXT,

            FOREIGN KEY (capture_event_id)
                REFERENCES capture_event(id)
                ON DELETE CASCADE
        );
    `)
}
