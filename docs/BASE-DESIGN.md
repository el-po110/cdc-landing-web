# El Culto del Oculto — Style Reference
> A red memory card turning on a black canvas — Apple keynote restraint, one signal red.

**Theme:** dark

Source measurements are normalized; roles and recommendations are interpreted. Font summary lists are independent, not paired by position. HTML examples are reconstructions, not source components.

El Culto del Oculto (Pachuca MX; Synthwave, Darkwave, Post-Punk) is a four-route site whose home screen treats a single 3D object as the entire hero. The canvas is carbon black and a red memory card turns in the center. The only interface furniture on the home screen is the fixed nav. The card itself glitches: short, harsh horizontal jumps, then it holds still until the next burst. Typography is aggressive: system fonts pushed to weights 700-800 with tight tracking, never thin or light. The UI is 1% chromatic by design — `#e10600` is the only chromatic UI token, and it appears on the filled button and the active nav item. The card's own red belongs to the object, the way the print on its face does. Components are compact, radii are mostly sharp (1.5px), and the only soft radius belongs to the app-window card itself (25px) and the pill-lozenge button (20px). Interior routes repeat the nav and the black canvas; they do not repeat the hero.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Carbon Black | `#111111` | `--color-carbon-black` | Page background on every route |
| Signal Red | `#e10600` | `--color-signal-red` | Filled button and active nav item. The only chromatic UI token |
| Pure White | `#ffffff` | `--color-pure-white` | Text on the black canvas, and the elevated window-card surface |
| Graphite | `#2d2d2d` | `--color-graphite` | Window-chrome dots, icon strokes, muted dark UI on the white card |
| Pale Stone | `#dddddd` | `--color-pale-stone` | Hairline divider inside the window card |
| Silver Mist | `#b4b4b4` | `--color-silver-mist` | Muted text, inactive chrome, low-emphasis labels |

## Tokens — Typography

### -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif — Primary interface typeface — used for the wordmark, nav labels, page titles, the support line, and the button. Weights stay at 700 and 800, plus 500 for the smallest muted line. Combined with -0.036em tracking on the 28px size, headlines feel mechanically precise rather than elegant. · `--font-sans`
- **Substitute:** Inter (weights 500, 700, 800) or SF Pro Display
- **Weights:** 500, 700, 800
- **Sizes:** 12px, 16px, 18px, 28px
- **Line height:** 1.25
- **Letter spacing:** -0.036em (28px headlines), -0.016em (16-18px body and subhead), normal (12px caption)
- **Role:** Primary interface typeface for every route.

### ui-monospace, 'SF Mono', Menlo, monospace — Reserved for single-character or ultra-short technical labels. Monospace at weight 800 at 12px reads as a stamped serial number rather than body text. · `--font-mono`
- **Substitute:** JetBrains Mono or IBM Plex Mono at weight 800
- **Weights:** 800
- **Sizes:** 12px
- **Line height:** 1.25
- **Letter spacing:** normal
- **Role:** Reserved for single-character or ultra-short technical labels.

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | `--font-sans` | 500 | 12px | 1.25 | 0px | `--text-caption` |
| body-sm | `--font-sans` | 700 | 16px | 1.25 | -0.256px | `--text-body-sm` |
| body | `--font-sans` | 700 | 18px | 1.25 | -0.288px | `--text-body` |
| heading | `--font-sans` | 800 | 28px | 1.25 | -1.008px | `--text-heading` |

## Tokens — Spacing & Shapes

**Density:** compact

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 5 | 5px | `--spacing-5` |
| 8 | 8px | `--spacing-8` |
| 10 | 10px | `--spacing-10` |
| 20 | 20px | `--spacing-20` |
| 30 | 30px | `--spacing-30` |

### Border Radius

| Element | Value |
|---------|-------|
| cards | 25px |
| buttons | 20px |
| default | 1.5px |
| window-chrome | 13px |

### Layout

- **Section gap:** 30px
- **Card padding:** 10px
- **Element gap:** 8px

## Components

### Hero Render Stage
**Role:** The full-bleed visual container on `/` that holds the turning memory card

Takes the full viewport under the nav. Background is `#111111` (`--color-carbon-black`) — the page canvas is the stage. The memory card is a live 3D object: a rounded red plastic body, the photographed face on the front, the photographed back (connector well) on the rear. It sits about 40° off vertical, pushed back into the scene, and rotates on its vertical axis. It sits centered in the viewport. The glitch is the card jumping horizontally in short harsh bursts, then returning to its place. This component exists only on `/`. The window card is not on the page.

