# Power Up My Property

Static website for https://www.powerupmyproperty.co.uk/, hosted with the existing GitHub Pages configuration. No package installation or build step is required.

## Files

- `index.html`: page content, metadata, service copy and gallery slides.
- `Assets/site.css`: responsive visual design.
- `Assets/site.js`: navigation, gallery filters, slide controls and full-size image dialog.
- `Assets/`: original photographs and the unchanged business logo. `approved-hero.png` is the owner-selected hero image.
- `Assets/images/`: compressed responsive WebP copies; originals are retained.
- `CNAME`: existing custom domain — do not change without updating DNS and Pages settings.

## Preview and validate

Run `python3 -m http.server 4173 --bind 127.0.0.1` from this directory and open http://127.0.0.1:4173.
Run `python3 scripts/check_site.py` to check local links, asset paths, image alternatives, IDs, metadata and structured data. If Node is available, run `node --check Assets/site.js`.
Before pushing, check desktop and mobile layouts, navigation, every gallery filter, first/last slide controls, touch/keyboard scrolling, full-size image viewing, Escape/close focus return, and phone/email links. Also check with reduced motion and JavaScript disabled.

## Updating the gallery

Each `.project-slide` in `index.html` is one photograph. Set its title and category, link to the original image and supply responsive copies in the image `srcset`. Preserve accurate captions and meaningful alt text. Categories must match the filter buttons; do not publish filters without photographs. The JavaScript derives totals from the visible slides. No autoplay is used.

Do not replace the original logo with an AI redraw. New photographs should be exported in web-friendly sizes without changing the depicted work. Contact links go directly to Steve’s phone or Gmail address; there is no non-functional contact form, tracking service or third-party font dependency.

## Publishing

The repository’s existing `main` branch is the publishing source. Push tested changes to `main`, then verify the GitHub Pages deployment and public site. To roll back, revert the redesign commit and push the revert; avoid rewriting shared history. The existing `CNAME.txt` is retained as a legacy file; GitHub Pages uses `CNAME`.

## Search and AI discovery

Three service pages cover electrical work, plastering and property renovations in Gloucestershire. Each has its own title, description, canonical URL, service information, project photographs and visible questions and answers. Keep homepage links and sitemap entries in sync when adding pages. `service-pages.css` extends the shared visual style; these pages work without JavaScript.

JSON-LD connects the business, website, services and breadcrumbs through stable IDs. Keep it consistent with visible content. Do not add invented addresses, opening hours, reviews, credentials or coverage towns. The confirmed phone number is 07553 097529. The Hatton Electrical directory currently lists a different number and needs owner correction.

The expanded checker validates all HTML pages, cross-page links and canonical URLs. Search Console ownership, sitemap submission, indexing requests and Google Business Profile management still require access to the owner's accounts. No indexing or ranking increase is implied by publishing.
