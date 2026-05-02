import { useState } from "react";
import { LiquidBackground } from "./components/LiquidBackground";
import { LandingPage } from "./pages/LandingPage";
import { RoomPage } from "./pages/RoomPage";
import type { Room, Entity } from "./types/combat";

type View = "landing" | "room";

function App() {
  const [view, setView] = useState<View>("landing");
  const [room, setRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Entity | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleCreateRoom = () => {
    setView("room");
  };

  const handleJoinRoom = (roomData: Room, playerData: Entity) => {
    setRoom(roomData);
    setPlayer(playerData);
    setNotification(null);
    setView("room");
  };

  const handleLeaveRoom = (message?: string) => {
    setRoom(null);
    setPlayer(null);
    if (message) {
      setNotification(message);
      // Auto-clear after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    }
    setView("landing");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <LiquidBackground />

      {view === "landing" && (
        <LandingPage
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          notification={notification}
          clearNotification={() => setNotification(null)}
        />
      )}

      {view === "room" && (
        <RoomPage
          onLeave={handleLeaveRoom}
          initialRoom={room}
          currentPlayer={player}
        />
      )}
    </main>
  );
}

export default App;
