# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Electron application built with TypeScript and Vite. The project uses Electron Forge for packaging and distribution.

## Architecture

- **Main Process** (`src/main.ts`): Standard Electron main process that creates browser windows and handles app lifecycle
- **Preload Script** (`src/preload.ts`): Security bridge between main and renderer processes
- **Renderer Process** (`src/renderer.ts`): Frontend application code
- **Build System**: Uses Vite for bundling with separate configs for main, preload, and renderer processes

## Common Commands

### Development
- `npm start` - Start the Electron app in development mode
- `npm run lint` - Run ESLint on TypeScript files

### Building & Packaging
- `npm run package` - Package the app for distribution
- `npm run make` - Create platform-specific distributables
- `npm run publish` - Publish the app

## Build Configuration

The project uses multiple Vite configurations:
- `vite.main.config.ts` - Main process build
- `vite.preload.config.ts` - Preload script build  
- `vite.renderer.config.ts` - Renderer process build

Electron Forge configuration is in `forge.config.ts` and includes:
- Multiple platform makers (Squirrel, ZIP, Deb, RPM)
- Security fuses for hardening
- VitePlugin for build integration

## TypeScript Configuration

Uses ESNext target with CommonJS modules. Source maps enabled for debugging.