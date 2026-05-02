# GEMINI.md

## Project: DnDCombatPlus

DnDCombatPlus is a fullstack Go + React web application for making physical Dungeons & Dragons table combat more immersive through a shared realtime visual display.

The app should **not replace the physical table**, the DM, dice, character sheets, or normal DnD flow. It is a visual combat companion controlled by the Dungeon Master.

The Dungeon Master controls what happens. Players mostly watch the combat UI and receive updates in real time.

---

## Primary Platform: Mobile-First

DnDCombatPlus is intended to be used primarily on phones at a physical DnD table.

Design and implement the app **phone-first**.

Desktop/tablet support is allowed, but the main UX must work well on a normal phone screen.

Mobile-first priorities:

- Large readable text.
- Big tap targets.
- Simple stacked layouts.
- Minimal typing during combat.
- Fast interactions for the DM.
- Clear visual feedback for players.
- Avoid hover-only interactions.
- Avoid tiny buttons.
- Avoid dense desktop-style dashboards.
- Keep combat state visible without excessive scrolling.
- Use responsive CSS from the start.
- Prioritize readability over strict desktop left/right layout when screen space is limited.

The app should feel like a lightweight combat display/controller that players can open on their phones while still paying attention to the physical table.

---

## Core Product Idea

The app lets a Dungeon Master create a combat room. The DM receives a room key and gives it to players at the physical table.

Players join using:

- Room Key
- Character Name

Once inside, players see a visual combat interface inspired by classic turn-based RPG games, like Pokémon-style combat layout:

- Players are conceptually on the left side.
- Enemies are conceptually on the right side.
- On phone screens, this should adapt to stacked sections for readability.

The DM can control entities, health, turns, statuses, and visual events. Players are mostly spectators, except when it is their current turn. If selected as the current turn, a player can request to end their turn. The DM must confirm manually.

---

## MVP Goal

Build the smallest useful version of the app that proves the core loop:

1. DM creates a room.
2. App generates a room key and DM token.
3. Player joins room using character name and room key.
4. Player appears in the players group.
5. DM can add enemies to the enemies group.
6. DM can apply actions to entities.
7. All connected clients receive realtime updates.
8. UI is mobile-first and comfortable on a phone.

---

## Non-Goals for MVP

Do **not** add these unless explicitly requested:

- User accounts
- Authentication system
- Database persistence
- Character sheets
- Dice rolling
- Initiative automation
- Full DnD rules engine
- Monster stat blocks
- Inventory
- Campaign management
- Maps or grid movement
- Payment system
- Admin dashboard
- AI-generated monsters
- Mobile native app
- Complex animations beyond simple visual feedback

The app is a combat display, not a combat simulator.

---

## Current Project Environment

Current repository structure:

```txt
.
├── .gitignore
├── Makefile
├── README.md
├── app.log
├── client
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── assets
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── main.tsx
│   │   └── styles
│   │       └── index.css
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── cmd
│   └── web
│       └── main.go
├── go.mod
└── internal
    └── server
        └── server.go
```

Current Go module:

```txt
github.com/ItsRTQ/DnDCombatPlus
```

Use this exact module path in imports.

Example:

```go
import "github.com/ItsRTQ/DnDCombatPlus/internal/server"
```

Go import paths are case-sensitive. Keep capitalization exactly as written.

---

## Current Frontend Stack

The frontend is now set up in:

```txt
client/
```

Frontend stack:

```txt
React
Vite
TypeScript
Tailwind CSS
```

The frontend should remain inside `/client`.

The Go backend remains at the repository root.

During development:

```txt
Go backend:       http://localhost:8080
Vite frontend:   http://localhost:5173
```

React communicates with Go through:

- HTTP JSON APIs
- WebSockets for realtime room updates

The frontend must be mobile-first.

---

## Tailwind CSS Setup

Tailwind CSS is used through the Vite setup.

The main Tailwind import should live in:

```txt
client/src/styles/index.css
```

