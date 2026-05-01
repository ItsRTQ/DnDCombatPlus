package main

import (
	"log"

	"github.com/ItsRTQ/DnDCombatPlus/internal/server"
)

func main() {
	srv := server.New(":8080")

	log.Println("server running on http://localhost:8080")

	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}