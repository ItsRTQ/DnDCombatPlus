package server

import (
	"encoding/json"
	"net/http"
)

type Server struct {
	roomManager *RoomManager
}

func (s *Server) createRoomHandler(w http.ResponseWriter, r *http.Request) {
	room, err := s.roomManager.CreateRoom()
	if err != nil {
		http.Error(w, "failed to create room", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(room)
}
