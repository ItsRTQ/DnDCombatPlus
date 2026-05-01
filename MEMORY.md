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
