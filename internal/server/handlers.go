package server

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Server struct {
	roomManager *RoomManager
	hub         *Hub
}

type AddEntityRequest struct {
	Name      string     `json:"name"`
	Type      EntityType `json:"type"`
	MaxHealth int        `json:"maxHealth"`
	Amount    int        `json:"amount"`
}

type JoinRoomRequest struct {
	RoomKey       string `json:"roomKey"`
	CharacterName string `json:"characterName"`
}

type JoinRoomResponse struct {
	Room   *Room   `json:"room"`
	Player *Entity `json:"player"`
}

type CreateRoomResponse struct {
	Room    *Room  `json:"room"`
	DMToken string `json:"dmToken"`
}

type UpdateEntityRequest struct {
	Name      *string `json:"name"`
	MaxHealth *int    `json:"maxHealth"`
}

type HPActionRequest struct {
	Amount int `json:"amount"`
}

type SetTurnRequest struct {
	EntityID string `json:"entityId"`
}

func (s *Server) broadcastRoom(key string) {
	if room, ok := s.roomManager.GetRoom(key); ok {
		s.hub.BroadcastRoom(key, room)
	}
}

func (s *Server) createRoomHandler(w http.ResponseWriter, r *http.Request) {
	room, err := s.roomManager.CreateRoom()
	if err != nil {
		http.Error(w, "failed to create room", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(CreateRoomResponse{
		Room:    room,
		DMToken: room.DMToken,
	})
}

func (s *Server) getRoomHandler(w http.ResponseWriter, r *http.Request) {
	key := r.PathValue("key")
	room, ok := s.roomManager.GetRoom(key)
	if !ok {
		http.Error(w, "room not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(room)
}

func (s *Server) deleteRoomHandler(w http.ResponseWriter, r *http.Request) {
	key := r.PathValue("key")
	token := r.Header.Get("Authorization")
	if len(token) < 8 || token[:7] != "Bearer " {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// Broadcast that the room is ending before deleting it
	s.hub.broadcast <- broadcastMessage{
		roomKey: key,
		data:    []byte(`{"type":"room_ended"}`),
	}

	err := s.roomManager.DeleteRoom(key, token[7:])
	if err != nil {
		if err.Error() == "room not found" {
			http.Error(w, err.Error(), http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusUnauthorized)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) addEntityHandler(w http.ResponseWriter, r *http.Request) {
	key := r.PathValue("key")

	// Validate DM token
	room, ok := s.roomManager.GetRoom(key)
	if !ok {
		http.Error(w, "room not found", http.StatusNotFound)
		return
	}

	token := r.Header.Get("Authorization")
	if token != "Bearer "+room.DMToken {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req AddEntityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	if req.MaxHealth <= 0 {
		http.Error(w, "maxHealth must be greater than 0", http.StatusBadRequest)
		return
	}

	amount := req.Amount
	if amount <= 0 {
		amount = 1
	}
	if amount > 5 {
		amount = 5
	}

	// Pre-check cap for batch
	currentCount := 0
	for _, e := range room.Entities {
		if e.Type == req.Type {
			currentCount++
		}
	}
	if currentCount+amount > 7 {
		http.Error(w, fmt.Sprintf("adding %d entities would exceed the maximum of 7", amount), http.StatusBadRequest)
		return
	}

	var entity *Entity
	var err error

	for i := 0; i < amount; i++ {
		name := req.Name
		if amount > 1 {
			name = fmt.Sprintf("%s %d", req.Name, i+1)
		}

		entity, err = s.roomManager.AddEntity(key, name, req.Type, req.MaxHealth)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	s.broadcastRoom(key)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(entity)
}

func (s *Server) joinRoomHandler(w http.ResponseWriter, r *http.Request) {
	var req JoinRoomRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.RoomKey == "" {
		http.Error(w, "roomKey is required", http.StatusBadRequest)
		return
	}

	room, player, err := s.roomManager.JoinPlayer(req.RoomKey, req.CharacterName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	s.broadcastRoom(req.RoomKey)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(JoinRoomResponse{
		Room:   room,
		Player: player,
	})
}

func (s *Server) updateEntityHandler(w http.ResponseWriter, r *http.Request) {
	key := r.PathValue("key")
	id := r.PathValue("id")

	room, ok := s.roomManager.GetRoom(key)
	if !ok {
		http.Error(w, "room not found", http.StatusNotFound)
		return
	}

	token := r.Header.Get("Authorization")
	if token != "Bearer "+room.DMToken {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req UpdateEntityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	entity, err := s.roomManager.UpdateEntity(key, id, req.Name, req.MaxHealth)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	s.broadcastRoom(key)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entity)
}

func (s *Server) damageEntityHandler(w http.ResponseWriter, r *http.Request) {
	key := r.PathValue("key")
	id := r.PathValue("id")

	room, ok := s.roomManager.GetRoom(key)
	if !ok {
		http.Error(w, "room not found", http.StatusNotFound)
		return
	}

	token := r.Header.Get("Authorization")
	if token != "Bearer "+room.DMToken {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req HPActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	entity, err := s.roomManager.ApplyDamage(key, id, req.Amount)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	s.broadcastRoom(key)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entity)
}

func (s *Server) healEntityHandler(w http.ResponseWriter, r *http.Request) {
	key := r.PathValue("key")
	id := r.PathValue("id")

	room, ok := s.roomManager.GetRoom(key)
	if !ok {
		http.Error(w, "room not found", http.StatusNotFound)
		return
	}

	token := r.Header.Get("Authorization")
	if token != "Bearer "+room.DMToken {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req HPActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	entity, err := s.roomManager.ApplyHeal(key, id, req.Amount)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	s.broadcastRoom(key)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entity)
}

func (s *Server) setTurnHandler(w http.ResponseWriter, r *http.Request) {
	key := r.PathValue("key")

	room, ok := s.roomManager.GetRoom(key)
	if !ok {
		http.Error(w, "room not found", http.StatusNotFound)
		return
	}

	token := r.Header.Get("Authorization")
	if token != "Bearer "+room.DMToken {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req SetTurnRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	err := s.roomManager.SetCurrentTurn(key, req.EntityID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	s.broadcastRoom(key)

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) deleteEntityHandler(w http.ResponseWriter, r *http.Request) {
	key := r.PathValue("key")
	id := r.PathValue("id")

	// If DM token is provided, they can delete any entity.
	// Otherwise, we'll allow the deletion for now (player self-removal).
	// In a real app, we'd have player tokens.
	token := r.Header.Get("Authorization")
	if token != "" {
		room, ok := s.roomManager.GetRoom(key)
		if ok && token != "Bearer "+room.DMToken {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
	}

	err := s.roomManager.RemoveEntity(key, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	s.broadcastRoom(key)

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) requestEndTurnHandler(w http.ResponseWriter, r *http.Request) {
	key := r.PathValue("key")
	id := r.PathValue("id")

	err := s.roomManager.RequestEndTurn(key, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	s.broadcastRoom(key)

	w.WriteHeader(http.StatusNoContent)
}
