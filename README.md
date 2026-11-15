# Healthy vs Unhealthy - Kids Learning Game 🍎🍔

A child-friendly interactive frontend educational game built with **React**, **Vite**, and **Tailwind CSS**, designed exactly according to the provided mockups and game logic.

---

## 🎮 Game Rules & Logic

1. **Food Categories**:
   - **Healthy Foods (Left Box)**: Mango, Apple, Watermelon (features the fruit basket with green checkmark badge).
   - **Unhealthy Foods (Right Box)**: Burger, French Fries, Pizza (features the fast food with cancel sign badge).

2. **Interactions**:
   - **Drag & Drop**: Native drag-and-drop on desktop.
   - **Touch Dragging**: Pointer-based dragging with touch-action controls for tablets and mobile devices.
   - **Click / Tap to Move**: Tap any food item to select it (with animated golden glow and checkmark), then tap the target box to drop it!
   - **Click / Tap to Remove**: Tap any placed food item inside a box to return it to the outer area.

3. **Scoring & Modals**:
   - **All 6 Correct**:
     - ⭐⭐⭐ **3 Stars**
     - 🪙 **40 Coins**
     - Triggers **Level Complete Modal** with victory fanfare sound and celebratory confetti!
   - **4–5 Correct**:
     - ⭐⭐ **2 Stars**
     - 🪙 **20 Coins**
     - Triggers **Level Complete Modal**.
   - **1–3 Correct**:
     - ⭐ **1 Star**
     - 🪙 **10 Coins**
     - Triggers **Level Complete Modal**.
   - **0 Correct**:
     - Triggers **Retry Modal** ("You Failed :( Please Retry!") with a retry sound and animated restart button.

4. **Audio & Sound Effects**:
   - Built-in Web Audio API sound synthesis (zero external audio file dependencies):
     - Pick up sound ("bloop")
     - Drop chime ("ding")
     - Return whoosh
     - Victory fanfare
     - Cartoon retry trombone
     - Button click sound
     - Sound Mute / Unmute toggle button in header.

---

## 🚀 How to Run

### Development Server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build:
```bash
npm run build
npm run preview
```

---

## 🎨 Asset Processing
The original design assets in `materials/` have been processed, transparent-padded margins cropped, and optimized into `public/assets/clean/` for fast loading and crisp resolution across all devices.
