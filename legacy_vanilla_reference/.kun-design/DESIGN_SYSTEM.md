# Design System — "Creamy Green" preset

Brand system for the blinkit grocery platform. All UI (customer storefront, admin panel, shop portal) must stay in this family.

## Color
| Token | Value | Use |
|---|---|---|
| `--ink` | `#1D2A1E` | headings, body text |
| `--ink-2` | `#45564A` | secondary text |
| `--ink-3` | `#5F7163` | meta text (min 12px) |
| `--green` | `#3E7A4A` | primary brand green — buttons, links, selection |
| `--green-deep` | `#2F6B3C` | header strip, hovers, CTA fills |
| `--green-ink` | `#245A34` | green text on light surfaces |
| `--green-soft` | `#E3EEDD` | tints, chips, avatars |
| `--green-mist` | `#EDF5E8` | search field, panels, art tiles |
| `--cream` | `#F4F7EF` | app background — light creamy green |
| `--card` | `#FFFFFF` | card surfaces |
| `--yellow` | `#F5C84C` | accent ONLY: badges, logo dot, ETA chips (Blinkit DNA) |
| `--yellow-ink` | `#3A2E08` | text on yellow |
| `--line` | `#E2E8DE` | hairlines, borders |
| `--danger` | `#B4493C` | remove / out-of-stock / errors |

### Rules
- App background stays light creamy green (`#F4F7EF`) — never pure white, never beige, never dark.
- Primary green stays creamy/soft — never neon saturated green.
- Yellow is an accent only, never a fill for large areas.
- No purple/blue gradients, no neon glow, no glassmorphism bloat.

## Type
- Family: Plus Jakarta Sans (Google) → Segoe UI → system-ui
- Scale: 12 / 13 / 14 / 15 / 18 / 22 / 28 / 34
- Body 14px/1.55 · Headings 800 weight, letter-spacing −0.2 to −0.5px
- Contrast: body text ≥ 4.5:1 on both `#F4F7EF` and `#FFFFFF`

## Shape & spacing
- Radius scale: 8 / 12 / 16 / 20 / pill
- Spacing scale: 4 8 12 16 20 24 32 48
- Cards: white, 1px `--line` border, radius 16, soft shadow only on hover

## Motion
- 160–220ms, `cubic-bezier(.2,0,0,1)` — no bounce/overshoot
- Success check: scale .55→1, 350ms, plays once
- `prefers-reduced-motion`: all durations forced to ~0

## Iconography
- Inline SVG line icons, stroke 1.8–2.4, round caps, `currentColor`
- **No emoji as icons.** Product art = flat SVG pack-shots on tinted tiles (rendered client-side from catalog art config)

## Structure
- Heading order: h1 (page) → h2 (sections) → h4 (card titles) — never h1 → h3
- One focal point per view (hero CTA on home, bill card at checkout, stat cards on admin overview)
- Mobile-first; desktop ≥900px
- All state server-driven; UI only renders what the API returns
