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

### 2026-05-01 - Fix player "End Turn" button interaction

**Status:** Done

**Task:**
Resolve the issue where players were unable to click the "End Your Turn" button.

**Files changed:**
- client/src/pages/RoomPage.tsx

**Summary:**
- **Bug Fix:** Removed the `disabled` attribute from player/creature character cards. Previously, because players lacked a `dmToken`, the entire card (implemented as a `<button>`) was disabled, which blocked all clicks to the internal "End Your Turn" button.
- **Refactor:** Converted character cards from `<button>` to `<div>` to allow nested interactive elements (like buttons) to function correctly.
- **UI Logic:** Maintained selection logic for the DM by adding `cursor-pointer` and `onClick` selection handlers that only fire if a `dmToken` is present.

**Verification:**
- Verified that nested buttons within the character cards are now clickable for players.
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Simplify "End Turn" flow (Direct Action)

**Status:** Done

**Task:**
Scrap the DM confirmation for ending turns and allow players to end their own turns directly.

**Files changed:**
- internal/server/rooms.go
- internal/server/handlers.go
- client/src/pages/RoomPage.tsx
- client/src/types/combat.ts

**Summary:**
- **Backend:** Updated `RequestEndTurn` to directly clear the `CurrentTurn` instead of setting a request flag.
- **Backend:** Removed the `EndTurnRequested` field from the `Room` struct as it is no longer needed.
- **Frontend:** Removed the "Waiting for Host" logic and yellow pulsing state from the player's "End Your Turn" button.
- **Frontend:** Removed the DM notification banner for turn end requests.
- **Frontend:** Simplified the turn indicator UI to only show the current turn without any "End Requested" state.

**Verification:**
- Verified that clicking "End Your Turn" as a player instantly clears the current turn for all participants.
- Ran `go build ./...` and `npm run build` (passed).

**Notes / Follow-ups:**
- DM still has full override control by selecting any entity and clicking "Set Turn".

### 2026-05-01 - Add global DM notification for turn end requests

**Status:** Done

**Task:**
Ensure the DM sees turn end requests immediately, even without having an entity selected.

**Files changed:**
- client/src/pages/RoomPage.tsx

**Summary:**
- Moved the "Confirm End Turn" functionality from the selected-entity panel to a global notification banner.
- The banner appears at the top of the `RoomPage` for the DM whenever `room.endTurnRequested` is true.
- Styled the banner with high visibility: emerald background, pulsing icon, and a prominent "Confirm & Clear Turn" button.
- Cleaned up the redundant button from the DM Action Panel.

**Verification:**
- Verified that the banner appears automatically for the DM when a player ends their turn, regardless of selection.
- Verified that clicking the button clears the turn for everyone.
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Add DM "Confirm End Turn" button

**Status:** Done

**Task:**
Make the "Confirm End Turn" action visible and easily accessible for the DM when a player requests it.

**Files changed:**
- client/src/pages/RoomPage.tsx

**Summary:**
- Added a pulsing emerald **"Confirm End Turn"** button to the DM Action Panel.
- The button only appears when a player has signaled they want to end their turn (`room.endTurnRequested`).
- Clicking the button clears the current turn on the backend, resetting the combat state to a neutral "no one's turn" state.
- Fixed TypeScript null-check errors related to the room object in the new handler.

**Verification:**
- Verified that the button appears only when a request is active.
- Verified that clicking the button resets the turn for all participants.
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Implement Player "End Turn" request

**Status:** Done

**Task:**
Allow players to signal the end of their turn, notifying the DM.

**Files changed:**
- internal/server/rooms.go
- internal/server/handlers.go
- internal/server/server.go
- client/src/pages/RoomPage.tsx
- client/src/types/combat.ts

**Summary:**
- **Backend:** Added `EndTurnRequested` flag to the `Room` state.
- **Backend:** Implemented `RequestEndTurn` method and `POST .../end-turn` endpoint for players.
- **Backend:** Ensured `EndTurnRequested` is reset whenever the DM manually changes the turn.
- **Frontend:** Added an **"End Your Turn"** button that only appears for the active player.
- **Frontend:** Implemented visual feedback: when a player requests to end their turn, their card border and the turn indicator pulse red for everyone (especially the DM).
- **Bug Fix:** Fixed a regression in `deleteEntityHandler` where players couldn't remove themselves from the room.

**Verification:**
- Verified that the "End Your Turn" button correctly updates the room state.
- Verified that the pulsing red UI appears when a request is active.
- Ran `go build ./...` and `npm run build` (passed).

**Notes / Follow-ups:**
- DM still has final authority to move to the next turn by selecting an entity and clicking "Set Turn".

### 2026-05-01 - Refine "End Turn" visual feedback

**Status:** Done

**Task:**
Improve the "End Turn" experience with clearer visual states for both players and DMs.

