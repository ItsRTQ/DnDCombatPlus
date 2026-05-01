import { useState } from "react";
import { LiquidBackground } from "./components/LiquidBackground";
import { LandingPage } from "./pages/LandingPage";
import { RoomPage } from "./pages/RoomPage";

type View = "landing" | "room";

function App() {
  const [view, setView] = useState<View>("landing");

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <LiquidBackground />

      {view === "landing" && (
        <LandingPage onCreateRoom={() => setView("room")} />
      )}

      {view === "room" && <RoomPage onLeave={() => setView("landing")} />}
    </main>
  );
}

export default App;
