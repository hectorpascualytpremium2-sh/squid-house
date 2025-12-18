# Squid House

A complete Vite + React + TypeScript + Tailwind SPA for tracking a "Squid Games" style roster. Features a neon purple/blue theme with interactive particle effects, an arena visualization, and a responsive roster system.

## Features

- 🎨 **Neon Theme**: Purple and blue gradient design with glow effects
- ✨ **Interactive Particles**: Touch/mouse-responsive particle background
- 🎯 **Arena Visualization**: Spiral-layout player tokens with elimination status
- 📱 **Mobile-First**: Fully responsive design optimized for all devices
- 🔍 **Search & Filter**: Real-time filtering by status and search by name/ID
- ♿ **Accessible**: Built with Headless UI for accessibility

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Arena.tsx          # Arena visualization with spiral layout
│   ├── Controls.tsx       # Search and filter controls
│   ├── Hero.tsx           # Hero section with particles
│   ├── PlayerModal.tsx    # Player detail modal/drawer
│   └── Roster.tsx         # Responsive roster grid
├── data/
│   └── players.json       # Player data source
├── types.ts               # TypeScript type definitions
├── App.tsx                # Main application component
├── main.tsx               # React entry point
└── index.css              # Global styles
```

## Data Model

Players are defined in `src/data/players.json` with the following structure:

```typescript
type Player = {
  id: string;
  name: string;
  picture: string;
  eliminated: boolean;
}
```

## Technologies

- **Vite** - Build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@tsparticles/react** - Particle effects
- **@headlessui/react** - Accessible UI components

## Browser Support

Modern browsers with ES2020 support. Tested on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

