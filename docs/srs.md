# 📋 ClipMate — Software Requirements Specification (SRS)
**Version:** 1.0.0 — MVP
**Last Updated:** 2026-05-17
**Author:** Rana
**Status:** 🟢 Active

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Stakeholders & Users](#2-stakeholders--users)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Technical Architecture](#5-technical-architecture)
6. [UI/UX Requirements](#6-uiux-requirements)
7. [Data Model](#7-data-model)
8. [IPC API Contract](#8-ipc-api-contract)
9. [Out of Scope](#9-out-of-scope)
10. [Acceptance Criteria](#10-acceptance-criteria)
11. [Implementation Phases](#11-implementation-phases)
12. [Risk Register](#12-risk-register)
13. [Glossary](#13-glossary)

---

## 1. Project Overview

### 1.1 Purpose
**ClipMate** is a lightweight, privacy-first desktop clipboard manager. It silently monitors the system clipboard, stores a searchable history of copied items, and lets users retrieve any past clip instantly via a global hotkey — all 100% offline.

### 1.2 Problem Statement
Power users (developers, writers, researchers) constantly lose clipboard content because the OS only holds one item at a time. Existing tools are either cloud-dependent, bloated, or require subscriptions.

### 1.3 Solution
A native-feeling Electron desktop app that:
- Runs silently in the system tray
- Captures text, links, and images automatically
- Surfaces a fast, searchable history panel on demand
- Stores everything locally with zero network calls

### 1.4 Platforms
| OS | Minimum Version |
|----|----------------|
| Windows | 10 (Build 1903+) / 11 |
| macOS | 11 Big Sur+ |
| Linux | Ubuntu 20.04+, X11 & Wayland fallback |

### 1.5 Tech Stack (First-Time Builder Rationale)
| Tool | Why Chosen |
|------|-----------|
| **Electron** | Write once, run on Win/Mac/Linux. Uses HTML/JS you already know. |
| **React + Vite** | Fast dev server, hot reload, component model keeps UI manageable. |
| **electron-store** | Zero-config JSON persistence. No SQL to learn for MVP. |
| **electron-builder** | One command produces `.exe`, `.dmg`, `.AppImage` installers. |

---

## 2. Stakeholders & Users

### 2.1 Primary Users
| Persona | Pain Point | Key Need |
|---------|-----------|----------|
| **Developer** | Copies API keys, code snippets, commands — needs quick recall | Fast search + keyboard-only workflow |
| **Writer / Researcher** | Loses text snippets when switching between sources | Timestamped history, preview on hover |
| **Power User** | Context-switches heavily between windows | Near-instant hotkey access |

### 2.2 Developer (You — First-Time Desktop Builder)
This SRS is also written as a **learning guide**. Each phase is broken into tasks small enough to complete and understand one at a time.

---

## 3. Functional Requirements

### 3.1 Must-Have (MVP Critical)
| ID | Feature | Detailed Description | Priority |
|----|---------|---------------------|----------|
| F1 | **Clipboard Monitoring** | Main process polls/listens for clipboard changes. Captures `text/plain`, `text/uri-list`, `image/png`. Debounce: ignore duplicate sequential values. Emits `clip:new` IPC event to renderer. | 🔴 Critical |
| F2 | **Local Storage** | Persist clips via `electron-store`. Each clip record: `{ id, type, content, imagePath?, timestamp, charLength }`. Survives app restart. | 🔴 Critical |
| F3 | **Global Hotkey** | Register `Ctrl+Shift+V` (Win/Linux) / `Cmd+Shift+V` (macOS) via `globalShortcut`. Toggle main window show/hide. Unregister on quit. | 🔴 Critical |
| F4 | **History UI** | Scrollable list: type icon + first 80 chars of preview + relative timestamp. Virtualize list when > 100 items. Real-time search as user types. | 🔴 Critical |
| F5 | **One-Click Paste** | Click or `Enter` on clip → write content to system clipboard → show brief "Copied!" toast → close window. | 🔴 Critical |

### 3.2 High Priority (MVP Should-Have)
| ID | Feature | Detailed Description | Priority |
|----|---------|---------------------|----------|
| F6 | **System Tray** | Persistent tray icon. Context menu: `Open`, `Pause/Resume Monitoring`, `Settings`, `Quit`. Tooltip shows last clip preview (max 60 chars). | 🟠 High |
| F7 | **Auto-Cleanup** | When clip count exceeds `settings.retentionLimit` (default: 500), delete oldest entries. Run check on every new clip save. | 🟠 High |
| F8 | **Settings Panel** | In-app settings page. Fields: hotkey (text input), retention limit (number), theme (light/dark/system), monitoring state (toggle). Save to `electron-store`. | 🟠 High |

### 3.3 Nice-to-Have (Post-MVP)
| ID | Feature |
|----|---------|
| F9 | Pin important clips to top |
| F10 | Delete individual clips from UI |
| F11 | Keyboard shortcut cheatsheet overlay |
| F12 | Export history as `.json` file |

---

## 4. Non-Functional Requirements

| Category | Requirement | How to Verify |
|----------|-------------|---------------|
| **Performance** | Window opens in `< 300ms`. Clip capture latency `< 50ms`. Idle RAM `< 60MB`. | Manual timing + Task Manager |
| **Security** | `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. All IPC args validated with type checks. | Code review checklist |
| **Privacy** | Zero network requests. No analytics, no crash reporting. All data in `userData` directory. | Wireshark trace during use |
| **Reliability** | App does not crash if clipboard content is empty or binary. Graceful error boundaries in renderer. | Manual edge-case testing |
| **Cross-Platform** | Installer works on Win/Mac/Linux. OS-specific clipboard quirks handled. | Test matrix in Phase 5 |
| **Accessibility** | Full keyboard navigation. `aria-label` on all interactive elements. High-contrast theme support. | Screen reader smoke test |
| **Maintainability** | Each module < 200 lines. JSDoc comments on all IPC handlers. README kept up to date. | Code review |

---

## 5. Technical Architecture

### 5.1 Process Model
```
┌─────────────────────────────────────────────────┐
│                  Main Process                    │
│  ┌────────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Clipboard  │  │ electron │  │  electron   │  │
│  │  Poller   │  │  -store  │  │   -builder  │  │
│  └────────────┘  └──────────┘  └─────────────┘  │
│  ┌────────────┐  ┌──────────┐                   │
│  │  System   │  │ Global   │                   │
│  │   Tray    │  │ Shortcut │                   │
│  └────────────┘  └──────────┘                   │
└──────────────┬──────────────────────────────────┘
               │  contextBridge (preload.js)
               │  ipcMain.handle / ipcRenderer.invoke
┌──────────────▼──────────────────────────────────┐
│              Renderer Process                    │
│         React + Vite (zero Node access)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Search   │ │ ClipList │ │ Settings Panel   │ │
│  │   Bar    │ │          │ │                  │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 5.2 File/Folder Structure
```
clipboard/
├── src/
│   ├── main/
│   │   ├── index.js          # App entry, window creation
│   │   ├── clipboard.js      # Clipboard polling logic
│   │   ├── store.js          # electron-store setup & CRUD
│   │   ├── tray.js           # System tray setup
│   │   ├── shortcuts.js      # Global hotkey registration
│   │   └── ipc-handlers.js   # All ipcMain.handle() definitions
│   ├── preload/
│   │   └── preload.js        # contextBridge API exposure
│   └── renderer/
│       ├── index.html
│       ├── main.jsx          # React entry point
│       ├── App.jsx
│       ├── components/
│       │   ├── ClipList.jsx
│       │   ├── ClipItem.jsx
│       │   ├── SearchBar.jsx
│       │   ├── SettingsPanel.jsx
│       │   └── Toast.jsx
│       └── styles/
│           ├── global.css
│           └── themes.css
├── docs/
│   └── srs.md
├── package.json
├── vite.config.js
├── electron-builder.yml
└── README.md
```

### 5.3 Storage Schema
```json
{
  "clips": [
    {
      "id": "uuid-v4",
      "type": "text | link | image",
      "content": "string (null for images)",
      "imagePath": "string | null",
      "timestamp": "ISO8601",
      "charLength": 42
    }
  ],
  "settings": {
    "hotkey": "CommandOrControl+Shift+V",
    "retentionLimit": 500,
    "theme": "system",
    "monitoringEnabled": true
  }
}
```

---

## 6. UI/UX Requirements

### 6.1 Window Properties
| Property | Value |
|----------|-------|
| Type | Frameless (custom titlebar drag region) |
| Width | `480px` fixed |
| Height | `70vh`, min `400px` |
| Position | Center screen on first open |
| Always on Top | `true` (so it overlays other apps) |
| Show in Taskbar | `false` (tray-only presence) |

### 6.2 Layout Specification
```
┌─────────────────────────────────┐
│  [🔍 Search clips...         ]  │  ← Search bar (auto-focused)
├─────────────────────────────────┤
│  🔤 npm install electron   2s  │  ← Clip item (hover = highlight)
│  🔗 https://electron.js  1m   │
│  🖼️ [image] 640×480        5m  │
│  🔤 Hello world            1h  │
│  ...                            │
├─────────────────────────────────┤
│  500 clips  •  Monitoring ON    │  ← Status footer
└─────────────────────────────────┘
```

### 6.3 Keyboard Navigation
| Key | Action |
|-----|--------|
| `↑` / `↓` | Move selection |
| `Enter` | Copy selected clip |
| `Esc` | Close window |
| `Ctrl/Cmd+F` | Focus search bar |
| `Delete` | (Post-MVP) Delete selected clip |

### 6.4 Visual Design Tokens
```css
/* Light theme */
--bg-primary: #ffffff;
--bg-secondary: #f5f5f5;
--accent: #6366f1;       /* Indigo */
--text-primary: #111827;
--text-muted: #6b7280;
--border: #e5e7eb;

/* Dark theme */
--bg-primary: #1a1a2e;
--bg-secondary: #16213e;
--accent: #818cf8;
--text-primary: #f1f5f9;
--text-muted: #94a3b8;
--border: #334155;
```

---

## 7. Data Model

### 7.1 Clip Record
| Field | Type | Constraints |
|-------|------|-------------|
| `id` | `string` | UUID v4, unique, required |
| `type` | `enum` | `"text"` \| `"link"` \| `"image"` |
| `content` | `string\|null` | Max 10,000 chars. `null` if image |
| `imagePath` | `string\|null` | Absolute path. `null` if not image |
| `timestamp` | `string` | ISO 8601 UTC |
| `charLength` | `number` | Integer ≥ 0 |

### 7.2 Settings Record
| Field | Type | Default |
|-------|------|---------|
| `hotkey` | `string` | `"CommandOrControl+Shift+V"` |
| `retentionLimit` | `number` | `500` |
| `theme` | `string` | `"system"` |
| `monitoringEnabled` | `boolean` | `true` |

---

## 8. IPC API Contract

All renderer↔main communication goes through these channels only:

| Channel | Direction | Args | Returns |
|---------|-----------|------|---------|
| `clips:get-all` | Renderer → Main | none | `Clip[]` |
| `clips:search` | Renderer → Main | `{ query: string }` | `Clip[]` |
| `clips:copy` | Renderer → Main | `{ id: string }` | `{ success: boolean }` |
| `clips:delete` | Renderer → Main | `{ id: string }` | `{ success: boolean }` |
| `settings:get` | Renderer → Main | none | `Settings` |
| `settings:update` | Renderer → Main | `Partial<Settings>` | `{ success: boolean }` |
| `monitoring:toggle` | Renderer → Main | none | `{ enabled: boolean }` |
| `clip:new` | Main → Renderer | `Clip` | — (event push) |

---

## 9. Out of Scope

| Feature | Reason Excluded from MVP |
|---------|--------------------------|
| Cloud sync / WebDAV | Network code, auth, privacy complexity |
| Plugin system | Sandboxing architecture needed first |
| Pinning / Folders | State management overhead |
| AES-256 encryption | Added post-MVP once schema stabilizes |
| Auto-updater | Code signing cost; manual re-install acceptable for MVP |
| Vim keybindings | Niche; arrow key navigation covers 90% |
| AI formatting / summarize | External API dependency, out of privacy scope |

---

## 10. Acceptance Criteria

### 10.1 Definition of Done (All must pass before MVP release)
- [ ] App launches with no console errors or `nodeIntegration` warnings
- [ ] Clipboard text changes captured and stored within 100ms
- [ ] Clipboard images captured and saved to `userData/images/`
- [ ] Global hotkey opens UI from any app; `Esc` closes it
- [ ] Real-time search filters clips accurately as user types
- [ ] Clicking or pressing `Enter` on a clip writes it back to clipboard
- [ ] System tray shows correct monitoring state; all menu items functional
- [ ] Settings persist correctly after full app restart
- [ ] Auto-cleanup removes oldest clips when retention limit hit
- [ ] `npm run build` produces working installers on Win, Mac, Linux
- [ ] No Node.js APIs accessible from DevTools console in renderer
- [ ] All IPC args validated; malformed input does not crash main process
- [ ] Idle RAM usage under 60MB (verified in Task Manager / Activity Monitor)

---

## 11. Implementation Phases

> **For first-time desktop builders:** Each phase builds on the last. Complete Phase 1 fully before moving to Phase 2. Each task includes what you'll learn, not just what you'll build.

---

### Phase 1 — Project Scaffolding & Hello World
**Goal:** Get a working Electron window on screen. Understand process model.
**Duration Estimate:** 1–2 days

#### Tasks
| # | Task | What You Learn |
|---|------|---------------|
| 1.1 | Run `npm init` and install `electron`, `vite`, `react`, `react-dom`, `electron-builder` | Node project setup, devDependencies vs dependencies |
| 1.2 | Create `src/main/index.js` — create a `BrowserWindow`, load `index.html` | What the Main Process is, how windows work |
| 1.3 | Create `src/renderer/index.html` + `main.jsx` with a "Hello ClipMate" heading | What the Renderer Process is |
| 1.4 | Configure `vite.config.js` for Electron renderer | How Vite serves files to Electron |
| 1.5 | Add `npm run dev` script that starts Vite + Electron together | Dev workflow |
| 1.6 | Set `contextIsolation: true`, `nodeIntegration: false` in `BrowserWindow` | Security model — **most important concept in Electron** |

#### Deliverable
✅ Electron window opens showing "Hello ClipMate". DevTools console shows no errors.

#### Key Files Created
- `package.json`
- `src/main/index.js`
- `src/renderer/index.html`
- `src/renderer/main.jsx`
- `vite.config.js`

---

### Phase 2 — Preload Bridge & IPC Foundation
**Goal:** Establish secure communication between Main and Renderer. This is the hardest concept — get it right now.
**Duration Estimate:** 1–2 days

#### Tasks
| # | Task | What You Learn |
|---|------|---------------|
| 2.1 | Create `src/preload/preload.js` with `contextBridge.exposeInMainWorld` | How to safely expose APIs to the renderer |
| 2.2 | Register preload in `BrowserWindow` options | How Electron loads the preload script |
| 2.3 | Create `src/main/ipc-handlers.js` — add one test handler `ping:pong` | `ipcMain.handle()` pattern |
| 2.4 | Call `window.clipmate.ping()` from React and display result | `ipcRenderer.invoke()` pattern, async/await across processes |
| 2.5 | Add input validation to the handler (check arg types) | Why validation matters — renderer could send garbage |

#### Deliverable
✅ Renderer calls `window.clipmate.ping()` → Main responds → UI displays "pong". No Node APIs accessible in DevTools.

#### Key Files Created
- `src/preload/preload.js`
- `src/main/ipc-handlers.js`

---

### Phase 3 — Clipboard Monitoring & Storage
**Goal:** Actually capture clipboard data and persist it.
**Duration Estimate:** 2–3 days

#### Tasks
| # | Task | What You Learn |
|---|------|---------------|
| 3.1 | Install `electron-store`. Create `src/main/store.js` with schema | JSON file storage, data validation |
| 3.2 | Create `src/main/clipboard.js` — poll `clipboard.readText()` every 200ms | `setInterval` in Main process, Electron's clipboard module |
| 3.3 | Add debounce: only save if content changed from last poll | Preventing duplicate entries |
| 3.4 | Detect clip type: URL regex for "link", else "text" | Basic string classification |
| 3.5 | Capture images: `clipboard.readImage()` — save PNG to `userData/images/` | Binary file I/O in Node.js |
| 3.6 | Generate UUID for each clip (`crypto.randomUUID()`) | Built-in Node crypto module |
| 3.7 | Save clip to `electron-store`. Enforce retention limit (delete oldest). | CRUD with electron-store |
| 3.8 | Expose `clips:get-all` and `clips:search` IPC handlers | Wiring storage to IPC |
| 3.9 | Push `clip:new` event to renderer using `webContents.send()` | Main→Renderer push events (vs request/response) |

#### Deliverable
✅ Copy text in any app → check `electron-store` JSON file → clip appears with correct fields.

#### Key Files Created
- `src/main/clipboard.js`
- `src/main/store.js`

---

### Phase 4 — History UI & Search
**Goal:** Build the visible part of the app. Users see and interact with their clipboard history.
**Duration Estimate:** 3–4 days

#### Tasks
| # | Task | What You Learn |
|---|------|---------------|
| 4.1 | Create `SearchBar.jsx` — controlled input, calls `window.clipmate.search(q)` | React controlled components, debounced API calls |
| 4.2 | Create `ClipItem.jsx` — shows type icon, preview, relative timestamp | Props, conditional rendering |
| 4.3 | Create `ClipList.jsx` — renders list of `ClipItem`, handles `clip:new` push event | `useEffect`, event listeners, state updates |
| 4.4 | Add keyboard navigation (`↑`/`↓` arrow keys, `Enter` to copy) | `onKeyDown` handlers, `useRef` for focus |
| 4.5 | Implement `clips:copy` IPC — write to clipboard, return success | IPC handler with side effect |
| 4.6 | Add `Toast.jsx` — brief "Copied!" message using `setTimeout` | Temporary UI state pattern |
| 4.7 | Add `global.css` with design tokens (light/dark variables) | CSS custom properties, theming |
| 4.8 | Make window frameless, add draggable titlebar region | `-webkit-app-region: drag` CSS property |
| 4.9 | Add `Esc` key listener to hide window | `ipcRenderer.invoke` to tell main to hide window |

#### Deliverable
✅ Hotkey opens window, list shows history, search filters live, clicking copies & closes.

#### Key Files Created
- `src/renderer/components/ClipList.jsx`
- `src/renderer/components/ClipItem.jsx`
- `src/renderer/components/SearchBar.jsx`
- `src/renderer/components/Toast.jsx`
- `src/renderer/styles/global.css`

---

### Phase 5 — System Tray & Global Hotkey
**Goal:** Make the app feel native — always present, never in the way.
**Duration Estimate:** 1–2 days

#### Tasks
| # | Task | What You Learn |
|---|------|---------------|
| 5.1 | Create `src/main/tray.js` — `new Tray(iconPath)` with context menu | Electron Tray API, `nativeImage` |
| 5.2 | Add tray menu items: Open, Pause/Resume, Settings, Quit | `Menu.buildFromTemplate()` |
| 5.3 | Link Pause/Resume to `clipboard.js` monitoring toggle | Module communication in Main process |
| 5.4 | Create `src/main/shortcuts.js` — register global hotkey | `globalShortcut.register()`, why to unregister on quit |
| 5.5 | Hotkey toggles window show/hide (not open multiple windows) | `BrowserWindow` show/hide vs create |
| 5.6 | Intercept window close (`x` button) → hide, not quit | `window.on('close')` event |

#### Deliverable
✅ App lives in tray. Hotkey toggles window. Pause stops capture. Quit terminates fully.

#### Key Files Created
- `src/main/tray.js`
- `src/main/shortcuts.js`

---

### Phase 6 — Settings Panel
**Goal:** Let users configure the app to their preferences.
**Duration Estimate:** 1–2 days

#### Tasks
| # | Task | What You Learn |
|---|------|---------------|
| 6.1 | Create `SettingsPanel.jsx` with form fields for all settings | React forms, uncontrolled vs controlled |
| 6.2 | Implement `settings:get` IPC — load from store on open | Data fetching pattern |
| 6.3 | Implement `settings:update` IPC — validate and save | Partial updates, input sanitization |
| 6.4 | Re-register hotkey when changed in settings | Dynamic `globalShortcut` management |
| 6.5 | Apply theme change immediately without restart | CSS variable swap at runtime |
| 6.6 | Add route/navigation between History and Settings views | React state for simple view routing |

#### Deliverable
✅ Settings open, all fields editable and saved. Theme and hotkey changes take effect immediately.

---

### Phase 7 — Polish, Security Audit & Testing
**Goal:** Make it production-worthy. Fix edge cases. Verify security.
**Duration Estimate:** 2–3 days

#### Tasks
| # | Task | What You Learn |
|---|------|---------------|
| 7.1 | Test with empty clipboard, binary data, emoji, very long strings | Defensive coding |
| 7.2 | Add error boundaries in React (`ErrorBoundary` component) | React error handling |
| 7.3 | Validate all IPC args in `ipc-handlers.js` (type + length checks) | Security hardening |
| 7.4 | Verify no Node APIs in renderer via DevTools: `window.require` should be `undefined` | contextIsolation verification |
| 7.5 | Profile idle memory in Task Manager — target < 60MB | Performance awareness |
| 7.6 | Add `aria-label` to all interactive elements | Accessibility basics |
| 7.7 | Write `README.md` with setup, dev, and build instructions | Documentation habits |

#### Deliverable
✅ All acceptance criteria from Section 10 pass.

---

### Phase 8 — Build & Package
**Goal:** Ship it. Create real installers.
**Duration Estimate:** 1 day

#### Tasks
| # | Task | What You Learn |
|---|------|---------------|
| 8.1 | Create `electron-builder.yml` — configure appId, productName, icons | Packaging configuration |
| 8.2 | Add app icons: `.ico` (Win), `.icns` (Mac), `.png` (Linux) | Platform-specific assets |
| 8.3 | Run `npm run build` — verify `.exe`, `.dmg`, `.AppImage` output | electron-builder workflow |
| 8.4 | Test the installer on Windows (primary platform first) | End-to-end install testing |
| 8.5 | Tag `v1.0.0` in Git | Release versioning |

#### Deliverable
✅ A real `.exe` installer that anyone can install and run.

---

### Phase Summary Timeline

```
Week 1:  Phase 1 (Scaffold) → Phase 2 (IPC) → Phase 3 (Clipboard + Storage)
Week 2:  Phase 4 (History UI) → Phase 5 (Tray + Hotkey)
Week 3:  Phase 6 (Settings) → Phase 7 (Polish) → Phase 8 (Build)
```

> **Tip for first-timers:** Don't skip phases. The temptation is to jump to UI early, but a broken IPC bridge will waste days of debugging. Get Phase 2 right first.

---

## 12. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Clipboard polling misses rapid copies | Medium | Medium | Reduce poll to 100ms; accept that < 50ms gaps may be missed |
| Image storage fills disk | Low | High | Cap image clips at 50, auto-delete oldest image clips |
| Global hotkey conflicts with other apps | Medium | Low | Allow user to reconfigure; graceful fallback if register fails |
| Linux Wayland clipboard access restricted | Medium | Medium | Fall back to polling; document limitation |
| electron-store file corrupted | Low | High | Catch parse error on startup; backup previous file |
| Large clipboard content (e.g. 1MB text) slows UI | Low | Medium | Truncate stored content at 10,000 chars; store full in separate file |

---

## 13. Glossary

| Term | Definition |
|------|-----------|
| **Main Process** | The Node.js process that manages windows, system APIs. One per app. |
| **Renderer Process** | The Chromium browser process that runs the UI. One per window. |
| **Preload Script** | Runs in renderer context but has Node access. Bridge between the two. |
| **contextBridge** | Electron API to safely expose functions from preload to renderer. |
| **IPC** | Inter-Process Communication. How Main and Renderer talk to each other. |
| **electron-store** | Library that saves data to a JSON file in the OS user data directory. |
| **globalShortcut** | Electron API to capture key combos even when app is not focused. |
| **userData** | OS-specific path where app data is stored (`%APPDATA%` on Windows). |
| **contextIsolation** | Security setting that prevents renderer from accessing Node globals. |
