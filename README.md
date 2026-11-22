# Kolomi - Educational Games

This repository contains educational games for children:

## Game Folders

- [food/](file:///Users/riyadhmac/Documents/GitHub/kolomi/food): **Healthy vs Unhealthy Food Game**
  - Interactive drag-and-drop / tap-to-move food sorting game.
  - Features real-time live scoring, sound effects, confetti, and level completion modals with dedicated 3D stars.
  - Frame aspect ratio: 1280×832.

- [transport/](file:///Users/riyadhmac/Documents/GitHub/kolomi/transport): **Transport Game (Workspace)**
  - Standalone scaffold ready for the transport educational game.
  - Add assets into `transport/materials/` or `transport/public/` and build gameplay inside `transport/src/`.

---

## Running the Games

### Option 1: From Repository Root
```bash
# Run Food Game (Default)
npm run dev

# Or explicitly:
npm run dev:food

# Run Transport Game
npm run dev:transport
```

### Option 2: Inside Each Folder
```bash
# Food Game
cd food
npm run dev

# Transport Game
cd transport
npm run dev
```
