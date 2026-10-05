# Lineage

A text-only incremental game for the browser. Guide one line of life from a protocell to a civilization, and survive the disasters that end every era.

**Play:** https://ervzs.github.io/lineage/

## Features

- **8 species**, from Protocells to Humans. Each has 3 producers and 9 Traits.
- **Era Threats:** every era ends with a disaster, such as the Oxygen Catastrophe, Snowball Earth or the Great Dying. Survive it or the world ends.
- **Three resistances:** Immunity, Toughness and Endurance. Your Survival choices decide which Threats you can survive.
- **Trait levels** with no cap, plus Gifted Traits that carry rare Mutations.
- **Rebirth into Epochs:** earn Fossils, buy permanent upgrades, and face stronger Threats each time you survive.
- **Events** with choices, Population losses, Genome from extinct species, and a final Reckoning.
- An always-open Chronicle log, so you never miss what happened.
- Runs in the background. Autosaves, plus save export and import.
- Text only: no images, works on phones.

## How to play

1. Click **Absorb nutrients** until you can buy your first producer.
2. Buy producers. Each one makes Biomass or makes the producer below it.
3. Buy Traits to adapt. Enough adaptation ends the era.
4. Read the **Era threat ahead** line, and build the resistances it needs before the era ends.
5. When a run ends, **Rebirth**, spend Fossils, and go further.

Keyboard: `A` absorb, `1` `2` `3` buy producers, `M` buy amount, `E` answer an event with the safe option.

## Run locally

Needs [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev        # play locally
npm run build      # production build in dist/
npm run balance    # simulate the game with a bot and write balance-report.md
```

## Tech

- React 19 + TypeScript (strict), built with Vite
- State in React Context + `useReducer`; game rules in a pure TypeScript engine
- Plain CSS with variables, Space Grotesk and Space Mono
- Deployed to GitHub Pages with GitHub Actions

## Project structure

```
src/data/      game content and every tuning number (constants.ts)
src/engine/    game rules: production, traits, events, threats, saves
src/context/   game loop and React state
src/ui/        components
scripts/       balance bot (npm run balance)
```

The latest balance results are in [balance-report.md](balance-report.md).
