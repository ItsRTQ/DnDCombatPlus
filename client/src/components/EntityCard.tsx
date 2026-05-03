import { useState, useEffect, useRef } from "react";
import type { Entity } from "../types/combat";

// Import knight frames
import knightIdle1 from "../assets/sprites/players/knight/idle/knight_idle_1.png";
import knightIdle2 from "../assets/sprites/players/knight/idle/knight_idle_2.png";
import knightIdle3 from "../assets/sprites/players/knight/idle/knight_idle_3.png";
import knightIdle4 from "../assets/sprites/players/knight/idle/knight_idle_4.png";

import knightHurt1 from "../assets/sprites/players/knight/hurt/knight_idlehurt_1.png";
import knightHurt2 from "../assets/sprites/players/knight/hurt/knight_idlehurt_2.png";
import knightHurt3 from "../assets/sprites/players/knight/hurt/knight_idlehurt_3.png";
import knightHurt4 from "../assets/sprites/players/knight/hurt/knight_idlehurt_4.png";

import knightHit1 from "../assets/sprites/players/knight/hit/knight_hit_1.png";
import knightHit2 from "../assets/sprites/players/knight/hit/knight_hit_2.png";
import knightHit3 from "../assets/sprites/players/knight/hit/knight_hit_3.png";
import knightHit4 from "../assets/sprites/players/knight/hit/knight_hit_4.png";

// Import rouge frames
import rougeIdle1 from "../assets/sprites/players/rouge/idle/rouge_idle_1.png";
import rougeIdle2 from "../assets/sprites/players/rouge/idle/rouge_idle_2.png";
import rougeIdle3 from "../assets/sprites/players/rouge/idle/rouge_idle_3.png";
import rougeIdle4 from "../assets/sprites/players/rouge/idle/rouge_idle_4.png";

import rougeHurt1 from "../assets/sprites/players/rouge/hurt/rouge_hurt_1.png";
import rougeHurt2 from "../assets/sprites/players/rouge/hurt/rouge_hurt_2.png";
import rougeHurt3 from "../assets/sprites/players/rouge/hurt/rouge_hurt_3.png";
import rougeHurt4 from "../assets/sprites/players/rouge/hurt/rouge_hurt_4.png";

import rougeHit1 from "../assets/sprites/players/rouge/hit/rouge_hit_1.png";
import rougeHit2 from "../assets/sprites/players/rouge/hit/rouge_hit_2.png";
import rougeHit3 from "../assets/sprites/players/rouge/hit/rouge_hit_3.png";
import rougeHit4 from "../assets/sprites/players/rouge/hit/rouge_hit_4.png";

// Import female_mage frames (note typo in filenames: femaile)
import mageIdle1 from "../assets/sprites/players/female_mage/idle/femaile_mage_idle_1.png";
import mageIdle2 from "../assets/sprites/players/female_mage/idle/femaile_mage_idle_2.png";
import mageIdle3 from "../assets/sprites/players/female_mage/idle/femaile_mage_idle_3.png";
import mageIdle4 from "../assets/sprites/players/female_mage/idle/femaile_mage_idle_4.png";

import mageHurt1 from "../assets/sprites/players/female_mage/hurt/femaile_mage_hurt_1.png";
import mageHurt2 from "../assets/sprites/players/female_mage/hurt/femaile_mage_hurt_2.png";
import mageHurt3 from "../assets/sprites/players/female_mage/hurt/femaile_mage_hurt_3.png";
import mageHurt4 from "../assets/sprites/players/female_mage/hurt/femaile_mage_hurt_4.png";

import mageHit1 from "../assets/sprites/players/female_mage/hit/femaile_mage_hit_1.png";
import mageHit2 from "../assets/sprites/players/female_mage/hit/femaile_mage_hit_2.png";
import mageHit3 from "../assets/sprites/players/female_mage/hit/femaile_mage_hit_3.png";
import mageHit4 from "../assets/sprites/players/female_mage/hit/femaile_mage_hit_4.png";

