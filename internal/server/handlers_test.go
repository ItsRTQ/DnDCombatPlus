package server

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRequestEndTurnHandler(t *testing.T) {
	rm := NewRoomManager()
	hub := NewHub()
	go hub.Run()
	s := &Server{roomManager: rm, hub: hub}

	room, _ := rm.CreateRoom()
	player, _ := rm.AddEntity(room.Key, "Grog", EntityPlayer, 10)
	rm.SetCurrentTurn(room.Key, player.ID)

	req := httptest.NewRequest("POST", "/rooms/"+room.Key+"/entities/"+player.ID+"/end-turn", nil)
	req.SetPathValue("key", room.Key)
	req.SetPathValue("id", player.ID)
	w := httptest.NewRecorder()

	s.requestEndTurnHandler(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("expected status 204, got %d", w.Code)
	}

	if room.CurrentTurn != "" {
		t.Errorf("expected current turn to be empty, got %s", room.CurrentTurn)
	}
}
