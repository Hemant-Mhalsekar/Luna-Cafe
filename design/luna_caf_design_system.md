---
name: "Luna Café — Warm Botanical & Board Game Design System"
description: "An organic, editorial design system for Luna Café, blending specialty coffee warmth with playful tabletop discovery."
---

## Overview

Luna Café is a cozy specialty coffee shop that secretly doubles as a board game destination. The design system balances serene, sunlit café hospitality with tactile, playful tabletop character. It is warm, welcoming, modern without feeling sterile, and playful without looking childish.

The visual language pairs soft cream and sage surfaces with deep forest greens, rounded editorial typography (`Fredoka` for expressive headings, `DM Sans` for effortless body reading), organic blob masks, wavy SVG section dividers, and pill-shaped interactive controls. Burnt orange (`#C85A24`) is strictly reserved for primary interactive CTAs and must never be used as a decorative section background.

## Colors

The palette is anchored in natural, calming café tones and muted tabletop accents:

- **Cream (`#F6EFDF`)**: Primary page background for sunlit warmth.
- **Sage (`#A9BBA0`)**: Alternate section background for visual rhythm and calm contrast.
- **Forest Green (`#4A6B4F`)**: Primary brand color for body-level accents, icons, and secondary buttons.
- **Dark Forest (`#294632`)**: High-contrast headings, primary navigation text, and dark editorial sections.
- **Burnt Orange (`#C85A24`)**: Reserved exclusively for high-priority interactive CTAs (e.g., "Book a Table", "Find My Game", primary submit actions).
- **Card White (`#FFFDF8`)**: Warm off-white surface for elevated cards, modals, and form containers.
- **Game Card Accents**: Muted dusty blue, terracotta, mustard, and lavender tints used exclusively for board game cards and category badges.

```yaml
colors:
  cream: "#F6EFDF"
  on-cream: "#294632"
  sage: "#A9BBA0"
  on-sage: "#193623"
  sage-soft: "#E4F6D9"
  forest-green: "#4A6B4F"
  on-forest-green: "#FFFDF8"
  dark-forest: "#294632"
  on-dark-forest: "#F6EFDF"
  burnt-orange: "#C85A24"
  on-burnt-orange: "#1F0900"
  surface: "#FFFDF8"
  on-surface: "#294632"
  surface-muted: "#E9E2D2"
  on-surface-muted: "#4A473B"
  outline: "#CCC6B7"
  outline-strong: "#7B776A"
  dusty-blue: "#E5F2FF"
  on-dusty-blue: "#153346"
  dusty-blue-accent: "#456277"
  terracotta: "#FFEDE8"
  on-terracotta: "#53210E"
  terracotta-accent: "#8C4E37"
  mustard: "#FFEED8"
  on-mustard: "#422C00"
  mustard-accent: "#7D5800"
  lavender: "#F8EDFF"
  on-lavender: "#362B48"
  lavender-accent: "#665979"
  success: "#2E4E34"
  on-success: "#FFFDF8"
  success-container: "#D5FAD7"
  on-success-container: "#01210C"
  warning: "#7D5800"
  on-warning: "#FFFDF8"
  warning-container: "#FFDEA9"
  on-warning-container: "#271900"
  error: "#BA1A1A"
  on-error: "#FFFDF8"
  error-container: "#FFDAD6"
  on-error-container: "#410002"
```

## Typography

**Fredoka** brings friendly, rounded warmth to display headlines and section titles, while **DM Sans** provides crisp geometric clarity for menus, filters, descriptions, and administrative tables. **Fragment Mono** is used for booking reference codes and tabular figures.

```yaml
typography:
  display-lg:
    fontFamily: "Fredoka"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 62px
    letterSpacing: -0.5px
  display-lg-mobile:
    fontFamily: "Fredoka"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 38px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: "Fredoka"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 46px
    letterSpacing: -0.25px
  headline-lg-mobile:
    fontFamily: "Fredoka"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 34px
    letterSpacing: 0px
  headline-md:
    fontFamily: "Fredoka"
    fontSize: 28px
    fontWeight: 500
    lineHeight: 34px
    letterSpacing: 0px
  headline-sm:
    fontFamily: "Fredoka"
    fontSize: 22px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: 0px
  title-lg:
    fontFamily: "DM Sans"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 28px
    letterSpacing: 0px
  title-md:
    fontFamily: "DM Sans"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 24px
    letterSpacing: 0px
  body-lg:
    fontFamily: "DM Sans"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: 0px
  body-md:
    fontFamily: "DM Sans"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-sm:
    fontFamily: "DM Sans"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  label-lg:
    fontFamily: "DM Sans"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.1px
  label-sm:
    fontFamily: "DM Sans"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.3px
  mono-md:
    fontFamily: "Fragment Mono"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0.5px
```

