# Employee KPI Tracking Application - Design Guidelines

## Design Approach
**System:** Material Design with modern productivity influences (Linear/Notion-inspired)

**Core Principles:**
1. **Data First** - Prioritize KPI metrics and actionable insights
2. **Efficiency Over Aesthetics** - Minimize clicks, maximize visibility
3. **Role-Appropriate UX** - Admin (management/overview), Employee (personal tracking)
4. **Progressive Disclosure** - Summary first, details on demand

---

## Typography

**Fonts:**
- Primary: Inter (Google Fonts) - all UI text
- Monospace: JetBrains Mono - numerical data/KPIs only

**Scale:**
```
Page Titles:    text-3xl (30px), font-bold
Sections:       text-xl (20px), font-semibold
Cards:          text-lg (18px), font-semibold
Body:           text-base (16px), font-normal
Labels:         text-sm (14px), font-medium
KPI Numbers:    text-2xl to text-4xl, font-bold, JetBrains Mono
Captions:       text-xs (12px), font-medium
```

**Hierarchy:** font-normal (primary), font-semibold (emphasis), font-bold (KPIs), opacity-60 (de-emphasis)

---

## Layout System

**Spacing Scale:** `2, 4, 6, 8, 12, 16`
- Component internals: `p-2, gap-2`
- Related elements: `p-4, gap-4, m-4`
- Sections: `p-6, gap-6`
- Page padding: `p-8` (mobile), `p-12` (tablet), `p-16` (desktop)
- Major breaks: `mt-12, mb-12`

**Grid:**
- Admin: 12-column, `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for KPI cards
- Employee: Single (mobile), 2-col (tablet), 3-4 col (desktop)
- Tables: Full-width with horizontal scroll on mobile

**Container:**
- Max width: `max-w-7xl` (1280px), centered with `mx-auto`
- Page padding: `px-4` (mobile), `px-8` (tablet), `px-12` (desktop)

**Breakpoints:** Base (<768px), md (768-1024px), lg (1024px+), xl (1280px+)

---

## Components

### Navigation

**Login:**
```
Centered card: max-w-md, mx-auto, mt-16
Logo at top (mb-8)
Inputs with labels above (mb-6)
Primary button: w-full, h-12
Error messages: text-sm below inputs
```

**Top Bar:**
```
Fixed: sticky top-0, h-16, shadow
Left: Logo (text-xl, font-bold)
Right: Profile dropdown with role badge
Mobile: Hamburger menu (<md)
```

**Admin Sidebar:**
```
Desktop: w-64, h-screen, border-right
Nav items: p-4, rounded-md hover
Active: font-semibold, left border accent
Icons: Heroicons outline, size-5
```

**Employee Tabs:**
```
Top horizontal tabs (Dashboard, Weekly Tracker, Progress, Profile)
Active: border-b-2, font-semibold
Mobile: horizontal scroll
```

### UI Elements

**Cards:**
```
Standard: rounded-lg, shadow-sm, border, p-6
Stat cards: p-6, icon (size-8), value (text-3xl), label (text-sm), trend
Hover: hover:shadow-md, transition
Mobile: p-4
```

**Buttons:**
```
Primary: h-10, px-6, rounded-md, font-medium, shadow-sm
Secondary: h-10, px-6, border variant
Icon: h-10, w-10, rounded-full
Groups: flex gap-2
```

**Forms:**
```
Inputs: h-12, px-4, rounded-md, border, w-full
Labels: text-sm, font-medium, mb-2 (above)
Errors: text-sm, mt-1 (below field)
Help: text-xs, mt-1, reduced opacity
```

**Tables:**
```
Header: sticky, font-semibold
Rows: h-14, px-4 py-3
Alternating backgrounds (desktop)
Numerical: right-align, JetBrains Mono
Mobile: transform to stacked cards
```

**Charts (Recharts):**
```
Types: Area (trends), Bar (comparative), Pie (percentages), Line (YTD)
Height: h-64 (mobile), h-80 (desktop)
Legend: bottom positioned
Responsive with aspect-ratio
```

**Progress:**
```
Linear: h-2, rounded-full, percentage label above
Circular: size-20 (summary), size-32 (detail)
Labels: text-sm, font-semibold, top-right
```

**Status:**
```
Badges: px-3, py-1, rounded-full, text-xs, font-medium
Dots: size-2, rounded-full, mr-2
Zones: Behind (critical), At-risk (warning), On-track (success), Exceeded (exceptional)
```

### Overlays

**Modals:**
```
Overlay: fixed, inset-0, backdrop-blur
Container: max-w-2xl (standard), max-w-4xl (large), mx-auto, mt-16
Content: p-8, rounded-lg, shadow-xl
Header: text-xl, font-semibold, mb-6
Footer: flex justify-between, pt-6, border-t
Close: absolute top-4, right-4
```

**Confirmations:**
```
Smaller: max-w-md
Icon: size-12, mb-4, centered
Message: text-center, text-lg, mb-6
Buttons: horizontal, gap-3
```

**Toasts:**
```
Position: fixed top-4, right-4
Size: w-96 (desktop), full-width-minus-padding (mobile)
Animation: slide-in-right, auto-dismiss 4s
Stack: gap-2 when multiple
```

---

## Page Layouts

### Admin Dashboard
```
Layout: Sidebar (w-64) + main content
Top: Title + quick actions (flex justify-between)
KPI Grid: lg:grid-cols-4, md:grid-cols-2
Tabs: Dashboard/Employees/Reports
Charts: lg:grid-cols-2 comparison views
```

### Employee Dashboard
```
Nav: Top tabs (no sidebar)
Hero: 4-col metric cards (Annual, Monthly, Weekly, Conversion)
Weekly Tracker Card:
  - Date selector above
  - 6 inputs: Face-to-Face (max 3), Events, Videos, Hours, Thank You (max 2), Leads
  - Submit: w-full (mobile), w-auto (desktop)
Progress: 2-col chart grid (lg:grid-cols-2)
History: Expandable table with pagination
```

### Reports (Admin)
```
Top: Filters (date, employee, KPI) + export buttons
Summary: Aggregate metric cards
Charts: lg:grid-cols-2 grid
Table: Sortable columns at bottom
```

---

## Mobile Optimization

**Navigation:**
- Employee: Bottom nav bar (fixed bottom-0, h-16)
- Admin: Hamburger → slide-in drawer

**Layout:**
- Stack all multi-column to single column
- Tables → card-based list views
- Horizontal scroll for unavoidable wide content

**Forms:**
- Full-width inputs, h-12 touch targets
- Padding: p-4
- Stack buttons: flex-col gap-2

**Charts:**
- Reduce height: h-48 (mobile) vs h-80 (desktop)
- Bottom horizontal legend
- Touch-friendly tooltips

---

## Animations

**Minimal & Purposeful:**
```
Transitions: transition-colors, duration-200 (all interactive)
Loading: Fade-in opacity
Modals: Fade + scale (scale-95 → scale-100)
Page: None (instant for efficiency)
Charts: 500ms initial render only
Toasts: Slide-in-right, fade-out dismiss
```

---

## Additional Notes

- **No images used** - Data-centric design with typography, charts, status indicators
- **Icons:** Heroicons (outline style) for all visual cues
- **Accessibility:** All form labels, ARIA attributes, keyboard navigation, sufficient color contrast
- **Weekly Constraints:** Display in helper text (e.g., "Max 3 per week")