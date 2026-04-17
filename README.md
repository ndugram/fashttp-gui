<div align="center">

<br />

<img src="src-tauri/icons/icon.png" alt="FastHTTP GUI" width="96" height="96" />

<br />
<br />

# FastHTTP GUI

**A minimal, fast, dark-native HTTP client for developers.**  
Built with Tauri · React · TypeScript · Rust

<br />

[![Release](https://img.shields.io/github/v/release/NEFORCEO/fasthttp-gui?style=flat-square&color=58a6ff&labelColor=0f1115&label=latest)](https://github.com/NEFORCEO/fasthttp-gui/releases)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-58a6ff?style=flat-square&labelColor=0f1115)](https://github.com/NEFORCEO/fasthttp-gui/releases)
[![License](https://img.shields.io/badge/license-MIT-3fb950?style=flat-square&labelColor=0f1115)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-ffa657?style=flat-square&labelColor=0f1115)](https://tauri.app)

<br />

</div>

---

## Overview

FastHTTP GUI is a lightweight, cross-platform HTTP client designed to feel fast and stay out of your way. No bloat, no accounts, no telemetry — just you and your API.

The entire app fits in a few megabytes. The Rust backend handles every HTTP request natively, the frontend is pure React with zero UI libraries, and everything runs locally on your machine.

---

## Features

**Request builder**
- `GET` `POST` `PUT` `DELETE` `PATCH` methods with color-coded labels
- URL input with monospace font and keyboard shortcut (`⌘ Enter` / `Ctrl Enter` to send)
- Custom headers — add, toggle, delete per-request
- JSON body editor

**Response viewer**
- Syntax-highlighted JSON with colored keys, strings, numbers, booleans
- Response headers table
- Status badge with color by range — `2xx` green · `3xx` blue · `4xx` red · `5xx` yellow
- Elapsed time in milliseconds

**Request history**
- Persistent history across sessions (stored in `localStorage`)
- Real-time search by URL or HTTP method
- One-click restore — loads full request back into the form
- Clear history with confirmation

**Code generator**
- Generates ready-to-run Python + FastHTTP code from the current request
- Syntax highlighting for keywords, decorators, strings
- Copy button · Regenerate button
- Language badge: `Python · FastHTTP`

**UI / UX**
- Dark theme only — `#0f1115` background, `#151821` cards, `#2a2f3a` borders
- Collapsible history sidebar with smooth animation
- Monospace font throughout code areas (`JetBrains Mono` → `Fira Code` → system fallback)
- Custom scrollbars, hover transitions, focus rings — no browser defaults

---

## Stack

| Layer | Technology |
|-------|-----------|
| Shell | [Tauri 2](https://tauri.app) — Rust-powered native window |
| Frontend | React 18 + TypeScript 5 |
| HTTP engine | Rust [`reqwest`](https://github.com/seanmonstar/reqwest) |
| Build | Vite 5 |
| Styles | Plain CSS (no UI library) |
| Distribution | GitHub Actions → GitHub Releases |

---

## Installation

Go to the [**Releases**](https://github.com/NEFORCEO/fasthttp-gui/releases) page and download the build for your platform:

| Platform | File |
|----------|------|
| macOS (Apple Silicon) | `.dmg` `aarch64-apple-darwin` |
| macOS (Intel) | `.dmg` `x86_64-apple-darwin` |
| Windows | `.msi` |
| Linux | `.AppImage` · `.deb` |

> **macOS note:** the app is not notarized. On first launch: right-click → Open → Open anyway.

---

## Building from source

**Prerequisites:** [Rust](https://rustup.rs) · [Node.js 20+](https://nodejs.org) · [Tauri CLI prerequisites](https://tauri.app/start/prerequisites/)

```bash
git clone https://github.com/NEFORCEO/fasthttp-gui.git
cd fasthttp-gui

npm install
npm run tauri dev
```

**Production build:**

```bash
npm run tauri build
```

Installers land in `src-tauri/target/release/bundle/`.

---

<div align="center">

<br />

Made with obsessive attention to detail.

<br />

</div>
