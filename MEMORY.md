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

### 2026-05-01 - Fix "vite not found" in debug mode

**Status:** Done

**Task:**
Resolve frontend container failure in debug mode due to missing dependencies.

**Files changed:**
- docker-compose.debug.yml

**Summary:**
- Updated the `frontend` command in `docker-compose.debug.yml` to run `npm install` before `npm run dev`. This ensures that even if `node_modules` is missing or incompatible on the host, the container will have the correct dependencies installed in its anonymous volume.

**Verification:**
- User reported `sh: vite: not found` error; `npm install` is the standard fix for this in dev containers.

**Notes / Follow-ups:**
- The first run of `make debug` will take slightly longer as it installs npm packages.

### 2026-05-01 - Add "make debug" for real-time development

**Status:** Done

**Task:**
Add a "debug" option to the `Makefile` for hot-reloading changes in real-time.

**Files changed:**
- .air.toml
- docker-compose.debug.yml
- Makefile
- GEMINI.md

**Summary:**
- Implemented `make debug` which uses a dedicated `docker-compose.debug.yml`.
- Set up **Go hot-reloading** using `air` with a `.air.toml` configuration to watch backend files (excluding `client/` and `data/`).
- Set up **Frontend hot-reloading** by running the Vite dev server inside the container with volume-mounted source code.
- Updated documentation in `GEMINI.md` to explain how to use the new debug mode.

**Verification:**
- Verified `.air.toml` and `docker-compose.debug.yml` configurations.

**Notes / Follow-ups:**
- Debug mode runs in the foreground by default so developers can see rebuild logs instantly.

### 2026-05-01 - Update web-app title to "DnD-CombatPlus"

**Status:** Done

**Task:**
Change the title of the web-app to "DnD-CombatPlus".

**Files changed:**
- client/index.html
- client/src/pages/LandingPage.tsx
- Makefile
- README.md

**Summary:**
- Updated the `<title>` tag in `index.html`.
- Updated the visual title in `LandingPage.tsx`.
- Updated `APP_NAME` in `Makefile`.
- Updated the main heading in `README.md`.

**Verification:**
- Verified string replacements across all target files.

**Notes / Follow-ups:**
- Go module path and project-internal identifiers remain "DnDCombatPlus" to avoid breaking code references.

### 2026-05-01 - Update Makefile to run in background by default

**Status:** Done

**Task:**
Make the `make run` command run everything in the background and ensure `make stop` stops everything.

**Files changed:**
- Makefile
- GEMINI.md

**Summary:**
- Updated `make run` to use `docker compose up -d --build`, moving execution to the background by default.
- Removed the redundant `make start` command.
- Updated `make stop` and `make help` to reflect the background-first workflow.
- Updated `GEMINI.md` documentation to match the new `Makefile` commands.

**Verification:**
- Verified `Makefile` command changes.

**Notes / Follow-ups:**
- Users can now use `make logs` to see output after `make run`.

### 2026-05-01 - Fix Go version mismatch in Dockerfile

**Status:** Done

**Task:**
Resolve Docker build error caused by Go version mismatch.

**Files changed:**
- Dockerfile

**Summary:**
- Updated the base image in the backend `Dockerfile` from `golang:1.23-alpine` to `golang:1.25-alpine` to match the `go 1.25.0` requirement in `go.mod`.

**Verification:**
- User report indicated failure with 1.23; 1.25 is required by `go.mod`.

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Set up Docker Compose and update Makefile

**Status:** Done

**Task:**
Set up the project to run from a docker compose file and update the Makefile to use docker-compose commands.

**Files changed:**
- Dockerfile
- client/Dockerfile
- docker-compose.yml
- Makefile
- GEMINI.md

**Summary:**
- Created a multistage `Dockerfile` for the Go backend.
- Created a multistage `Dockerfile` for the React frontend (build with Node, serve with Nginx).
- Created `docker-compose.yml` to orchestrate both services, exposing backend on 8080 and frontend on 5173.
- Updated `Makefile` to use `docker compose` for all lifecycle commands (`run`, `start`, `stop`, `restart`, `logs`, `build`, `test`).
- Updated `GEMINI.md` to reflect the new Docker-based development workflow.

**Verification:**
- Verified `Dockerfile` and `docker-compose.yml` structures.
- Verified `Makefile` commands match the new Docker workflow.

**Notes / Follow-ups:**
- Frontend in Docker is currently served as static files via Nginx. For hot-reloading development, users might still prefer `npm run dev` locally or a volume-mounted dev container setup in the future.

### 2026-05-01 - Implement Room creation with backend integration

**Status:** Done

**Task:**
Add a "Start Room" button that generates a random Room Key via the backend.

**Files changed:**
- internal/server/rooms.go
- internal/server/handlers.go
- internal/server/server.go
- client/src/pages/RoomPage.tsx
- client/.env

**Summary:**
- Created `internal/server/rooms.go` with `RoomManager` for in-memory room state.
- Created `internal/server/handlers.go` with `createRoomHandler` for `POST /rooms`.
- Updated `internal/server/server.go` to include `RoomManager`, register the new route, and added basic CORS middleware.
- Updated `RoomPage.tsx` to include a "Start Room" button (emerald-500) that calls the backend and displays the generated Room Key.
- Created `client/.env` to store `VITE_API_BASE_URL`.

**Verification:**
- Verified backend `POST /rooms` returns a JSON room object with a 6-character hex key using `curl`.
- Ran `npm run build` and `npm run lint` in `client` directory (passed).
- Confirmed "Start Room" button appears and UI displays the key (simulated response).

**Notes / Follow-ups:**
- Used in-memory storage for rooms as per MVP goals.
- Backend currently runs on `http://localhost:8080`.

### 2026-05-01 - Add Leave Room with confirmation

**Status:** Done

**Task:**
Add a button to the room view to leave the room with a confirmation prompt.

**Files changed:**
- client/src/App.tsx
- client/src/pages/RoomPage.tsx

**Summary:**
- Added a "Leave Room" button at the top right of the `RoomPage` view.
- Implemented a custom confirmation modal in `RoomPage` with fade-in/out animations.
- The "Leave Room" action within the modal triggers the `onLeave` prop, which navigates back to the landing view.
- Added a "Go Back" button and backdrop-click to dismiss the confirmation modal.

**Verification:**
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Build Room view layout

**Status:** Done

**Task:**
Implement a central container in the Room view with "Players" and "Creatures" headers.

**Files changed:**
- client/src/pages/RoomPage.tsx

**Summary:**
- Replaced placeholder text with a glassmorphism container (`backdrop-blur-md`, `bg-white/10`).
- Added a header row with labels for "Players" (left) and "Creatures" (right).
- Implemented a responsive grid layout (1 column on mobile, 2 columns on tablet/desktop).
- Added placeholder empty states for both columns.

**Verification:**
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- None.

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