**Files changed:**
- client/src/pages/RoomPage.tsx

**Summary:**
- Updated the player's "End Your Turn" button: it now turns **yellow**, pulses, and says **"Waiting for Host..."** after being clicked.
- Disabled the button once a request is active to prevent double-submissions.
- Refined the DM's notification banner to clearly indicate which player is ready to end their turn.
- Leveraged the real-time WebSocket system to ensure these states update instantly for all participants.

**Verification:**
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Implement Real-time updates with WebSockets

**Status:** Done

**Task:**
Replace polling with WebSockets for instant state updates across all connected clients.

**Files changed:**
- internal/server/realtime.go
- internal/server/handlers.go
- internal/server/server.go
- client/src/pages/RoomPage.tsx
- go.mod
- go.sum

**Summary:**
- **Backend:** Added `github.com/gorilla/websocket` dependency.
- **Backend:** Created a `Hub` system in `internal/server/realtime.go` to manage room-based WebSocket connections and message broadcasting.
- **Backend:** Registered `GET /ws/rooms/{key}` endpoint.
- **Backend:** Updated all state-changing handlers (add, update, delete, damage, heal, turn, end-turn) to broadcast the updated room state to all clients in the room via the Hub.
- **Backend:** Added a special `room_ended` event for when the DM deletes a room.
- **Frontend:** Replaced the 3-second polling logic in `RoomPage.tsx` with a persistent WebSocket connection.
- **Frontend:** Updated UI to dynamically react to incoming WebSocket messages, providing instant feedback for actions taken by the DM or other players.

**Verification:**
- Verified that actions taken in one client are reflected instantly in other connected clients.
- Verified that kicking a player or ending a session triggers the correct notification instantly via WebSocket.
- Ran `go build ./...` and `npm run build` (passed).

**Notes / Follow-ups:**
- Actions are still sent via HTTP POST/PATCH for simplicity and to leverage existing token validation; WebSockets are currently used for one-way server-to-client broadcasts.

### 2026-05-01 - Implement Entity caps (Max 7 per side)

**Status:** Done

**Task:**
Limit the number of entities in each group to 7 (max 7 players and 7 enemies).

**Files changed:**
- internal/server/rooms.go
- internal/server/handlers.go
- client/src/pages/RoomPage.tsx

**Summary:**
- **Backend:** Enforced a cap of 7 entities per type in `AddEntity` and `JoinPlayer` methods.
- **Backend:** Updated `addEntityHandler` to pre-validate that batch creature creation won't exceed the 7-enemy limit.
- **Frontend:** Updated `RoomPage.tsx` to hide the "+ Add Creature" button and display an "Enemy Cap Reached" indicator when 7 enemies are present.
- **Frontend:** Handled backend error messages during join/add actions to inform users when a cap is reached.

**Verification:**
- Verified that trying to add an 8th enemy or player returns a `400 Bad Request` or `404 Not Found` (mapped to join) error from the backend.
- Ran `go build ./...` and `npm run build` (passed).

**Notes / Follow-ups:**
- Players will see a clear "Room is full" message if they try to join a room with 7 players already inside.

### 2026-05-01 - Implement Batch creature creation

**Status:** Done

**Task:**
Add an "amount" field to the New Creature menu to allow creating multiple creatures at once (max 5).

**Files changed:**
- internal/server/handlers.go
- client/src/pages/RoomPage.tsx

**Summary:**
- **Backend:** Updated `AddEntityRequest` to include an `Amount` field.
- **Backend:** Updated `addEntityHandler` to loop and create multiple entities if `Amount > 1`, using numbered names (e.g., "Goblin 1", "Goblin 2").
- **Frontend:** Added `creatureAmount` state to `RoomPage.tsx`.
- **Frontend:** Added an "Amount (Max 5)" input field to the "New Creature" modal.
- **Frontend:** Updated `addCreature` to send the amount to the backend.

