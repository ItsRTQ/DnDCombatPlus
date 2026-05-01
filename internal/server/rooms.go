package server

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
)

type EntityType string

const (
	EntityPlayer EntityType = "player"
	EntityEnemy  EntityType = "enemy"
)

type Status struct {
	Name     string `json:"name"`
	Duration int    `json:"duration"`
}

type Entity struct {
	ID        string     `json:"id"`
	Name      string     `json:"name"`
	Type      EntityType `json:"type"`
	MaxHealth int        `json:"maxHealth"`
	Health    int        `json:"health"`
	TempHP    int        `json:"tempHP"`
	Statuses  []Status   `json:"statuses"`
}

type Room struct {
	Key         string             `json:"roomKey"`
	DMToken     string             `json:"dmToken"`
	Entities    map[string]*Entity `json:"entities"`
	CurrentTurn string             `json:"currentTurn"`
}

type RoomManager struct {
	mu    sync.RWMutex
	rooms map[string]*Room
}

func NewRoomManager() *RoomManager {
	return &RoomManager{
		rooms: make(map[string]*Room),
	}
}

func (rm *RoomManager) CreateRoom() (*Room, error) {
	key, err := generateRandomKey(6)
	if err != nil {
		return nil, err
	}

	token, err := generateRandomKey(16)
	if err != nil {
		return nil, err
	}

	rm.mu.Lock()
	defer rm.mu.Unlock()

	room := &Room{
		Key:         key,
		DMToken:     token,
		Entities:    make(map[string]*Entity),
		CurrentTurn: "",
	}

	rm.rooms[key] = room
	return room, nil
}

func (rm *RoomManager) GetRoom(key string) (*Room, bool) {
	rm.mu.RLock()
	defer rm.mu.RUnlock()

	room, ok := rm.rooms[key]
	return room, ok
}

func generateRandomKey(n int) (string, error) {
	bytes := make([]byte, n/2+1)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes)[:n], nil
}
