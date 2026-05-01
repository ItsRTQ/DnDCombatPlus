import { useState } from "react";

interface RoomPageProps {
  onLeave: () => void;
}

export function RoomPage({ onLeave }: RoomPageProps) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomKey, setRoomKey] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const openModal = () => {
    setIsLeaveModalOpen(true);
    requestAnimationFrame(() => {
      setIsModalVisible(true);
    });
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setIsLeaveModalOpen(false);
    }, 300);
  };

  const startRoom = async () => {
    setIsStarting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rooms`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to create room");
      const data = await response.json();
      setRoomKey(data.roomKey);
    } catch (error) {
      console.error("Error starting room:", error);
      alert("Failed to start room. Is the backend running?");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-6">
      <div className="mb-6 flex w-full justify-between max-w-5xl items-center">
        <div>
          {roomKey && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Room Key
              </span>
              <span className="text-xl font-black tracking-tight text-white">
                {roomKey.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={openModal}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/60 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          Leave Room
        </button>
      </div>

      <div className="w-full rounded-3xl border border-white/10 bg-white/10 p-6 md:p-8 shadow-2xl shadow-black/50 backdrop-blur-md">
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Players
          </h2>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Creatures
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Players Column */}
          <div className="flex flex-col gap-4">
            <div className="flex min-h-[100px] items-center justify-center rounded-2xl border border-dashed border-white/5 bg-white/[0.02]">
              <span className="text-xs italic text-white/20">
                No players joined yet
              </span>
            </div>
          </div>

          {/* Creatures Column */}
          <div className="flex flex-col gap-4">
            <div className="flex min-h-[100px] items-center justify-center rounded-2xl border border-dashed border-white/5 bg-white/[0.02]">
              <span className="text-xs italic text-white/20">
                No creatures added yet
              </span>
            </div>
          </div>
        </div>
      </div>

      {!roomKey && (
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

      {/* Leave Confirmation Modal */}
      {isLeaveModalOpen && (
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
                onClick={onLeave}
                className="h-14 w-full rounded-2xl bg-red-500 text-base font-bold text-white transition hover:scale-[1.02] hover:bg-red-600 active:scale-[0.98]"
              >
                Leave Room
              </button>
              <button
                type="button"
                onClick={closeModal}
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
