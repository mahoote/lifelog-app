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

            imported_at TEXT NOT NULL,
            day_key TEXT NOT NULL,
            is_favorite INTEGER NOT NULL DEFAULT 0,
            is_processed INTEGER NOT NULL DEFAULT 0,
            notes TEXT,
            tags_json TEXT,

            FOREIGN KEY (capture_event_id)
                REFERENCES capture_event(id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS gallery_day (
            day_key TEXT PRIMARY KEY NOT NULL,
            image_count INTEGER NOT NULL DEFAULT 0,
            video_count INTEGER NOT NULL DEFAULT 0,
            first_item_at TEXT,
            last_item_at TEXT,
            cover_image_uri TEXT,
            updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_footage_item_day_created
        ON footage_item(day_key, created_at);

        CREATE INDEX IF NOT EXISTS idx_footage_item_type_day
        ON footage_item(type, day_key);

        CREATE INDEX IF NOT EXISTS idx_footage_item_state_day
        ON footage_item(state, day_key);

        CREATE INDEX IF NOT EXISTS idx_footage_item_capture_event
        ON footage_item(capture_event_id);
    `)

    migrateDatabase()
}

function migrateDatabase() {
    addColumnIfMissing('footage_item', 'is_processed', 'INTEGER NOT NULL DEFAULT 0')
}

function addColumnIfMissing(tableName: string, columnName: string, columnDefinition: string) {
    const columns = db.getAllSync<{ name: string }>(`PRAGMA table_info(${tableName});`)
    const hasColumn = columns.some(column => column.name === columnName)

    if (hasColumn) return

    db.execSync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`)
}