The file should include:

```css
@import "tailwindcss";
```

A clean mobile-first base is recommended:

```css
@import "tailwindcss";

:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  color-scheme: dark;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  min-width: 320px;
  background: #0f172a;
  color: #f8fafc;
}
```

Make sure `client/src/main.tsx` imports the stylesheet:

```ts
import "./styles/index.css";
```

Avoid keeping default Vite demo CSS if it fights the app layout, especially styles that center the whole app or constrain `#root`.

The existing `App.css` can be removed later if unused, but do not delete files unless the task asks for cleanup.

---

## Vite Config Expectations

The Vite config should support React and Tailwind.

Expected file:

```txt
client/vite.config.ts
```

Expected shape:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

If proxying API/WebSocket requests during development becomes useful, add it later only when requested.

---

## Frontend Environment Variables

When frontend API calls are added, prefer Vite environment variables instead of hardcoding URLs everywhere.

Suggested future file:

```txt
client/.env
```

Suggested values:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080
```

Usage:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;
```

Do not commit private secrets into frontend environment files. Vite variables are exposed to the browser.

---

## Existing Makefile Expectations

The project uses a Makefile for backend workflow.

Expected backend commands:

```bash
make run
make start
make stop
make restart
make logs
make test
make test-health
make test-home
make wait
```

The Go app should run from:

```bash
go run ./cmd/web
```

The default local server address should be:

```txt
http://localhost:8080
```

The health endpoint should be:

```txt
GET /health
```

Runtime files should be ignored by Git:

```gitignore
app.log
.app.pid
```

Frontend runtime/build files should be ignored:

```gitignore
client/node_modules/
client/dist/
```

Do not ignore:

```txt
client/package-lock.json
```

Commit `package-lock.json`.

---

## Development Commands

### All Services (Docker)

From repo root:

```bash
make run
```

or for real-time development (Hot Reload):

```bash
make debug
```

or:

```bash
make logs
```

The project uses Docker Compose to run both the backend and frontend. `make run` starts services in the background.

