import { useState } from "react";

interface LandingPageProps {
  onCreateRoom: () => void;
}

export function LandingPage({ onCreateRoom }: LandingPageProps) {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomKey, setRoomKey] = useState("");
  const [characterName, setCharacterName] = useState("");

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
    }, 300);
  };

  return (
    <>
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
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Room Key
                </label>
                <input
                  type="text"
                  placeholder="e.g. AB1234"
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
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="h-14 rounded-2xl border border-white/10 bg-white/5 px-4 font-medium text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                />
              </div>

              <div className="mt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="h-14 w-full rounded-2xl bg-white text-base font-bold text-black transition hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
                >
                  Join Room
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