### App Window Card
**Role:** The single elevated container on `/` — a macOS-style window mockup that frames the brand name, the support line, and the CTA

White (`--color-pure-white`) surface on the carbon-black page. 25px border-radius (`--radius-cards`). 10px internal padding (`--card-padding`). Width grows with the wordmark; the wordmark may wrap to two lines. Contains a title bar with three traffic-light dots (`--color-silver-mist` and `--color-graphite`) and a 2px title-bar separator (`--color-pale-stone`). Houses the wordmark, the muted support line, and the filled button, centered. Subtle drop shadow is the only elevation on the site. Exists only on `/`.

### Traffic Light Window Controls
**Role:** Decorative macOS chrome elements signaling 'this is an app'

Three small circular indicators in the window title bar at approximately 2px size. Mixed `#b4b4b4` (`--color-silver-mist`) and `#2d2d2d` (`--color-graphite`) fills. 1.5px radius (`--radius-default`), effectively circles at that size. Purely decorative — not interactive.

### Brand Wordmark
**Role:** The headline inside the window card on `/`

Literal string `El Culto del Oculto`, rendered at 28px, weight 800, color `#111111` (`--color-carbon-black`), letter-spacing -0.036em (`--tracking-heading`), line-height 1.25. Centered. May wrap to two lines. Directly beneath it, one muted line at caption size, weight 500, color `#b4b4b4` (`--color-silver-mist`): `Pachuca MX · Synthwave, Darkwave, Post-Punk`.

### Filled Primary Button
**Role:** The sole filled action on the site — it lives only on `/`, inside the window card

Background `#e10600` (`--color-signal-red`), label `#ffffff` (`--color-pure-white`) at 12px weight 800. The label is the slot `{{CTA}}`. 20px border-radius (`--radius-buttons`). 10px vertical padding (`--spacing-10`) and 20px horizontal padding (`--spacing-20`). Includes a trailing chevron (›) at 12px weight 800. One filled button on the whole site. No second button on the nav or on interior routes.

### Chevron Affordance Glyph
**Role:** Trailing icon inside the primary button indicating forward action

Single › character at 12px weight 800 in `#ffffff` (`--color-pure-white`). Sits at the right edge of the filled button with a 2–5px gap from the label. Uses the system font's heavy weight to render as a solid triangle rather than a thin stroke.

### Nav Header
**Role:** Fixed route switcher, present on every route

Fixed to the top edge, full width, on `#111111` (`--color-carbon-black`). Horizontal padding 20px (`--spacing-20`), vertical padding 10px (`--spacing-10`). Three page links separated by a muted pipe, gap 20px (`--spacing-20`). Labels are literal, 12px, weight 800, line-height 1.25, letter-spacing 0, color `#ffffff` (`--color-pure-white`):

- `FECHAS` → `/fechas`
- `CONTACTO` → `/contacto`
- `ACERCA DE` → `/acerca-de`

Pipes between labels use `#b4b4b4` (`--color-silver-mist`). The link for the active route uses `#e10600` (`--color-signal-red`). These are page hyperlinks, not scroll anchors. No button in the header.

### Fechas Page
**Role:** Interior route at `/fechas`

Shares the Nav Header and the `#111111` canvas. Does not include the hero or the window card. Title literal `FECHAS` at 28px, weight 800, color `#ffffff` (`--color-pure-white`), letter-spacing -0.036em, line-height 1.25, centered, 30px (`--spacing-30`) below the nav. Body is the labeled slot `{{FECHAS}}` at 18px, weight 700, color `#ffffff`, 30px below the title. Do not invent dates.

### Contacto Page
**Role:** Interior route at `/contacto`

Shares the Nav Header and the `#111111` canvas. Does not include the hero or the window card. Title literal `CONTACTO` at 28px, weight 800, color `#ffffff` (`--color-pure-white`), letter-spacing -0.036em, line-height 1.25, centered, 30px (`--spacing-30`) below the nav. Body is the labeled slot `{{CONTACTO}}` at 18px, weight 700, color `#ffffff`, 30px below the title. Do not invent URLs or addresses.

### Acerca de Page
**Role:** Interior route at `/acerca-de`