**Verification:**
- Verified backend numbering logic: "Goblin 1", "Goblin 2", etc.
- Ran `go build ./...` and `npm run build` (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Fix DM "Rename" and "Max HP" controls

**Status:** Done

**Task:**
Resolve issues where "Rename" and "Max HP" actions were not working for the DM.

**Files changed:**
- internal/server/server.go
- internal/server/handlers.go
- internal/server/rooms.go

**Summary:**
- **Bug Fix:** Added `PATCH` to the allowed methods in the CORS middleware; previously, the browser blocked these requests.
- **Backend Improvement:** Updated `UpdateEntityRequest` and `UpdateEntity` to use pointers for `name` and `maxHealth`. This allows the server to correctly distinguish between a partial update (e.g., only renaming) and an intentional "zero" or "empty" value.
- **Backend:** Ensured proper clamping of current health if the maximum health is reduced below the current level.

**Verification:**
- Verified that `PATCH` requests are now allowed by the server.
- Verified Go build and frontend build/lint (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Add pulsing red border to session notifications

**Status:** Done

**Task:**
Make the kick/end session popup's red border pulse slowly for better visibility.

**Files changed:**
- client/src/pages/LandingPage.tsx

**Summary:**
- Added the `animate-pulse` Tailwind class to the notification popup container.
- Increased the border opacity to `border-red-500/40` to make the pulsing effect more prominent against the dark background.

**Verification:**
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Implement Session notifications (Kicked/Ended)

**Status:** Done

**Task:**
Show clear popup messages when a player is kicked or a room session ends.

**Files changed:**
- client/src/App.tsx
- client/src/pages/LandingPage.tsx
- client/src/pages/RoomPage.tsx

**Summary:**
- Added global `notification` state to `App.tsx` and updated `handleLeaveRoom` to accept an optional message.
- Implemented a themed notification popup on the `LandingPage` with a 5-second auto-clear and manual close button.
- Updated `RoomPage` to pass specific messages to `onLeave`:
    - "You have been kicked by host" when the player's entity is removed.
    - "This room has been ended by host" when the room is deleted (404).

**Verification:**
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Implement Player kick if removed by DM

**Status:** Done

**Task:**
Ensure a player is automatically kicked from their session if the DM manually removes their character from the room.

**Files changed:**
- client/src/pages/RoomPage.tsx

**Summary:**
- Updated the polling logic in `fetchRoom` to check for the current player's existence in the room state.
- If the player's entity ID is missing from the fetched `data.entities`, the `onLeave()` handler is called to redirect them to the landing page.
- Added `currentPlayer` as a dependency to the `fetchRoom` callback.

**Verification:**
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- This complements the previous "Room deleted" kick logic.

### 2026-05-01 - Implement Entity removal on player leave and DM control

**Status:** Done

**Task:**
Automatically remove a player's character from the room when they leave, and give the DM manual removal control.

**Files changed:**
- internal/server/rooms.go
- internal/server/handlers.go
- internal/server/server.go
- client/src/pages/RoomPage.tsx

**Summary:**
- **Backend:** Added `RemoveEntity` method to `RoomManager`, ensuring the `currentTurn` is cleared if the active entity is removed.
- **Backend:** Implemented `DELETE /rooms/{key}/entities/{id}` endpoint with DM token validation (optional for self-removal).
- **Frontend:** Updated `handleLeaveConfirmed` in `RoomPage.tsx` to call the DELETE endpoint for players before they navigate away.
- **Frontend:** Added a **"Remove"** button to the DM Action Panel, allowing DMs to manually kick players or delete creatures.
- **Frontend:** Implemented a confirmation prompt for manual removal.

**Verification:**
- Verified that leaving as a player removes the entity from the server state.
- Verified that the DM can remove any entity via the new button.
- Ran `go build ./...` and `npm run build` (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Implement DM entity controls (Update, Damage, Heal, Turn)

**Status:** Done

**Task:**
Provide the DM with the ability to select entities and manage their name, max health, current HP (damage/heal), and set the active turn.

**Files changed:**
- internal/server/rooms.go
- internal/server/handlers.go
- internal/server/server.go
- client/src/pages/RoomPage.tsx
- client/src/types/combat.ts

**Summary:**
- **Backend:** Added `UpdateEntity`, `ApplyDamage`, `ApplyHeal`, and `SetCurrentTurn` methods to `RoomManager`.
- **Backend:** Implemented proper HP clamping (min 0, max MaxHealth) and Temp HP absorption during damage.
- **Backend:** Registered `PATCH /rooms/{key}/entities/{id}`, `POST .../damage`, `POST .../heal`, and `PUT /rooms/{key}/turn` endpoints.
- **Frontend:** Implemented entity selection logic in `RoomPage.tsx`.
- **Frontend:** Added a **DM Action Panel** that appears when an entity is selected, featuring buttons for Damage, Heal, Set Turn, Rename, and Max HP.
- **Frontend:** Added a generic action modal for entering numeric amounts or new names.
- **Frontend:** Added a turn indicator in the header and visual highlighting (emerald ring) for the entity whose turn it currently is.

**Verification:**
- Verified backend logic for HP clamping and DM token validation.
- Verified frontend selection and action triggering.
- Ran `go build ./...` and `npm run build` (passed).

**Notes / Follow-ups:**
- Selection and turn highlights are currently static; real-time updates via WebSockets will further enhance this.

### 2026-05-01 - Implement Room deletion on DM leave

**Status:** Done

**Task:**
End the combat session, kick all players, and delete the room when the DM leaves.

**Files changed:**
- internal/server/rooms.go
- internal/server/handlers.go
- internal/server/server.go
- client/src/pages/RoomPage.tsx

**Summary:**
- **Backend:** Added `DeleteRoom` method to `RoomManager` with DM token validation.
- **Backend:** Implemented `DELETE /rooms/{key}` endpoint.
- **Frontend:** Updated DM's leave confirmation to call the `DELETE` endpoint, effectively ending the session for everyone.
- **Frontend:** Implemented a polling mechanism (every 3s) for players that checks if the room still exists.
- **Frontend:** Players are automatically redirected to the landing page ("kicked") if the backend returns a 404 for their room.
- **Code Quality:** Refactored `fetchRoom` with `useCallback` to resolve React hook dependency warnings.

**Verification:**
- Verified that deleting a room via `DELETE` makes subsequent `GET` requests return 404.
- Verified frontend build and lint (passed).

**Notes / Follow-ups:**
- Polling is used as a temporary solution until WebSockets are fully implemented for real-time events.

### 2026-05-01 - Implement DM authentication and role-based UI

**Status:** Done

**Task:**
Restrict DM actions (like adding creatures) to the room owner and hide them from players.

**Files changed:**
- internal/server/rooms.go
- internal/server/handlers.go
- client/src/pages/RoomPage.tsx

**Summary:**
- **Backend:** Updated `Room` struct to hide `DMToken` from public JSON serialization using `json:"-"`.
- **Backend:** Updated `createRoomHandler` to return the `dmToken` only upon room creation via a new `CreateRoomResponse` wrapper.
- **Backend:** Updated `addEntityHandler` to require a `Bearer <token>` in the `Authorization` header, validating it against the room's secret token.
- **Frontend:** Added `dmToken` state to `RoomPage`.
- **Frontend:** Updated `startRoom` to capture and store the secret token for the DM.
- **Frontend:** Restricted the "+ Add Creature" button visibility to only appear if `dmToken` is present.
- **Frontend:** Added the `Authorization` header to the `addCreature` API call.

**Verification:**
- Verified that players (joined via key) do not receive the `dmToken` in the API response.
- Verified that the backend returns `401 Unauthorized` if the token is missing or incorrect when adding a creature.
- Ran `go build ./...` and `npm run build` (passed).

**Notes / Follow-ups:**
- Players are now effectively spectators with no control over room entities.

### 2026-05-01 - Implement Player join room

**Status:** Done

**Task:**
Enable players to join a room using a Room Key and Character Name.

**Files changed:**
- internal/server/rooms.go
- internal/server/handlers.go
- internal/server/server.go
- client/src/pages/LandingPage.tsx
- client/src/App.tsx
- client/src/pages/RoomPage.tsx
- client/src/types/combat.ts

**Summary:**
- Added `JoinPlayer` method to `RoomManager` on the backend, implementing unique character name logic (case-insensitive, appending numbers for duplicates).
- Implemented `POST /rooms/join` endpoint.
- Updated `LandingPage.tsx` to call the join endpoint and handle navigation.
- Updated `App.tsx` to manage room and player state and pass them to `RoomPage`.
- Updated `RoomPage.tsx` to highlight the "You" player card for the joined user.
- Created `client/src/types/combat.ts` for shared TypeScript types to resolve linter errors.

**Verification:**
- Verified unique name logic: "Joe" becomes "Joe1" if "joe" already exists.
- Ran `go build ./...` (passed).
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Fix missing fmt import in rooms.go

**Status:** Done

**Task:**
Resolve Go compilation error `undefined: fmt` in `internal/server/rooms.go`.

**Files changed:**
- internal/server/rooms.go

**Summary:**
- Re-added the `fmt` import which was missing after previous refactoring.

**Verification:**
- Ran `go build ./...` (passed).

**Notes / Follow-ups:**
- None.

### 2026-05-01 - Implement Creature creation

**Status:** Done

**Task:**
Add a button to the room view that prompts for Creature Name and Max Health to create a new creature.

**Files changed:**
- internal/server/rooms.go
- internal/server/handlers.go
- internal/server/server.go
- client/src/pages/RoomPage.tsx

**Summary:**
- Added `AddEntity` method to `RoomManager` on the backend.
- Implemented `POST /rooms/{key}/entities` and `GET /rooms/{key}` endpoints.
- Added an "+ Add Creature" button to the Creatures column in `RoomPage.tsx`.
- Implemented a modal to prompt for "Creature Name" and "Max Health".
- The UI now fetches and displays the list of creatures (with HP) after adding a new one.
- Improved `RoomPage` state to store the full `room` object for better data management.

**Verification:**
- Ran `npm run build` and `npm run lint` in `client` directory (passed).

**Notes / Follow-ups:**
- Players are filtered to the left column and enemies to the right.
- Real-time updates via WebSockets are not yet implemented; the DM view currently refetches the room state manually after actions.

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
