---
name: doctor
description: Diagnose and fix oh-my-qwencode installation issues
---

# Doctor Skill

Note: All `~/.qwen/...` paths in this guide respect `QWEN_HOME` when that environment variable is set.

## Task: Run Installation Diagnostics

You are the OMQ Doctor - diagnose and fix installation issues.

### Step 1: Check Plugin Version

```bash
# Get installed version
INSTALLED=$(ls ~/.qwen/plugins/cache/omc/oh-my-qwencode/ 2>/dev/null | sort -V | tail -1)
echo "Installed: $INSTALLED"

# Get latest from npm
LATEST=$(npm view oh-my-qwencode version 2>/dev/null)
echo "Latest: $LATEST"
```

**Diagnosis**:
- If no version installed: CRITICAL - plugin not installed
- If INSTALLED != LATEST: WARN - outdated plugin
- If multiple versions exist: WARN - stale cache

### Step 2: Check Hook Configuration (config.toml + legacy settings.json)

Check `~/.qwen/config.toml` first (current Qwen Code config), then check legacy `~/.qwen/settings.json` only if it exists.

Look for hook entries pointing to removed scripts like:
- `bash $HOME/.qwen/hooks/keyword-detector.sh`
- `bash $HOME/.qwen/hooks/persistent-mode.sh`
- `bash $HOME/.qwen/hooks/session-start.sh`

**Diagnosis**:
- If found: CRITICAL - legacy hooks causing duplicates

### Step 3: Check for Legacy Bash Hook Scripts

```bash
ls -la ~/.qwen/hooks/*.sh 2>/dev/null
```

**Diagnosis**:
- If `keyword-detector.sh`, `persistent-mode.sh`, `session-start.sh`, or `stop-continuation.sh` exist: WARN - legacy scripts (can cause confusion)

### Step 4: Check AGENTS.md

```bash
# Check if AGENTS.md exists
ls -la ~/.qwen/AGENTS.md 2>/dev/null

# Check for OMQ marker
grep -q "oh-my-qwencode Multi-Agent System" ~/.qwen/AGENTS.md 2>/dev/null && echo "Has OMQ config" || echo "Missing OMQ config"
```

**Diagnosis**:
- If missing: CRITICAL - AGENTS.md not configured
- If missing OMQ marker: WARN - outdated AGENTS.md

### Step 5: Check for Stale Plugin Cache

```bash
# Count versions in cache
ls ~/.qwen/plugins/cache/omc/oh-my-qwencode/ 2>/dev/null | wc -l
```

**Diagnosis**:
- If > 1 version: WARN - multiple cached versions (cleanup recommended)

### Step 6: Check for Legacy Curl-Installed Content

Check for legacy agents, commands, and historical legacy skill roots from older installs/migrations:

```bash
# Check for legacy agents directory
ls -la ~/.qwen/agents/ 2>/dev/null

# Check for legacy commands directory
ls -la ~/.qwen/commands/ 2>/dev/null

# Check canonical current skills directory
ls -la ${QWEN_HOME:-~/.qwen}/skills/ 2>/dev/null

# Check historical legacy skill directory
ls -la ~/.agents/skills/ 2>/dev/null
```

**Diagnosis**:
- If `~/.qwen/agents/` exists with oh-my-qwencode-related files: WARN - legacy agents (now provided by plugin)
- If `~/.qwen/commands/` exists with oh-my-qwencode-related files: WARN - legacy commands (now provided by plugin)
- If `${QWEN_HOME:-~/.qwen}/skills/` exists with OMQ skills: OK - canonical current user skill root
- If `~/.agents/skills/` exists: WARN - historical legacy skill root that can overlap with `${QWEN_HOME:-~/.qwen}/skills/` and cause duplicate Enable/Disable Skills entries

Look for files like:
- `architect.md`, `researcher.md`, `explore.md`, `executor.md`, etc. in agents/
- `ultrawork.md`, `deepsearch.md`, etc. in commands/
- Any oh-my-qwencode-related `.md` files in skills/

---

## Report Format

After running all checks, output a report:

```
## OMQ Doctor Report

### Summary
[HEALTHY / ISSUES FOUND]

### Checks

| Check | Status | Details |
|-------|--------|---------|
| Plugin Version | OK/WARN/CRITICAL | ... |
| Hook Config (config.toml / legacy settings.json) | OK/CRITICAL | ... |
| Legacy Scripts (~/.qwen/hooks/) | OK/WARN | ... |
| AGENTS.md | OK/WARN/CRITICAL | ... |
| Plugin Cache | OK/WARN | ... |
| Legacy Agents (~/.qwen/agents/) | OK/WARN | ... |
| Legacy Commands (~/.qwen/commands/) | OK/WARN | ... |
| Skills (${QWEN_HOME:-~/.qwen}/skills) | OK/WARN | ... |
| Legacy Skill Root (~/.agents/skills) | OK/WARN | ... |

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommended Fixes
[List fixes based on issues]
```

---

## Auto-Fix (if user confirms)

If issues found, ask user: "Would you like me to fix these issues automatically?"

If yes, apply fixes:

### Fix: Legacy Hooks in legacy settings.json
If `~/.qwen/settings.json` exists, remove the legacy `"hooks"` section (keep other settings intact).

### Fix: Legacy Bash Scripts
```bash
rm -f ~/.qwen/hooks/keyword-detector.sh
rm -f ~/.qwen/hooks/persistent-mode.sh
rm -f ~/.qwen/hooks/session-start.sh
rm -f ~/.qwen/hooks/stop-continuation.sh
```

### Fix: Outdated Plugin
```bash
rm -rf ~/.qwen/plugins/cache/omc/oh-my-qwencode
echo "Plugin cache cleared. Restart Qwen Code to fetch latest version."
```

### Fix: Stale Cache (multiple versions)
```bash
# Keep only latest version
cd ~/.qwen/plugins/cache/omc/oh-my-qwencode/
ls | sort -V | head -n -1 | xargs rm -rf
```

### Fix: Missing/Outdated AGENTS.md
Fetch latest from GitHub and write to `~/.qwen/AGENTS.md`:
```
WebFetch(url: "https://raw.githubusercontent.com/chrisxue90/oh-my-qwencode/main/docs/AGENTS.md", prompt: "Return the complete raw markdown content exactly as-is")
```

### Fix: Legacy Curl-Installed Content

Remove legacy agents/commands plus the historical `~/.agents/skills` tree if it overlaps with the canonical `${QWEN_HOME:-~/.qwen}/skills` install:

```bash
# Backup first (optional - ask user)
# mv ~/.qwen/agents ~/.qwen/agents.bak
# mv ~/.qwen/commands ~/.qwen/commands.bak
# mv ~/.agents/skills ~/.agents/skills.bak

# Or remove directly
rm -rf ~/.qwen/agents
rm -rf ~/.qwen/commands
rm -rf ~/.agents/skills
```

**Note**: Only remove if these contain oh-my-qwencode-related files. If user has custom agents/commands/skills, warn them and ask before removing.

---

## Post-Fix

After applying fixes, inform user:
> Fixes applied. **Restart Qwen Code** for changes to take effect.
