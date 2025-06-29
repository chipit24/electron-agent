# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Coding Guidelines

- Always reference the latest documentation to prevent hallucinations and incorrect or deprecated usage. For this, use Context7 (via MCP). If you cannot find documentation via Context7, or the documentation is unsufficient, then search the web.
  - Context7 has documentation for Electron at `electron/electron` and for Electron Forge at `electron-forge/electron-forge-docs`.

## Project Overview

This is an Electron application built with TypeScript, React, and Vite. The app provides an AI chat interface using Mistral AI, with a multi-window architecture for the main chat and settings. The project uses Electron Forge for packaging and distribution.

## Architecture

This application uses a **multi-window architecture** with separate processes for different concerns:

### Main Process (`src/main.ts`)
- Creates two BrowserWindow instances: main chat window (750x850) and settings modal (500x300)
- Implements macOS-style `hiddenInset` title bar
- Configures application menu with Settings shortcut (Cmd+,)
- Handles window lifecycle and IPC communication

### Preload Scripts (Security Bridge)
- **Main Preload** (`src/main/preload.ts`): Exposes `agentApi` for AI chat functionality
- **Settings Preload** (`src/settings/preload.ts`): Exposes `settingsApi` for configuration management

### Renderer Processes (React Frontend)
- **Main Window** (`src/main/renderer/`): Chat interface with message bubbles and real-time status
- **Settings Window** (`src/settings/renderer/`): API key configuration form

### IPC Handlers
- **Agent Handlers** (`src/main/handlers.ts`): Manages Mistral AI integration with `devstral-small-latest` model
- **Settings Handlers** (`src/settings/handlers.ts`): Uses electron-store for persistent configuration

### Build System
Uses Vite with multiple entry points for different processes and preload scripts

## Common Commands

### Development

- `npm start` - Start the Electron app in development mode with hot reload
- `npm run lint` - Run ESLint on TypeScript files
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript validation for both node and renderer environments

### Building & Packaging

- `npm run package` - Package the app for distribution
- `npm run make` - Create platform-specific distributables (Squirrel, ZIP, Deb, RPM)
- `npm run publish` - Publish the app

## Build Configuration

The project uses multiple Vite configurations:

- `vite.main.config.ts` - Main process build
- `vite.preload.config.ts` - Multi-entry preload script build (main + settings)
- `vite.renderer.config.mts` - Renderer process build with React and Tailwind CSS

Electron Forge configuration is in `forge.config.ts` and includes:

- **Makers**: Multi-platform support (Squirrel, ZIP, Deb, RPM)
- **VitePlugin**: Multi-entry build pipeline for main, preload scripts, and renderers
- **FusesPlugin**: Security hardening with ASAR integrity, cookie encryption, and restricted Node.js access

## TypeScript Configuration

- **Node Config** (`tsconfig.node.json`): ESNext target for main process and Node.js code
- **Renderer Config** (`tsconfig.renderer.json`): Browser environment with DOM types and React JSX support
- Separate type checking for different environments to ensure compatibility

## Key Development Considerations

- **Security**: Uses proper context isolation with preload scripts, no Node.js integration in renderers
- **Multi-Window**: Independent preload scripts and handlers for main chat and settings windows
- **IPC Communication**: Event-driven patterns with real-time API key change notifications
- **AI Integration**: Mistral AI client with `devstral-small-latest` model and professional system prompts
- **Persistent Storage**: electron-store for configuration with schema validation