Backend: [http://localhost:8080](http://localhost:8080)
Frontend: [http://localhost:5173](http://localhost:5173)

### Tests

```bash
make test
```

### Manual Controls (Optional)

If you need to run things outside Docker:

#### Backend

```bash
go run ./cmd/web
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

---

## Recommended Backend File Tree

Expand the server package gradually:

```txt
internal/
└── server/
    ├── server.go       # HTTP server setup and route registration
    ├── handlers.go     # HTTP handlers
    ├── rooms.go        # Room manager and room state logic
    ├── entity.go       # Entity, status, and combat state types
    ├── realtime.go     # WebSocket hub/client/broadcast logic
    └── errors.go       # Shared domain errors, if needed
```

Keep code small and focused. Do not create extra packages until the project needs them.

---

## Recommended Frontend File Tree

Grow the frontend toward this shape:

```txt
client/src/
├── App.tsx
├── main.tsx
├── api/
│   ├── http.ts
│   └── socket.ts
├── types/
│   └── combat.ts
├── pages/
│   ├── LandingPage.tsx
│   ├── DMRoomPage.tsx
│   └── PlayerRoomPage.tsx
├── components/
│   ├── BattleView.tsx
│   ├── EntityCard.tsx
│   ├── DMActionPanel.tsx
│   ├── StatusBadge.tsx
│   └── FloatingNumber.tsx
└── styles/
    └── index.css
```

Do not create all files at once unless needed.

Add files only as features require them.

---

## Architecture

### MVP Architecture

```txt
DM Browser
   |
   | HTTP + WebSocket
   v
Go Backend
   |
   | In-memory Room Manager
   | WebSocket Hub
   v
Player Browsers
```

Use in-memory storage for MVP.

Do not add a database yet.

### Future Scaled Architecture

Only consider this later:

```txt
DM Browser
   |
   v
Go Server A
   |
   v
Redis Pub/Sub ---> Go Server B ---> Player Browser
   |
   v
Postgres
```

Future scaling may use:

- Postgres for persistent room/entity state
- Redis Pub/Sub for cross-instance realtime messages
- Sticky sessions for WebSocket load balancing

Do not implement this in the MVP unless explicitly requested.

---

## Backend vs Frontend Responsibility

### Go Backend Owns

- Rooms
- Room keys
- DM tokens
- Player entities
- Enemy entities
- Health state
- Temp HP
- Statuses
- Current turn
- Permission checks
- Realtime broadcasting
- Validation
- Source of truth

### React Frontend Owns

- Mobile UI
- Forms
- Entity card display
- DM action panels
- Player battle view
- Floating damage/heal visuals
- WebSocket connection handling
- Local optimistic UI only if explicitly requested

Do not put authoritative combat rules in React.

The backend is the source of truth.

---

## Main Domain Concepts

### Room

A room represents one active combat table.

A room should have:

- Room key
- DM token
- Entities
- Connected clients
- Current turn entity ID
- End-turn requests, if needed

Example shape:

```go
type Room struct {
    Key         string
    DMToken     string
    Entities    map[string]*Entity
    CurrentTurn string
}
```

The actual implementation may include a mutex or be protected by the RoomManager.

### Entity

An entity is either a player character or an enemy.

```go
type EntityType string

const (
    EntityPlayer EntityType = "player"
    EntityEnemy  EntityType = "enemy"
)

type Entity struct {
    ID        string
    Name      string
    Type      EntityType
    MaxHealth int
    Health    int
    TempHP    int
    Statuses  []Status
}
```

### Status

A status is a simple visual/combat marker.

```go
type Status struct {
    Name     string
    Duration int
}
```

Examples:

- Poisoned, 3
- Stunned, 1
- Blessed, 10
- Burning, 2

Do not implement DnD rules for statuses in MVP. Just display them.

---

## Frontend Types

Suggested TypeScript types:

```ts
export type EntityType = "player" | "enemy";

export type Status = {
  name: string;
  duration: number;
};

export type Entity = {
  id: string;
  name: string;
  type: EntityType;
  maxHealth: number;
  health: number;
  tempHP: number;
  statuses: Status[];
};

export type RoomState = {
  roomKey: string;
  currentTurn: string;
  entities: Entity[];
};
```

Keep frontend types aligned with backend JSON.

---

## Player Join Rules

Players join by submitting:

- Character Name
- Room Key

The backend validates that the room exists.

The backend creates a player entity using the submitted character name.

Character names are display names inside a room. They do not need to be globally unique.

If a duplicate character name exists inside the same room, append the next available number.

Example:

```txt
joe
joe1
joe2
joe3
```

If existing names are:

```txt
joe
joe1
joe3
```

and another player joins as `joe`, assign:

```txt
joe2
```

Name comparison should be case-insensitive.

For example, these should be considered duplicates:

```txt
Joe
joe
JOE
```

The backend owns this rule. Do not rely on frontend-only duplicate checks.

Suggested helper behavior:

```go
func uniqueCharacterName(room *Room, requestedName string) string
```

Name cleanup rules:

- Trim whitespace.
- Empty name becomes `Player`.
- Limit length, for example 24 characters.
- Keep it simple. Avoid complex username validation for MVP.

---

## DM Permissions

The DM is the only client allowed to:

- Add enemies
- Batch add enemies
- Remove entities
- Apply damage
- Apply healing
- Set current turn
- Set max health
- Set temporary HP
- Add statuses
- Edit statuses, if implemented
- Confirm end-turn requests

Players must not be able to perform DM-only actions.

Use a DM token generated when the room is created.

The room key allows players to join.

The DM token allows DM control.

Example:

```txt
Player:
http://localhost:5173/rooms/ABC123/player

DM:
http://localhost:5173/rooms/ABC123/dm?token=SECRET
```

For MVP this is acceptable. Later, improve token handling.

---

## Player Permissions

Players can:

- Join a room
- View the combat display
- See realtime updates
- Request to end turn only if they are the current turn entity

Players cannot:

- Damage entities
- Heal entities
- Add enemies
- Remove entities
- Set turns
- Edit statuses
- Edit HP
- Control other players

---

## HTTP Routes

Suggested MVP routes on the Go backend:

```txt
GET  /health                   # Health check
POST /rooms                    # Create room
POST /rooms/join               # Join room as player
GET  /ws/rooms/{key}           # WebSocket endpoint
```

Frontend routes can be handled by React later:

```txt
/                         # Landing page
/rooms/:key/dm            # DM view
/rooms/:key/player        # Player view
```

Keep routes simple. Prefer standard library routing if possible.

If using Go 1.22+ ServeMux patterns, route examples can look like:

```go
mux.HandleFunc("GET /health", healthHandler)
mux.HandleFunc("POST /rooms", createRoomHandler)
```

---

## Realtime Design

Use WebSockets for MVP.

Reason:

- DM sends commands to server.
- Players receive updates.
- Players can send end-turn request.
- Two-way communication is useful.

Avoid SSE for MVP because players need to send at least one action: end-turn request.

Recommended dependency:

```txt
github.com/coder/websocket
```

or:

```txt
github.com/gorilla/websocket
```

Prefer minimal dependencies. Use only one WebSocket package.

---

## WebSocket Message Format

Use JSON messages.

Client-to-server command shape:

```json
{
  "type": "damage",
  "entityId": "entity_123",
  "amount": 7
}
```

Server-to-client event shape:

```json
{
  "type": "damage_applied",
  "entityId": "entity_123",
  "amount": 7,
  "health": 5
}
```

Keep message names clear and boring.

---

## Client Commands

DM commands:

```txt
add_enemy
batch_add_enemy
remove_entity
damage
heal
set_current_turn
set_max_health
set_temp_hp
add_status
```

Player commands:

```txt
end_turn_request
```

System/client commands:

```txt
join_socket
ping
```

Only implement what is currently needed.

---

## Server Events

Broadcast events to all clients in a room:

```txt
room_state
entity_added
entity_removed
damage_applied
heal_applied
turn_changed
max_health_changed
temp_hp_changed
status_added
end_turn_requested
error
```

When a client first connects, send a full `room_state`.

For normal updates, send smaller events.

If state gets out of sync, the client should be able to request or receive full `room_state` again.

---

## Combat Actions

### Add Enemy

DM inputs:

- Enemy name
- Max health
- Count, for batch add

If count is 1:

```txt
Goblin
```

If count is more than 1:

```txt
Goblin 1
Goblin 2
Goblin 3
```

Keep batch naming simple.

### Damage

DM selects an entity and enters damage amount.

Backend should:

- Validate DM permission.
- Validate amount > 0.
- Apply temp HP first, if temp HP exists.
- Reduce current health.
- Clamp health at minimum 0.
- Broadcast damage event.

### Heal

DM selects an entity and enters heal amount.

Backend should:

- Validate DM permission.
- Validate amount > 0.
- Increase health.
- Clamp health at max health.
- Broadcast heal event.

### Remove

DM selects an entity and removes it.

If entity is a player, this effectively kicks/removes them from combat UI.

### Set Current Turn

DM selects an entity and marks it as current turn.

Broadcast turn change to everyone.

Player should only see `End Turn` button if their own entity is the current turn.

### Set Max Health

DM selects an entity and enters max health.

Backend should:

- Validate max health > 0.
- Update max health.
- Optionally clamp current health if current health exceeds new max.

### Set Temporary HP

DM selects an entity and enters temp HP.

Backend should:

- Validate temp HP >= 0.
- Update temp HP.

### Add Status

DM selects an entity and enters:

- Status name
- Duration

Backend should:

- Validate status name is not empty.
- Validate duration >= 0.
- Add status to entity.
- Broadcast update.

Do not implement automatic status countdown unless requested.

### End Turn Request

If the current-turn player clicks `End Turn`, frontend sends:

```json
{
  "type": "end_turn_request",
  "entityId": "player_123"
}
```

Backend should:

- Validate requester owns that entity.
- Validate entity is current turn.
- Broadcast notification to DM.
- Not automatically change turn.

DM confirms manually.

---

## Frontend MVP

Use React + Vite + TypeScript + Tailwind CSS.

The first goal is realtime behavior with a clean phone UI, not frontend complexity.

Mobile UI rules:

- Use responsive Tailwind classes.
- Default layout should fit phone screens first.
- Use large buttons for DM actions.
- Use bottom sheets, simple modals, or stacked panels instead of wide desktop panels.
- Avoid hover behavior.
- Avoid tiny icon-only controls unless they also have labels.
- Keep player view mostly read-only and visually clear.
- Keep DM controls fast: select entity, tap action, enter value, submit.

---

## Frontend Pages

### Landing Page

Should allow:

- DM creates room.
- Player enters room key and character name.

### DM View

Should show:

- Room key
- Player group
- Enemy group
- Selected entity details
- Large action buttons

Phone-first DM UI guidance:

- Entity cards should be easy to tap.
- Selected entity controls should appear in a clear panel or bottom area.
- Action buttons should be large enough for thumbs.
- Avoid requiring the DM to scroll too much during combat.
- Prefer simple prompts/modals for values like damage, healing, status, and HP.

DM actions:

- Add enemy
- Batch add enemy
- Set current turn
- Damage
- Heal
- Remove
- Set max health
- Set temp HP
- Add status

### Player View

Should show:

- Player group
- Enemy group
- Current turn highlight
- HP/max HP/temp HP
- Statuses
- Visual damage/heal numbers

Phone-first player UI guidance:

- This view should be mostly visual and low-interaction.
- Players should understand whose turn it is immediately.
- Damage/heal feedback should be visible without needing to inspect logs.
- The End Turn button should be large and obvious only when available.

Player action:

- End Turn button only when this player is current turn.

---

## Visual Layout

The visual layout must be mobile-first.

On phones, use a stacked battle layout:

```txt
┌───────────────────────────────┐
│ Current Turn                  │
├───────────────────────────────┤
│ Enemies                       │
│ [Enemy Card] [Enemy Card]     │
├───────────────────────────────┤
│ Players                       │
│ [Player Card] [Player Card]   │
└───────────────────────────────┘
```

For wider screens, it may adapt to the classic side-by-side layout:

```txt
┌─────────────────────────────────────────────┐
│                 Current Turn                 │
├───────────────────────┬─────────────────────┤
│ Players               │ Enemies             │
│ [Player Card]         │ [Enemy Card]        │
│ [Player Card]         │ [Enemy Card]        │
└───────────────────────┴─────────────────────┘
```

The original product idea is players on the left and enemies on the right. On phone screens, prioritize readability over strict left/right positioning.

Entity cards should show:

- Name
- Type
- HP / Max HP
- Temp HP, if greater than 0
- Statuses
- Current turn highlight
- Recent floating damage/heal text

Damage numbers:

- Red visual popup
- Example: `-7`

Heal numbers:

- Green visual popup
- Example: `+5`

Do not overbuild animations. Simple CSS transitions are enough.

---

## Coding Standards

Use practical, clear Go and TypeScript.

Priorities:

1. Correctness
2. Readability
3. Small functions
4. Simple state management
5. Good error handling
6. Minimal dependencies
7. Mobile-first UI

Avoid:

- Huge files
- Clever abstractions
- Framework-heavy designs
- Premature microservices
- Database before MVP needs it
- Overly generic systems
- Desktop-only layouts
- UI that requires hover to work

### Go Style

Use:

- `context.Context` where request lifecycle matters.
- `http.Server` with timeouts.
- `sync.RWMutex` for in-memory shared state.
- Clear domain errors.
- Small structs.
- Small methods.
- JSON request/response structs.

Example server timeouts:

```go
srv := &http.Server{
    Addr:         addr,
    Handler:      mux,
    ReadTimeout:  5 * time.Second,
    WriteTimeout: 10 * time.Second,
    IdleTimeout:  60 * time.Second,
}
```

### React/TypeScript Style

Use:

- Functional components.
- Typed props.
- Small reusable components.
- Clear event handler names.
- TypeScript types for API payloads.
- CSS via Tailwind utility classes.
- Local component state for UI-only state.
- Backend state from API/WebSocket data.

Avoid:

- Putting backend authority in React.
- Large components with too many responsibilities.
- Untyped `any` payloads unless temporarily unavoidable.
- Inline magic strings scattered everywhere.
- Desktop-first styling.

---

## Error Handling

Return useful HTTP status codes:

```txt
400 Bad Request      # invalid input
401 Unauthorized     # missing/invalid DM token
403 Forbidden        # player tried DM action
404 Not Found        # room or entity not found
409 Conflict         # state conflict if needed
500 Internal Error   # unexpected server issue
```

Do not leak internal error details to clients.

Log server-side details.

Frontend should show short, useful error messages.

---

## Input Validation

Validate:

- Room key length and format
- Character name length
- Entity name length
- Status name length
- Damage amount > 0
- Heal amount > 0
- Max health > 0
- Temp HP >= 0
- Batch count within reasonable limit

Suggested MVP limits:

```txt
character name: 1-24 chars
entity name: 1-32 chars
status name: 1-32 chars
room key: 6-10 chars
damage/heal amount: 1-9999
batch enemy count: 1-20
```

---

## In-Memory Storage Rules

Use a RoomManager.

Suggested responsibilities:

```go
type RoomManager struct {
    mu    sync.RWMutex
    rooms map[string]*Room
}
```

RoomManager should handle:

- Create room
- Get room
- Join player
- Add enemy
- Remove entity
- Apply damage
- Apply healing
- Set current turn
- Set max health
- Set temp HP
- Add status

Do not let handlers directly mutate maps everywhere.

Handlers should call methods on RoomManager.

---

## Realtime Hub Rules

The realtime layer should handle:

- WebSocket connection registration
- Client disconnects
- Broadcasting to all clients in a room
- Sending initial room state
- Reading client commands
- Validating role permissions before applying changes

Suggested types:

```go
type Client struct {
    RoomKey  string
    Role     ClientRole
    EntityID string
    Send     chan []byte
}

type ClientRole string

const (
    RoleDM     ClientRole = "dm"
    RolePlayer ClientRole = "player"
)
```

Do not block the whole room because one client is slow.

Use a buffered send channel for each client.

Disconnect clients that cannot keep up.

---

## Security Hygiene

MVP security rules:

- Generate random room keys.
- Generate random DM tokens.
- Do not trust frontend role claims.
- DM actions require valid DM token.
- Player actions require valid player/entity association.
- Limit WebSocket message size.
- Validate JSON input.
- Avoid panics from malformed input.
- Avoid logging private tokens where possible.

Room keys are for joining.

DM tokens are for controlling.

Keep those separate.

---

## Testing and Verification

### Local Run

Backend:

```bash
make run
```

or:

```bash
make start
make logs
```

Frontend:

```bash
cd client
npm run dev
```

### Health Check

```bash
curl http://localhost:8080/health
```

Expected:

```txt
ok
```

### Go Tests

```bash
go test ./...
```

### Frontend Checks

```bash
cd client
npm run lint
npm run build
```

Only run commands that exist in `client/package.json`.

### Suggested Unit Tests

Test RoomManager logic:

- Create room returns unique key and token.
- Join player adds player entity.
- Duplicate player names become unique.
- Damage reduces temp HP first.
- Damage clamps health at 0.
- Heal clamps health at max health.
- Player cannot perform DM-only action.
- Set current turn updates room state.
- Remove entity removes it from room.

### Suggested Manual Integration Test

1. Start backend.
2. Start frontend.
3. Create room as DM.
4. Open player page in second browser tab.
5. Join as `joe`.
6. Open another player tab.
7. Join as `joe`.
8. Confirm second player appears as `joe1`.
9. DM adds enemy `Goblin`.
10. Confirm all tabs show `Goblin`.
11. DM damages `Goblin`.
12. Confirm red damage popup and HP update.
13. DM sets current turn to `joe`.
14. Confirm only `joe` sees End Turn button.
15. Player clicks End Turn.
16. Confirm DM sees request.
17. DM manually changes turn.

---

## Project Memory File

This project uses a separate `MEMORY.md` file at the repository root.

The purpose of `MEMORY.md` is to keep a short project change log for CLI agents.

Before starting work:

1. Read `GEMINI.md` to understand project rules and architecture.
2. Read `MEMORY.md` to understand recent changes and avoid repeating work.
3. Inspect the current repository files before editing.

After completing each meaningful task:

1. Update `MEMORY.md`.
2. Add a new entry at the top of the Change Log.
3. Summarize the task, files changed, what changed, verification performed, and any follow-ups.
4. Keep the entry short and practical.
5. Do not paste full source files into `MEMORY.md`.
6. Do not include secrets, tokens, API keys, passwords, or private environment values.

If the task is partial or failed, still update `MEMORY.md` and mark the status as `Partial` or `Failed`.

Expected entry format:

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

## Agent Workflow Instructions

When making changes:

1. Inspect the current file tree.
2. Read relevant files before editing.
3. Preserve existing structure unless a change is necessary.
4. Make minimal focused changes.
5. Do not add features outside the requested task.
6. Keep code beginner-readable.
7. Run or provide commands for verification.
8. Explain what changed and why.

When implementing a backend feature, proceed in this order:

1. Define or update types.
2. Add RoomManager method.
3. Add handler or WebSocket command.
4. Add verification steps.
5. Add tests if practical.

When implementing a frontend feature, proceed in this order:

1. Define or update TypeScript types.
2. Add API/socket function if needed.
3. Add or update component.
4. Make it mobile-first with Tailwind.
5. Add loading/error state if needed.
6. Verify in browser.

Do not rewrite the whole app unless requested.

---

## Acceptance Criteria for MVP

The MVP is accepted when:

- DM can create a room.
- Room key is generated.
- DM token is generated.
- Player can join with room key and character name.
- Duplicate player names are automatically made unique.
- Joined players appear in the players group.
- DM can add enemies.
- Enemies appear in the enemies group.
- DM can select entities.
- DM can apply damage.
- DM can apply healing.
- DM can set current turn.
- DM can remove entities.
- DM can set max health.
- DM can set temporary HP.
- DM can add statuses.
- Realtime updates are visible to all connected clients.
- Current-turn player can request end turn.
- DM receives end-turn request.
- Players cannot perform DM-only actions.
- App can be run locally with Makefile/backend commands.
- Frontend runs through Vite.
- Health check works.
- UI works well on phone screen sizes.

---

## Definition of Done

A task is done when:

- Go code compiles.
- TypeScript builds if frontend was changed.
- `go test ./...` passes when backend was changed.
- `npm run build` passes when frontend was changed.
- App runs with `make run` or `make start`.
- Frontend runs with `npm run dev`.
- Health endpoint works.
- Relevant manual flow works in browser.
- UI is usable on phone width.
- No unrelated features were added.
- No runtime files are committed.
- Code is readable and documented where helpful.
- The change matches the requested scope.

---

## Important Project Philosophy

This project should feel like a useful table companion, not a replacement for playing DnD.

The DM remains in control.

The app should make combat more engaging, visual, and clear for players.

Build the core loop first.

Avoid overengineering.
