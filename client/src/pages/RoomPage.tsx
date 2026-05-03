import { useState, useEffect, useCallback, useRef } from "react";
import type { Room, Entity } from "../types/combat";
import { EntityCard } from "../components/EntityCard";

// Sprite Previews for Modal
import knightPreview from "../assets/sprites/players/knight/idle/knight_idle_1.png";
import rougePreview from "../assets/sprites/players/rouge/idle/rouge_idle_1.png";
import magePreview from "../assets/sprites/players/female_mage/idle/femaile_mage_idle_1.png";
import banditPreview from "../assets/sprites/enemies/bandit/idle/bandit_idle_1.png";
import goblinPreview from "../assets/sprites/enemies/goblin/idle/goblin_idle_1.png";
import dragonPreview from "../assets/sprites/enemies/red_dragon/idle/red_dragon_idle_1.png";

interface RoomPageProps {
  onLeave: (message?: string) => void;
  initialRoom?: Room | null;
  currentPlayer?: Entity | null;
}

export function RoomPage({ onLeave, initialRoom, currentPlayer }: RoomPageProps) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [room, setRoom] = useState<Room | null>(initialRoom || null);
  const [dmToken, setDmToken] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSpriteModalOpen, setIsSpriteModalOpen] = useState(false);

  // Selection State
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Action Modal State (Generic for numeric inputs)
  const [actionModal, setActionModal] = useState<{
    type: "damage" | "heal" | "maxHealth" | "rename";
    visible: boolean;
    value: string;
  } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  const fetchRoom = useCallback(
    async (key: string) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/rooms/${key}`
        );
        if (response.ok) {
          const data = await response.json();
          setRoom(data);

          // If we are a player, check if we've been removed from the room
          if (!isLeaving && currentPlayer && !data.entities[currentPlayer.id]) {
            onLeave("You have been kicked by host");
          }
        } else if (response.status === 404) {
          // Room was deleted by DM
          onLeave("This room has been ended by host");
        }
      } catch (error) {
        console.error("Error fetching room:", error);
      }
    },
    [onLeave, currentPlayer, isLeaving]
  );

  // WebSocket for real-time updates
  useEffect(() => {
    if (!room?.roomKey) return;

    const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/ws/rooms/${room.roomKey}${
      currentPlayer ? `?entityId=${currentPlayer.id}` : ""
    }${dmToken ? `${currentPlayer ? "&" : "?"}token=${dmToken}` : ""}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "room_ended") {
          onLeave("This room has been ended by host");
          return;
        }

        // Otherwise, it's a full room state update
        setRoom(data);

        // If we are a player, check if we've been removed
        if (!isLeaving && currentPlayer && !data.entities[currentPlayer.id]) {
          onLeave("You have been kicked by host");
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [room?.roomKey, currentPlayer, onLeave, isLeaving, dmToken]);

  const cycleSprite = useCallback((entityId: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "cycle_sprite",
        entityId: entityId
      }));
    }
  }, []);

  const handlePlayerCycleSprite = useCallback(() => {
    if (currentPlayer) {
      cycleSprite(currentPlayer.id);
    }
  }, [currentPlayer, cycleSprite]);

  const handleSetSprite = (sprite: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && selectedEntityId) {
      socketRef.current.send(JSON.stringify({
        type: "set_sprite",
        entityId: selectedEntityId,
        sprite: sprite
      }));
      setIsSpriteModalOpen(false);
    }
  };

  const handleDMCycleSprite = () => {
    if (selectedEntityId) {
      setIsSpriteModalOpen(true);
    }
  };

  // Add Creature Modal State
  const [isAddCreatureModalOpen, setIsAddCreatureModalOpen] = useState(false);
  const [isAddCreatureVisible, setIsAddCreatureVisible] = useState(false);
  const [creatureName, setCreatureName] = useState("");
  const [creatureMaxHealth, setCreatureMaxHealth] = useState("10");
  const [creatureAmount, setCreatureAmount] = useState("1");

  const openActionModal = (type: "damage" | "heal" | "maxHealth" | "rename") => {
    const entity = selectedEntityId ? room?.entities[selectedEntityId] : null;
    setActionModal({
      type,
      visible: true,
      value: type === "rename" ? entity?.name || "" : "",
    });
  };

  const closeActionModal = () => {
    setActionModal(null);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !dmToken || !selectedEntityId || !actionModal) return;

    const { type, value } = actionModal;
    const urlBase = `${import.meta.env.VITE_API_BASE_URL}/rooms/${
      room.roomKey
    }/entities/${selectedEntityId}`;

    try {
      let response;
      if (type === "damage" || type === "heal") {
        response = await fetch(`${urlBase}/${type}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${dmToken}`,
          },
          body: JSON.stringify({ amount: parseInt(value) }),
        });
      } else if (type === "maxHealth" || type === "rename") {
        response = await fetch(urlBase, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${dmToken}`,
          },
          body: JSON.stringify({
            name: type === "rename" ? value : undefined,
            maxHealth: type === "maxHealth" ? parseInt(value) : undefined,
          }),
        });
      }

      if (response && response.ok) {
        await fetchRoom(room.roomKey);
        closeActionModal();
      }
    } catch (error) {
      console.error("Action error:", error);
    }
  };

  const setTurn = async () => {
    if (!room || !dmToken || !selectedEntityId) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/rooms/${room.roomKey}/turn`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${dmToken}`,
          },
          body: JSON.stringify({ entityId: selectedEntityId }),
        }
      );
      if (response.ok) {
        await fetchRoom(room.roomKey);
      }
    } catch (error) {
      console.error("Set turn error:", error);
    }
  };

  const requestEndTurn = async () => {
    if (!room || !currentPlayer) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/rooms/${
          room.roomKey
        }/entities/${currentPlayer.id}/end-turn`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        await fetchRoom(room.roomKey);
      }
    } catch (error) {
      console.error("Request end turn error:", error);
    }
  };

  const openLeaveModal = () => {
    setIsLeaveModalOpen(true);
    requestAnimationFrame(() => {
      setIsModalVisible(true);
    });
  };

  const closeLeaveModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setIsLeaveModalOpen(false);
    }, 300);
  };

  const openAddCreatureModal = () => {
    setIsAddCreatureModalOpen(true);
    requestAnimationFrame(() => {
      setIsAddCreatureVisible(true);
    });
  };

  const closeAddCreatureModal = () => {
    setIsAddCreatureVisible(false);
    setTimeout(() => {
      setIsAddCreatureModalOpen(false);
      setCreatureName("");
      setCreatureMaxHealth("10");
      setCreatureAmount("1");
    }, 300);
  };

  const handleLeaveConfirmed = async () => {
    setIsLeaving(true);
    if (room && dmToken) {
      // DM is leaving, end the session
      try {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/rooms/${room.roomKey}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${dmToken}`,
            },
          }
        );
      } catch (error) {
        console.error("Error deleting room:", error);
      }
    } else if (room && currentPlayer) {
      // Player is leaving, remove their entity
      try {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/rooms/${room.roomKey}/entities/${
            currentPlayer.id
          }`,
          {
            method: "DELETE",
          }
        );
      } catch (error) {
        console.error("Error removing self from room:", error);
      }
    }
    onLeave();
  };

  const removeEntity = async () => {
    if (!room || !dmToken || !selectedEntityId) return;

    if (!confirm(`Are you sure you want to remove ${selectedEntity?.name}?`))
      return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/rooms/${
          room.roomKey
        }/entities/${selectedEntityId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${dmToken}`,
          },
        }
      );

      if (response.ok) {
        setSelectedEntityId(null);
        await fetchRoom(room.roomKey);
      }
    } catch (error) {
      console.error("Remove entity error:", error);
    }
  };

  const toggleSettings = async (type: "player" | "enemy" | "simple") => {
    if (!room || !dmToken) return;

    let payload = {};
    if (type === "player") payload = { hidePlayerHP: !room.hidePlayerHP };
    else if (type === "enemy") payload = { hideEnemyHP: !room.hideEnemyHP };
    else if (type === "simple") payload = { simpleView: !room.simpleView };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/rooms/${room.roomKey}/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${dmToken}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to toggle settings");
    } catch (error) {
      console.error("Toggle settings error:", error);
    }
  };

  const startRoom = async () => {
    setIsStarting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/rooms`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to create room");
      const data = await response.json();
      setRoom(data.room);
      setDmToken(data.dmToken);
    } catch (error) {
      console.error("Error starting room:", error);
      alert("Failed to start room. Is the backend running?");
    } finally {
      setIsStarting(false);
    }
  };

  const addCreature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/rooms/${room.roomKey}/entities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${dmToken}`,
          },
          body: JSON.stringify({
            name: creatureName,
            type: "enemy",
            maxHealth: parseInt(creatureMaxHealth),
            amount: parseInt(creatureAmount),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add creature");

      await fetchRoom(room.roomKey);
      closeAddCreatureModal();
    } catch (error) {
      console.error("Error adding creature:", error);
      alert("Failed to add creature.");
    }
  };

  const players = Object.values(room?.entities || {}).filter(
    (e) => e.type === "player"
  );
  const creatures = Object.values(room?.entities || {}).filter(
    (e) => e.type === "enemy"
  );

  const selectedEntity = selectedEntityId
    ? room?.entities[selectedEntityId]
    : null;

  return (
    <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-6">
      <div className="mb-6 flex w-full justify-between max-w-5xl items-center">
        <div className="flex gap-8 items-center">
          {room?.roomKey && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Room Key
              </span>
              <span className="text-xl font-black tracking-tight text-white">
                {room.roomKey.toUpperCase()}
              </span>
            </div>
          )}

          {dmToken && room && (
            <div className="relative border-l border-white/10 pl-6 flex items-center">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2 rounded-xl border transition-all ${
                  isSettingsOpen 
                    ? "bg-white text-black border-white" 
                    : "bg-white/5 text-white/60 border-white/10 hover:border-white/20 hover:text-white"
                }`}
                title="Room Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>

              {/* Settings Popup */}
              {isSettingsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsSettingsOpen(false)}
                  />
                  <div className="absolute top-12 left-0 z-50 w-64 rounded-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-2xl transition-all duration-200 origin-top-left scale-100 opacity-100">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 px-1">
                      Visibility Settings
                    </h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-xs font-bold text-white/80 tracking-wide">Player HP</span>
                        <button
                          onClick={() => toggleSettings("player")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                            room.hidePlayerHP
                              ? "bg-red-500/20 text-red-400 border border-red-500/20"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {room.hidePlayerHP ? "Hidden" : "Visible"}
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-xs font-bold text-white/80 tracking-wide">Enemy HP</span>
                        <button
                          onClick={() => toggleSettings("enemy")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                            room.hideEnemyHP
                              ? "bg-red-500/20 text-red-400 border border-red-500/20"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {room.hideEnemyHP ? "Hidden" : "Visible"}
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-xs font-bold text-white/80 tracking-wide">Simple View</span>
                        <button
                          onClick={() => toggleSettings("simple")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                            room.simpleView
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                              : "bg-white/10 text-white/40 border border-white/10"
                          }`}
                        >
                          {room.simpleView ? "ON" : "OFF"}
                        </button>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setIsLogOpen(true);
                            setIsSettingsOpen(false);
                          }}
                          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                          View Combat Log
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <button
          onClick={openLeaveModal}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/60 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          {dmToken ? "End Session" : "Leave Room"}
        </button>
      </div>

      {room?.simpleView ? (
        /* Simple View Layout */
        <div className="w-full max-w-5xl flex flex-col gap-12 py-12">
          {room?.currentTurn && (
            <div className="flex justify-center">
              <div className="px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-pulse">
                <span className="text-sm font-black uppercase tracking-widest text-emerald-400">
                  Current Turn: {room.entities[room.currentTurn]?.name}
                </span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-24 items-center justify-items-center">
            {/* Players side */}
            <div className="flex flex-col gap-12 items-center">
              {players.map((p) => (
                <EntityCard
                  key={p.id}
                  entity={p}
                  isCurrentPlayer={p.id === currentPlayer?.id}
                  isCurrentTurn={room?.currentTurn === p.id}
                  isSelected={selectedEntityId === p.id}
                  canSelect={!!dmToken}
                  onClick={() => dmToken && setSelectedEntityId(p.id)}
                  onEndTurn={requestEndTurn}
                  onCycleSprite={handlePlayerCycleSprite}
                  hideHP={!dmToken && room?.hidePlayerHP}
                  simple={true}
                />
              ))}
            </div>

            {/* Enemies side */}
            <div className="flex flex-col gap-12 items-center">
              {creatures.map((c) => (
                <EntityCard
                  key={c.id}
                  entity={c}
                  isCurrentPlayer={false}
                  isCurrentTurn={room?.currentTurn === c.id}
                  isSelected={selectedEntityId === c.id}
                  canSelect={!!dmToken}
                  onClick={() => dmToken && setSelectedEntityId(c.id)}
                  hideHP={!dmToken && room?.hideEnemyHP}
                  simple={true}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Standard View Layout */
        <div className="w-full rounded-3xl border border-white/10 bg-white/10 p-6 md:p-8 shadow-2xl shadow-black/50 backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              Players
            </h2>
            {room?.currentTurn && (
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Turn: {room.entities[room.currentTurn]?.name}
                </span>
              </div>
            )}
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              Creatures
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Players Column */}
            <div className="flex flex-col gap-4">
              {players.length === 0 ? (
                <div className="flex min-h-[100px] items-center justify-center rounded-2xl border border-dashed border-white/5 bg-white/[0.02]">
                  <span className="text-xs italic text-white/20">
                    No players joined yet
                  </span>
                </div>
              ) : (
                players.map((p) => (
                  <EntityCard
                    key={p.id}
                    entity={p}
                    isCurrentPlayer={p.id === currentPlayer?.id}
                    isCurrentTurn={room?.currentTurn === p.id}
                    isSelected={selectedEntityId === p.id}
                    canSelect={!!dmToken}
                    onClick={() => dmToken && setSelectedEntityId(p.id)}
                    onEndTurn={requestEndTurn}
                    onCycleSprite={handlePlayerCycleSprite}
                    hideHP={!dmToken && room?.hidePlayerHP}
                  />
                ))
              )}
            </div>

            {/* Creatures Column */}
            <div className="flex flex-col gap-4">
              {creatures.length === 0 ? (
                <div className="flex min-h-[100px] items-center justify-center rounded-2xl border border-dashed border-white/5 bg-white/[0.02]">
                  <span className="text-xs italic text-white/20">
                    No creatures added yet
                  </span>
                </div>
              ) : (
                creatures.map((c) => (
                  <EntityCard
                    key={c.id}
                    entity={c}
                    isCurrentPlayer={false}
                    isCurrentTurn={room?.currentTurn === c.id}
                    isSelected={selectedEntityId === c.id}
                    canSelect={!!dmToken}
                    onClick={() => dmToken && setSelectedEntityId(c.id)}
                    hideHP={!dmToken && room?.hideEnemyHP}
                  />
                ))
              )}

              {room && dmToken && creatures.length < 7 && (
                <button
                  onClick={openAddCreatureModal}
                  className="mt-2 w-full rounded-2xl border border-dashed border-white/10 py-4 text-xs font-bold uppercase tracking-widest text-white/20 transition hover:border-white/20 hover:bg-white/5 hover:text-white/40"
                >
                  + Add Creature
                </button>
              )}

              {room && dmToken && creatures.length >= 7 && (
                <div className="mt-2 w-full rounded-2xl border border-dashed border-white/5 py-4 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/10">
                    Enemy Cap Reached (7/7)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DM Action Panel */}
      {dmToken && selectedEntity && (
        <div className="mt-8 w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Selected: {selectedEntity.type}
              </span>
              <h3 className="text-xl font-black">{selectedEntity.name}</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <button
                onClick={() => openActionModal("damage")}
                className="h-12 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest border border-red-500/20 hover:bg-red-500/30 transition"
              >
                Damage
              </button>
              <button
                onClick={() => openActionModal("heal")}
                className="h-12 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/30 transition"
              >
                Heal
              </button>
              <button
                onClick={setTurn}
                className="h-12 rounded-xl bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/20 hover:bg-blue-500/30 transition"
              >
                Set Turn
              </button>
              <button
                onClick={handleDMCycleSprite}
                className="h-12 rounded-xl bg-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest border border-purple-500/20 hover:bg-purple-500/30 transition"
              >
                Select Sprite
              </button>
              <button
                onClick={() => openActionModal("rename")}
                className="h-12 rounded-xl bg-white/5 text-white/60 text-xs font-bold uppercase tracking-widest border border-white/10 hover:bg-white/10 hover:text-white transition"
              >
                Rename
              </button>
              <button
                onClick={() => openActionModal("maxHealth")}
                className="h-12 rounded-xl bg-white/5 text-white/60 text-xs font-bold uppercase tracking-widest border border-white/10 hover:bg-white/10 hover:text-white transition"
              >
                Max HP
              </button>
              <button
                onClick={removeEntity}
                className="h-12 rounded-xl bg-zinc-900 text-red-500/60 text-xs font-bold uppercase tracking-widest border border-red-500/10 hover:bg-red-500/10 hover:text-red-500 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Combat Log Modal (DM only) */}
      {dmToken && room && isLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsLogOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                Combat Log
              </h3>
              <button
                onClick={() => setIsLogOpen(false)}
                className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-6 pt-2 custom-scrollbar">
              {room.logs && room.logs.length > 0 ? (
                <div className="flex flex-col-reverse gap-2">
                  {room.logs.map((log, index) => (
                    <div
                      key={index}
                      className="text-xs font-medium text-white/60 py-3 border-b border-white/5 last:border-0"
                    >
                      <span className="text-white/20 mr-2 font-mono">
                        [{room.logs.length - index}]
                      </span>
                      <span className="text-white/40">
                        {log.entityType === "player" ? "Character" : "Enemy"}:{" "}
                      </span>
                      <span
                        className={`font-black ${
                          log.entityType === "player"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {log.entityName}
                      </span>
                      <span className="ml-1 opacity-80">
                        {log.message.includes("turn") ? ` ${log.message}` : `, ${log.message}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs italic text-white/20">
                  No combat events recorded yet.
                </div>
              )}
            </div>
            
            <div className="border-t border-white/10 p-4">
              <button
                onClick={() => setIsLogOpen(false)}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeActionModal}
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
            <h2 className="text-2xl font-black tracking-tight text-white capitalize">
              {actionModal.type === "maxHealth"
                ? "Max Health"
                : actionModal.type}
            </h2>
            <form
              className="mt-8 flex flex-col gap-6"
              onSubmit={handleActionSubmit}
            >
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  {actionModal.type === "rename" ? "New Name" : "Amount"}
                </label>
                <input
                  type={actionModal.type === "rename" ? "text" : "number"}
                  autoFocus
                  required
                  value={actionModal.value}
                  onChange={(e) =>
                    setActionModal({ ...actionModal, value: e.target.value })
                  }
                  className="h-14 rounded-2xl border border-white/10 bg-white/5 px-4 font-medium text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  className="h-14 w-full rounded-2xl bg-white text-base font-bold text-black transition hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="h-12 w-full text-sm font-bold text-white/40 transition hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!room?.roomKey && (
        <div className="mt-8">
          <button
            onClick={startRoom}
            disabled={isStarting}
            className="h-16 px-12 rounded-2xl bg-emerald-500 text-lg font-black text-white transition hover:scale-[1.05] hover:bg-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {isStarting ? "Starting..." : "Start Room"}
          </button>
        </div>
      )}

      {/* Add Creature Modal */}
      {isAddCreatureModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isAddCreatureVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeAddCreatureModal}
          />
          <div
            className={`relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl transition-all duration-300 ${
              isAddCreatureVisible
                ? "scale-100 translate-y-0"
                : "scale-95 translate-y-4"
            }`}
          >
            <div className="text-left">
              <h2 className="text-2xl font-black tracking-tight text-white">
                New Creature
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Add an enemy to the combat.
              </p>
            </div>

            <form className="mt-8 flex flex-col gap-6" onSubmit={addCreature}>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Creature Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Goblin"
                  required
                  value={creatureName}
                  onChange={(e) => setCreatureName(e.target.value)}
                  className="h-14 rounded-2xl border border-white/10 bg-white/5 px-4 font-medium text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Max Health
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={creatureMaxHealth}
                  onChange={(e) => setCreatureMaxHealth(e.target.value)}
                  className="h-14 rounded-2xl border border-white/10 bg-white/5 px-4 font-medium text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Amount (Max 5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  required
                  value={creatureAmount}
                  onChange={(e) => setCreatureAmount(e.target.value)}
                  className="h-14 rounded-2xl border border-white/10 bg-white/5 px-4 font-medium text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                />
              </div>

              <div className="mt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="h-14 w-full rounded-2xl bg-white text-base font-bold text-black transition hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
                >
                  Create Creature
                </button>
                <button
                  type="button"
                  onClick={closeAddCreatureModal}
                  className="h-12 w-full text-sm font-bold text-white/40 transition hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {isLeaveModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isModalVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeLeaveModal}
          />
          <div
            className={`relative w-full max-w-xs overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl transition-all duration-300 ${
              isModalVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
            }`}
          >
            <div className="text-center">
              <h2 className="text-xl font-black tracking-tight text-white">
                Leave Room?
              </h2>
              <p className="mt-2 text-sm text-white/60">
                You will lose your current combat state.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <button
                onClick={handleLeaveConfirmed}
                className="h-14 w-full rounded-2xl bg-red-500 text-base font-bold text-white transition hover:scale-[1.02] hover:bg-red-600 active:scale-[0.98]"
              >
                {dmToken ? "End Session & Leave" : "Leave Room"}
              </button>
              <button
                type="button"
                onClick={closeLeaveModal}
                className="h-12 w-full text-sm font-bold text-white/40 transition hover:text-white"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sprite Selection Modal (DM Only) */}
      {dmToken && isSpriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSpriteModalOpen(false)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Select Sprite
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Choose a new visual representation for {selectedEntity?.name}.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {selectedEntity?.type === "player" ? (
                <>
                  {[
                    { id: "knight", name: "Knight", img: knightPreview },
                    { id: "rouge", name: "Rogue", img: rougePreview },
                    { id: "female_mage", name: "Mage", img: magePreview },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSetSprite(s.id)}
                      className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                        selectedEntity.sprite === s.id
                          ? "bg-purple-500/20 border-purple-500"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="relative w-16 h-16 flex items-center justify-center bg-black/40 rounded-xl overflow-hidden">
                        <img
                          src={s.img}
                          alt={s.name}
                          className="h-16 w-auto object-contain transition-transform group-hover:scale-110"
                          style={{
                            imageRendering: "pixelated",
                            transform: "scaleX(-1)",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        {s.name}
                      </span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { id: "bandit", name: "Bandit", img: banditPreview },
                    { id: "goblin", name: "Goblin", img: goblinPreview },
                    { id: "red_dragon", name: "Dragon", img: dragonPreview },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSetSprite(s.id)}
                      className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                        selectedEntity?.sprite === s.id
                          ? "bg-purple-500/20 border-purple-500"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="relative w-16 h-16 flex items-center justify-center bg-black/40 rounded-xl overflow-hidden">
                        <img
                          src={s.img}
                          alt={s.name}
                          className="h-16 w-auto object-contain transition-transform group-hover:scale-110"
                          style={{
                            imageRendering: "pixelated",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        {s.name}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <button
                onClick={() => setIsSpriteModalOpen(false)}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
