package server

import (
	"testing"
)

func TestRequestEndTurn(t *testing.T) {
	rm := NewRoomManager()
	room, err := rm.CreateRoom()
	if err != nil {
		t.Fatalf("failed to create room: %v", err)
	}

	player, err := rm.AddEntity(room.Key, "Grog", EntityPlayer, 10)
	if err != nil {
		t.Fatalf("failed to add entity: %v", err)
	}

	err = rm.SetCurrentTurn(room.Key, player.ID)
	if err != nil {
		t.Fatalf("failed to set turn: %v", err)
	}

	if room.CurrentTurn != player.ID {
		t.Errorf("expected current turn to be %s, got %s", player.ID, room.CurrentTurn)
	}

	err = rm.RequestEndTurn(room.Key, player.ID)
	if err != nil {
		t.Fatalf("failed to request end turn: %v", err)
	}

	if room.CurrentTurn != "" {
		t.Errorf("expected current turn to be empty, got %s", room.CurrentTurn)
	}
}

func TestRequestEndTurnMismatchedID(t *testing.T) {
	rm := NewRoomManager()
	room, _ := rm.CreateRoom()
	p1, _ := rm.AddEntity(room.Key, "Grog", EntityPlayer, 10)
	p2, _ := rm.AddEntity(room.Key, "Vex", EntityPlayer, 10)

	rm.SetCurrentTurn(room.Key, p1.ID)

	err := rm.RequestEndTurn(room.Key, p2.ID)
	if err == nil {
		t.Error("expected error when ending turn for wrong player, got nil")
	}
}

func TestRequestEndTurnEmptyTurn(t *testing.T) {
	rm := NewRoomManager()
	room, _ := rm.CreateRoom()
	p1, _ := rm.AddEntity(room.Key, "Grog", EntityPlayer, 10)

	// No one's turn
	err := rm.RequestEndTurn(room.Key, p1.ID)
	if err == nil {
		t.Error("expected error when ending turn while no turn active, got nil")
	}
}

func TestRequestEndTurnNotYourTurn(t *testing.T) {
	rm := NewRoomManager()
	room, err := rm.CreateRoom()
	if err != nil {
		t.Fatalf("failed to create room: %v", err)
	}

	p1, _ := rm.AddEntity(room.Key, "Grog", EntityPlayer, 10)
	p2, _ := rm.AddEntity(room.Key, "Vex", EntityPlayer, 10)

	rm.SetCurrentTurn(room.Key, p1.ID)

	err = rm.RequestEndTurn(room.Key, p2.ID)
	if err == nil {
		t.Error("expected error for not your turn, got nil")
	}
}
