# MEMORY.md

## Purpose

This file is the project memory log for CLI agents working on DnDCombatPlus.

After each meaningful change, the agent should append a short summary of what changed, why it changed, and how it was verified.

This file is not for long explanations, planning dumps, or full code copies. Keep it short and useful.

---

## Rules for the Agent

When completing a task, append a new entry to the top of the log under **Change Log**.

Each entry must include:

- Date
- Task summary
- Files changed
- What changed
- Verification performed
- Notes / follow-ups, if any

Keep entries concise.

Do not include secrets, tokens, API keys, passwords, or private environment values.

Do not paste full source files into this log.

Do not remove older entries unless the user explicitly asks.

If a task fails or is only partially completed, still add an entry and clearly mark the status as partial or failed.

---

## Entry Format

Use this format:

```md
### YYYY-MM-DD - Short task title

**Status:** Done | Partial | Failed

**Task:**
One sentence describing the requested task.

**Files changed:**
- path/to/file.go
- path/to/file.tsx

**Summary:**
- Short bullet explaining what changed.
- Short bullet explaining important behavior.

**Verification:**
- Command or manual check performed.
- Result of the check.

**Notes / Follow-ups:**
- Anything important for the next agent run.
```

---

## Change Log

### 2026-05-01 - Refactor to state-based router and add Room view

**Status:** Done

**Task:**
Create a "Room" view and navigate to it when "Create Room" is pressed.

**Files changed:**
- client/src/App.tsx
- client/src/components/LiquidBackground.tsx
- client/src/pages/LandingPage.tsx
- client/src/pages/RoomPage.tsx

**Summary:**
- Refactored `App.tsx` into a state-based router using a `view` state.
- Extracted the liquid background animation into `components/LiquidBackground.tsx`.
- Moved the landing page UI and logic (including the Join modal) into `pages/LandingPage.tsx`.
- Created `pages/RoomPage.tsx` with a placeholder "ROOM" text.
- Connected the "Create Room" button in `LandingPage` to switch the view to "room" in `App`.

**Verification:**
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- Navigation is currently handled by internal React state, not URL-based routing.

### 2026-05-01 - Animate Join Room modal

**Status:** Done

**Task:**
Add fade-in and fade-out animations to the "Join Room" modal.

**Files changed:**
- client/src/App.tsx

**Summary:**
- Added `isModalVisible` state to control transition classes separately from mount state.
- Implemented `openModal` and `closeModal` helpers to manage the timing of mounting and transitions.
- Added `opacity-0`/`opacity-100` and `scale-95`/`scale-100` transitions using Tailwind 4 utility classes.
- Used a 300ms timeout during closing to allow the fade-out animation to complete before unmounting.

**Verification:**
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Add Join Room modal

**Status:** Done

**Task:**
Make the "Join Room" button open a popup for Room Key and Character Name inputs.

**Files changed:**
- client/src/App.tsx

**Summary:**
- Added `useState` for `isJoinModalOpen`, `roomKey`, and `characterName`.
- Implemented a modal overlay with glassmorphism styling (`backdrop-blur-sm`, `bg-black/60`).
- Added a form inside the modal with two inputs: "Room Key" and "Character Name".
- Styled the modal to match the dark aesthetic with `bg-zinc-900` and `border-white/10`.
- Added "Join Room" (submit) and "Cancel" buttons within the modal.

**Verification:**
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- The form currently has `onSubmit={(e) => e.preventDefault()}` and does not save or send data yet.

### 2026-05-01 - Remove ripple effect from home page

**Status:** Done

**Task:**
Remove the interactive ripple effect from the background animation.

**Files changed:**
- client/src/App.tsx

**Summary:**
- Deleted `Ripple` type and ripple-related state from `LiquidBackground`.
- Removed `spawnRipple`, `trySpawnRipple`, `onPointerMove`, and `onPointerDown` functions.
- Removed `updateRipples` and `drawRipples` logic from the animation loop.
- Unregistered pointer event listeners for ripples.
- Preserved the animated "liquid" blobs background.

**Verification:**
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Refine button hover effects with scaling and contrast

**Status:** Done

**Task:**
Apply contrasting hover effects and scale-up animation to home page buttons.

**Files changed:**
- client/src/App.tsx

**Summary:**
- Added `hover:scale-[1.02]` to both "Create Room" and "Join Room" buttons.
- Updated "Create Room" hover to `bg-zinc-200` for a visible contrast against white.
- Updated "Join Room" hover to `bg-white/15` and `border-white/40` for better visibility against the dark gray background.
- Increased shadow intensity on "Create Room" hover (`hover:shadow-xl`).

**Verification:**
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Add hover effects to home page buttons

### 2026-05-01 - Initialize project memory log

**Status:** Done

**Task:**
Create a dedicated memory file for agents to record short summaries of completed project changes.

**Files changed:**
- MEMORY.md

**Summary:**
- Added a lightweight project memory log format.
- Defined rules for agents to append concise change summaries after meaningful tasks.
- Added a standard entry template for consistency.

**Verification:**
- File created successfully.

**Notes / Follow-ups:**
- Future agents should update this file after each completed task.
