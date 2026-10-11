/* Agent Skill Forge — playground only. localStorage drafts; never touches agent-data. */
(function () {
  "use strict";

  const STORAGE_KEY = "skill-forge.drafts.v1";
  const LAST_KEY = "skill-forge.last.v1";
  const LAST_WIRE = "skill-forge.lastWire.v1";

  const FALLBACK_GALLERY = [
    {
      id: "morning-digest",
      name: "Morning Digest",
      emoji: "☀️",
      tag: "ops",
      description:
        "Compile overnight Slack heat, calendar blockers, and finance surprises into a 6-bullet morning brief for Boyd before 8 AM ET.",
      steps: [
        "Scan Slack channels for unread heat since 8 PM ET prior day; rank by urgency.",
        "Pull today's Outlook/calendar events; flag conflicts and travel buffers.",
        "Check Finance for surprise charges over $250 or unusual merchants.",
        "Summarize kids sports/school coverage gaps for the day.",
        "Draft a 6-bullet digest; escalate only decisions and people waiting.",
        "Store draft locally; do not auto-send unless Boyd approved the channel.",
      ],
    },
    {
      id: "sports-desk",
      name: "Sports Desk Check",
      emoji: "🏟️",
      tag: "sports",
      description:
        "Quick sports desk for Ravens, Orioles, Chelsea, Terps, plus Vic/Char team logistics for the next 72 hours.",
      steps: [
        "Fetch latest scores/news for Ravens, Orioles, Chelsea FC, Terps basketball.",
        "List Vic API baseball / Green Hornets and Char Aspire practices & games in next 72h.",
        "Note carpool rules: Vic drop API/Hornets daily; Boyds pick up; Char Aspire Tue/Thu.",
        "Flag weather or field-status risks if available from public sources.",
        "Produce a one-screen desk card Boyd can skim between meetings.",
      ],
    },
    {
      id: "fleet-health",
      name: "Fleet Health",
      emoji: "🩺",
      tag: "agents",
      description:
        "Read-only health sweep of Boyd's Grok Bot fleet: routines, stuck jobs, and usage pacing vs TokenMax target.",
      steps: [
        "List registered bots and last-run timestamps from local metadata only.",
        "Flag routines overdue or failed in the last 24h.",
        "Compare Grok Bot weekly usage vs straight-line target to reset.",
        "Suggest burn candidates from SHORTLIST.md without launching agents.",
        "Report pass/warn/fail strip; never mutate workflows or other bots.",
      ],
    },
    {
      id: "bookmark-radar",
      name: "Bookmark Radar",
      emoji: "📡",
      tag: "agents",
      description:
        "Cluster recent X bookmarks from @xristafer into themes — personal AI-agent systems first — and surface 3 build ideas.",
      steps: [
        "Pull recent bookmarks (read-only) and group by theme.",
        "Weight personal AI-agent / tooling clusters highest.",
        "Cross-check against TokenMax SHORTLIST to avoid dupes.",
        "Propose 3 concrete offline HTML or agent-skill ideas.",
        "Save a radar card to localStorage for the forge gallery.",
      ],
    },
    {
      id: "token-burn-watch",
      name: "Token Burn Watch",
      emoji: "🔥",
      tag: "ops",
      description:
        "Keep Grok Bot weekly pool on pace (95% by reset ~7:42 PM ET Thursdays). Trigger daily-usage-check burns when behind.",
      steps: [
        "Reload Cursor dashboard; read Grok Bot weekly %, Cursor Models %, reset time.",
        "Compute straight-line target from week start to reset.",
        "If behind by >5 pts, pick 4 SHORTLIST builds and queue burn notes.",
        "Never burn Cursor Models pool before Oct 20 unless Boyd says so.",
        "Post status only when thursday-reset-safety-net or user-approved send.",
      ],
    },
    {
      id: "calendar-sweep",
      name: "Calendar Sweep",
      emoji: "📅",
      tag: "ops",
      description:
        "Sweep Boyd's Outlook week for NCBA, sports, school, and work AI-ops blocks; propose free slots for deep work.",
      steps: [
        "List next 7 days of calendar events (Outlook web if connector pending).",
        "Tag NCBA conference, kids sports, school, KPD meetings.",
        "Find 2+ hour free blocks suitable for agent builds or deep work.",
        "Loop Miranda only on school/money/calendar conflicts.",
        "Output a week strip Boyd can screenshot.",
      ],
    },
    {
      id: "slack-heat",
      name: "Slack Heat Map",
      emoji: "💬",
      tag: "work",
      description:
        "Map kpdlawgroup Slack heat for firm AI/ops priority when things are on fire — Lucas, Stefan/Nate, Kent, Ruck, Shawn.",
      steps: [
        "Search recent public+private mentions involving AI/ops projects.",
        "Rank threads by recency and unanswered @cboyd.",
        "Group by counterpart: Lucas, Stefan/Nate, Kent, Ruck, Shawn, Tony, Amanda, Steve.",
        "Escalate only decisions and people waiting; lunchtime interrupts OK.",
        "Draft triage list; do not reply unless Boyd asked.",
      ],
    },
    {
      id: "kids-coverage",
      name: "Kids Coverage Board",
      emoji: "👨‍👧‍👦",
      tag: "family",
      description:
        "Board for Char/Vic coverage — always ask Boyd/Miranda before assuming Chris/Beth, Melody, or team-parent coverage.",
      steps: [
        "List practices/games for Char Aspire and Vic API/Hornets this week.",
        "Apply standing rules: Vic drop daily by Vic's carpool; Boyds pick up; Char Aspire Tue carpool / Thu Boyds to St Mary's.",
        "Never auto-assign Chris/Beth/Melody/team parents — ask first.",
        "Homework before sports; note who is coaching.",
        "Produce a coverage board draft for Miranda + Boyd review.",
      ],
    },
    {
      id: "ravens-gameday",
      name: "Ravens Gameday Prep",
      emoji: "💜",
      tag: "sports",
      description:
        "Pre-game card: opponent, kickoff ET, broadcast, injury notes, and a 5-play fantasy/watchlist cheat sheet.",
      steps: [
        "Confirm next Ravens kickoff time in ET and TV/stream.",
        "Summarize opponent form and key matchups in 4 bullets.",
        "Note injury/inactives from public sources.",
        "Build a 5-item watchlist (players/moments).",
        "Save card for Fridge Board / family TV night.",
      ],
    },
    {
      id: "orioles-hot-stove",
      name: "Orioles Hot Stove Brief",
      emoji: "🧡",
      tag: "sports",
      description:
        "Offseason / Hot Stove brief for the Orioles — roster moves, prospect buzz, and schedule milestones.",
      steps: [
        "Scan recent Orioles roster and Hot Stove headlines.",
        "Highlight prospects and arbitration/free-agent notes.",
        "List next meaningful calendar milestones (ST, Opening Day).",
        "Keep tone fan-first, rumor-skeptical.",
        "One-page brief suitable for Camden Nights companion.",
      ],
    },
    {
      id: "ncba-pack",
      name: "NCBA Conference Pack",
      emoji: "🧳",
      tag: "work",
      description:
        "Travel/session pack for NCBA Oct 2026 — sessions Boyd chose, Shawn & Michael Lagana overlap, logistics checklist.",
      steps: [
        "Load Boyd's chosen sessions (1, 2, 7, 8) and calendar blocks.",
        "Note colleagues also attending: Shawn, Michael Lagana.",
        "Checklist: travel, badge, hotel, laptop/chargers, AI demo notes.",
        "Prep 3 talking points on KPD AI/ops autonomy work.",
        "Do not invent session times — pull from calendar/Outlook.",
      ],
    },
    {
      id: "wire-check-lite",
      name: "Skill Wire Check Lite",
      emoji: "✅",
      tag: "agents",
      description:
        "Validate a drafted SKILL.md: frontmatter, description length, step count, and playground-safe boundaries (no real FS writes).",
      steps: [
        "Parse draft for name, description, and ordered steps.",
        "Fail if description < 40 or > 400 chars; warn if steps < 3 or > 12.",
        "Flag verbs that imply mutating other bots or workflows.",
        "Confirm playground-only: localStorage allowed, agent-data paths forbidden.",
        "Emit pass/fail checklist with animated strip for the Forge UI.",
      ],
    },
  ];

  const DANGEROUS_PATTERNS = [
    /agent-data\/workflows/i,
    /\/home\/box\/agent-data/i,
    /\bmutate\b.*\bbots?\b/i,
    /\bdelete\b.*\bworkflow/i,
    /\blaunch\b.*\bcloud\s*agent/i,
    /\boverwrite\b.*\bskill/i,
  ];

  /** @type {Array<any>} */
  let gallery = Array.isArray(window.__GALLERY__) && window.__GALLERY__.length
    ? window.__GALLERY__
    : FALLBACK_GALLERY;

  /** @type {{id:string,name:string,emoji:string,tag:string,description:string,steps:string[],updated:number,example?:boolean}} */
  let current = blankSkill();
  let syncLock = false;
  let toastTimer = null;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function blankSkill() {
    return {
      id: "draft-" + Date.now().toString(36),
      name: "",
      emoji: "⚙️",
      tag: "custom",
      description: "",
      steps: ["", "", ""],
      updated: Date.now(),
      example: false,
    };
  }

  function uid() {
    return "draft-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function loadDrafts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveDrafts(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 40)));
  }

  function persistLast() {
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify(current));
    } catch (_) {}
  }

  function restoreLast() {
    try {
      const raw = localStorage.getItem(LAST_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slugify(name) {
    return String(name || "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "untitled";
  }

  function toMarkdown(skill) {
    const steps = (skill.steps || []).filter((s) => String(s).trim());
    const lines = [
      "---",
      "name: " + (skill.name || "Untitled Skill"),
      "description: >-",
      "  " + (skill.description || "").replace(/\n/g, " ").trim(),
      "emoji: " + (skill.emoji || "⚙️"),
      "tag: " + (skill.tag || "custom"),
      "---",
      "",
      "# " + (skill.name || "Untitled Skill"),
      "",
      skill.description || "_No description yet._",
      "",
      "## Steps",
      "",
    ];
    if (!steps.length) {
      lines.push("1. _Add steps in the editor_");
    } else {
      steps.forEach((s, i) => lines.push(i + 1 + ". " + s.trim()));
    }
    lines.push("", "## Notes", "", "- Playground draft from Agent Skill Forge", "- Do not deploy to real agent-data/workflows from this UI");
    return lines.join("\n");
  }

  function parseMarkdown(md) {
    const text = String(md || "");
    const skill = blankSkill();
    skill.id = current.id || uid();
    const fm = text.match(/^---\s*\n([\s\S]*?)\n---\s*/);
    let body = text;
    if (fm) {
      body = text.slice(fm[0].length);
      const block = fm[1];
      const nameM = block.match(/^name:\s*(.+)$/m);
      const emojiM = block.match(/^emoji:\s*(.+)$/m);
      const tagM = block.match(/^tag:\s*(.+)$/m);
      const descM = block.match(/^description:\s*>-?\s*\n((?:[ \t]+.+\n?)+)|^description:\s*(.+)$/m);
      if (nameM) skill.name = nameM[1].trim();
      if (emojiM) skill.emoji = emojiM[1].trim();
      if (tagM) skill.tag = tagM[1].trim();
      if (descM) {
        skill.description = (descM[1] || descM[2] || "")
          .split("\n")
          .map((l) => l.replace(/^[ \t]+/, ""))
          .join(" ")
          .trim();
      }
    }
    const h1 = body.match(/^#\s+(.+)$/m);
    if (h1 && !skill.name) skill.name = h1[1].trim();
    if (!skill.description) {
      const para = body.replace(/^#.*$/m, "").match(/\n\n([^#\n][\s\S]*?)(?:\n\n|$)/);
      if (para) skill.description = para[1].replace(/\n/g, " ").trim();
    }
    const steps = [];
    const stepRe = /^\s*\d+\.\s+(.+)$/gm;
    let m;
    while ((m = stepRe.exec(body))) steps.push(m[1].trim());
    skill.steps = steps.length ? steps : ["", "", ""];
    skill.updated = Date.now();
    return skill;
  }

  function showToast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 2200);
  }

  function setView(name) {
    $$(".tab").forEach((t) => {
      const on = t.dataset.view === name;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$(".view").forEach((v) => {
      const on = v.id === "view-" + name;
      v.hidden = !on;
      v.classList.toggle("active", on);
    });
    try {
      history.replaceState(null, "", "#" + name);
    } catch (_) {}
    if (name === "preview") renderPreview();
    if (name === "wire") renderWireSubject();
    if (name === "gallery") renderGallery();
    if (name === "home") renderHome();
    if (name === "editor") syncFieldsFromCurrent();
  }

  function renderSkillCard(skill, opts) {
    opts = opts || {};
    const steps = (skill.steps || []).filter((s) => String(s).trim()).slice(0, opts.maxSteps || 6);
    const more = (skill.steps || []).filter((s) => String(s).trim()).length - steps.length;
    const exampleBadge = opts.example || skill.example
      ? '<span class="badge-ex">EXAMPLE</span>'
      : '<span>local draft</span>';
    return (
      '<div class="card-top">' +
      '<div class="card-emoji">' +
      escapeHtml(skill.emoji || "⚙️") +
      "</div>" +
      "<div><h4>" +
      escapeHtml(skill.name || "Untitled Skill") +
      '</h4><span class="card-tag">' +
      escapeHtml(skill.tag || "custom") +
      "</span></div></div>" +
      '<p class="card-desc">' +
      escapeHtml(skill.description || "Add a description…") +
      "</p>" +
      (steps.length
        ? '<ol class="card-steps">' +
          steps.map((s) => "<li>" + escapeHtml(s) + "</li>").join("") +
          (more > 0 ? "<li>… +" + more + " more</li>" : "") +
          "</ol>"
        : '<p class="card-desc">No steps yet.</p>') +
      '<div class="card-foot">' +
      exampleBadge +
      "<span>" +
      (skill.steps || []).filter((s) => String(s).trim()).length +
      " steps</span></div>"
    );
  }

  function syncFieldsFromCurrent() {
    syncLock = true;
    $("#fieldName").value = current.name || "";
    $("#fieldEmoji").value = current.emoji || "⚙️";
    $("#fieldTag").value = current.tag || "custom";
    $("#fieldDesc").value = current.description || "";
    renderStepInputs();
    $("#rawMd").value = toMarkdown(current);
    updateLivePreview();
    syncLock = false;
  }

  function readFieldsIntoCurrent() {
    current.name = $("#fieldName").value.trim();
    current.emoji = $("#fieldEmoji").value.trim() || "⚙️";
    current.tag = $("#fieldTag").value;
    current.description = $("#fieldDesc").value.trim();
    current.steps = $$("#stepList textarea").map((t) => t.value);
    current.updated = Date.now();
  }

  function renderStepInputs() {
    const list = $("#stepList");
    const steps = current.steps && current.steps.length ? current.steps : ["", "", ""];
    current.steps = steps;
    list.innerHTML = steps
      .map(
        (s, i) =>
          '<li class="step-row" data-i="' +
          i +
          '">' +
          '<div class="num">' +
          (i + 1) +
          "</div>" +
          '<textarea rows="2" placeholder="Step ' +
          (i + 1) +
          '…">' +
          escapeHtml(s) +
          "</textarea>" +
          '<div class="step-actions">' +
          '<button type="button" class="icon-btn" data-act="up" title="Move up">↑</button>' +
          '<button type="button" class="icon-btn" data-act="down" title="Move down">↓</button>' +
          '<button type="button" class="icon-btn danger" data-act="del" title="Remove">×</button>' +
          "</div></li>"
      )
      .join("");
  }

  function updateLivePreview() {
    const card = $("#liveCard");
    if (card) card.innerHTML = renderSkillCard(current, { maxSteps: 5 });
    const md = $("#mdPreview");
    if (md) md.textContent = toMarkdown(current);
    const n = toMarkdown(current).length;
    const sc = $("#statChars");
    if (sc) sc.textContent = String(n);
    persistLast();
  }

  function onFieldsChange() {
    if (syncLock) return;
    readFieldsIntoCurrent();
    syncLock = true;
    $("#rawMd").value = toMarkdown(current);
    syncLock = false;
    updateLivePreview();
  }

  function onRawChange() {
    if (syncLock) return;
    const parsed = parseMarkdown($("#rawMd").value);
    current = Object.assign(current, parsed, { id: current.id, example: false });
    syncLock = true;
    $("#fieldName").value = current.name;
    $("#fieldEmoji").value = current.emoji;
    $("#fieldTag").value = ["ops", "agents", "sports", "work", "family", "custom"].includes(current.tag)
      ? current.tag
      : "custom";
    $("#fieldDesc").value = current.description;
    renderStepInputs();
    syncLock = false;
    updateLivePreview();
  }

  function saveCurrentDraft() {
    readFieldsIntoCurrent();
    if (!current.name.trim()) {
      showToast("Give the skill a name before saving");
      return;
    }
    const list = loadDrafts();
    const idx = list.findIndex((d) => d.id === current.id);
    const copy = Object.assign({}, current, { example: false, updated: Date.now() });
    if (idx >= 0) list[idx] = copy;
    else list.unshift(copy);
    list.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    saveDrafts(list);
    updateDraftPills();
    showToast("Draft saved to localStorage");
    renderHome();
  }

  function loadSkill(skill, asExample) {
    current = {
      id: asExample ? uid() : skill.id || uid(),
      name: skill.name || "",
      emoji: skill.emoji || "⚙️",
      tag: skill.tag || "custom",
      description: skill.description || "",
      steps: (skill.steps || []).slice(),
      updated: Date.now(),
      example: !!asExample,
    };
    if (!current.steps.length) current.steps = ["", "", ""];
    syncFieldsFromCurrent();
    updateDraftPills();
  }

  function updateDraftPills() {
    const n = loadDrafts().length;
    const pill = $("#draftCountPill");
    if (pill) pill.textContent = n + " draft" + (n === 1 ? "" : "s");
    const sd = $("#statDrafts");
    if (sd) sd.textContent = String(n);
    const sg = $("#statGallery");
    if (sg) sg.textContent = String(gallery.length);
    try {
      const w = JSON.parse(localStorage.getItem(LAST_WIRE) || "null");
      const sp = $("#statPass");
      if (sp && w) sp.textContent = w.ok ? "PASS" : "FAIL";
    } catch (_) {}
  }

  function renderHome() {
    const qt = $("#quickTemplates");
    if (qt) {
      qt.innerHTML = gallery
        .slice(0, 6)
        .map(
          (g) =>
            '<button type="button" class="tpl-chip" data-gid="' +
            escapeHtml(g.id) +
            '"><span>' +
            escapeHtml(g.emoji) +
            "</span><span>" +
            escapeHtml(g.name) +
            '</span><span class="ex">EXAMPLE</span></button>'
        )
        .join("");
    }
    const rd = $("#recentDrafts");
    if (rd) {
      const drafts = loadDrafts();
      if (!drafts.length) {
        rd.innerHTML =
          '<div class="empty-drafts">No drafts yet. Open the editor or load an EXAMPLE from the gallery.</div>';
      } else {
        rd.innerHTML = drafts
          .slice(0, 8)
          .map((d) => {
            const when = d.updated ? new Date(d.updated).toLocaleString() : "";
            return (
              '<div class="draft-item" data-did="' +
              escapeHtml(d.id) +
              '"><div class="em">' +
              escapeHtml(d.emoji || "⚙️") +
              '</div><div class="meta"><strong>' +
              escapeHtml(d.name || "Untitled") +
              "</strong><span>" +
              escapeHtml(when) +
              ' · ' +
              escapeHtml(d.tag || "custom") +
              '</span></div><button type="button" class="del" data-del="' +
              escapeHtml(d.id) +
              '" title="Delete draft">×</button></div>'
            );
          })
          .join("");
      }
    }
    const hero = $("#heroPreviewCard");
    if (hero) {
      const sample = current.name ? current : gallery[0];
      hero.innerHTML = '<div class="skill-card">' + renderSkillCard(sample, { example: !current.name, maxSteps: 3 }) + "</div>";
    }
    updateDraftPills();
    const sc = $("#statChars");
    if (sc) sc.textContent = String(toMarkdown(current).length);
  }

  function renderGallery() {
    const q = ($("#galleryFilter").value || "").toLowerCase().trim();
    const tag = $("#galleryTag").value;
    const grid = $("#galleryGrid");
    const items = gallery.filter((g) => {
      if (tag && g.tag !== tag) return false;
      if (!q) return true;
      const blob = (g.name + " " + g.description + " " + g.tag + " " + (g.steps || []).join(" ")).toLowerCase();
      return blob.includes(q);
    });
    grid.innerHTML = items
      .map(
        (g) =>
          '<button type="button" class="gallery-card" data-gid="' +
          escapeHtml(g.id) +
          '"><div class="gc-top"><div class="gc-emoji">' +
          escapeHtml(g.emoji) +
          "</div><div><h4>" +
          escapeHtml(g.name) +
          '</h4><span class="card-tag">' +
          escapeHtml(g.tag) +
          '</span></div></div><p>' +
          escapeHtml(g.description) +
          '</p><div class="gc-foot"><span class="badge-ex">EXAMPLE</span><span>' +
          (g.steps || []).length +
          " steps · Load →</span></div></button>"
      )
      .join("");
    if (!items.length) {
      grid.innerHTML = '<div class="empty-drafts">No EXAMPLES match that filter.</div>';
    }
  }

  function renderPreview() {
    readFieldsIntoCurrent();
    $("#settingsCard").innerHTML = renderSkillCard(current, { maxSteps: 8, example: current.example });
    $("#exportPre").textContent = toMarkdown(current);
  }

  function renderWireSubject() {
    readFieldsIntoCurrent();
    const el = $("#wireSubject");
    el.innerHTML =
      "<h3 style=\"margin:0 0 10px;font-size:0.95rem\">Subject draft</h3>" +
      '<div class="skill-card">' +
      renderSkillCard(current, { maxSteps: 4, example: current.example }) +
      "</div>" +
      '<p class="muted sm" style="margin-top:12px">Wire Check is simulated. It never writes outside localStorage and never touches real skills.</p>';
  }

  function runWireCheck() {
    readFieldsIntoCurrent();
    const checks = [];
    const name = (current.name || "").trim();
    const desc = (current.description || "").trim();
    const steps = (current.steps || []).map((s) => String(s).trim()).filter(Boolean);
    const md = toMarkdown(current);

    checks.push({
      id: "frontmatter",
      title: "Frontmatter present",
      detail: "YAML-style --- block with name + description",
      status: /^---[\s\S]*?---/.test(md) && /name:/.test(md) && /description:/.test(md) ? "pass" : "fail",
    });
    checks.push({
      id: "name",
      title: "Name length",
      detail: name ? name.length + " chars (need 3–80)" : "missing",
      status: name.length >= 3 && name.length <= 80 ? "pass" : "fail",
    });
    checks.push({
      id: "desc-len",
      title: "Description length",
      detail: desc.length + " chars (ideal 40–400)",
      status: desc.length >= 40 && desc.length <= 400 ? "pass" : desc.length === 0 ? "fail" : "warn",
    });
    checks.push({
      id: "steps",
      title: "Steps count",
      detail: steps.length + " steps (ideal 3–12)",
      status: steps.length >= 3 && steps.length <= 12 ? "pass" : steps.length === 0 ? "fail" : "warn",
    });
    checks.push({
      id: "emoji",
      title: "Emoji set",
      detail: current.emoji ? "using " + current.emoji : "default gear",
      status: current.emoji && current.emoji !== "⚙️" ? "pass" : "warn",
    });
    checks.push({
      id: "tag",
      title: "Tag taxonomy",
      detail: "tag = " + (current.tag || "—"),
      status: ["ops", "agents", "sports", "work", "family", "custom"].includes(current.tag) ? "pass" : "warn",
    });

    const blob = md + "\n" + steps.join("\n");
    const hit = DANGEROUS_PATTERNS.find((re) => re.test(blob));
    checks.push({
      id: "safe",
      title: "Playground boundaries",
      detail: hit
        ? "Flagged pattern: " + hit.toString()
        : "No agent-data/workflows or mutate-bot verbs detected",
      status: hit ? "fail" : "pass",
    });
    checks.push({
      id: "storage",
      title: "Storage target",
      detail: "Drafts → localStorage only (skill-forge.drafts.v1)",
      status: "pass",
    });
    checks.push({
      id: "slug",
      title: "Slug stable",
      detail: "slug = " + slugify(name || "untitled"),
      status: name ? "pass" : "warn",
    });

    const list = $("#wireList");
    list.innerHTML = checks
      .map(
        (c) =>
          '<li class="wire-item" data-id="' +
          c.id +
          '"><div class="wire-icon">·</div><div><div class="wi-title">' +
          escapeHtml(c.title) +
          '</div><div class="wi-detail">' +
          escapeHtml(c.detail) +
          '</div></div><div class="wi-status">…</div></li>'
      )
      .join("");

    let pass = 0;
    let fail = 0;
    let warn = 0;
    checks.forEach((c, i) => {
      setTimeout(() => {
        const row = list.children[i];
        if (!row) return;
        row.classList.add("run", c.status);
        const icon = row.querySelector(".wire-icon");
        const st = row.querySelector(".wi-status");
        if (c.status === "pass") {
          icon.textContent = "✓";
          st.textContent = "PASS";
          st.style.color = "var(--green)";
          pass++;
        } else if (c.status === "fail") {
          icon.textContent = "✕";
          st.textContent = "FAIL";
          st.style.color = "var(--red)";
          fail++;
        } else {
          icon.textContent = "!";
          st.textContent = "WARN";
          st.style.color = "var(--amber)";
          warn++;
        }
        const done = i === checks.length - 1;
        if (done) {
          const score = Math.round((pass / checks.length) * 100);
          const ring = $("#scoreRing");
          ring.style.setProperty("--p", score + "%");
          $("#scorePct").textContent = score + "%";
          const ok = fail === 0;
          $("#scoreLabel").textContent = ok ? (warn ? "Pass with warnings" : "All clear") : "Needs work";
          $("#scoreDetail").textContent = pass + " pass · " + warn + " warn · " + fail + " fail";
          try {
            localStorage.setItem(LAST_WIRE, JSON.stringify({ ok, score, pass, warn, fail, at: Date.now() }));
          } catch (_) {}
          const sp = $("#statPass");
          if (sp) sp.textContent = ok ? "PASS" : "FAIL";
        }
      }, 180 + i * 220);
    });
  }

  function openExampleModal() {
    const body = $("#modalBody");
    body.innerHTML = gallery
      .map(
        (g) =>
          '<button type="button" class="modal-item" data-gid="' +
          escapeHtml(g.id) +
          '"><span style="font-size:1.3rem">' +
          escapeHtml(g.emoji) +
          "</span><span><strong>" +
          escapeHtml(g.name) +
          '</strong><br><span class="muted sm">' +
          escapeHtml(g.tag) +
          " · EXAMPLE</span></span></button>"
      )
      .join("");
    $("#exampleModal").hidden = false;
    $("#backdrop").hidden = false;
  }

  function closeModal() {
    $("#exampleModal").hidden = true;
    $("#backdrop").hidden = true;
  }

  function exportAll() {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: "agent-skill-forge",
      drafts: loadDrafts(),
      current: current,
      note: "Playground export only — not a real skill install.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "skill-forge-drafts.json";
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Exported drafts JSON");
  }

  function bind() {
    $$(".tab").forEach((t) =>
      t.addEventListener("click", () => setView(t.dataset.view))
    );

    document.body.addEventListener("click", (e) => {
      const goto = e.target.closest("[data-goto]");
      if (goto) {
        const v = goto.dataset.goto;
        if (goto.dataset.action === "blank") {
          current = blankSkill();
          syncFieldsFromCurrent();
        }
        setView(v);
        return;
      }
      const tpl = e.target.closest(".tpl-chip[data-gid], .gallery-card[data-gid], .modal-item[data-gid]");
      if (tpl) {
        const g = gallery.find((x) => x.id === tpl.dataset.gid);
        if (g) {
          loadSkill(g, true);
          closeModal();
          setView("editor");
          showToast("Loaded EXAMPLE · " + g.name);
        }
        return;
      }
      const draft = e.target.closest(".draft-item[data-did]");
      if (draft && !e.target.closest("[data-del]")) {
        const d = loadDrafts().find((x) => x.id === draft.dataset.did);
        if (d) {
          loadSkill(d, false);
          setView("editor");
        }
        return;
      }
      const del = e.target.closest("[data-del]");
      if (del) {
        e.stopPropagation();
        const list = loadDrafts().filter((x) => x.id !== del.dataset.del);
        saveDrafts(list);
        renderHome();
        showToast("Draft deleted");
        return;
      }
    });

    $("#btnNewSkill").addEventListener("click", () => {
      current = blankSkill();
      syncFieldsFromCurrent();
      setView("editor");
    });
    $("#btnSaveDraft").addEventListener("click", saveCurrentDraft);
    $("#btnToPreview").addEventListener("click", () => {
      readFieldsIntoCurrent();
      setView("preview");
    });
    $("#btnAddStep").addEventListener("click", () => {
      readFieldsIntoCurrent();
      current.steps.push("");
      renderStepInputs();
      onFieldsChange();
    });
    $("#stepList").addEventListener("input", (e) => {
      if (e.target.tagName === "TEXTAREA") onFieldsChange();
    });
    $("#stepList").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const row = btn.closest(".step-row");
      const i = Number(row.dataset.i);
      readFieldsIntoCurrent();
      const act = btn.dataset.act;
      if (act === "del") {
        current.steps.splice(i, 1);
        if (!current.steps.length) current.steps = [""];
      } else if (act === "up" && i > 0) {
        const t = current.steps[i - 1];
        current.steps[i - 1] = current.steps[i];
        current.steps[i] = t;
      } else if (act === "down" && i < current.steps.length - 1) {
        const t = current.steps[i + 1];
        current.steps[i + 1] = current.steps[i];
        current.steps[i] = t;
      }
      renderStepInputs();
      onFieldsChange();
    });

    ["fieldName", "fieldEmoji", "fieldTag", "fieldDesc"].forEach((id) => {
      const el = $("#" + id);
      el.addEventListener("input", onFieldsChange);
      el.addEventListener("change", onFieldsChange);
    });
    $("#rawMd").addEventListener("input", onRawChange);
    $("#btnFormatMd").addEventListener("click", () => {
      readFieldsIntoCurrent();
      $("#rawMd").value = toMarkdown(current);
      showToast("Formatted SKILL.md");
    });
    $("#btnLoadExample").addEventListener("click", openExampleModal);
    $("#modalClose").addEventListener("click", closeModal);
    $("#backdrop").addEventListener("click", closeModal);

    $("#btnCopyMd").addEventListener("click", async () => {
      const md = toMarkdown(current);
      try {
        await navigator.clipboard.writeText(md);
        showToast("Copied SKILL.md to clipboard");
      } catch (_) {
        $("#exportPre").textContent = md;
        showToast("Select & copy from the export panel");
      }
    });

    $("#btnRunWire").addEventListener("click", runWireCheck);
    $("#galleryFilter").addEventListener("input", renderGallery);
    $("#galleryTag").addEventListener("change", renderGallery);
    $("#btnExportAll").addEventListener("click", exportAll);

    window.addEventListener("hashchange", () => {
      const h = (location.hash || "#home").replace("#", "");
      if (["home", "editor", "preview", "gallery", "wire"].includes(h)) setView(h);
    });
  }

  function boot() {
    const last = restoreLast();
    if (last && last.name) current = Object.assign(blankSkill(), last);
    else if (gallery[0]) {
      // seed live card only; keep editor blank-ish with gallery hero
      current = blankSkill();
    }
    bind();
    const h = (location.hash || "#home").replace("#", "");
    setView(["home", "editor", "preview", "gallery", "wire"].includes(h) ? h : "home");
    renderHome();
    updateDraftPills();
    const foot = $("#footMeta");
    if (foot) {
      foot.textContent =
        gallery.length + " EXAMPLES · " + loadDrafts().length + " drafts · " + new Date().toLocaleString();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