// Import bandit frames
import banditIdle1 from "../assets/sprites/enemies/bandit/idle/bandit_idle_1.png";
import banditIdle2 from "../assets/sprites/enemies/bandit/idle/bandit_idle_2.png";
import banditIdle3 from "../assets/sprites/enemies/bandit/idle/bandit_idle_3.png";
import banditIdle4 from "../assets/sprites/enemies/bandit/idle/bandit_idle_4.png";

import banditHurt1 from "../assets/sprites/enemies/bandit/hurt/bandit_hurt_1.png";
import banditHurt2 from "../assets/sprites/enemies/bandit/hurt/bandit_hurt_2.png";
import banditHurt3 from "../assets/sprites/enemies/bandit/hurt/bandit_hurt_3.png";
import banditHurt4 from "../assets/sprites/enemies/bandit/hurt/bandit_hurt_4.png";

import banditHit1 from "../assets/sprites/enemies/bandit/hit/bandit_hit_1.png";
import banditHit2 from "../assets/sprites/enemies/bandit/hit/bandit_hit_2.png";
import banditHit3 from "../assets/sprites/enemies/bandit/hit/bandit_hit_3.png";
import banditHit4 from "../assets/sprites/enemies/bandit/hit/bandit_hit_4.png";

// Import goblin frames
import goblinIdle1 from "../assets/sprites/enemies/goblin/idle/goblin_idle_1.png";
import goblinIdle2 from "../assets/sprites/enemies/goblin/idle/goblin_idle_2.png";
import goblinIdle3 from "../assets/sprites/enemies/goblin/idle/goblin_idle_3.png";
import goblinIdle4 from "../assets/sprites/enemies/goblin/idle/goblin_idle_4.png";

import goblinHurt1 from "../assets/sprites/enemies/goblin/hurt/goblin_hurt_1.png";
import goblinHurt2 from "../assets/sprites/enemies/goblin/hurt/goblin_hurt_2.png";
import goblinHurt3 from "../assets/sprites/enemies/goblin/hurt/goblin_hurt_3.png";
import goblinHurt4 from "../assets/sprites/enemies/goblin/hurt/goblin_hurt_4.png";

import goblinHit1 from "../assets/sprites/enemies/goblin/hit/goblin_hit_1.png";
import goblinHit2 from "../assets/sprites/enemies/goblin/hit/goblin_hit_2.png";
import goblinHit3 from "../assets/sprites/enemies/goblin/hit/goblin_hit_3.png";
import goblinHit4 from "../assets/sprites/enemies/goblin/hit/goblin_hit_4.png";

// Import red_dragon frames
import dragonIdle1 from "../assets/sprites/enemies/red_dragon/idle/red_dragon_idle_1.png";
import dragonIdle2 from "../assets/sprites/enemies/red_dragon/idle/red_dragon_idle_2.png";
import dragonIdle3 from "../assets/sprites/enemies/red_dragon/idle/red_dragon_idle_3.png";
import dragonIdle4 from "../assets/sprites/enemies/red_dragon/idle/red_dragon_idle_4.png";

import dragonHurt1 from "../assets/sprites/enemies/red_dragon/hurt/red_dragon_hurt_1.png";
import dragonHurt2 from "../assets/sprites/enemies/red_dragon/hurt/red_dragon_hurt_2.png";
import dragonHurt3 from "../assets/sprites/enemies/red_dragon/hurt/red_dragon_hurt_3.png";
import dragonHurt4 from "../assets/sprites/enemies/red_dragon/hurt/red_dragon_hurt_4.png";

import dragonHit1 from "../assets/sprites/enemies/red_dragon/hit/red_dragon_hit_1.png";
import dragonHit2 from "../assets/sprites/enemies/red_dragon/hit/red_dragon_hit_2.png";
import dragonHit3 from "../assets/sprites/enemies/red_dragon/hit/red_dragon_hit_3.png";
import dragonHit4 from "../assets/sprites/enemies/red_dragon/hit/red_dragon_hit_4.png";

