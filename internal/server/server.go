// Package server contains the HTTP server setup for the app.
package server

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

// New creates and configures the app HTTP server.
func New(addr string) *http.Server {
	hub := NewHub()
	go hub.Run()

	s := &Server{
		roomManager: NewRoomManager(),
		hub:         hub,
	}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", healthHandler)
	mux.HandleFunc("GET /ws/rooms/{key}", s.wsHandler)
	mux.HandleFunc("POST /rooms", s.createRoomHandler)
	mux.HandleFunc("POST /rooms/join", s.joinRoomHandler)
	mux.HandleFunc("GET /rooms/{key}", s.getRoomHandler)
	mux.HandleFunc("DELETE /rooms/{key}", s.deleteRoomHandler)
	mux.HandleFunc("POST /rooms/{key}/entities", s.addEntityHandler)
	mux.HandleFunc("DELETE /rooms/{key}/entities/{id}", s.deleteEntityHandler)
	mux.HandleFunc("POST /rooms/{key}/entities/{id}/end-turn", s.requestEndTurnHandler)
	mux.HandleFunc("PATCH /rooms/{key}/entities/{id}", s.updateEntityHandler)
	mux.HandleFunc("POST /rooms/{key}/entities/{id}/damage", s.damageEntityHandler)
	mux.HandleFunc("POST /rooms/{key}/entities/{id}/heal", s.healEntityHandler)
	mux.HandleFunc("PUT /rooms/{key}/turn", s.setTurnHandler)
	mux.HandleFunc("PATCH /rooms/{key}/settings", s.toggleSettingsHandler)

	// Serve static files from the React app if it exists
	if _, err := os.Stat("./client/dist"); err == nil {
		fileServer := http.FileServer(http.Dir("./client/dist"))
		mux.Handle("GET /", fileServer)
		// Handle SPA routing: redirect all non-API requests to index.html
		mux.HandleFunc("GET /{path...}", func(w http.ResponseWriter, r *http.Request) {
			// If the request is for a file that doesn't exist, serve index.html
			path := r.URL.Path
			if strings.HasPrefix(path, "/health") || 
			   strings.HasPrefix(path, "/ws/") || 
			   strings.HasPrefix(path, "/rooms") {
				// These should have been caught by specific handlers, 
				// but just in case, don't serve index.html for them.
				return
			}
			
			// If it's not a known API path, check if it's a file
			http.ServeFile(w, r, "./client/dist/index.html")
		})
	}

	// Simple CORS middleware
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")
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

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "ok")
}