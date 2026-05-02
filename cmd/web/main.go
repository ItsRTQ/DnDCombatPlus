package main

import (
	"context"
	"log"

	"github.com/ItsRTQ/DnDCombatPlus/internal/server"
	"github.com/ItsRTQ/DnDCombatPlus/internal/storage"
)

func main() {
	ctx := context.Background()

	db, err := storage.OpenSQLite(ctx, "data/dndcombatplus.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := storage.Migrate(ctx, db); err != nil {
		log.Fatal(err)
	}

	srv := server.New(":8080")

	log.Println("database ready: data/dndcombatplus.db")
	log.Println("server running on http://localhost:8080")

	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}