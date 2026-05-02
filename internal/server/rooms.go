package server

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
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
	DMToken     string             `json:"-"`
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

func (rm *RoomManager) DeleteRoom(key string, token string) error {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	room, ok := rm.rooms[key]
	if !ok {
		return fmt.Errorf("room not found")
	}

	if room.DMToken != token {
		return fmt.Errorf("unauthorized")
	}

	delete(rm.rooms, key)
	return nil
}

func (rm *RoomManager) AddEntity(roomKey string, name string, entityType EntityType, maxHealth int) (*Entity, error) {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	room, ok := rm.rooms[roomKey]
	if !ok {
		return nil, fmt.Errorf("room not found")
	}

	// Enforce cap of 7 per type
	count := 0
	for _, e := range room.Entities {
		if e.Type == entityType {
			count++
		}
	}
	if count >= 7 {
		return nil, fmt.Errorf("maximum of 7 %s entities reached", entityType)
	}

	id, err := generateRandomKey(8)
	if err != nil {
		return nil, err
	}

	entity := &Entity{
		ID:        id,
		Name:      name,
		Type:      entityType,
		MaxHealth: maxHealth,
		Health:    maxHealth,
		TempHP:    0,
		Statuses:  []Status{},
	}

	room.Entities[id] = entity
	return entity, nil
}

func (rm *RoomManager) JoinPlayer(roomKey string, name string) (*Room, *Entity, error) {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	room, ok := rm.rooms[roomKey]
	if !ok {
		return nil, nil, fmt.Errorf("room not found")
	}

	// Enforce cap of 7 players
	playerCount := 0
	for _, e := range room.Entities {
		if e.Type == EntityPlayer {
			playerCount++
		}
	}
	if playerCount >= 7 {
		return nil, nil, fmt.Errorf("room is full (maximum 7 players)")
	}

	// Clean up name
	name = cleanName(name)
	if name == "" {
		name = "Player"
	}
	if len(name) > 24 {
		name = name[:24]
	}

	// Make name unique
	uniqueName := rm.makeUniqueName(room, name)

	id, err := generateRandomKey(8)
	if err != nil {
		return nil, nil, err
	}

	entity := &Entity{
		ID:        id,
		Name:      uniqueName,
		Type:      EntityPlayer,
		MaxHealth: 10, // Default for now
		Health:    10,
		TempHP:    0,
		Statuses:  []Status{},
	}

	room.Entities[id] = entity
	return room, entity, nil
}

func (rm *RoomManager) UpdateEntity(roomKey string, entityId string, name *string, maxHealth *int) (*Entity, error) {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	room, ok := rm.rooms[roomKey]
	if !ok {
		return nil, fmt.Errorf("room not found")
	}

	entity, ok := room.Entities[entityId]
	if !ok {
		return nil, fmt.Errorf("entity not found")
	}

	if name != nil {
		entity.Name = *name
	}

	if maxHealth != nil && *maxHealth > 0 {
		entity.MaxHealth = *maxHealth
		if entity.Health > entity.MaxHealth {
			entity.Health = entity.MaxHealth
		}
	}

	return entity, nil
}

func (rm *RoomManager) ApplyDamage(roomKey string, entityId string, amount int) (*Entity, error) {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	room, ok := rm.rooms[roomKey]
	if !ok {
		return nil, fmt.Errorf("room not found")
	}

	entity, ok := room.Entities[entityId]
	if !ok {
		return nil, fmt.Errorf("entity not found")
	}

	// Apply to temp HP first
	if entity.TempHP > 0 {
		if amount <= entity.TempHP {
			entity.TempHP -= amount
			amount = 0
		} else {
			amount -= entity.TempHP
			entity.TempHP = 0
		}
	}

	entity.Health -= amount
	if entity.Health < 0 {
		entity.Health = 0
	}

	return entity, nil
}

func (rm *RoomManager) ApplyHeal(roomKey string, entityId string, amount int) (*Entity, error) {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	room, ok := rm.rooms[roomKey]
	if !ok {
		return nil, fmt.Errorf("room not found")
	}

	entity, ok := room.Entities[entityId]
	if !ok {
		return nil, fmt.Errorf("entity not found")
	}

	entity.Health += amount
	if entity.Health > entity.MaxHealth {
		entity.Health = entity.MaxHealth
	}

	return entity, nil
}

func (rm *RoomManager) SetCurrentTurn(roomKey string, entityId string) error {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	room, ok := rm.rooms[roomKey]
	if !ok {
		return fmt.Errorf("room not found")
	}

	// entityId can be empty to clear turn
	if entityId != "" {
		if _, ok := room.Entities[entityId]; !ok {
			return fmt.Errorf("entity not found")
		}
	}

	room.CurrentTurn = entityId
	return nil
}

func (rm *RoomManager) RequestEndTurn(roomKey string, entityId string) error {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	room, ok := rm.rooms[roomKey]
	if !ok {
		return fmt.Errorf("room not found")
	}

	if room.CurrentTurn != entityId {
		return fmt.Errorf("not your turn")
	}

	room.CurrentTurn = "" // Directly clear the turn
	return nil
}

func (rm *RoomManager) RemoveEntity(roomKey string, entityId string) error {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	room, ok := rm.rooms[roomKey]
	if !ok {
		return fmt.Errorf("room not found")
	}

	if _, ok := room.Entities[entityId]; !ok {
		return fmt.Errorf("entity not found")
	}

	delete(room.Entities, entityId)

	// Clear turn if the removed entity was taking its turn
	if room.CurrentTurn == entityId {
		room.CurrentTurn = ""
	}

	return nil
}

func (rm *RoomManager) makeUniqueName(room *Room, name string) string {
	base := name
	counter := 1
	uniqueName := base

	for {
		found := false
		for _, e := range room.Entities {
			if strings.EqualFold(e.Name, uniqueName) {
				found = true
				break
			}
		}

		if !found {
			return uniqueName
		}

		uniqueName = fmt.Sprintf("%s%d", base, counter)
		counter++
	}
}

func cleanName(s string) string {
	return strings.TrimSpace(s)
}

func generateRandomKey(n int) (string, error) {
	bytes := make([]byte, n/2+1)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes)[:n], nil
}