Shares the Nav Header and the `#111111` canvas. Does not include the hero or the window card. Title literal `ACERCA DE` at 28px, weight 800, color `#ffffff` (`--color-pure-white`), letter-spacing -0.036em, line-height 1.25, centered, 30px (`--spacing-30`) below the nav. Body is the labeled slot `{{ACERCA}}` at 18px, weight 700, color `#ffffff`, 30px below the title. Do not invent a biography or members.

## Do's and Don'ts

### Do
- Use `#111111` (`--color-carbon-black`) as the page background on every route
- Use `#e10600` (`--color-signal-red`) as the only chromatic UI token — filled button and active nav item
- Keep the single filled button on `/` only, with a `#ffffff` label
- Set headlines at 28px, weight 800, letter-spacing -1.008px (-0.036em)
- Use 25px border-radius for the app-window card and 20px for the button — keep the rest of the UI at 1.5px
- Link `FECHAS`, `CONTACTO`, and `ACERCA DE` to `/fechas`, `/contacto`, and `/acerca-de`
- Anchor the window card below the rendered hero with 30px vertical margin
- Use `--font-sans` at weights 700-800 for interface text; the muted support line may use weight 500
- Keep line-height locked at 1.25 across every text size

### Don't
- Don't add a second chromatic token, and don't bring back the light canvas `#f1f2f3`
- Don't use border-radius above 25px or below 1.5px — the system is binary: sharp or lozenge
- Don't use font weights below 500 anywhere
- Don't add a second filled button, on the nav or on any interior route
- Don't turn the nav into scroll anchors, and don't stack Fechas, Contacto, or Acerca de under the hero
- Don't repeat the hero or the window card on `/fechas`, `/contacto`, or `/acerca-de`
- Don't add visible borders to the window card — rely on the 25px radius and the shadow for definition
- Don't replace the turning memory card with a flat still, an illustration, or a gradient — the card is the home hero
- Don't invent dates, a biography, members, or URLs inside `{{FECHAS}}`, `{{CONTACTO}}`, or `{{ACERCA}}`

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Page Canvas | `#111111` | Background on every route — the black stage under the nav, the hero, and the interior pages |
| 1 | App Window Surface | `#ffffff` | Elevated white card on `/` containing the wordmark, the support line, and the CTA |
| 2 | Primary Action | `#e10600` | Red button surface on the white card, and the active nav color |

## Elevation

- **App Window Card:** `0 1px 3px rgba(17,17,17,0.08), 0 4px 12px rgba(17,17,17,0.06)`

## Imagery

The site carries exactly one visual, and only on `/`: a red memory card modeled in 3D, tilted slightly, rotating on its vertical axis. The front face is the photographed print (PlayStation memory card, the handwritten mark, and the Sony line). The back face is the photographed connector shell. The card is tilted about 40° and set back in depth. The plastic body is geometry, not a still image. The card is centered in the viewport. Its glitch is a horizontal snap of the object itself, then a pause. There is no window card on this screen. `/fechas`, `/contacto`, and `/acerca-de` carry no second image.

## Layout

- `/` → Nav Header + Hero (memory card), one screen, no section scroll
- `/fechas` → Nav Header + Fechas page
- `/contacto` → Nav Header + Contacto page
- `/acerca-de` → Nav Header + Acerca de page

## Agent Prompt Guide

Quick Color Reference:
- canvas: `#111111` (`--color-carbon-black`)
- card surface: `#ffffff` (`--color-pure-white`)
- text on canvas: `#ffffff` (`--color-pure-white`)
- text on card: `#111111` (`--color-carbon-black`)
- muted: `#b4b4b4` (`--color-silver-mist`)
- hairline: `#dddddd` (`--color-pale-stone`)
- chrome dot: `#2d2d2d` (`--color-graphite`)
- signal: `#e10600` (`--color-signal-red`)
- fonts: `--font-sans`, `--font-mono`

Example route prompts:

1. Build `/`. Fixed Nav Header with `FECHAS` → `/fechas`, `CONTACTO` → `/contacto`, `ACERCA DE` → `/acerca-de`. Labels `#ffffff`, active route `#e10600`, pipes `#b4b4b4`, font `--font-sans` at 12px weight 800. Below it, one screen and no section scroll: full-bleed `#111111` hero and a red memory card rotating in 3D, tilted about 40°, with the photographed face on the front and the connector photo on the back. No window card. The memory card glitches by snapping horizontally for a brief burst, then resting.

