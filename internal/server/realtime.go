package server

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // For MVP, allow all origins
	},
}

type Client struct {
	hub     *Hub
	roomKey string
	conn    *websocket.Conn
	send    chan []byte
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		// For now, we only broadcast FROM server TO client.
		// Player actions like "End Turn" are still handled via HTTP POST for simplicity and auth.
	}
}

func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()
	for {
		message, ok := <-c.send
		if !ok {
			c.conn.WriteMessage(websocket.CloseMessage, []byte{})
			return
		}

		w, err := c.conn.NextWriter(websocket.TextMessage)
		if err != nil {
			return
		}
		w.Write(message)

		if err := w.Close(); err != nil {
			return
		}
	}
}

type Hub struct {
	rooms      map[string]map[*Client]bool
	broadcast  chan broadcastMessage
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

type broadcastMessage struct {
	roomKey string
	data    []byte
}

func NewHub() *Hub {
	return &Hub{
		rooms:      make(map[string]map[*Client]bool),
		broadcast:  make(chan broadcastMessage),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.rooms[client.roomKey] == nil {
				h.rooms[client.roomKey] = make(map[*Client]bool)
			}
			h.rooms[client.roomKey][client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.rooms[client.roomKey]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.send)
					if len(clients) == 0 {
						delete(h.rooms, client.roomKey)
					}
				}
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			clients := h.rooms[message.roomKey]
			for client := range clients {
				select {
				case client.send <- message.data:
				default:
					// If buffer is full, unregister client
					go func(c *Client) { h.unregister <- c }(client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) BroadcastRoom(roomKey string, room *Room) {
	roomKey = strings.ToLower(roomKey)
	data, err := json.Marshal(room)
	if err != nil {
		log.Printf("error marshaling room state: %v", err)
		return
	}
	h.broadcast <- broadcastMessage{roomKey: roomKey, data: data}
}

func (s *Server) wsHandler(w http.ResponseWriter, r *http.Request) {
	roomKey := strings.ToLower(r.PathValue("key"))
	if roomKey == "" {
		http.Error(w, "missing room key", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("error upgrading connection: %v", err)
		return
	}

	client := &Client{
		hub:     s.hub,
		roomKey: roomKey,
		conn:    conn,
		send:    make(chan []byte, 256),
	}
	s.hub.register <- client

	// Send initial room state immediately
	if room, ok := s.roomManager.GetRoom(roomKey); ok {
		data, err := json.Marshal(room)
		if err == nil {
			client.send <- data
		}
	}

	go client.writePump()
	go client.readPump()
}
