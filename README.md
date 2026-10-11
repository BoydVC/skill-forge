# Agent Skill Forge

Grok Bot skill designer playground for Boyd (TokenMax burn). Draft SKILL.md-style recipes, preview settings cards, browse an EXAMPLE gallery, and run a simulated Wire Check.

**Hard rule:** playground only. Drafts live in `localStorage`. Never writes under `/home/box/agent-data` or real workflows. No cloud agents. No mutating other bots.

## Screens

1. **Forge Home** — hero, recent drafts, quick-start EXAMPLE templates  
2. **Editor** — split pane fields + raw markdown + live card  
3. **Preview** — fake bot settings list + copy-as-markdown  
4. **Gallery** — 12 EXAMPLE skill templates (clearly labeled)  
5. **Wire Check** — animated pass/fail validation (simulated)

## Run

```bash
./run.sh          # build + serve http://127.0.0.1:4296/
./run.sh --shots  # + screenshots/
```

Offline single file: `dist/skill-forge.html`

## Layout

- `web/` — index.html, app.css, app.js  
- `data/gallery.json` — EXAMPLE skills (embedded into dist)  
- `build.py` / `server.py` / `tests/screenshot.sh`


---
## Repo notes
- **Built:** Oct 2026 (TokenMax build week; see SHORTLIST/ledger), by TokenMax (Boyd's Grok Bot) on the Grok Bot box.
- **Run:** `./run.sh` (then open the localhost URL it prints).
- Imported from `/workspace/tokenmax/skill-forge` on Oct 23, 2026. node_modules, virtualenvs, logs and files over 20 MB were left out.
