// Package server contains the HTTP server setup for the app.
package server

import (
	"fmt"
	"net/http"
	"time"
)

// New creates and configures the app HTTP server.
func New(addr string) *http.Server {
	s := &Server{
		roomManager: NewRoomManager(),
	}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /", homeHandler)
	mux.HandleFunc("GET /health", healthHandler)
	mux.HandleFunc("POST /rooms", s.createRoomHandler)

	// Simple CORS middleware
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		mux.ServeHTTP(w, r)
	})

	return &http.Server{
		Addr:         addr,
		Handler:      handler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "DnD Combat Plus is running")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "ok")
}