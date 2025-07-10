# 🚀 Antigravity Flight Game

A 3D flight simulator game built with [React Three Fiber](https://github.com/pmndrs/react-three-fiber), supporting full keyboard and gamepad controls, collision detection, and HUD UI.

## ✈️ Features

- Smooth pitch and roll-based flight controls
- Gamepad (PlayStation-style) support with dead zone handling
- 360° vertical loops and antigravity-style inertia physics
- Dynamic camera that follows the aircraft
- Procedurally generated obstacle field
- Real-time collision detection with bounce response
- UI HUD displaying speed, acceleration, braking state, and controls

## 🧩 Tech Stack

- [React](https://react.dev/)
- [React Three Fiber (R3F)](https://docs.pmnd.rs/react-three-fiber)
- [Three.js](https://threejs.org/)
- [Drei](https://github.com/pmndrs/drei) – useful helpers for R3F
- TypeScript

## 🎮 Controls

| Input      | Action              |
|------------|---------------------|
| `W` / `S`  | Pitch Up / Down     |
| `A` / `D`  | Roll Left / Right   |
| `I`        | Accelerate          |
| `K`        | Brake               |
| Gamepad X  | Accelerate          |
| Gamepad ☐  | Brake               |

> Controller support uses standard browser Gamepad API. X and Square buttons mapped for PlayStation-style controllers.

## 🧠 Physics Details

- Angular inertia simulated with rotational velocity damping
- Linear antigravity-style motion using velocity vectors and lerp smoothing
- Ship bounce on obstacle collision
- Boundaries enforced via `THREE.MathUtils.clamp`

## 🛠️ Project Structure

```bash
/components
├── Aircraft.tsx // Main player logic (input, movement, collisions)
├── FollowCamera.tsx // Dynamic camera tracking the ship
├── Obstacle.tsx // Single obstacle with forwardRef
├── PlayingField.tsx // Scene floor or boundary visuals
├── HUD.tsx // On-screen UI for flight status

/app/stage
└── page.tsx // Game stage with Canvas, lights, and scene setup
/models
└── spaceship.glb // Your 3D spaceship model
```

## 🚀 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/antigravity-flight-game.git
   cd antigravity-flight-game
   ```

2. **Install Dependencies:**
    ```bash
    npm install
    ```
    
3. **Run development server:**
    ```bash
    npm run dev
    ```
    
4. **Open in browser:**
    navigate to http://localhost:3000

## 📦 Build for Production
```bash
npm run build
```