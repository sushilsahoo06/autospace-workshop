# Design System, UI/UX Guidelines & Spatial Specifications

---

## 1. Aesthetic Philosophy: "Precision Mobility"

The **Autospace** design language is built on the concept of **Precision Mobility**—a sleek, modern, high-contrast aesthetic that conveys reliability, spatial precision, and effortless clarity.

### Core Pillars
1. **Dark Mode First**: Deep slate and navy tones (`#090d16`, `#0f172a`) eliminate visual clutter, enhance night-time driving usability, and make vibrant accent states stand out.
2. **Glassmorphism & Depth**: Multi-layered interfaces with semi-transparent frosted panels (`backdrop-filter: blur(16px)`), subtle borders (`rgba(255,255,255,0.08)`), and soft radial glows.
3. **Spatial Fidelity**: Real-time 3D interactive graphics bridge the gap between abstract booking records and physical garage parking spaces.
4. **Immediate Feedback**: Micro-animations, glowing status badges, and animated route pulses keep the user oriented during complex multi-step workflows.

---

## 2. Design Tokens & Color Palette

### 2.1 Color Tokens

```css
:root {
  /* Surface & Background */
  --bg-primary: #090d16;        /* Deep void background */
  --bg-surface: #0f172a;        /* Elevated card background */
  --bg-glass: rgba(16, 24, 40, 0.75); /* Frosted glass cards */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);

  /* Primary Brand & Accents */
  --primary: #38bdf8;           /* Electric Cyan (Interactive controls) */
  --primary-glow: rgba(56, 189, 248, 0.25);
  --indigo-accent: #6366f1;     /* Primary action gradient */
  
  /* Semantic Status */
  --status-available: #10b981;  /* Emerald Green: Available slot / active booking */
  --status-occupied: #f43f5e;   /* Rose Red: Occupied / unavailable slot */
  --status-valet: #f59e0b;      /* Amber: In transit / Valet dispatched */
  --status-pending: #8b5cf6;    /* Violet: Payment / Session verifying */

  /* Typography */
  --text-main: #f8fafc;         /* High-contrast headings and body */
  --text-muted: #94a3b8;        /* Supporting text and captions */
  --text-subtle: #64748b;       /* Metadata, timestamps, borders */
}
```

---

## 3. Typography System

The platform standardizes on three clean Google Fonts:
1. **Headings & Brand**: `Plus Jakarta Sans` — Geometric, contemporary, and highly legible at large display weights.
2. **Interface & Body**: `Inter` — Precision neutral typeface optimized for user interface dense tables and forms.
3. **Data, Coordinates & Telemetry**: `JetBrains Mono` — Monospaced font for lat/lng coordinates, timestamps, transaction IDs, and code blocks.

```css
/* Typography Scale */
h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 2.25rem; font-weight: 800; letter-spacing: -0.025em; }
h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem;  font-weight: 700; letter-spacing: -0.02em; }
h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.125rem; font-weight: 600; }
body { font-family: 'Inter', sans-serif; font-size: 0.9375rem; line-height: 1.5; color: var(--text-main); }
code, .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; }
```

---

## 4. Shared UI Component Architecture (`@autospace/ui`)

All applications consume reusable component primitives from `libs/ui`:

1. **`Button`**:
   - `primary`: Gradient fill (`linear-gradient(135deg, #0284c7, #2563eb)`), glowing drop shadow on hover.
   - `secondary`: Glass background with subtle white border.
   - `danger`: Muted rose background with red border.
2. **`Badge`**:
   - Small status indicator with live pulsing dot for `ACTIVE`, `PARKED`, or `CONFIRMED`.
3. **`Modal` & `SlideOver`**:
   - Centered dialogs and right-hand drawers with backdrop blur (`backdrop-blur-md`) and smooth enter/exit transitions (`framer-motion`).
4. **`MapBoxComponent`**:
   - Dark-styled Mapbox canvas (`mapbox://styles/mapbox/dark-v11`) featuring custom HTML marker pins showing real-time price labels (e.g. `"$18/hr"`).

---

## 5. 3D Spatial Visualization Architecture (`@autospace/3d`)

The 3D interactive parking lot visualizer is built using **Three.js** and **React Three Fiber (R3F)** inside `libs/3d`:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        R3F Canvas Container                            │
│  • OrbitControls (Restricted pitch & pan for ergonomic orientation)   │
│  • Directional Lighting + Ambient Fill + Soft Shadows                  │
├────────────────────────────────────────────────────────────────────────┤
│                          Garage Structure                              │
│  • Level Meshes: Concrete floor slabs, ramps, and pillar columns       │
│  • Floor Switcher: Multi-level navigation (Level 1, Level 2, Rooftop)  │
├────────────────────────────────────────────────────────────────────────┤
│                          Slot Meshes (Interactive)                     │
│  • Material Shaders:                                                   │
│    - Emerald (#10b981) + Glow = Available                              │
│    - Slate Dark (#334155) = Occupied / Reserved                        │
│    - Electric Blue (#38bdf8) = Currently Selected by User              │
│  • Hover Interaction: Slot elevates +0.15 units along Y-axis           │
│  • Click Interaction: Focuses camera smoothly onto selected stall      │
└────────────────────────────────────────────────────────────────────────┘
```

### Camera Controls & Performance Budget
* **Default FOV**: 45 degrees, isometric top-down angle (`position: [15, 20, 25]`).
* **Geometry Instancing**: Slot bay line markings use instanced rendering (`InstancedMesh`) to keep draw calls below 25 across large 200+ stall garages.

---

## 6. Mobile & Responsive Layout Patterns

1. **Driver Booking Flow (Mobile)**:
   - Split view: Top 45% screen dedicated to Mapbox or 3D lot canvas; bottom 55% presents an interactive swipeable bottom sheet containing slot details, pricing calculation, and the "Reserve & Pay" CTA.
2. **Valet Attendant Console (Tablet / Handheld)**:
   - High-contrast, touch-optimized card layout.
   - Oversized action buttons (e.g. "START PICKUP", "MARK PARKED", "SCAN PASS") designed for one-handed operation while walking or driving.
   - Offline-capable status caching for garage subterranean levels with intermittent cellular reception.
