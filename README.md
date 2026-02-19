# Pandora QE Workshop — SDLC Agentic Transformation

Interactive workshop application for redefining Quality Engineering across the SDLC lifecycle with Claude Agents. Built with Next.js 14 / React 18.

---

## Prerequisites

Make sure you have the following installed:

| Tool | Version | Check |
|------|---------|-------|
| **Node.js** | v18.17+ (LTS recommended) | `node --version` |
| **npm** | v9+ (comes with Node) | `npm --version` |
| **Git** | Any recent version | `git --version` |

### Install Node.js (if needed)

**macOS (Homebrew):**
```bash
brew install node@20
```

**macOS / Windows / Linux (nvm — recommended):**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal, then:
nvm install 20
nvm use 20
```

**Windows (direct):**
Download from https://nodejs.org/en/download — use the LTS version.

---

## Quick Start

### 1. Clone / Copy the project

If you have the zip file:
```bash
unzip pandora-qe-workshop.zip
cd pandora-qe-workshop
```

Or if you're setting it up from scratch, copy the entire `pandora-qe-workshop/` folder to your machine.

### 2. Install dependencies

```bash
npm install
```

This will install Next.js, React, and TypeScript. Takes about 30-60 seconds.

### 3. Start the development server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.3s
```

### 4. Open in browser

Navigate to **http://localhost:3000**

---

## Project Structure

```
pandora-qe-workshop/
├── package.json              # Dependencies & scripts
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── src/
│   ├── app/
│   │   ├── globals.css       # Design tokens, base styles, fonts
│   │   ├── layout.tsx        # Root HTML layout
│   │   └── page.tsx          # Main page (imports App component)
│   ├── components/
│   │   └── App.tsx           # Main application component (all views)
│   └── data/
│       ├── index.ts          # Data exports (architecture, effort, shortcomings, heatmap)
│       ├── phases.ts         # QE Phase definitions with agentic vision detail
│       └── slides.ts         # Workshop slideshow content (13 slides)
└── public/                   # Static assets (add logo, images here)
```

### Key Architecture Decisions

- **Single App component (`App.tsx`)**: Contains all view components, the slideshow, and UI logic in one file for simplicity. In production, you'd split this into separate component files.
- **Data layer (`src/data/`)**: Fully separated. Edit phase definitions, slides, shortcomings, etc. without touching components.
- **No Tailwind**: Uses inline styles with design tokens for zero-config portability. Can be migrated to Tailwind or CSS Modules easily.

---

## Features & Navigation

### Mode Toggle
- **📋 Current State** — Shows the existing QE process, pain points, effort
- **🤖 Agentic Vision** — Shows the target state with Claude Agent details

### View Tabs
1. **📽 Slideshow** — Full workshop presentation (13 slides, arrow key navigation)
2. **QE Lifecycle** — Architecture layers + 7 expandable phase cards
3. **Effort & Timeline** — Effort bars + sprint breakdown (comparison in vision mode)
4. **Shortcomings** — 12 critical issues + risk heatmap (with agent fixes in vision mode)

### Slideshow Controls
- **← →** Arrow keys to navigate
- Click slide thumbnails at bottom to jump
- Progress bar shows position

---

## Customisation

### Edit Workshop Content

**Change slides:** Edit `src/data/slides.ts`
**Change QE phases:** Edit `src/data/phases.ts`
**Change shortcomings:** Edit `src/data/index.ts` → `SHORTCOMINGS` array
**Change architecture:** Edit `src/data/index.ts` → `ARCHITECTURE_LAYERS`

### Add Your Logo

1. Place `pandora-logo.svg` in `public/`
2. Reference in App.tsx header section

### Change Colour Theme

Edit CSS variables in `src/app/globals.css` under `:root`.

---

## Build for Production

```bash
# Create optimised production build
npm run build

# Start production server
npm start
```

The production build will be in `.next/` and runs at http://localhost:3000.

### Export as Static HTML (for hosting anywhere)

Add to `next.config.js`:
```js
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Add this line
};
```

Then:
```bash
npm run build
```

The static site will be in `out/` — deploy to any web server, S3, Netlify, Vercel, etc.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm install` fails | Delete `node_modules/` and `package-lock.json`, run `npm install` again |
| Port 3000 in use | Run `npm run dev -- -p 3001` to use a different port |
| Fonts not loading | Check internet connection — fonts load from Google Fonts CDN |
| TypeScript errors | Run `npx tsc --noEmit` to check. The project uses loose TS config. |
| Hot reload not working | Stop server, delete `.next/`, restart with `npm run dev` |

---

## Workshop Tips

1. **Start with Slideshow tab** — Walk through slides 1-6 to set context
2. **Switch to QE Lifecycle** in Current State mode — expand each phase card
3. **Toggle to Agentic Vision** — same phase cards now show agent details
4. **Use the example scenarios** — each phase has a concrete step-by-step workflow
5. **End with Slideshow** slides 10-12 — discussion topics and roadmap

---

Built for the Pandora Global Platform QE Transformation Workshop.
