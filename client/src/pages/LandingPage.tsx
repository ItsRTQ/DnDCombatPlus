import { useState } from "react";
import type { Room, Entity } from "../types/combat";
import { API_BASE_URL } from "../api/config";

interface LandingPageProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomData: Room, playerData: Entity) => void;
  notification: string | null;
  clearNotification: () => void;
}

export function LandingPage({
  onCreateRoom,
  onJoinRoom,
  notification,
  clearNotification,
}: LandingPageProps) {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomKey, setRoomKey] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const openModal = () => {
    setIsJoinModalOpen(true);
    requestAnimationFrame(() => {
      setIsModalVisible(true);
    });
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setIsJoinModalOpen(false);
      setRoomKey("");
      setCharacterName("");
    }, 300);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomKey) return;

    setIsJoining(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/rooms/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomKey: roomKey.toLowerCase(),
            characterName: characterName,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to join room");
      }

      const data = await response.json();
      onJoinRoom(data.room, data.player);
    } catch (error: unknown) {
      console.error("Error joining room:", error);
      const message = error instanceof Error ? error.message : "Failed to join room. Is the key correct?";
      alert(message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      {/* Notification Popup */}
      {notification && (
        <div className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/40 bg-zinc-900/90 p-4 pr-6 shadow-2xl shadow-black backdrop-blur-xl pointer-events-auto transition-all animate-in fade-in slide-in-from-top-4 duration-300 animate-pulse">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm font-bold text-white">{notification}</p>
            <button
              onClick={clearNotification}
              className="ml-2 text-white/20 hover:text-white transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-sm:px-4 max-w-sm items-center justify-center px-4 py-6">
        <div className="w-full rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/50 backdrop-blur-md">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/60">
              DnD-CombatPlus
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
              Combat Room
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/70">
              Create a room as DM or join one as a player.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <button
              type="button"
              onClick={onCreateRoom}
              className="h-14 w-full rounded-2xl bg-white text-base font-bold text-black transition hover:scale-[1.02] hover:bg-zinc-200 hover:shadow-xl hover:shadow-white/10 active:scale-[0.98]"
            >
              Create Room
            </button>

            <button
              type="button"
              onClick={openModal}
              className="h-14 w-full rounded-2xl border border-white/20 bg-black/20 text-base font-bold text-white transition hover:scale-[1.02] hover:border-white/40 hover:bg-white/15 active:scale-[0.98]"
            >
              Join Room
            </button>
          </div>
        </div>
      </section>

      {/* Join Modal Overlay */}
      {isJoinModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isModalVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div
            className={`relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl transition-all duration-300 ${
              isModalVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
            }`}
          >
            <div className="text-left">
              <h2 className="text-2xl font-black tracking-tight text-white">
                Join Combat
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Enter the details provided by your DM.
              </p>
            </div>

            <form
              className="mt-8 flex flex-col gap-6"
              onSubmit={handleJoin}
            >
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Room Key
                </label>
                <input
                  type="text"
                  placeholder="e.g. AB1234"
                  required
                  value={roomKey}
                  onChange={(e) => setRoomKey(e.target.value)}
                  className="h-14 rounded-2xl border border-white/10 bg-white/5 px-4 font-medium text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Character Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grog"
                  required
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="h-14 rounded-2xl border border-white/10 bg-white/5 px-4 font-medium text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                />
              </div>

              <div className="mt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isJoining}
                  className="h-14 w-full rounded-2xl bg-white text-base font-bold text-black transition hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50"
                >
                  {isJoining ? "Joining..." : "Join Room"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-12 w-full text-sm font-bold text-white/40 transition hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