## Layout & Spacing

The layout uses a centered max-width editorial container (`1280px`) on desktop with generous section breathing room, collapsing gracefully to a single-column fluid grid on tablet (`768px`) and mobile (`375px`). All spacing adheres to a strict `4px` / `8px` grid.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 16px
  gutter-lg: 24px
  gutter-xl: 32px
  section-sm: 48px
  section-lg: 80px
  page-margin: 24px
```

## Elevation & Depth

Luna Café avoids heavy drop shadows, glassmorphism, and neon glows. Depth is communicated through warm tonal surface contrast (`cream` → `sage` → `surface`), subtle `1px` borders in `outline` (`#CCC6B7`), and soft, diffused ambient shadows (`0 8px 24px rgba(41, 70, 50, 0.06)`) on elevated cards and modals.

## Shapes

Generous, organic rounded corners reinforce the cozy, approachable personality: large rounded cards (`24px`), pill-shaped buttons and badges (`9999px`), organic SVG blob image masks, and flowing wave dividers between alternating cream and sage sections.

```yaml
rounded:
  sm: 8px
  DEFAULT: 12px
  md: 16px
  lg: 24px
  xl: 32px
  full: 9999px
```

## Motion & Micro-interaction

Motion is gentle, tactile, and unhurried—like steam rising from a ceramic cup or a wooden game piece settling onto a board. Hover states lift cards subtly (`translateY(-4px)`) with a slight playful tilt on game cards. All animations honor `prefers-reduced-motion: reduce`.

```yaml
motion:
  state-change:
    duration: 180ms
    delay: 0ms
    timingFunction: ease-out
  card-lift:
    duration: 240ms
    delay: 0ms
    timingFunction: cubic-bezier(0.2, 0, 0, 1)
  surface-enter:
    duration: 320ms
    delay: 0ms
    timingFunction: cubic-bezier(0.2, 0, 0, 1)
  surface-exit:
    duration: 200ms
    delay: 0ms
    timingFunction: cubic-bezier(0.3, 0, 1, 1)
```

## Voice & Content Strategy

- **Tone of voice**: Warm, neighborly, quietly witty, and unpretentious. Sounds like a friendly barista who also knows the rules to every game on the shelf.
- **Capitalisation**: Sentence case for most headings, button labels, and navigation items; title case for proper game and drink names.
- **Button and action labels**: Specific, inviting verb phrases ("Explore Our Menu", "Discover the Games", "Find My Game", "Book Your Table"). Never generic "Submit" or "OK".
- **Do's and Don'ts**:
  - **Do**: Keep burnt orange (`#C85A24`) strictly for primary CTAs and interactive actions.
  - **Do**: Use coded SVG/CSS illustrations for board game cards, never generated photographs.
  - **Do**: Keep photography warm, sunlit, and focused on specialty coffee and cozy café interiors.
  - **Don't**: Use glassmorphism (`backdrop-blur`), neon colors, excessive gradients, or SaaS dashboard tropes.

## Components

Component implementations live as individual HTML sticker sheet files in
`components/`. Each file contains the canonical, styled HTML components with
`<!-- COMPONENT: name -->` comment markers. Read each file before use.

- **Button** → `@components/button.html`: `button-primary`, `button-icon`, `button-with-icon`
- **Card** → `@components/card.html`: `card-elevated`, `card-action`, `card-interactive`, `card-interactive-2`
- **Input Field** → `@components/input-field.html`: `input-field-text`, `input-field-icon`
- **Modal** → `@components/modal.html`: `modal-standard`, `modal-alert`, `modal-drawer`
- **Table** → `@components/table.html`: `table-standard`, `table-interactive`, `table-selectable`
