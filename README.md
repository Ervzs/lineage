# Lineage

A text-only incremental game for the browser. Guide one line of life from the first cells to early humans, and survive the disaster that ends every stage.

**Play:** https://ervzs.github.io/lineage/

## Features

- **9 stages of life**, from the first cells in the Primordial Soup to early humans.
- **Resources and population:** your species gathers food from the wild. Plenty means more births. Too many mouths strip the land, and then they starve.
- **Adaptations** bought with saved resources, each explained in plain words. Buy every evolution step to move on.
- **A disaster at every stage**, from volcanoes and the Great Oxidation to the asteroid and the Ice Age. There is no warning panel: the clues are in the Chronicle. Fail and the run ends.
- **A living Chronicle:** a new line every 20 to 45 seconds about what your species is doing, plus life events like plankton blooms, sickness, first beliefs and wars.
- Runs in the background. Autosaves, plus save export and import.
- Text only: no images, works on phones.

## How to play

1. Watch the population grow. The Life tab shows why it is changing.
2. Your species saves part of what it gathers. Spend it on adaptations.
3. Read the Chronicle. When it starts warning you, buy what protects your species.
4. Survive the disaster and finish the evolution steps to reach the next stage.

## Run locally

Needs [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev        # play locally
npm run build      # production build in dist/
npm run balance    # simulate full runs with bots and write balance-report.md
```

## Tech

- React 19 + TypeScript (strict), built with Vite
- State in React Context + `useReducer`; game rules in a pure TypeScript engine
- Plain CSS with variables, Space Grotesk and Space Mono
- Deployed to GitHub Pages with GitHub Actions

## Project structure

```
src/data/      game content and every tuning number (constants.ts)
src/data/stages/ the 9 stages: resources, adaptations, disasters, log lines
src/engine/    game rules: ecology, story log, disasters, saves
src/context/   game loop and React state
src/ui/        components
scripts/       balance bots (npm run balance)
```

The latest balance results are in [balance-report.md](balance-report.md).
