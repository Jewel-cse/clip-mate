# ClipMate 🔗

ClipMate is a lightweight, robust, offline-first desktop clipboard manager built with **Electron**, **React**, and **Vite**. It captures your copy-paste history automatically, stores it securely, and lets you quickly search and restore clips via a sleek search interface and dynamic global hotkeys.

## ✨ Features

- **Background Clipboard Monitoring**: Polling-based monitoring captures text, URLs, and images instantly with smart duplicate debouncing.
- **Privacy & Security First**: Fully offline architecture. Image data is cached locally inside the user data directory, and the renderer is fully sandboxed using strict Electron context isolation and validation.
- **Dynamic Search & Filtering**: Fuzzy real-time search of captured clips with custom icons and preview states.
- **Instant System Tray Integration**: Minimize to tray on close. Double-click tray to restore, or pause monitoring instantly via context menus.
- **Global Hotkeys**: Toggle the app globally from anywhere using `Ctrl + Shift + V` (customizable).
- **Smooth Custom UI**: Borderless frameless window with a premium Dark/Light mode engine that shifts instantly without reboots.
- **Keyboard Navigation**: Fully optimized navigation using Arrow Keys, `Enter` to copy, and `Escape` to close/hide.

---

## 🛠️ Tech Stack

- **Framework**: Electron (v33+)
- **Frontend**: React + Vite
- **Storage**: `electron-store` (encapsulated schema-validated local JSON store)
- **Development Tooling**: `concurrently`, `wait-on`

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have **Node.js** (v18+) and **npm** installed.

### 📥 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Jewel-cse/clip-mate.git
   cd clipboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in Development Mode:**
   ```bash
   npm run dev
   ```
   This command starts the Vite dev server and spawns the Electron main process simultaneously, automatically wait-on for port `5173`.

---

## 📁 Project Structure

```
├── docs/                 # Software Requirement Specifications (SRS)
├── src/
│   ├── main/             # Electron Main Process (System level API)
│   │   ├── assets/       # Icons and system assets
│   │   ├── clipboard.js  # Clipboard Poller and detector service
│   │   ├── index.js      # Main Electron lifecycle controller
│   │   ├── ipc-handlers.js # Sandboxed IPC endpoint registry
│   │   ├── shortcuts.js  # Global keyboard shortcut registry
│   │   ├── store.js      # Local electron-store layer (schema validated)
│   │   └── tray.js       # System Tray and context menu builder
│   ├── preload/          # Secure ContextBridge IPC Layer
│   │   └── preload.js    # Preload scripts (exposes APIs safely to UI)
│   └── renderer/         # React Frontend
│       ├── components/   # React components (SearchBar, ClipList, SettingsPanel, etc.)
│       ├── styles/       # HSL tailormade global variables & CSS theming
│       ├── App.jsx       # View routing, navigation & main controller
│       ├── index.html    # Base HTML template with safe CSP headers
│       └── main.jsx      # React mounting core and Error Boundaries
├── package.json          # Dependency specs and dev pipelines
└── vite.config.js        # Vite bundler properties
```

---

## 📦 Production & Local Builds

To package the application for distribution, you can run:

```bash
npm run build
```

For step-by-step instructions on compiling and packaging ClipMate on your specific machine, including detailed requirements and commands for **Windows (.exe)**, **macOS (.dmg)**, **Ubuntu/Debian (.deb)**, and **Fedora/CentOS (.rpm)**, please refer to our comprehensive:

👉 **[Step-by-Step Building & Packaging Guide](docs/build-instructions.md)**

---

## 🤝 Contribution Guidelines

1. **Granular Commits**: Follow Conventional Commits format (e.g. `feat: ...`, `fix: ...`, `docs: ...`).
2. **Security Checks**: Never expose raw Node APIs to the renderer. Statically validate all arguments passed through IPC bridges.
3. **Accessibility**: Maintain `aria-label` tags for new UI controls.

---

## 📄 License

This project is licensed under the MIT License.