const spriteMap: Record<string, { idle: string[], hurt: string[], hit: string[] }> = {
  knight: {
    idle: [knightIdle1, knightIdle2, knightIdle3, knightIdle4],
    hurt: [knightHurt1, knightHurt2, knightHurt3, knightHurt4],
    hit: [knightHit1, knightHit2, knightHit3, knightHit4],
  },
  rouge: {
    idle: [rougeIdle1, rougeIdle2, rougeIdle3, rougeIdle4],
    hurt: [rougeHurt1, rougeHurt2, rougeHurt3, rougeHurt4],
    hit: [rougeHit1, rougeHit2, rougeHit3, rougeHit4],
  },
  female_mage: {
    idle: [mageIdle1, mageIdle2, mageIdle3, mageIdle4],
    hurt: [mageHurt1, mageHurt2, mageHurt3, mageHurt4],
    hit: [mageHit1, mageHit2, mageHit3, mageHit4],
  },
  bandit: {
    idle: [banditIdle1, banditIdle2, banditIdle3, banditIdle4],
    hurt: [banditHurt1, banditHurt2, banditHurt3, banditHurt4],
    hit: [banditHit1, banditHit2, banditHit3, banditHit4],
  },
  goblin: {
    idle: [goblinIdle1, goblinIdle2, goblinIdle3, goblinIdle4],
    hurt: [goblinHurt1, goblinHurt2, goblinHurt3, goblinHurt4],
    hit: [goblinHit1, goblinHit2, goblinHit3, goblinHit4],
  },
  red_dragon: {
    idle: [dragonIdle1, dragonIdle2, dragonIdle3, dragonIdle4],
    hurt: [dragonHurt1, dragonHurt2, dragonHurt3, dragonHurt4],
    hit: [dragonHit1, dragonHit2, dragonHit3, dragonHit4],
  }
};

interface EntityCardProps {
  entity: Entity;
  isCurrentPlayer: boolean;
  isCurrentTurn: boolean;
  isSelected: boolean;
  canSelect: boolean;
  onClick: () => void;
  onEndTurn?: () => void;
  onCycleSprite?: () => void;
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
  onCycleSprite,
  hideHP = false,
  simple = false,
}: EntityCardProps) {
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
  const spriteSet = spriteMap[entity.sprite] || spriteMap.knight;
  let currentFrames = spriteSet.idle;
  if (isTakingDamage) {
    currentFrames = spriteSet.hit;
  } else if (entity.health / entity.maxHealth <= 0.25) {
    currentFrames = spriteSet.hurt;
  }

  const handleSpriteClick = (e: React.MouseEvent) => {
    if (isCurrentPlayer && onCycleSprite) {
      e.stopPropagation();
      onCycleSprite();
    }
  };

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
          <div className={`relative transition-all ${isCurrentTurn ? "scale-125" : "scale-100"}`}>
            <img
              src={currentFrames[frameIndex]}
              alt={entity.name}
              onClick={handleSpriteClick}
              className={`h-24 w-auto object-contain ${isCurrentPlayer ? "cursor-pointer hover:brightness-125" : ""}`}
              style={{
                imageRendering: "pixelated",
                transform: entity.type === "player" ? "scaleX(-1)" : "none",
              }}
            />
            {isCurrentTurn && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 blur-sm animate-pulse" />
            )}
          </div>
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
          <div className={`relative w-16 h-16 shrink-0 overflow-hidden rounded-xl bg-black/40 border border-white/5 flex items-center justify-center ${isCurrentPlayer ? "cursor-pointer hover:bg-black/60" : ""}`}>
            <img
              src={currentFrames[frameIndex]}
              alt={entity.name}
              onClick={handleSpriteClick}
              className="h-16 w-auto object-contain"
              style={{ 
                imageRendering: "pixelated",
                transform: entity.type === "player" ? "scaleX(-1)" : "none",
              }}
            />
            {isCurrentTurn && (
              <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />
            )}
          </div>

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
