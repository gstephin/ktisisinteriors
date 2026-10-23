# Ktisis Interiors — site notes

Static marketing site for Ktisis Interiors, a modular-kitchen / home-interiors studio in Kochi, Kerala (est. 2010, 250+ projects). Owner: Stephin (gstephin on GitHub). Live at https://ktisisinteriors.com.

## Stack
- Plain HTML/CSS/JS, no bundler. `index.html`, `css/style.css`, `js/main.js`.
- GSAP 3.12 + ScrollTrigger and Lenis from CDN (cdnjs / jsdelivr).
- Fonts: Inter (Google Fonts). Palette carried from the old site: charcoal `#2b2a28`, bronze `#a67f5d`, accent `#d89a4b`, paper `#f4f2ee`.
- Photos: the 9 real project JPEGs are web-sized into `assets/img/p1..p9.jpg` (originals in `public/assets/portfolio/`). Hero, Vision and the comparison slider use Unsplash stock (hotlinked, credited in the footer) at the owner's request.

## Design direction (decided 2026-10-22)
Editorial "Luxe" look from a Dribbble reference (Ofspace): large Inter headlines with *italic* emphasis words, per-character text reveals, chamfered photo frames that wipe in, small inline image "pills" inside headlines, hover-expand services gallery, closing CTA with a giant faded KTISIS wordmark.

Rejected, do not reintroduce: the CSS-3D first-person apartment walkthrough, a procedural Three.js 3D tour ("doesn't look real"), and the animated CSS modular-kitchen showcase. If a realistic walkthrough is ever wanted, use a scroll-scrubbed MP4 rendered from the owner's own 3D software, not WebGL.

## Page order
Hero → Vision (`#vision`) → Services gallery (`#services`) → Render vs delivered slider (`#compare`) → Process timeline (`#process`) → Stats (`#about`) → Pinned horizontal projects (`#portfolio`) → Testimonials (`#quotes`) → Contact (`#contact`, WhatsApp-first form, no backend) → Collaborate CTA (`#collab`) → Footer.

## Animation conventions (js/main.js)
- `data-chars` on a heading + `.line` spans: split into `.wd` (unbreakable word) / `.ch` (character) and revealed with `charsIn()`. Keep `<em>`, `.pill`, `.orb`, `.star` as single tokens.
- `data-wipe` on a `<figure>`: clip-path wipe + image settle via `wipeIn()`.
- `data-pill`: inline image pill grows in on scroll. `data-drift`: slow scroll parallax. `data-magnetic`: magnetic hover. `data-parallax`: hero visual follows the pointer.
- Create ScrollTrigger pins in DOM order; `prefers-reduced-motion` must leave everything visible (see the media query at the end of style.css).

## Deploy
- Netlify (team "Ktisisinteriors"), linked to `gstephin/ktisisinteriors` branch `main`; every push to `main` is live in ~20 s.
- `netlify.toml` copies the site into `dist/public` and publishes that — the dashboard's old publish dir is `dist/public`, and an empty `command = ""` does NOT override a dashboard build command, so keep the real no-op/copy command.
- `gstephin/InteriorDesignStudio` is a stale twin repo (Netlify was linked to it before); it can be archived.
- Netlify env vars `DATABASE_URL`, `PG*`, `EMAIL_*`, `NETLIFY_EMAILS_*` are leftovers from the old React/Express app and can be deleted.

## Local preview
`python3 -m http.server 8787` in the repo root, then http://127.0.0.1:8787/. Check both 1440px and 390px; there should be zero console errors.

## Open items
- Testimonials are placeholders — replace with real client words.
- Confirm copy claims before relying on them: Hettich/Ebco hardware, "our own fitters, not subcontractors", weeks 2–5 fabrication.
- Contact form is WhatsApp-only (`wa.me/919947386281`); Netlify Forms can be added if stored leads are wanted.
- Contacts on the site: +91 98477 82499 / +91 99473 86281, ktisisinteriors744@gmail.com, instagram.com/ktisis_interiors, facebook.com/ktisisinteriors.