2. Build `/fechas`. Same Nav Header, with `FECHAS` in `#e10600`. Canvas `#111111`. No hero and no window card. Centered title `FECHAS` at 28px weight 800 in `#ffffff`, 30px below the nav. Body slot `{{FECHAS}}` at 18px weight 700 in `#ffffff`, 30px below the title. Do not invent dates.

3. Build `/contacto`. Same Nav Header, with `CONTACTO` in `#e10600`. Canvas `#111111`. No hero and no window card. Centered title `CONTACTO` at 28px weight 800 in `#ffffff`, 30px below the nav. Body slot `{{CONTACTO}}` at 18px weight 700 in `#ffffff`, 30px below the title. Do not invent URLs or addresses.

4. Build `/acerca-de`. Same Nav Header, with `ACERCA DE` in `#e10600`. Canvas `#111111`. No hero and no window card. Centered title `ACERCA DE` at 28px weight 800 in `#ffffff`, 30px below the nav. Body slot `{{ACERCA}}` at 18px weight 700 in `#ffffff`, 30px below the title. Do not invent a biography or members.

## Similar Brands

- **Apple product launch pages (macOS, Music app)** — Same macOS-window card, system fonts at heavy weights, and a single rendered object as the home hero. This system puts that card on a black canvas and adds one red.
- **Arc browser site (arc.net)** — Same aggressive bold type at tight tracking, and a single hero visual that carries the home screen. This system is dark, with one red accent.
- **Nothing.tech** — Same minimal product page with a single CTA. Nothing's monochrome field is the reference for restraint; this system keeps a single red.
- **Rayo.fm or other music app teasers** — Same hero render above one CTA on the home screen. Fechas, Contacto, and Acerca de are separate routes, not a scrolling teaser.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-carbon-black: #111111;
  --color-signal-red: #e10600;
  --color-pure-white: #ffffff;
  --color-graphite: #2d2d2d;
  --color-pale-stone: #dddddd;
  --color-silver-mist: #b4b4b4;

  /* Typography — Font Families */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, monospace;

  /* Typography — Scale */
  --text-caption: 12px;
  --leading-caption: 1.25;
  --tracking-caption: 0px;
  --text-body-sm: 16px;
  --leading-body-sm: 1.25;
  --tracking-body-sm: -0.256px;
  --text-body: 18px;
  --leading-body: 1.25;
  --tracking-body: -0.288px;
  --text-heading: 28px;
  --leading-heading: 1.25;
  --tracking-heading: -1.008px;

  /* Typography — Weights */
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  /* Spacing */
  --spacing-5: 5px;
  --spacing-8: 8px;
  --spacing-10: 10px;
  --spacing-20: 20px;
  --spacing-30: 30px;

  /* Layout */
  --section-gap: 30px;
  --card-padding: 10px;
  --element-gap: 8px;

  /* Border Radius */
  --radius-sm: 1.5px;
  --radius-xl: 13px;
  --radius-2xl: 20px;
  --radius-3xl: 25px;

  /* Named Radii */
  --radius-cards: 25px;
  --radius-buttons: 20px;
  --radius-default: 1.5px;
  --radius-window-chrome: 13px;

  /* Surfaces */
  --surface-page-canvas: #111111;
  --surface-app-window-surface: #ffffff;
  --surface-primary-action: #e10600;
}
```

### Tailwind v4

```css
@theme {
  /* Colors */
  --color-carbon-black: #111111;
  --color-signal-red: #e10600;
  --color-pure-white: #ffffff;
  --color-graphite: #2d2d2d;
  --color-pale-stone: #dddddd;
  --color-silver-mist: #b4b4b4;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, monospace;

  /* Typography — Scale */
  --text-caption: 12px;
  --leading-caption: 1.25;
  --tracking-caption: 0px;
  --text-body-sm: 16px;
  --leading-body-sm: 1.25;
  --tracking-body-sm: -0.256px;
  --text-body: 18px;
  --leading-body: 1.25;
  --tracking-body: -0.288px;
  --text-heading: 28px;
  --leading-heading: 1.25;
  --tracking-heading: -1.008px;

  /* Spacing */
  --spacing-5: 5px;
  --spacing-8: 8px;
  --spacing-10: 10px;
  --spacing-20: 20px;
  --spacing-30: 30px;

  /* Border Radius */
  --radius-sm: 1.5px;
  --radius-xl: 13px;
  --radius-2xl: 20px;
  --radius-3xl: 25px;
}
```
