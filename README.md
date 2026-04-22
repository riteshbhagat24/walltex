# Walltex India — Premium Interior Surfaces

A multi-page luxury brand site for **Walltex Trading Company** (Nagpur, India),
a surface atelier specialising in wallpapers, blinds, wooden flooring,
artificial grass, and wall panels.

**Live demo:** _(will update once GitHub Pages is live)_

## Pages

- `index.html` — cinematic home
- `products.html` — collections overview
- `wallpapers.html`, `blinds.html`, `flooring.html`, `grass.html`, `panels.html` — category pages with filters, masonry grids, before/after sliders
- `projects.html` — six case studies with before/after sliders
- `lookbook.html` — Pinterest-style masonry
- `about.html` — brand story + timeline
- `blog.html` — editorial journal
- `contact.html` — consultation form + Google Maps

## Stack

Plain HTML / CSS / JS — no build step. Fonts load from Google Fonts,
imagery from Unsplash CDN, everything else served as static files.

## Local preview

```bash
cd d:/Walltex
python -m http.server 8000
# open http://localhost:8000
```

## Deploying

This is pure static HTML — deploy anywhere that serves files:
Netlify Drop, Vercel, Cloudflare Pages, or GitHub Pages.
