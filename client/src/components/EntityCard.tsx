import { useState, useEffect, useRef } from "react";
import type { Entity } from "../types/combat";

// Import individual frames
import idle1 from "../assets/sprites/players/knight/idle/knight_idle_1.png";
import idle2 from "../assets/sprites/players/knight/idle/knight_idle_2.png";
import idle3 from "../assets/sprites/players/knight/idle/knight_idle_3.png";
import idle4 from "../assets/sprites/players/knight/idle/knight_idle_4.png";

import hurt1 from "../assets/sprites/players/knight/hurt/knight_idlehurt_1.png";
import hurt2 from "../assets/sprites/players/knight/hurt/knight_idlehurt_2.png";
import hurt3 from "../assets/sprites/players/knight/hurt/knight_idlehurt_3.png";
import hurt4 from "../assets/sprites/players/knight/hurt/knight_idlehurt_4.png";

import hit1 from "../assets/sprites/players/knight/hit/knight_hit_1.png";
import hit2 from "../assets/sprites/players/knight/hit/knight_hit_2.png";
import hit3 from "../assets/sprites/players/knight/hit/knight_hit_3.png";
import hit4 from "../assets/sprites/players/knight/hit/knight_hit_4.png";

const idleFrames = [idle1, idle2, idle3, idle4];
const hurtFrames = [hurt1, hurt2, hurt3, hurt4];
const hitFrames = [hit1, hit2, hit3, hit4];

interface EntityCardProps {
  entity: Entity;
  isCurrentPlayer: boolean;
  isCurrentTurn: boolean;
  isSelected: boolean;
  canSelect: boolean;
  onClick: () => void;
  onEndTurn?: () => void;
  hideHP?: boolean;
  simple?: boolean;
}

export function EntityCard({
  entity,
  isCurrentPlayer,
  isCurrentTurn,
  isSelected,
  canSelect,
  onClick,
  onEndTurn,
  hideHP = false,
  simple = false,
}: EntityCardProps) {
  const isPlayer = entity.type === "player";
  const [isTakingDamage, setIsTakingDamage] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const prevHealthRef = useRef(entity.health);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % 4);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Detect health changes
  useEffect(() => {
    if (entity.health < prevHealthRef.current) {
      setIsTakingDamage(true);
      setFrameIndex(0);
      const timer = setTimeout(() => setIsTakingDamage(false), 800);
      prevHealthRef.current = entity.health;
      return () => clearTimeout(timer);
    } else if (entity.health > prevHealthRef.current) {
      setIsHealing(true);
      const timer = setTimeout(() => setIsHealing(false), 1000);
      prevHealthRef.current = entity.health;
      return () => clearTimeout(timer);
    }
    prevHealthRef.current = entity.health;
  }, [entity.health]);

  // Determine which frame set to use
  let currentFrames = idleFrames;
  if (isTakingDamage) {
    currentFrames = hitFrames;
  } else if (entity.health / entity.maxHealth <= 0.25) {
    currentFrames = hurtFrames;
  }

  return (
    <div
      onClick={onClick}
      className={`transition-all relative ${
        simple 
          ? `${isSelected ? "scale-110 z-20" : "scale-100 z-10"}` 
          : `w-full text-left rounded-2xl border p-4 overflow-hidden ${
              isSelected ? "ring-2 ring-white/50 border-white/20" : "border-white/10 hover:border-white/20"
            } ${isCurrentPlayer ? "bg-emerald-500/10 border-emerald-500/50" : "bg-white/5"} ${
              isCurrentTurn ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-black" : ""
            }`
      } ${canSelect ? "cursor-pointer" : "cursor-default"} ${
        isTakingDamage ? "animate-shake-pulse" : ""
      } ${isHealing ? "animate-heal-glow" : ""}`}
    >
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px) rotate(-1deg); }
          50% { transform: translateX(4px) rotate(1deg); }
          75% { transform: translateX(-4px) rotate(-1deg); }
          100% { transform: translateX(0); }
        }
        @keyframes damage-pulse {
          0% { background-color: rgba(239, 68, 68, 0); }
          50% { background-color: rgba(239, 68, 68, 0.2); }
          100% { background-color: rgba(239, 68, 68, 0); }
        }
        @keyframes heal-pulse {
          0% { background-color: rgba(16, 185, 129, 0); transform: scale(1); }
          50% { background-color: rgba(16, 185, 129, 0.2); transform: scale(1.03); }
          100% { background-color: rgba(16, 185, 129, 0); transform: scale(1); }
        }
        @keyframes rise {
          0% { transform: translateY(100%) scaleX(0.5); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-100%) scaleX(1); opacity: 0; }
        }
        .animate-shake-pulse {
          animation: shake 0.2s ease-in-out 0s 2, damage-pulse 0.4s ease-in-out 0s 1;
        }
        .animate-heal-glow {
          animation: heal-pulse 1s ease-in-out 0s 1;
        }
        .heal-ray {
          position: absolute;
          bottom: 0;
          width: 2px;
          height: 40px;
          background: linear-gradient(to top, rgba(16, 185, 129, 0), rgba(16, 185, 129, 1));
          filter: blur(1px);
          animation: rise 1s ease-out infinite;
        }
      `}</style>

      {isHealing && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="heal-ray"
              style={{
                left: `${15 + i * 15}%`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}

      {simple ? (
        /* Simple View Content */
        <div className="flex flex-col items-center gap-2 relative z-10">
          {isPlayer ? (
            <div className={`relative transition-all ${isCurrentTurn ? "scale-125" : "scale-100"}`}>
              <img
                src={currentFrames[frameIndex]}
                alt={entity.name}
                className="h-24 w-auto object-contain"
                style={{
                  imageRendering: "pixelated",
                  transform: "scaleX(-1)",
                }}
              />
              {isCurrentTurn && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 blur-sm animate-pulse" />
              )}
            </div>
          ) : (
            <div className={`px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-black uppercase tracking-widest ${isCurrentTurn ? "border-emerald-500 text-emerald-400" : "text-white/60"}`}>
              {entity.name}
            </div>
          )}
          {!hideHP && (
            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-500 ${
                  entity.health / entity.maxHealth > 0.5 ? "bg-emerald-500" : entity.health / entity.maxHealth > 0.2 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${(entity.health / entity.maxHealth) * 100}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        /* Standard View Content */
        <div className="flex gap-4 items-center relative z-10">
          {isPlayer && (
            <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
              <img
                src={currentFrames[frameIndex]}
                alt={entity.name}
                className="h-16 w-auto object-contain"
                style={{ 
                  imageRendering: "pixelated",
                  transform: "scaleX(-1)"
                }}
              />
              {isCurrentTurn && (
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-bold flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 truncate">
                {entity.name}
                {isCurrentPlayer && (
                  <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shrink-0">
                    You
                  </span>
                )}
              </span>
              {!hideHP && (
                <span className="text-xs font-mono text-white/40 shrink-0">
                  HP: {entity.health}/{entity.maxHealth}
                </span>
              )}
            </div>

            {!hideHP && (
              <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    entity.health / entity.maxHealth > 0.5 ? "bg-emerald-500" : entity.health / entity.maxHealth > 0.2 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${(entity.health / entity.maxHealth) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {!simple && isCurrentPlayer && isCurrentTurn && onEndTurn && (
        <div className="mt-4 relative z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEndTurn();
            }}
            className="w-full h-10 rounded-xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest transition hover:bg-emerald-400 active:scale-95"
          >
            End Your Turn
          </button>
        </div>
      )}
    </div>
  );
}
