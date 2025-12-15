# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Multi-Role Agent System

This repository uses Claude Code's native subagent system with four specialized agents:

### Available Agents

| Agent | Purpose | Tools |
|-------|---------|-------|
| `pm-agent` | Requirements, planning, task breakdown | Read, Glob, Grep, Bash, TodoWrite |
| `dev-agent` | Implementation, debugging, code review | Read, Edit, Write, Bash, Grep, Glob, TodoWrite |
| `qa-agent` | Testing, validation, bug reporting | Read, Bash, Grep, Glob, TodoWrite |
| `orchestrator` | Coordinates PM→Dev→QA workflows | Read, Grep, Glob, Bash, TodoWrite, Task |

### Usage Examples

```bash
# Direct agent invocation
> Use pm-agent to break down this feature into tasks
> Have dev-agent implement the login module
> Run qa-agent to test the authentication flow

# Orchestrated workflow
> Use orchestrator to build and test the user registration feature
```

### Workflow Patterns

**Feature Development:**
1. pm-agent → Requirements & task breakdown
2. dev-agent → Implementation
3. qa-agent → Testing & validation

**Bug Fix:**
1. qa-agent → Reproduce & document
2. dev-agent → Fix
3. qa-agent → Verify

### Agent Configs

Located in `.claude/agents/`:
- `pm-agent.md`
- `dev-agent.md`
- `qa-agent.md`
- `orchestrator.md`
