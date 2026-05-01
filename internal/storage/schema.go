package storage

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// Migrate creates the required database tables for the MVP.
func Migrate(ctx context.Context, db *sql.DB) error {
	migrationCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	statements := []string{
		createRoomsTable,
		createEntitiesTable,
		createStatusesTable,
	}

	for _, statement := range statements {
		if _, err := db.ExecContext(migrationCtx, statement); err != nil {
			return fmt.Errorf("run migration: %w", err)
		}
	}

	return nil
}

const createRoomsTable = `
CREATE TABLE IF NOT EXISTS rooms (
	id TEXT PRIMARY KEY,
	room_key TEXT NOT NULL UNIQUE,
	dm_token TEXT NOT NULL,
	current_turn_entity_id TEXT,
	created_at TEXT NOT NULL,
	deleted_at TEXT
);
`

const createEntitiesTable = `
CREATE TABLE IF NOT EXISTS entities (
	id TEXT PRIMARY KEY,
	room_id TEXT NOT NULL,
	name TEXT NOT NULL,
	type TEXT NOT NULL,
	max_health INTEGER NOT NULL,
	health INTEGER NOT NULL,
	temp_hp INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,

	FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
`

const createStatusesTable = `
CREATE TABLE IF NOT EXISTS statuses (
	id TEXT PRIMARY KEY,
	entity_id TEXT NOT NULL,
	name TEXT NOT NULL,
	duration INTEGER NOT NULL,

	FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);
`