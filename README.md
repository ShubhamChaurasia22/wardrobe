# 3D Room Configurator

A React-based 3D room configuration tool that allows users to design and customize wardrobes in a virtual room environment. This interactive tool enables users to create customized wardrobe layouts with various styles, colors, and handle configurations.

## Features

- 3D room visualization with real-time updates
- Multiple view angles:
  - Orbit View (360° visualization)
  - Left Wall View
  - Back Wall View
  - Right Wall View
- Customizable room dimensions with minimum specifications:
  - Width: 5m
  - Length: 5m
  - Height: 2.4m
- Two types of wardrobes:
  - Full-height single door wardrobe
  - Storage block
- Handle customization:
  - Multiple handle styles (None, Straight, Fancy, Spherical)
  - Handle position (Left/Right)
  - Handle colors and materials
- Wardrobe customization:
  - Various colors and textures
  - Metallic and non-metallic finishes
- Screenshot functionality with custom naming
- Responsive design for all devices
- Preview mode with orbit controls

## Tech Stack

- React (v19.0.0)
- TypeScript (v4.9.5)
- Three.js (v0.173.0)
- React Three Fiber (v9.0.4)
- React Three Drei (v10.0.2)
- React Tabs (v6.1.0)
- React Icons (v5.5.0)

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (version 19.0.0 or higher)
- npm (version 9.0.0 or higher)
- Git

## Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/3d-room-configurator.git
```

2. Navigate to project directory:
```bash
cd 3d-room-configurator
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm start
```

5. Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

## Project Structure

```
3d-room-configurator/
├── public/
│   ├── textures/           # Texture images for materials
│   │   ├── wood.jpg
│   │   ├── metal.jpg
│   │   ├── DirtWindowStains.jpg
│   │   ├── FloorPoured.jpg
│   │   └── ... other textures
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CameraController.tsx   # Camera view control
│   │   ├── Colors.tsx            # Color selection component
│   │   ├── Controls.tsx          # View control buttons
│   │   ├── CustomTabs.tsx        # Tab navigation
│   │   ├── Doors.tsx             # Door styles component
│   │   ├── Room.tsx              # Main room component
│   │   ├── SizeControls.tsx      # Room size inputs
│   │   ├── StyleWardrobes.tsx    # Wardrobe styling
│   │   ├── WardrobeControls.tsx  # Wardrobe controls
│   │   └── WardrobeModel.tsx     # 3D wardrobe model
│   ├── types.ts                  # TypeScript types
│   ├── App.tsx                   # Main application
│   └── index.tsx                 # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Development Workflow

1. **Room Configuration Stage**
   - Set room dimensions using number inputs
   - Validate minimum requirements (5m x 5m x 2.4m)
   - Proceed to wardrobe stage

2. **Wardrobe Stage**
   - Enter project name
   - Select walls to add wardrobes
   - Choose wardrobe types (full-height/storage)

3. **Style Stage**
   - Navigate between Doors and Colors tabs
   - Select handle types and positions
   - Choose colors and textures
   - Preview changes in real-time

4. **Preview Stage**
   - View design in orbit mode
   - Take screenshots
   - Return to editing

## Available Scripts

### `npm start`
- Runs development server
- Opens [http://localhost:3000](http://localhost:3000)
- Enables hot reloading
- Shows lint errors in console

### `npm test`
- Launches test runner
- Runs in interactive watch mode
- Displays test results

### `npm run build`
- Creates production build
- Outputs to `build` folder
- Optimizes and minifies code
- Generates asset hashes

### `npm run eject`
- Ejects from Create React App
- Copies all configurations
- One-way operation
- Provides full control over configs

## Dependencies

Core Dependencies

```json
  "typescript": "^4.9.5",
  "three": "^0.173.0",
  "react-tabs": "^6.1.0",
  "react-icons": "^5.5.0",
  "react-dom": "^19.0.0",
  "react": "^19.0.0",
  "@react-three/fiber": "^9.0.4",
  "@react-three/drei": "^10.0.2"
```

## Usage Guide

### Room Configuration

- Start by setting room dimensions (width, length, height)
- Minimum dimensions: 5m x 5m x 2.4m

### Wardrobe Placement

- Enter your name for the project
- Click on wall sections to add wardrobes
- Choose between full-height wardrobes or storage blocks

### Customization

- Select a wardrobe to customize
- Choose handle styles and positions
- Apply colors and textures to wardrobes and handles

### Preview

- Use orbit controls to view your design from any angle
- Take screenshots of your configuration
- Return to editing mode using the back button