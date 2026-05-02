import { useState, useEffect, useCallback } from "react";
import type { Room, Entity } from "../types/combat";

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

  // Selection State
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Action Modal State (Generic for numeric inputs)
  const [actionModal, setActionModal] = useState<{
    type: "damage" | "heal" | "maxHealth" | "rename";
    visible: boolean;
    value: string;
  } | null>(null);

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
          if (currentPlayer && !data.entities[currentPlayer.id]) {
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
    [onLeave, currentPlayer]
  );

  // WebSocket for real-time updates
  useEffect(() => {
    if (!room?.roomKey) return;

    const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/ws/rooms/${room.roomKey}`;
    const socket = new WebSocket(wsUrl);

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
        if (currentPlayer && !data.entities[currentPlayer.id]) {
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
    };
  }, [room?.roomKey, currentPlayer, onLeave]);

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
        <div>
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
        </div>
        <button
          onClick={openLeaveModal}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/60 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          {dmToken ? "End Session" : "Leave Room"}
        </button>
      </div>

      {/* DM End Turn Request Notification */}
      {dmToken && room?.endTurnRequested && (
        <div className="mb-6 w-full max-w-5xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border-2 border-emerald-500/50 bg-emerald-500/10 p-6 backdrop-blur-md shadow-2xl shadow-emerald-500/10">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-black animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black text-emerald-400 leading-tight uppercase tracking-tight">
                  Turn End Requested
                </h3>
                <p className="text-sm text-emerald-400/60 font-medium">
                  {room.entities[room.currentTurn]?.name} is ready to end their turn.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!room) return;
                fetch(
                  `${import.meta.env.VITE_API_BASE_URL}/rooms/${
                    room.roomKey
                  }/turn`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${dmToken}`,
                    },
                    body: JSON.stringify({ entityId: "" }),
                  }
                ).then(() => room && fetchRoom(room.roomKey));
              }}
              className="h-14 w-full sm:w-auto px-10 rounded-2xl bg-emerald-500 text-black text-sm font-black uppercase tracking-widest transition hover:bg-emerald-400 active:scale-[0.98] shadow-lg shadow-emerald-500/20"
            >
              Confirm & Clear Turn
            </button>
          </div>
        </div>
      )}

      <div className="w-full rounded-3xl border border-white/10 bg-white/10 p-6 md:p-8 shadow-2xl shadow-black/50 backdrop-blur-md">
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Players
          </h2>
          {room?.currentTurn && (
            <div
              className={`px-3 py-1 rounded-full border transition-all ${
                room.endTurnRequested
                  ? "bg-red-500/20 border-red-500/40 animate-pulse"
                  : "bg-emerald-500/10 border-emerald-500/20"
              }`}
            >
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  room.endTurnRequested ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {room.endTurnRequested ? "End Requested: " : "Turn: "}
                {room.entities[room.currentTurn]?.name}
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
                <button
                  key={p.id}
                  onClick={() => dmToken && setSelectedEntityId(p.id)}
                  disabled={!dmToken}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    selectedEntityId === p.id
                      ? "ring-2 ring-white/50 border-white/20"
                      : "border-white/10"
                  } ${
                    p.id === currentPlayer?.id
                      ? "bg-emerald-500/10 border-emerald-500/50"
                      : "bg-white/5"
                  } ${
                    room?.currentTurn === p.id
                      ? room.endTurnRequested
                        ? "ring-2 ring-red-500 animate-pulse ring-offset-2 ring-offset-black"
                        : "ring-2 ring-emerald-500 ring-offset-2 ring-offset-black"
                      : ""
                  }`}
                >
                  <span className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {p.name}
                      {p.id === currentPlayer?.id && (
                        <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                          You
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-mono text-white/40">
                      HP: {p.health}/{p.maxHealth}
                    </span>
                  </span>

                  {p.id === currentPlayer?.id &&
                    room?.currentTurn === p.id &&
                    !room.endTurnRequested && (
                      <div className="mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            requestEndTurn();
                          }}
                          className="w-full h-10 rounded-xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest transition hover:bg-emerald-400 active:scale-95"
                        >
                          End Your Turn
                        </button>
                      </div>
                    )}
                </button>
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
                <button
                  key={c.id}
                  onClick={() => dmToken && setSelectedEntityId(c.id)}
                  disabled={!dmToken}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    selectedEntityId === c.id
                      ? "ring-2 ring-white/50 border-white/20"
                      : "border-white/10"
                  } ${
                    room?.currentTurn === c.id
                      ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-black"
                      : "bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="text-xs text-white/40 font-mono">
                      HP: {c.health}/{c.maxHealth}
                    </span>
                  </div>
                </button>
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
    </section>
  );
}
