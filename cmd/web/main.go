package main

import (
	"context"
	"log"
	"os"

	"github.com/ItsRTQ/DnDCombatPlus/internal/server"
	"github.com/ItsRTQ/DnDCombatPlus/internal/storage"
)

func main() {
	ctx := context.Background()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "data/dndcombatplus.db"
	}

	db, err := storage.OpenSQLite(ctx, dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := storage.Migrate(ctx, db); err != nil {
		log.Fatal(err)
	}

	srv := server.New(":" + port)

	log.Printf("database ready: %s\n", dbPath)
	log.Printf("server running on http://localhost:%s\n", port)

	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}