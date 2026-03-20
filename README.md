# wedding-nova-fathi

Static wedding invitation. Vanilla stack, no framework, no build step.

**Live:** https://fathiraziq.github.io/wedding-nova-fathi/

## Stack

- HTML / CSS / JS (vanilla, single IIFE)
- Supabase REST API (RSVP + wishes storage)
- Google Fonts (Inter, Playfair Display)
- Google Maps Embed
- GitHub Pages

## Files

```
index.html          975 loc   markup, 10 sections
css/style.css      3500 loc   design system, 18 keyframes, dark mode
js/script.js       1400 loc   interactions, physics, supabase client
assets/images/                hero, couple, gallery
assets/music/                 background audio
```

## CSS Architecture

35+ custom properties. Full dark mode via `[data-theme="dark"]` override.

**Blur hierarchy (iOS 26 tier system):**
```css
--blur-primary:   blur(40px) saturate(1.8) brightness(1.05)   /* sections */
--blur-secondary: blur(30px) saturate(1.5) brightness(1.03)   /* cards */
--blur-tertiary:  blur(20px) saturate(1.3)                    /* buttons */
```

**Radius scale:**
```
container: 28px → card: 22px → element: 16px → small: 12px
```

**Easing:**
```css
--spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)
--spring-smooth: cubic-bezier(0.175, 0.885, 0.32, 1.275)
```

Gray scale `--gray-50` through `--gray-950`, inverted in dark mode. Glass layer: `--glass-bg`, `--glass-border`, `--glass-highlight`, `--glass-shadow`, `--glass-inner`.

## JS Modules

All wrapped in a single `(function() { 'use strict'; ... })()`. No modules, no imports.

| Module | What it does |
|--------|-------------|
| Cover gate | Scroll lock, focus trap, unlock → auto-play music |
| Guest parser | `?to=Name` fills cover + RSVP name |
| Supabase client | REST wrapper for DB read/write |
| RSVP form | Validation, segmented control with rAF spring physics |
| Wishes | Fetch from DB, render bubbles, load-more/collapse pagination |
| Nav pill morph | Stretch 220ms → settle 450ms, `exp(-5t) × sin(10t)` wobble |
| Segment slider | Directional stretch, leading edge races trailing, damped oscillation |
| Card tilt | Scroll-based `perspective(1200px) rotateX()` + gyroscope via `DeviceOrientationEvent` |
| Jelly touch | `pointerdown` → exponential decay × sinusoidal wobble on scale/rotate |
| Parallax | 4 orbs at `[0.03, -0.02, 0.025, -0.035]` speeds + title depth offset |
| Dynamic shimmer | Gift card gradient position linked to scroll progress |
| Lightbox | Spring-bounce open, ESC/tap-outside close |
| Countdown | `setInterval` hourly, pauses on `visibilitychange` |
| Live Activity | Shows at `rect.top < vh * 0.5`, stays visible from acara to end |

## Animations

18 `@keyframes`. Key ones:

- `liquidPress` / `liquidPressCircle` — button squeeze with spring overshoot
- `bubbleIn` — wish chat bubble pop-in, staggered by `i * 0.06s`
- `btnShimmer` — gradient sweep on cover button
- `meshShift` — background mesh gradient morph (12-16s loop)
- `orbFloat` — parallax orb drift (8-14s)

Word-by-word stagger: each `.word` span gets `transitionDelay = i * 0.05s`, transitions from `blur(4px) scale(0.96) translateY(8px)` to clear.

## Performance

- `IntersectionObserver` for lazy reveal (threshold 0.15, rootMargin -40px)
- 10+ `requestAnimationFrame` loops, all gated by ticking flags
- All scroll/touch listeners `{ passive: true }`
- `contain: layout style` on sections
- `loading="lazy"` on images, `fetchpriority="high"` on hero
- `dns-prefetch` + `preconnect` for Supabase/fonts
- Font `display=swap` with `<noscript>` fallback
- Countdown pauses via Visibility API

## iOS Safari

- `viewport-fit=cover` + `env(safe-area-inset-*)`
- `-webkit-backdrop-filter` prefix
- `-webkit-tap-highlight-color: transparent`
- `-webkit-overflow-scrolling: touch`
- `-webkit-appearance: none` on inputs
- `apple-mobile-web-app-capable` meta

## A11y

ARIA: `role="dialog"`, `aria-modal`, `aria-label`, `aria-checked`, `aria-hidden`. Focus trap on cover. `:focus-visible` outlines. `prefers-reduced-motion` kills all animations. `Escape` closes lightbox. Semantic heading hierarchy h1→h3.

## URL Params

```
?to=Nama+Tamu          Guest name (cover + RSVP autofill)
```

## Dev

```bash
npx serve .
# or
python -m http.server 8000
```

No build. Push to `main` → GitHub Pages auto-deploys.